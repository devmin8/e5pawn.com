import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/http';
import { listActiveStudents } from '$lib/server/users';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	requireAdmin(locals.user);

	const [{ assignees }, students] = await Promise.all([parent(), listActiveStudents(db)]);

	const assignedIds = new Set(assignees.map((assignee) => assignee.studentId));
	const unassignedStudents = students.filter((student) => !assignedIds.has(student.id));

	return { unassignedStudents };
};
