import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/http';
import { listUsers } from '$lib/server/users';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals.user);

	return { users: await listUsers(db) };
};
