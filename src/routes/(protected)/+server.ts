import { redirect } from '@sveltejs/kit';

import { requireAuthenticatedUser } from '$lib/server/http';

import type { RequestHandler } from './$types';

// There is no home page yet; send each role to its main page.
export const GET: RequestHandler = ({ locals }) => {
	const user = requireAuthenticatedUser(locals.user);
	redirect(303, user.role === 'admin' ? '/puzzles' : '/my-puzzles');
};
