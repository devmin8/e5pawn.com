import { describe, expect, test } from 'vitest';

import { attemptsLeft, finishAttempt, hasAttempted, isPuzzleEditable } from './attempts';

describe('finishAttempt', () => {
	test('solves on any attempt', () => {
		expect(finishAttempt({ attemptsUsed: 0, maxAttempts: 1, solved: true })).toEqual({
			status: 'solved',
			attemptsUsed: 1
		});
		expect(finishAttempt({ attemptsUsed: 4, maxAttempts: null, solved: true })).toEqual({
			status: 'solved',
			attemptsUsed: 5
		});
	});

	test('keeps the puzzle open while attempts remain', () => {
		expect(finishAttempt({ attemptsUsed: 1, maxAttempts: 3, solved: false })).toEqual({
			status: 'assigned',
			attemptsUsed: 2
		});
	});

	test('fails after the last allowed attempt', () => {
		expect(finishAttempt({ attemptsUsed: 0, maxAttempts: 1, solved: false })).toEqual({
			status: 'failed',
			attemptsUsed: 1
		});
		expect(finishAttempt({ attemptsUsed: 2, maxAttempts: 3, solved: false })).toEqual({
			status: 'failed',
			attemptsUsed: 3
		});
	});

	test('never fails with unlimited attempts', () => {
		expect(finishAttempt({ attemptsUsed: 999, maxAttempts: null, solved: false })).toEqual({
			status: 'assigned',
			attemptsUsed: 1000
		});
	});
});

describe('attemptsLeft', () => {
	test('counts down and never goes negative', () => {
		expect(attemptsLeft({ attemptsUsed: 0, maxAttempts: 3 })).toBe(3);
		expect(attemptsLeft({ attemptsUsed: 3, maxAttempts: 3 })).toBe(0);
		expect(attemptsLeft({ attemptsUsed: 5, maxAttempts: 3 })).toBe(0);
	});

	test('is null when unlimited', () => {
		expect(attemptsLeft({ attemptsUsed: 10, maxAttempts: null })).toBeNull();
	});
});

describe('hasAttempted', () => {
	test('is true once any attempt was used', () => {
		expect(hasAttempted({ attemptsUsed: 0 })).toBe(false);
		expect(hasAttempted({ attemptsUsed: 1 })).toBe(true);
	});
});

describe('isPuzzleEditable', () => {
	test('is editable while nobody has attempted it', () => {
		expect(isPuzzleEditable([])).toBe(true);
		expect(isPuzzleEditable([{ attemptsUsed: 0 }, { attemptsUsed: 0 }])).toBe(true);
	});

	test('locks after the first attempt', () => {
		expect(isPuzzleEditable([{ attemptsUsed: 0 }, { attemptsUsed: 1 }])).toBe(false);
	});
});
