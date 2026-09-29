import { requireAuthenticatedUser } from '$lib/server/http';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireAuthenticatedUser(locals.user);

	return { user };
};
