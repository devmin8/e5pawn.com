<script lang="ts">
	import type { PlayedMove } from '$lib/chess/game';
	import { numberMoves } from '$lib/chess/notation';
	import { cn } from '$lib/utils/cn';

	type Props = {
		fen: string;
		moves: PlayedMove[];
		/** How many moves the board currently shows; the last of them is highlighted. */
		shownMoveCount?: number;
		/** Makes moves clickable; receives how many moves to show. */
		onshow?: (moveCount: number) => void;
	};

	let { fen, moves, shownMoveCount, onshow }: Props = $props();

	const numberedMoves = $derived(numberMoves(fen, moves));
</script>

{#if numberedMoves.length}
	<ol class="flex flex-wrap items-center gap-1 font-mono text-sm">
		{#each numberedMoves as move (move.index)}
			{@const moveCount = move.index + 1}
			<li class="flex items-center gap-1">
				{#if move.moveNumberLabel}
					<span class="text-muted-foreground">{move.moveNumberLabel}</span>
				{/if}
				<button
					type="button"
					disabled={!onshow}
					class={cn(
						'rounded px-1.5 py-0.5 enabled:hover:bg-muted',
						shownMoveCount === moveCount &&
							'bg-primary text-primary-foreground enabled:hover:bg-primary'
					)}
					onclick={() => onshow?.(moveCount)}
				>
					{move.san}
				</button>
			</li>
		{/each}
	</ol>
{:else}
	<p class="text-muted-foreground text-sm">No moves yet.</p>
{/if}
