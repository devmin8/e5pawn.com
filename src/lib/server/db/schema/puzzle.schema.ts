import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { user } from './auth.schema';

export type AssignmentStatus = 'assigned' | 'solved' | 'failed';

export const puzzle = sqliteTable('puzzle', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	fen: text('fen').notNull(),
	// UCI moves; the side to move in `fen` plays the even indexes.
	solution: text('solution', { mode: 'json' }).$type<string[]>().notNull(),
	// Null means unlimited attempts.
	maxAttempts: integer('max_attempts'),
	createdBy: text('created_by')
		.notNull()
		.references(() => user.id),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull()
});

export const puzzleAssignment = sqliteTable(
	'puzzle_assignment',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		puzzleId: text('puzzle_id')
			.notNull()
			.references(() => puzzle.id, { onDelete: 'cascade' }),
		studentId: text('student_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		status: text('status').$type<AssignmentStatus>().notNull().default('assigned'),
		attemptsUsed: integer('attempts_used').notNull().default(0),
		assignedAt: integer('assigned_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		completedAt: integer('completed_at', { mode: 'timestamp_ms' })
	},
	(table) => [
		uniqueIndex('puzzle_assignment_puzzle_student_idx').on(table.puzzleId, table.studentId),
		index('puzzle_assignment_student_idx').on(table.studentId)
	]
);
