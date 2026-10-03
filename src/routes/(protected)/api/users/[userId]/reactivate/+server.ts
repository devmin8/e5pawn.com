import { json } from '@sveltejs/kit';

import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { apiError, protectedApi, requireAdmin } from '$lib/server/http';
import { reactivateUser } from '$lib/server/users';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = protectedApi(async ({ request, params }, actor) => {
	requireAdmin(actor);

	const result = await reactivateUser(
		{ db, auth: auth.api, headers: request.headers },
		params.userId
	);

	return result.ok
		? json({ message: 'User is now active' })
		: apiError(result.status, result.message);
});
