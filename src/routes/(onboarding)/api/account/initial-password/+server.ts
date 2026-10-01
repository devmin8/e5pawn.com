import { json } from '@sveltejs/kit';
import * as v from 'valibot';

import { ChangePasswordSchema } from '$lib/schemas/change-password.schema';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { apiError, badRequest, protectedApi, readJson, validationError } from '$lib/server/http';
import { changeInitialPassword } from '$lib/server/users';

export const POST = protectedApi(async ({ request }, actor) => {
	if (!actor.mustChangePassword) {
		return apiError(409, 'Your initial password has already been changed');
	}

	const body = await readJson(request);
	if (!body.ok) return badRequest('Invalid request body');

	const parsed = v.safeParse(ChangePasswordSchema, body.result);
	if (!parsed.success) return validationError(parsed.issues, 'Please check your password');

	const result = await changeInitialPassword(
		{ db, auth: auth.api, headers: request.headers },
		{ ...parsed.output, userId: actor.id }
	);

	return result.ok
		? json({ message: 'Password changed' })
		: apiError(result.status, result.message);
});
