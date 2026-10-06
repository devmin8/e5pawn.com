/**
 * Puzzle rules, modelled on Lichess puzzles:
 * - A puzzle is a starting FEN plus a solution: a list of UCI moves.
 * - The side to move in the FEN is the solver. Solver moves sit at even indexes (0, 2, 4…);
 *   opponent replies sit at odd indexes and are played automatically.
 * - The solution always ends on a solver move.
 * - The expected move is correct, and so is any move that delivers checkmate.
 */
import { Chess, validateFen } from 'chess.js';

import { safeTry } from '$lib/utils/safe-try';

import type { BoardOrientation } from './board';
import { parseUci } from './game';

export const UCI_MOVE_PATTERN = /^[a-h][1-8][a-h][1-8][qrbn]?$/;

export type SolverMoveResult =
	| { kind: 'correct'; opponentReply: string }
	| { kind: 'solved' }
	| { kind: 'wrong' }
	| { kind: 'invalid' };

type SolverMove = {
	fen: string;
	solution: string[];
	/** Full attempt history, including opponent replies and the latest student move. */
	moves: string[];
};

export function isSolverMoveIndex(moveIndex: number): boolean {
	return moveIndex % 2 === 0;
}

export function solverOrientation(fen: string): BoardOrientation {
	return fen.split(' ')[1] === 'b' ? 'black' : 'white';
}

export function fenError(fen: string): string | undefined {
	const validation = validateFen(fen);
	return validation.ok ? undefined : (validation.error ?? 'Invalid FEN');
}

export function solutionError(fen: string, solution: string[]): string | undefined {
	const invalidFen = fenError(fen);
	if (invalidFen) return invalidFen;

	if (!solution.length) return 'Play at least one move';
	if (!isSolverMoveIndex(solution.length - 1)) return 'The puzzle must end on the student’s move';

	const chess = new Chess(fen);
	for (const move of solution) {
		const played = safeTry(() => chess.move(parseUci(move)));
		if (!played.ok) return `Illegal move ${move}`;
	}

	return undefined;
}

export function checkSolverMove({ fen, solution, moves }: SolverMove): SolverMoveResult {
	const moveIndex = moves.length - 1;
	const isInRange = moveIndex >= 0 && moveIndex < solution.length;
	if (!isInRange || !isSolverMoveIndex(moveIndex)) return { kind: 'invalid' };

	const chess = new Chess(fen);
	for (let index = 0; index < moveIndex; index++) {
		if (moves[index] !== solution[index]) return { kind: 'invalid' };
		const played = safeTry(() => chess.move(parseUci(moves[index])));
		if (!played.ok || chess.isCheckmate()) return { kind: 'invalid' };
	}

	const move = moves[moveIndex];
	const played = safeTry(() => chess.move(parseUci(move)));
	if (!played.ok) return { kind: 'invalid' };

	const isCheckmate = chess.isCheckmate();
	const isExpectedMove = move === solution[moveIndex];
	if (!isExpectedMove && !isCheckmate) return { kind: 'wrong' };

	const opponentReply = solution[moveIndex + 1];
	if (isCheckmate || !opponentReply) return { kind: 'solved' };

	return { kind: 'correct', opponentReply };
}
