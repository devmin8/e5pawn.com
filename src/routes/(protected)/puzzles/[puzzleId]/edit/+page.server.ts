import { error } from '@sveltejs/kit';

import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/http';
import { getEditablePuzzle } from '$lib/server/puzzles';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	requireAdmin(locals.user);

	const result = await getEditablePuzzle(db, params.puzzleId);
	if (!result.ok) error(result.status, result.message);

	return { puzzle: result.puzzle, pageTitle: 'Edit puzzle' };
};
