import { DEFAULT_POSITION } from 'chess.js';
import { describe, expect, test } from 'vitest';

import { ChessGame, type PromotionPiece } from './game';

describe('ChessGame', () => {
	test('allows only the active side to move and preserves the position on illegal input', () => {
		const game = new ChessGame();
		expect(game.position.legalMoves.get('e2')).toEqual(['e3', 'e4']);
		expect(game.position.legalMoves.has('e7')).toBe(false);

		for (const [from, to] of [
			['e7', 'e5'],
			['e2', 'e5'],
			['a0', 'a1'],
			['e2', 'i4']
		]) {
			expect(game.move(from, to)).toEqual({ kind: 'illegal' });
			expect(game.position.fen).toBe(DEFAULT_POSITION);
		}

		expect(game.move('e2', 'e4')).toEqual({ kind: 'moved' });
		expect(game.position.turn).toBe('b');
		expect(game.position.lastMove).toEqual(['e2', 'e4']);
		expect(game.position.legalMoves.has('e2')).toBe(false);
		expect(game.move('e7', 'e5')).toEqual({ kind: 'moved' });
		expect(game.position.turn).toBe('w');
	});

	test('prevents a pinned piece from exposing its king', () => {
		const game = new ChessGame('4r1k1/8/8/8/8/8/4R3/4K3 w - - 0 1');
		expect(game.position.legalMoves.get('e2')).not.toContain('d2');
		expect(game.move('e2', 'd2')).toEqual({ kind: 'illegal' });
		expect(game.move('e2', 'e8')).toEqual({ kind: 'moved' });
	});

	test('castles both sides and includes the rook in the resulting position', () => {
		const game = new ChessGame('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
		expect(game.position.legalMoves.get('e1')).toEqual(expect.arrayContaining(['c1', 'g1']));
		expect(game.move('e1', 'g1')).toEqual({ kind: 'moved' });
		expect(game.position.fen.split(' ')[0]).toBe('r3k2r/8/8/8/8/8/8/R4RK1');
		expect(game.move('e8', 'c8')).toEqual({ kind: 'moved' });
		expect(game.position.fen.split(' ')[0]).toBe('2kr3r/8/8/8/8/8/8/R4RK1');
	});

	test('disallows castling through check', () => {
		const game = new ChessGame('4kr2/8/8/8/8/8/8/4K2R w K - 0 1');
		expect(game.position.legalMoves.get('e1')).not.toContain('g1');
		expect(game.move('e1', 'g1')).toEqual({ kind: 'illegal' });
	});

	test('removes the captured pawn on en passant', () => {
		const game = new ChessGame('4k3/3p4/8/4P3/8/8/8/4K3 b - - 0 1');
		game.move('d7', 'd5');
		expect(game.position.legalMoves.get('e5')).toContain('d6');
		expect(game.move('e5', 'd6')).toEqual({ kind: 'moved' });
		expect(game.position.fen.split(' ')[0]).toBe('4k3/8/3P4/8/8/8/8/4K3');
	});

	test('defers promotion without changing the position or duplicating destinations', () => {
		const fen = '4k3/P7/8/8/8/8/8/4K3 w - - 0 1';
		const game = new ChessGame(fen);
		expect(game.position.legalMoves.get('a7')).toEqual(['a8']);
		expect(game.move('a7', 'a8')).toEqual({ kind: 'promotion-required', from: 'a7', to: 'a8' });
		expect(game.position.fen).toBe(fen);
		expect(game.position.canUndo).toBe(false);
	});

	const promotionPieces: PromotionPiece[] = ['q', 'r', 'b', 'n'];
	test.each(promotionPieces)('supports promotion to %s for either side', (piece) => {
		const white = new ChessGame('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');
		expect(white.move('a7', 'a8', piece)).toEqual({ kind: 'moved' });
		expect(white.position.fen.split('/')[0]).toBe(`${piece.toUpperCase()}3k3`);
		expect(white.position.turn).toBe('b');

		const black = new ChessGame('4k3/8/8/8/8/8/p7/4K3 b - - 0 1');
		expect(black.move('a2', 'a1', piece)).toEqual({ kind: 'moved' });
		expect(black.position.fen.split(' ')[0].split('/')[7]).toBe(`${piece}3K3`);
		expect(black.position.turn).toBe('w');
	});

	test('stops play after checkmate', () => {
		const game = new ChessGame();
		game.move('f2', 'f3');
		game.move('e7', 'e5');
		game.move('g2', 'g4');
		game.move('d8', 'h4');
		expect(game.position.status).toBe('checkmate');
		expect(game.position.inCheck).toBe(true);
		expect(game.position.legalMoves.size).toBe(0);
		expect(game.move('a2', 'a3')).toEqual({ kind: 'illegal' });
		game.undo();
		expect(game.position.status).toBe('playing');
		expect(game.position.legalMoves.size).toBeGreaterThan(0);
	});

	test('recognizes stalemate', () => {
		const game = new ChessGame('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
		expect(game.position.status).toBe('stalemate');
		expect(game.position.inCheck).toBe(false);
		expect(game.position.legalMoves.size).toBe(0);
	});

	test('stops play after threefold repetition and restores play on undo', () => {
		const game = new ChessGame();
		for (let i = 0; i < 2; i++) {
			game.move('g1', 'f3');
			game.move('g8', 'f6');
			game.move('f3', 'g1');
			game.move('f6', 'g8');
		}
		expect(game.position.status).toBe('draw');
		expect(game.position.legalMoves.size).toBe(0);
		expect(game.move('e2', 'e4')).toEqual({ kind: 'illegal' });
		game.undo();
		expect(game.position.status).toBe('playing');
	});

	test('undo and reset restore history, turn, and the original position', () => {
		const game = new ChessGame();
		game.move('e2', 'e4');
		game.undo();
		expect(game.position.fen).toBe(DEFAULT_POSITION);
		expect(game.position.lastMove).toBeUndefined();
		expect(game.position.canUndo).toBe(false);

		game.move('d2', 'd4');
		game.reset();
		expect(game.position.fen).toBe(DEFAULT_POSITION);
		expect(game.position.canUndo).toBe(false);

		const fen = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
		const custom = new ChessGame(fen);
		custom.move('e1', 'g1');
		custom.reset();
		expect(custom.position.fen).toBe(fen);
		expect(custom.position.lastMove).toBeUndefined();
	});
});
