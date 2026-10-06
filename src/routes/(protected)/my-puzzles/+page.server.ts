import { db } from '$lib/server/db';
import { requireAuthenticatedUser } from '$lib/server/http';
import { listStudentAssignments } from '$lib/server/puzzles';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const student = requireAuthenticatedUser(locals.user);

	return { assignments: await listStudentAssignments(db, student.id) };
};
