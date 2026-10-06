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
import { createPuzzle } from '$lib/server/puzzles';

export const POST = protectedApi(async ({ request }, actor) => {
	requireAdmin(actor);

	const body = await readJson(request);
	if (!body.ok) return badRequest('Invalid request body');

	const parsed = v.safeParse(PuzzleSchema, body.result);
	if (!parsed.success) return validationError(parsed.issues, 'Please check the puzzle details');

	const result = await createPuzzle(db, { ...parsed.output, createdBy: actor.id });

	return result.ok
		? json({ puzzleId: result.puzzleId }, { status: 201 })
		: apiError(result.status, result.message);
});
