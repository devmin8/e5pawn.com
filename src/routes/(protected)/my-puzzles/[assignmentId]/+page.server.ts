import { error } from '@sveltejs/kit';

import { db } from '$lib/server/db';
import { requireAuthenticatedUser } from '$lib/server/http';
import { getStudentAssignment } from '$lib/server/puzzles';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const student = requireAuthenticatedUser(locals.user);

	const assignment = await getStudentAssignment(db, {
		studentId: student.id,
		assignmentId: params.assignmentId
	});
	if (!assignment) error(404, 'Puzzle not found');

	return { assignment, pageTitle: assignment.title };
};
