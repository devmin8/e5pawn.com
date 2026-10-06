import * as v from 'valibot';

import { UCI_MOVE_PATTERN } from '$lib/chess/puzzle';

export const TITLE_MAX_LENGTH = 100;
export const MAX_ATTEMPTS = 99;
export const DEFAULT_MAX_ATTEMPTS = 3;
export const MAX_SOLUTION_MOVES = 100;

export const PuzzleSchema = v.object({
	title: v.pipe(
		v.string(),
		v.trim(),
		v.nonEmpty('Title is required'),
		v.maxLength(TITLE_MAX_LENGTH, `Title must be ${TITLE_MAX_LENGTH} characters or fewer`)
	),
	fen: v.pipe(v.string(), v.trim(), v.nonEmpty('Starting position is required')),
	solution: v.pipe(
		v.array(v.pipe(v.string(), v.regex(UCI_MOVE_PATTERN, 'Invalid move'))),
		v.maxLength(MAX_SOLUTION_MOVES, `A solution can have at most ${MAX_SOLUTION_MOVES} moves`)
	),
	maxAttempts: v.nullable(
		v.pipe(
			v.number('Attempts must be a number'),
			v.integer('Attempts must be a whole number'),
			v.minValue(1, 'Allow at least one attempt'),
			v.maxValue(MAX_ATTEMPTS, `Attempts must be ${MAX_ATTEMPTS} or fewer`)
		)
	)
});

export type PuzzleInput = v.InferOutput<typeof PuzzleSchema>;
