import { json } from '@sveltejs/kit';
import * as v from 'valibot';

import { UserProfileSchema } from '$lib/schemas/user-profile.schema';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import {
	apiError,
	badRequest,
	protectedApi,
	readJson,
	requireAdmin,
	validationError
} from '$lib/server/http';
import { deactivateUser, updateUser } from '$lib/server/users';

import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = protectedApi(async ({ request, params }, actor) => {
	requireAdmin(actor);

	const body = await readJson(request);
	if (!body.ok) return badRequest('Invalid request body');

	const parsed = v.safeParse(UserProfileSchema, body.result);
	if (!parsed.success) return validationError(parsed.issues, 'Please check the user details');

	const result = await updateUser(
		{ db, auth: auth.api, headers: request.headers },
		{ ...parsed.output, userId: params.userId }
	);

	return result.ok ? json({ message: 'User updated' }) : apiError(result.status, result.message);
});

export const DELETE: RequestHandler = protectedApi(async ({ request, params }, actor) => {
	requireAdmin(actor);

	const result = await deactivateUser(
		{ db, auth: auth.api, headers: request.headers },
		params.userId
	);

	return result.ok
		? json({ message: 'User is now inactive' })
		: apiError(result.status, result.message);
});
