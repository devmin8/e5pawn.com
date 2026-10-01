import { json } from '@sveltejs/kit';
import * as v from 'valibot';

import { CreateUserSchema } from '$lib/schemas/create-user.schema';
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
import { createUser } from '$lib/server/users';

export const POST = protectedApi(async ({ request }, actor) => {
	requireAdmin(actor);

	const body = await readJson(request);
	if (!body.ok) return badRequest('Invalid request body');

	const parsed = v.safeParse(CreateUserSchema, body.result);
	if (!parsed.success) return validationError(parsed.issues, 'Please check the user details');

	const result = await createUser({ db, auth: auth.api, headers: request.headers }, parsed.output);

	return result.ok
		? json({ message: 'User created' }, { status: 201 })
		: apiError(result.status, result.message);
});
