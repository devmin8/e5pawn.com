import { and, asc, count, desc, eq, gt, inArray, notExists, sql, type SQL } from 'drizzle-orm';

import { solutionError } from '$lib/chess/puzzle';
import type { PuzzleInput } from '$lib/schemas/puzzle.schema';
import type { PuzzleStudentsInput } from '$lib/schemas/puzzle-students.schema';
import type { Database } from '$lib/server/db/create-db';
import { puzzle, puzzleAssignment, user, type AssignmentStatus } from '$lib/server/db/schema';
import type { ServiceError } from '$lib/server/errors';

import { hasAttempted, isPuzzleEditable } from './attempts';

type Puzzle = typeof puzzle.$inferSelect;

export type PuzzleAssignee = {
	assignmentId: string;
	studentId: string;
	name: string;
	email: string;
	/** Assigned before being deactivated; still listed so they can be unassigned. */
	inactive: boolean;
	status: AssignmentStatus;
	attemptsUsed: number;
};

export type PuzzleSummary = Pick<Puzzle, 'id' | 'title' | 'maxAttempts'> & {
	assignedCount: number;
	solvedCount: number;
	editable: boolean;
};

export type PuzzleDetails = Pick<Puzzle, 'id' | 'title' | 'fen' | 'solution' | 'maxAttempts'>;

type CreatePuzzleData = PuzzleInput & { createdBy: string };
type UpdatePuzzleData = PuzzleInput & { puzzleId: string };
type PuzzleStudentsData = PuzzleStudentsInput & { puzzleId: string };

type EditablePuzzleResult = { ok: true; puzzle: PuzzleDetails } | ServiceError;
type CreatePuzzleResult = { ok: true; puzzleId: string } | ServiceError;
type UpdatePuzzleResult = { ok: true } | ServiceError;
type PuzzleStudentsResult = { ok: true } | ServiceError;

const PUZZLE_NOT_FOUND: ServiceError = { ok: false, status: 404, message: 'Puzzle not found' };
const ALREADY_ATTEMPTED_PUZZLE_MESSAGE =
	'A student has already attempted this puzzle, so it can’t be edited anymore';
const UPDATED_ELSEWHERE_MESSAGE =
	'The assignments changed while you were editing. Reload the page and try again.';

const assigneeColumns = {
	assignmentId: puzzleAssignment.id,
	studentId: puzzleAssignment.studentId,
	name: user.name,
	email: user.email,
	inactive: user.inactive,
	status: puzzleAssignment.status,
	attemptsUsed: puzzleAssignment.attemptsUsed
};

function countWhere(condition: SQL | undefined) {
	return sql<number>`count(case when ${condition} then 1 end)`.mapWith(Number);
}

export async function listPuzzles(db: Database): Promise<PuzzleSummary[]> {
	const rows = await db
		.select({
			id: puzzle.id,
			title: puzzle.title,
			maxAttempts: puzzle.maxAttempts,
			assignedCount: count(puzzleAssignment.id),
			solvedCount: countWhere(eq(puzzleAssignment.status, 'solved')),
			attemptedCount: countWhere(gt(puzzleAssignment.attemptsUsed, 0))
		})
		.from(puzzle)
		.leftJoin(puzzleAssignment, eq(puzzleAssignment.puzzleId, puzzle.id))
		.groupBy(puzzle.id)
		.orderBy(desc(puzzle.createdAt));

	return rows.map(({ attemptedCount, ...summary }) => ({
		...summary,
		editable: attemptedCount === 0
	}));
}

export async function getPuzzle(
	db: Database,
	puzzleId: string
): Promise<PuzzleDetails | undefined> {
	const [found] = await db
		.select({
			id: puzzle.id,
			title: puzzle.title,
			fen: puzzle.fen,
			solution: puzzle.solution,
			maxAttempts: puzzle.maxAttempts
		})
		.from(puzzle)
		.where(eq(puzzle.id, puzzleId));

	return found;
}

export async function listAssignees(db: Database, puzzleId: string): Promise<PuzzleAssignee[]> {
	return db
		.select(assigneeColumns)
		.from(puzzleAssignment)
		.innerJoin(user, eq(user.id, puzzleAssignment.studentId))
		.where(eq(puzzleAssignment.puzzleId, puzzleId))
		.orderBy(asc(user.name));
}

export async function getEditablePuzzle(
	db: Database,
	puzzleId: string
): Promise<EditablePuzzleResult> {
	const found = await getPuzzle(db, puzzleId);
	if (!found) return PUZZLE_NOT_FOUND;

	const assignees = await listAssignees(db, puzzleId);
	if (!isPuzzleEditable(assignees)) {
		return { ok: false, status: 409, message: ALREADY_ATTEMPTED_PUZZLE_MESSAGE };
	}

	return { ok: true, puzzle: found };
}

export async function createPuzzle(
	db: Database,
	input: CreatePuzzleData
): Promise<CreatePuzzleResult> {
	const invalidSolution = solutionError(input.fen, input.solution);
	if (invalidSolution) return { ok: false, status: 400, message: invalidSolution };

	const [created] = await db.insert(puzzle).values(input).returning({ id: puzzle.id });
	return { ok: true, puzzleId: created.id };
}

export async function updatePuzzle(
	db: Database,
	{ puzzleId, ...input }: UpdatePuzzleData
): Promise<UpdatePuzzleResult> {
	const invalidSolution = solutionError(input.fen, input.solution);
	if (invalidSolution) return { ok: false, status: 400, message: invalidSolution };

	const target = await getPuzzle(db, puzzleId);
	if (!target) return PUZZLE_NOT_FOUND;

	// Guarded in the same statement so an attempt finishing in the meantime blocks the edit.
	const attemptedAssignments = db
		.select({ id: puzzleAssignment.id })
		.from(puzzleAssignment)
		.where(and(eq(puzzleAssignment.puzzleId, puzzle.id), gt(puzzleAssignment.attemptsUsed, 0)));
	const updated = await db
		.update(puzzle)
		.set(input)
		.where(and(eq(puzzle.id, puzzleId), notExists(attemptedAssignments)))
		.returning({ id: puzzle.id });
	if (!updated.length) return { ok: false, status: 409, message: ALREADY_ATTEMPTED_PUZZLE_MESSAGE };

	return { ok: true };
}

/** Students who already have this puzzle keep their existing progress. */
export async function assignStudents(
	db: Database,
	{ puzzleId, studentIds }: PuzzleStudentsData
): Promise<PuzzleStudentsResult> {
	const target = await getPuzzle(db, puzzleId);
	if (!target) return PUZZLE_NOT_FOUND;

	const uniqueIds = [...new Set(studentIds)];
	const activeStudents = await db
		.select({ id: user.id })
		.from(user)
		.where(and(inArray(user.id, uniqueIds), eq(user.role, 'user'), eq(user.inactive, false)));
	if (activeStudents.length !== uniqueIds.length) {
		return { ok: false, status: 400, message: 'Only active students can be assigned' };
	}

	await db
		.insert(puzzleAssignment)
		.values(uniqueIds.map((studentId) => ({ puzzleId, studentId })))
		.onConflictDoNothing();

	return { ok: true };
}

/** Students who already attempted the puzzle must keep it. */
export async function unassignStudents(
	db: Database,
	{ puzzleId, studentIds }: PuzzleStudentsData
): Promise<PuzzleStudentsResult> {
	const target = await getPuzzle(db, puzzleId);
	if (!target) return PUZZLE_NOT_FOUND;

	const removed = await db
		.select(assigneeColumns)
		.from(puzzleAssignment)
		.innerJoin(user, eq(user.id, puzzleAssignment.studentId))
		.where(
			and(eq(puzzleAssignment.puzzleId, puzzleId), inArray(puzzleAssignment.studentId, studentIds))
		);
	if (!removed.length) return { ok: true };

	const attempted = removed.find(hasAttempted);
	if (attempted) {
		return {
			ok: false,
			status: 409,
			message: `${attempted.name} has already attempted this puzzle and can’t be unassigned`
		};
	}

	// Checked again here so an attempt finishing in the meantime is never deleted.
	const deleted = await db
		.delete(puzzleAssignment)
		.where(
			and(
				inArray(
					puzzleAssignment.id,
					removed.map((assignee) => assignee.assignmentId)
				),
				eq(puzzleAssignment.attemptsUsed, 0)
			)
		)
		.returning({ id: puzzleAssignment.id });
	if (deleted.length !== removed.length) {
		return { ok: false, status: 409, message: UPDATED_ELSEWHERE_MESSAGE };
	}

	return { ok: true };
}
