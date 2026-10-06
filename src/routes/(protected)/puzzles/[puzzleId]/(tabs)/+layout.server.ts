import { error } from '@sveltejs/kit';

import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/http';
import { getPuzzle, isPuzzleEditable, listAssignees } from '$lib/server/puzzles';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	requireAdmin(locals.user);

	const puzzle = await getPuzzle(db, params.puzzleId);
	if (!puzzle) error(404, 'Puzzle not found');

	const assignees = await listAssignees(db, puzzle.id);

	return {
		puzzle,
		assignees,
		editable: isPuzzleEditable(assignees),
		pageTitle: puzzle.title
	};
};
