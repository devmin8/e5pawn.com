import { describe, expect, test } from 'vitest';

import { checkSolverMove, fenError, solutionError, solverOrientation } from './puzzle';

// White to move: Rd8+ Qe8 Rxe8#.
const backRankFen = '6k1/5ppp/8/1q6/8/8/5PPP/3R2K1 w - - 0 1';
const backRankSolution = ['d1d8', 'b5e8', 'd8e8'];

// White to move: both Ra8# and Rd8# mate.
const twoMatesFen = '6k1/5ppp/8/8/8/8/5PPP/R2R2K1 w - - 0 1';

function checkBackRankMove(moves: string[]) {
	return checkSolverMove({ fen: backRankFen, solution: backRankSolution, moves });
}

describe('solverOrientation', () => {
	test('follows the side to move', () => {
		expect(solverOrientation(backRankFen)).toBe('white');
		expect(solverOrientation('6k1/8/8/8/8/8/8/6K1 b - - 0 1')).toBe('black');
	});
});

describe('fenError', () => {
	test('accepts a valid FEN and rejects a broken one', () => {
		expect(fenError(backRankFen)).toBeUndefined();
		expect(fenError('not a fen')).toBeTypeOf('string');
	});
});

describe('solutionError', () => {
	test('accepts a legal solution that ends on the student move', () => {
		expect(solutionError(backRankFen, backRankSolution)).toBeUndefined();
	});

	test('rejects empty solutions and solutions ending on the opponent move', () => {
		expect(solutionError(backRankFen, [])).toBe('Play at least one move');
		expect(solutionError(backRankFen, backRankSolution.slice(0, 2))).toBe(
			'The puzzle must end on the student’s move'
		);
	});

	test('rejects illegal moves', () => {
		expect(solutionError(backRankFen, ['d1d9'])).toBe('Illegal move d1d9');
		expect(solutionError(backRankFen, ['g8h8'])).toBe('Illegal move g8h8');
	});
});

describe('checkSolverMove', () => {
	test('returns the opponent reply after a correct move', () => {
		expect(checkBackRankMove(['d1d8'])).toEqual({ kind: 'correct', opponentReply: 'b5e8' });
	});

	test('solves on the last expected move', () => {
		expect(checkBackRankMove(backRankSolution)).toEqual({ kind: 'solved' });
	});

	test('fails a legal move that is not the expected one', () => {
		expect(checkBackRankMove(['h2h3'])).toEqual({ kind: 'wrong' });
	});

	test('accepts any checkmate, even when it is not the recorded move', () => {
		const result = checkSolverMove({
			fen: twoMatesFen,
			solution: ['d1d8'],
			moves: ['a1a8']
		});
		expect(result).toEqual({ kind: 'solved' });
	});

	test('rejects empty histories, opponent turns, extra moves, and illegal moves', () => {
		expect(checkBackRankMove([])).toEqual({ kind: 'invalid' });
		expect(checkBackRankMove(backRankSolution.slice(0, 2))).toEqual({ kind: 'invalid' });
		expect(checkBackRankMove([...backRankSolution, 'g8h8', 'e8e7'])).toEqual({ kind: 'invalid' });
		expect(checkBackRankMove(['d1d9'])).toEqual({ kind: 'invalid' });
	});

	test('rejects skipped, reordered, or incorrect earlier moves', () => {
		expect(checkBackRankMove(['d8e8'])).toEqual({ kind: 'invalid' });
		expect(checkBackRankMove(['b5e8', 'd1d8', 'd8e8'])).toEqual({ kind: 'invalid' });
		expect(checkBackRankMove(['h2h3', 'b5e8', 'd8e8'])).toEqual({ kind: 'invalid' });
		expect(checkBackRankMove(['d1d8', 'g8h8', 'd8e8'])).toEqual({ kind: 'invalid' });
	});

	test('ends the attempt on a wrong final move after a correct history', () => {
		expect(checkBackRankMove(['d1d8', 'b5e8', 'h2h3'])).toEqual({ kind: 'wrong' });
	});

	test('accepts a mating move despite the fifty-move draw condition', () => {
		const fen = '7k/8/5KQ1/8/8/8/8/8 w - - 100 1';
		expect(solutionError(fen, ['g6g7'])).toBeUndefined();
		expect(checkSolverMove({ fen, solution: ['g6g7'], moves: ['g6g7'] })).toEqual({
			kind: 'solved'
		});
	});
});
