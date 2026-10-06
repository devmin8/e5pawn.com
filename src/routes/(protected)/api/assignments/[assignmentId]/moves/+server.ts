import { json } from '@sveltejs/kit';
import * as v from 'valibot';

import { PuzzleMoveSchema } from '$lib/schemas/puzzle-move.schema';
import { db } from '$lib/server/db';
import { apiError, badRequest, protectedApi, readJson, validationError } from '$lib/server/http';
import { submitMove } from '$lib/server/puzzles';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = protectedApi(async ({ request, params }, actor) => {
	const body = await readJson(request);
	if (!body.ok) return badRequest('Invalid request body');

	const parsed = v.safeParse(PuzzleMoveSchema, body.result);
	if (!parsed.success) return validationError(parsed.issues, 'Invalid move');

	const result = await submitMove(db, {
		...parsed.output,
		studentId: actor.id,
		assignmentId: params.assignmentId
	});

	return result.ok ? json(result.outcome) : apiError(result.status, result.message);
});
