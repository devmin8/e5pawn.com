import type { PlayedMove } from './game';

export type NumberedMove = {
	index: number;
	san: string;
	/** "12." before White's move, "12…" when the line starts with Black, otherwise undefined. */
	moveNumberLabel?: string;
};

export function numberMoves(fen: string, moves: PlayedMove[]): NumberedMove[] {
	const [, sideToMove, , , , fullMoveNumber] = fen.split(' ');
	let moveNumber = Number(fullMoveNumber) || 1;
	let isWhiteMove = sideToMove !== 'b';

	return moves.map((move, index) => {
		let moveNumberLabel: string | undefined;
		if (isWhiteMove) moveNumberLabel = `${moveNumber}.`;
		else if (index === 0) moveNumberLabel = `${moveNumber}…`;

		if (!isWhiteMove) moveNumber++;
		isWhiteMove = !isWhiteMove;

		return { index, san: move.san, moveNumberLabel };
	});
}
