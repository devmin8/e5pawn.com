import { Chessground } from '@lichess-org/chessground';
import type { Api } from '@lichess-org/chessground/api';
import type { Config } from '@lichess-org/chessground/config';

import type { GamePosition } from './game';

export type BoardOrientation = 'white' | 'black';

export type ChessBoardOptions = {
	position: GamePosition;
	orientation: BoardOrientation;
	disabled: boolean;
	onmove: (from: string, to: string) => void;
};

export class ChessBoard {
	readonly #api: Api;

	constructor(element: HTMLElement, options: ChessBoardOptions) {
		this.#api = Chessground(element, this.#config(options));
	}

	update(options: ChessBoardOptions): void {
		this.#api.cancelMove();
		this.#api.set(this.#config(options));
	}

	destroy(): void {
		this.#api.destroy();
	}

	#config({ position, orientation, disabled, onmove }: ChessBoardOptions): Config {
		const turnColor = position.turn === 'w' ? 'white' : 'black';
		return {
			fen: position.fen,
			orientation,
			turnColor,
			check: position.inCheck,
			lastMove: position.lastMove,
			coordinatesOnSquares: true,
			movable: {
				free: false,
				color: disabled || !position.legalMoves.size ? undefined : turnColor,
				dests: disabled ? new Map() : position.legalMoves,
				rookCastle: false,
				events: { after: onmove }
			},
			premovable: { enabled: false }
		};
	}
}
