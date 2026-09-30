import { Chess, DEFAULT_POSITION, SQUARES, type Color, type Square } from 'chess.js';

const squares: ReadonlySet<string> = new Set(SQUARES);

function isSquare(value: string): value is Square {
	return squares.has(value);
}

export type PromotionPiece = 'q' | 'r' | 'b' | 'n';
export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';

export type GamePosition = {
	fen: string;
	turn: Color;
	status: GameStatus;
	inCheck: boolean;
	legalMoves: Map<Square, Square[]>;
	lastMove: [Square, Square] | undefined;
	canUndo: boolean;
};

export type PromotionMove = {
	kind: 'promotion-required';
	from: Square;
	to: Square;
};

export type MoveResult = { kind: 'moved' } | { kind: 'illegal' } | PromotionMove;

export class ChessGame {
	readonly #chess: Chess;
	readonly #initialFen: string;

	constructor(fen = DEFAULT_POSITION) {
		this.#chess = new Chess(fen);
		this.#initialFen = fen;
	}

	get position(): GamePosition {
		const legalMoves = new Map<Square, Square[]>();
		if (!this.#chess.isGameOver()) {
			for (const move of this.#chess.moves({ verbose: true })) {
				const destinations = legalMoves.get(move.from) ?? [];
				if (!destinations.includes(move.to)) destinations.push(move.to);
				legalMoves.set(move.from, destinations);
			}
		}

		const history = this.#chess.history({ verbose: true });
		const lastMove = history.at(-1);

		return {
			fen: this.#chess.fen(),
			turn: this.#chess.turn(),
			status: this.#status(),
			inCheck: this.#chess.isCheck(),
			legalMoves,
			lastMove: lastMove ? [lastMove.from, lastMove.to] : undefined,
			canUndo: history.length > 0
		};
	}

	move(from: string, to: string, promotion?: PromotionPiece): MoveResult {
		if (!isSquare(from) || !isSquare(to) || this.#chess.isGameOver()) return { kind: 'illegal' };

		const candidates = this.#chess
			.moves({ square: from, verbose: true })
			.filter((move) => move.to === to);
		if (!candidates.length) return { kind: 'illegal' };
		if (!promotion && candidates.some((move) => move.promotion)) {
			return { kind: 'promotion-required', from, to };
		}

		const move = candidates.find((candidate) => candidate.promotion === promotion);
		if (!move) return { kind: 'illegal' };

		this.#chess.move(move);
		return { kind: 'moved' };
	}

	undo(): void {
		this.#chess.undo();
	}

	reset(): void {
		this.#chess.load(this.#initialFen);
	}

	#status(): GameStatus {
		if (this.#chess.isCheckmate()) return 'checkmate';
		if (this.#chess.isStalemate()) return 'stalemate';
		if (this.#chess.isDraw()) return 'draw';
		return this.#chess.isCheck() ? 'check' : 'playing';
	}
}
