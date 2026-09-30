<script lang="ts">
	import type { ChessBoardOptions } from '$lib/chess/board';
	import { ChessGame, type PromotionMove, type PromotionPiece } from '$lib/chess/game';

	import Chessground from './chessground.svelte';
	import PromotionDialog from './promotion-dialog.svelte';

	const game = new ChessGame();
	let position = $state.raw(game.position);
	let promotion = $state<PromotionMove | null>(null);
	let options: ChessBoardOptions = $derived({
		position,
		orientation: 'white',
		disabled: promotion !== null,
		onmove: move
	});

	function move(from: string, to: string): void {
		if (promotion) return;
		const result = game.move(from, to);
		promotion = result.kind === 'promotion-required' ? result : null;
		// Always restore the engine's position, including rejected or pending moves.
		position = game.position;
	}

	function promote(piece: PromotionPiece): void {
		if (!promotion) return;
		game.move(promotion.from, promotion.to, piece);
		promotion = null;
		position = game.position;
	}

	function cancelPromotion(): void {
		promotion = null;
		position = game.position;
	}
</script>

<section class="w-full" aria-label="Local chess game">
	<Chessground {options} />
	<PromotionDialog open={promotion !== null} onchoose={promote} oncancel={cancelPromotion} />
</section>
