import type { AssignmentStatus } from '$lib/server/db/schema';

type AttemptState = {
	attemptsUsed: number;
	/** Null means unlimited attempts. */
	maxAttempts: number | null;
};

type FinishedAttempt = AttemptState & {
	solved: boolean;
};

type AttemptProgress = {
	status: AssignmentStatus;
	attemptsUsed: number;
};

/** An attempt ends on the first wrong move or when the puzzle is solved. */
export function finishAttempt({
	attemptsUsed,
	maxAttempts,
	solved
}: FinishedAttempt): AttemptProgress {
	const attemptsUsedNow = attemptsUsed + 1;
	if (solved) return { status: 'solved', attemptsUsed: attemptsUsedNow };

	const isOutOfAttempts = maxAttempts !== null && attemptsUsedNow >= maxAttempts;
	return { status: isOutOfAttempts ? 'failed' : 'assigned', attemptsUsed: attemptsUsedNow };
}

export function attemptsLeft({ attemptsUsed, maxAttempts }: AttemptState): number | null {
	return maxAttempts === null ? null : Math.max(maxAttempts - attemptsUsed, 0);
}

export function hasAttempted({ attemptsUsed }: Pick<AttemptState, 'attemptsUsed'>): boolean {
	return attemptsUsed > 0;
}

/** A puzzle stays editable only until the first student attempts it. */
export function isPuzzleEditable(assignments: Pick<AttemptState, 'attemptsUsed'>[]): boolean {
	return !assignments.some(hasAttempted);
}
