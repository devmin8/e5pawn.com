import { Chess, DEFAULT_POSITION, SQUARES, type Color, type Square } from 'chess.js';

const squares: ReadonlySet<string> = new Set(SQUARES);

function isSquare(value: string): value is Square {
	return squares.has(value);
}

export type PromotionPiece = 'q' | 'r' | 'b' | 'n';
export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';

export type PlayedMove = {
	/** Machine notation such as `e2e4` or `e7e8q`; this is what gets stored and sent to the server. */
	uci: string;
	/** Human notation such as `e4` or `e8=Q+`; this is what players read. */
	san: string;
};

export type GamePosition = {
	fen: string;
	turn: Color;
	status: GameStatus;
	inCheck: boolean;
	legalMoves: Map<Square, Square[]>;
	lastMove: [Square, Square] | undefined;
	history: PlayedMove[];
	canUndo: boolean;
};

type UciMove = {
	from: string;
	to: string;
	promotion?: PromotionPiece;
};

/** Splits a UCI move such as `e7e8q` into its squares and optional promotion piece. */
export function parseUci(uci: string): UciMove {
	const promotion = uci.slice(4, 5) as PromotionPiece | '';
	return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: promotion || undefined };
}

export function positionAfterMoves(fen: string, moves: string[]): GamePosition {
	const game = new ChessGame(fen);
	for (const move of moves) game.moveUci(move);
	return game.position;
}

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
		// Puzzle play continues through draw conditions; mate and stalemate have no legal moves.
		for (const move of this.#chess.moves({ verbose: true })) {
			const destinations = legalMoves.get(move.from) ?? [];
			if (!destinations.includes(move.to)) destinations.push(move.to);
			legalMoves.set(move.from, destinations);
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
			history: history.map((move) => ({ uci: move.lan, san: move.san })),
			canUndo: history.length > 0
		};
	}

	move(from: string, to: string, promotion?: PromotionPiece): MoveResult {
		if (!isSquare(from) || !isSquare(to)) return { kind: 'illegal' };

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

	moveUci(uci: string): MoveResult {
		const { from, to, promotion } = parseUci(uci);
		return this.move(from, to, promotion);
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
