<script lang="ts">
	import type { BoardOrientation, ChessBoardOptions } from '$lib/chess/board';
	import type {
		ChessGame,
		GamePosition,
		MoveResult,
		PlayedMove,
		PromotionMove,
		PromotionPiece
	} from '$lib/chess/game';

	import Chessground from './chessground.svelte';
	import PromotionDialog from './promotion-dialog.svelte';

	type Props = {
		game: ChessGame;
		/** Owned by the parent; reassign it to `game.position` after changing `game` directly. */
		position: GamePosition;
		orientation?: BoardOrientation;
		disabled?: boolean;
		onmove?: (move: PlayedMove) => void;
	};

	let {
		game,
		position = $bindable(),
		orientation = 'white',
		disabled = false,
		onmove
	}: Props = $props();

	let promotion = $state<PromotionMove | null>(null);
	let options: ChessBoardOptions = $derived({
		position,
		orientation,
		disabled: disabled || promotion !== null,
		onmove: move
	});

	function applyMoveResult(result: MoveResult): void {
		promotion = result.kind === 'promotion-required' ? result : null;
		// Always restore the engine's position, including rejected or pending moves.
		position = game.position;

		const playedMove = position.history.at(-1);
		if (result.kind === 'moved' && playedMove) onmove?.(playedMove);
	}

	function move(from: string, to: string): void {
		if (promotion) return;
		applyMoveResult(game.move(from, to));
	}

	function promote(piece: PromotionPiece): void {
		if (!promotion) return;
		applyMoveResult(game.move(promotion.from, promotion.to, piece));
	}

	function cancelPromotion(): void {
		promotion = null;
		position = game.position;
	}
</script>

<section class="w-full" aria-label="Chess board">
	<Chessground {options} />
	<PromotionDialog open={promotion !== null} onchoose={promote} oncancel={cancelPromotion} />
</section>
