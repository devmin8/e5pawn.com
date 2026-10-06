import { requireAdmin } from '$lib/server/http';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals.user);

	return { pageTitle: 'New puzzle' };
};
