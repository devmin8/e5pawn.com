import * as v from 'valibot';

import { UCI_MOVE_PATTERN } from '$lib/chess/puzzle';

import { MAX_SOLUTION_MOVES } from './puzzle.schema';

export const PuzzleMoveSchema = v.object({
	moves: v.pipe(
		v.array(v.pipe(v.string(), v.regex(UCI_MOVE_PATTERN, 'Invalid move'))),
		v.minLength(1, 'Play at least one move'),
		v.maxLength(MAX_SOLUTION_MOVES, 'Too many moves')
	)
});

export type PuzzleMoveInput = v.InferOutput<typeof PuzzleMoveSchema>;
