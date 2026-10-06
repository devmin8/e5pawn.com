import { describe, expect, test } from 'vitest';

import { numberMoves } from './notation';

const moves = [
	{ uci: 'd1d8', san: 'Rd8+' },
	{ uci: 'b5e8', san: 'Qe8' },
	{ uci: 'd8e8', san: 'Rxe8#' }
];

describe('numberMoves', () => {
	test('numbers White moves starting from the FEN move number', () => {
		expect(numberMoves('6k1/8/8/8/8/8/8/6K1 w - - 0 12', moves)).toEqual([
			{ index: 0, san: 'Rd8+', moveNumberLabel: '12.' },
			{ index: 1, san: 'Qe8', moveNumberLabel: undefined },
			{ index: 2, san: 'Rxe8#', moveNumberLabel: '13.' }
		]);
	});

	test('marks the first move with an ellipsis when Black starts', () => {
		expect(numberMoves('6k1/8/8/8/8/8/8/6K1 b - - 0 7', moves)).toEqual([
			{ index: 0, san: 'Rd8+', moveNumberLabel: '7…' },
			{ index: 1, san: 'Qe8', moveNumberLabel: '8.' },
			{ index: 2, san: 'Rxe8#', moveNumberLabel: undefined }
		]);
	});
});
