import { describe, expect, test } from 'vitest';

import { assignmentProgress, matchesStudentSearch } from './utils';

describe('assignmentProgress', () => {
	test('keeps finished statuses', () => {
		expect(assignmentProgress({ status: 'solved', attemptsUsed: 1 })).toBe('solved');
		expect(assignmentProgress({ status: 'failed', attemptsUsed: 3 })).toBe('failed');
	});

	test('splits open assignments by whether they were attempted', () => {
		expect(assignmentProgress({ status: 'assigned', attemptsUsed: 0 })).toBe('todo');
		expect(assignmentProgress({ status: 'assigned', attemptsUsed: 2 })).toBe('in-progress');
	});
});

describe('matchesStudentSearch', () => {
	const student = { name: 'Magnus Carlsen', email: 'magnus@example.com' };

	test('matches everyone on a blank query', () => {
		expect(matchesStudentSearch(student, '')).toBe(true);
		expect(matchesStudentSearch(student, '   ')).toBe(true);
	});

	test('matches name or email, ignoring case and surrounding spaces', () => {
		expect(matchesStudentSearch(student, ' CARL ')).toBe(true);
		expect(matchesStudentSearch(student, 'example.com')).toBe(true);
	});

	test('rejects non-matching queries', () => {
		expect(matchesStudentSearch(student, 'hikaru')).toBe(false);
	});
});
