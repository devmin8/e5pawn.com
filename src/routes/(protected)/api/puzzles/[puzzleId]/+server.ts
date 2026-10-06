import { json } from '@sveltejs/kit';
import * as v from 'valibot';

import { PuzzleSchema } from '$lib/schemas/puzzle.schema';
import { db } from '$lib/server/db';
import {
	apiError,
	badRequest,
	protectedApi,
	readJson,
	requireAdmin,
	validationError
} from '$lib/server/http';
import { updatePuzzle } from '$lib/server/puzzles';

import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = protectedApi(async ({ request, params }, actor) => {
	requireAdmin(actor);

	const body = await readJson(request);
	if (!body.ok) return badRequest('Invalid request body');

	const parsed = v.safeParse(PuzzleSchema, body.result);
	if (!parsed.success) return validationError(parsed.issues, 'Please check the puzzle details');

	const result = await updatePuzzle(db, { ...parsed.output, puzzleId: params.puzzleId });

	return result.ok ? json({ message: 'Puzzle updated' }) : apiError(result.status, result.message);
});
