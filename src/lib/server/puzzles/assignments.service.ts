import { and, desc, eq } from 'drizzle-orm';

import { checkSolverMove, type SolverMoveResult } from '$lib/chess/puzzle';
import type { PuzzleMoveInput } from '$lib/schemas/puzzle-move.schema';
import type { Database } from '$lib/server/db/create-db';
import { puzzle, puzzleAssignment, type AssignmentStatus } from '$lib/server/db/schema';
import type { ServiceError } from '$lib/server/errors';

import { attemptsLeft, finishAttempt } from './attempts';

export type StudentAssignment = {
	id: string;
	title: string;
	status: AssignmentStatus;
	attemptsUsed: number;
	/** Null means unlimited attempts. */
	attemptsLeft: number | null;
};

export type StudentAssignmentDetails = StudentAssignment & {
	fen: string;
	/** Only revealed once the puzzle is solved or failed. */
	solution: string[] | null;
};

export type PuzzleMoveOutcome = Exclude<SolverMoveResult, { kind: 'invalid' }>;

type AssignmentLookup = {
	studentId: string;
	assignmentId: string;
};

type SubmitMoveData = AssignmentLookup & PuzzleMoveInput;

type AssignmentRecord = {
	id: string;
	title: string;
	fen: string;
	solution: string[];
	maxAttempts: number | null;
	status: AssignmentStatus;
	attemptsUsed: number;
};

type OpenAssignmentResult = { ok: true; assignment: AssignmentRecord } | ServiceError;
type SubmitMoveResult = { ok: true; outcome: PuzzleMoveOutcome } | ServiceError;
type GiveUpResult = { ok: true } | ServiceError;

const assignmentRecordColumns = {
	id: puzzleAssignment.id,
	title: puzzle.title,
	fen: puzzle.fen,
	solution: puzzle.solution,
	maxAttempts: puzzle.maxAttempts,
	status: puzzleAssignment.status,
	attemptsUsed: puzzleAssignment.attemptsUsed
};

const UPDATED_ELSEWHERE_MESSAGE = 'This puzzle was updated elsewhere. Reload the page to continue.';

function toStudentAssignment(record: AssignmentRecord): StudentAssignment {
	return {
		id: record.id,
		title: record.title,
		status: record.status,
		attemptsUsed: record.attemptsUsed,
		attemptsLeft: attemptsLeft(record)
	};
}

async function findAssignment(
	db: Database,
	{ studentId, assignmentId }: AssignmentLookup
): Promise<AssignmentRecord | undefined> {
	const [found] = await db
		.select(assignmentRecordColumns)
		.from(puzzleAssignment)
		.innerJoin(puzzle, eq(puzzle.id, puzzleAssignment.puzzleId))
		.where(and(eq(puzzleAssignment.id, assignmentId), eq(puzzleAssignment.studentId, studentId)));

	return found;
}

async function findOpenAssignment(
	db: Database,
	lookup: AssignmentLookup
): Promise<OpenAssignmentResult> {
	const assignment = await findAssignment(db, lookup);
	if (!assignment) return { ok: false, status: 404, message: 'Puzzle not found' };
	if (assignment.status !== 'assigned') {
		return { ok: false, status: 409, message: 'This puzzle is already finished' };
	}

	return { ok: true, assignment };
}

/** Saves only if no other attempt finished since `assignment` was read. */
async function saveAttemptProgress(
	db: Database,
	assignment: AssignmentRecord,
	status: AssignmentStatus,
	attemptsUsed: number
): Promise<boolean> {
	const saved = await db
		.update(puzzleAssignment)
		.set({ status, attemptsUsed, completedAt: status === 'assigned' ? null : new Date() })
		.where(
			and(
				eq(puzzleAssignment.id, assignment.id),
				eq(puzzleAssignment.status, 'assigned'),
				eq(puzzleAssignment.attemptsUsed, assignment.attemptsUsed)
			)
		)
		.returning({ id: puzzleAssignment.id });

	return saved.length > 0;
}

export async function listStudentAssignments(
	db: Database,
	studentId: string
): Promise<StudentAssignment[]> {
	const records = await db
		.select(assignmentRecordColumns)
		.from(puzzleAssignment)
		.innerJoin(puzzle, eq(puzzle.id, puzzleAssignment.puzzleId))
		.where(eq(puzzleAssignment.studentId, studentId))
		.orderBy(desc(puzzleAssignment.assignedAt));

	return records.map(toStudentAssignment);
}

export async function getStudentAssignment(
	db: Database,
	lookup: AssignmentLookup
): Promise<StudentAssignmentDetails | undefined> {
	const record = await findAssignment(db, lookup);
	if (!record) return undefined;

	return {
		...toStudentAssignment(record),
		fen: record.fen,
		solution: record.status === 'assigned' ? null : record.solution
	};
}

export async function submitMove(db: Database, input: SubmitMoveData): Promise<SubmitMoveResult> {
	const openAssignment = await findOpenAssignment(db, input);
	if (!openAssignment.ok) return openAssignment;

	const { assignment } = openAssignment;
	const result = checkSolverMove({
		fen: assignment.fen,
		solution: assignment.solution,
		moves: input.moves
	});

	if (result.kind === 'invalid') {
		return { ok: false, status: 400, message: 'That move does not fit this puzzle' };
	}
	if (result.kind === 'correct') return { ok: true, outcome: result };

	const progress = finishAttempt({ ...assignment, solved: result.kind === 'solved' });
	const saved = await saveAttemptProgress(db, assignment, progress.status, progress.attemptsUsed);
	if (!saved) return { ok: false, status: 409, message: UPDATED_ELSEWHERE_MESSAGE };

	return { ok: true, outcome: result };
}

export async function giveUp(db: Database, lookup: AssignmentLookup): Promise<GiveUpResult> {
	const openAssignment = await findOpenAssignment(db, lookup);
	if (!openAssignment.ok) return openAssignment;

	const { assignment } = openAssignment;
	const saved = await saveAttemptProgress(db, assignment, 'failed', assignment.attemptsUsed + 1);
	if (!saved) return { ok: false, status: 409, message: UPDATED_ELSEWHERE_MESSAGE };

	return { ok: true };
}
