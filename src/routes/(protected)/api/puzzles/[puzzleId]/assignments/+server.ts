import { json } from '@sveltejs/kit';
import * as v from 'valibot';

import {
	PuzzleStudentsSchema,
	type PuzzleStudentsInput
} from '$lib/schemas/puzzle-students.schema';
import { db } from '$lib/server/db';
import {
	apiError,
	badRequest,
	protectedApi,
	readJson,
	requireAdmin,
	validationError
} from '$lib/server/http';
import { assignStudents, unassignStudents } from '$lib/server/puzzles';

import type { RequestHandler } from './$types';

type ParsedStudents = { ok: true; input: PuzzleStudentsInput } | { ok: false; response: Response };

async function readStudents(request: Request): Promise<ParsedStudents> {
	const body = await readJson(request);
	if (!body.ok) return { ok: false, response: badRequest('Invalid request body') };

	const parsed = v.safeParse(PuzzleStudentsSchema, body.result);
	if (!parsed.success) {
		return { ok: false, response: validationError(parsed.issues, 'Please choose the students') };
	}

	return { ok: true, input: parsed.output };
}

export const POST: RequestHandler = protectedApi(async ({ request, params }, actor) => {
	requireAdmin(actor);

	const students = await readStudents(request);
	if (!students.ok) return students.response;

	const result = await assignStudents(db, { ...students.input, puzzleId: params.puzzleId });

	return result.ok
		? json({ message: 'Students assigned' })
		: apiError(result.status, result.message);
});

export const DELETE: RequestHandler = protectedApi(async ({ request, params }, actor) => {
	requireAdmin(actor);

	const students = await readStudents(request);
	if (!students.ok) return students.response;

	const result = await unassignStudents(db, { ...students.input, puzzleId: params.puzzleId });

	return result.ok
		? json({ message: 'Students unassigned' })
		: apiError(result.status, result.message);
});
