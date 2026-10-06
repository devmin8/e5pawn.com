import { json } from '@sveltejs/kit';

import { db } from '$lib/server/db';
import { apiError, protectedApi } from '$lib/server/http';
import { giveUp } from '$lib/server/puzzles';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = protectedApi(async ({ params }, actor) => {
	const result = await giveUp(db, { studentId: actor.id, assignmentId: params.assignmentId });

	return result.ok
		? json({ message: 'Solution revealed' })
		: apiError(result.status, result.message);
});
