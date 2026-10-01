import { redirect } from '@sveltejs/kit';

import { requireAuthenticatedUser } from '$lib/server/http';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	const user = requireAuthenticatedUser(locals.user);
	if (!user.mustChangePassword) redirect(303, '/');
};
