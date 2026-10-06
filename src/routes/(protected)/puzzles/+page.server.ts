import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/http';
import { listPuzzles } from '$lib/server/puzzles';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals.user);

	return { puzzles: await listPuzzles(db) };
};
