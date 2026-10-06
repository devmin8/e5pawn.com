import type { AssignmentStatus } from '$lib/server/db/schema';

export type AssignmentProgress = 'todo' | 'in-progress' | 'solved' | 'failed';

export const assignmentProgressLabels: Record<AssignmentProgress, string> = {
	todo: 'To do',
	'in-progress': 'In progress',
	solved: 'Solved',
	failed: 'Failed'
};

type AssignmentState = {
	status: AssignmentStatus;
	attemptsUsed: number;
};

type SearchableStudent = {
	name: string;
	email: string;
};

export function assignmentProgress({ status, attemptsUsed }: AssignmentState): AssignmentProgress {
	if (status === 'solved' || status === 'failed') return status;
	return attemptsUsed ? 'in-progress' : 'todo';
}

/** Case-insensitive match on name or email; a blank query matches everyone. */
export function matchesStudentSearch(student: SearchableStudent, query: string): boolean {
	const needle = query.trim().toLowerCase();
	if (!needle) return true;

	return (
		student.name.toLowerCase().includes(needle) || student.email.toLowerCase().includes(needle)
	);
}
