<script lang="ts">
	import ChevronFirstIcon from '@lucide/svelte/icons/chevron-first';
	import ChevronLastIcon from '@lucide/svelte/icons/chevron-last';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	import type { BoardOrientation, ChessBoardOptions } from '$lib/chess/board';
	import { positionAfterMoves } from '$lib/chess/game';
	import { Button } from '$lib/components/ui/button';

	import Chessground from './chessground.svelte';
	import MoveList from './move-list.svelte';

	type Props = {
		fen: string;
		/** UCI moves to step through. */
		moves: string[];
		orientation: BoardOrientation;
	};

	let { fen, moves, orientation }: Props = $props();

	let shownMoveCount = $state(0);

	const playedMoves = $derived(positionAfterMoves(fen, moves).history);
	const boardOptions: ChessBoardOptions = $derived({
		position: positionAfterMoves(fen, moves.slice(0, shownMoveCount)),
		orientation,
		disabled: true,
		onmove: () => {}
	});

	function showMoves(moveCount: number): void {
		shownMoveCount = Math.min(Math.max(moveCount, 0), moves.length);
	}
</script>

<div class="flex flex-col gap-3">
	<Chessground options={boardOptions} />

	<div class="flex justify-center gap-1">
		<Button variant="outline" size="icon" aria-label="First move" onclick={() => showMoves(0)}>
			<ChevronFirstIcon />
		</Button>
		<Button
			variant="outline"
			size="icon"
			aria-label="Previous move"
			onclick={() => showMoves(shownMoveCount - 1)}
		>
			<ChevronLeftIcon />
		</Button>
		<Button
			variant="outline"
			size="icon"
			aria-label="Next move"
			onclick={() => showMoves(shownMoveCount + 1)}
		>
			<ChevronRightIcon />
		</Button>
		<Button
			variant="outline"
			size="icon"
			aria-label="Last move"
			onclick={() => showMoves(moves.length)}
		>
			<ChevronLastIcon />
		</Button>
	</div>

	<MoveList {fen} moves={playedMoves} {shownMoveCount} onshow={showMoves} />
</div>
