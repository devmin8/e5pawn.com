<script lang="ts">
	import { untrack } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import '@lichess-org/chessground/assets/chessground.base.css';
	import '@lichess-org/chessground/assets/chessground.brown.css';
	import '@lichess-org/chessground/assets/chessground.cburnett.css';

	import { ChessBoard, type ChessBoardOptions } from '$lib/chess/board';
	import { cn } from '$lib/utils/cn';

	type Props = {
		options: ChessBoardOptions;
		class?: string;
	};

	let { options, class: className }: Props = $props();

	const attachBoard: Attachment<HTMLDivElement> = (element) => {
		const board = new ChessBoard(
			element,
			untrack(() => options)
		);
		$effect(() => board.update(options));
		return () => board.destroy();
	};
</script>

<div class={cn('cg-wrap aspect-square w-full', className)} {@attach attachBoard}></div>
