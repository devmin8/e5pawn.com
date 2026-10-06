<script lang="ts" module>
	export type RecordedPuzzle = {
		fen: string;
		/** UCI moves played on the board so far. */
		solution: string[];
	};
</script>

<script lang="ts">
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import Undo2Icon from '@lucide/svelte/icons/undo-2';
	import { DEFAULT_POSITION } from 'chess.js';
	import { untrack } from 'svelte';

	import { ChessGame } from '$lib/chess/game';
	import { fenError, isSolverMoveIndex, solverOrientation } from '$lib/chess/puzzle';
	import { MoveList, PlayableBoard } from '$lib/components/chess';
	import { Button } from '$lib/components/ui/button';
	import { Field, FieldDescription, FieldError, FieldLabel } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';

	type Props = {
		/** Position and moves to start from; defaults to the standard start with no moves. */
		initial?: RecordedPuzzle;
		onchange: (recording: RecordedPuzzle) => void;
	};

	let { initial = { fen: DEFAULT_POSITION, solution: [] }, onchange }: Props = $props();

	// Only the starting values are used; the board owns the position from then on.
	const start = untrack(() => initial);

	let fen = $state(start.fen);
	let fenDraft = $state(start.fen);
	let fenErrorMessage = $state<string>();

	const initialGame = new ChessGame(start.fen);
	for (const move of start.solution) initialGame.moveUci(move);
	let game = $state.raw(initialGame);
	let position = $state.raw(initialGame.position);

	const orientation = $derived(solverOrientation(fen));
	const studentSide = $derived(orientation === 'white' ? 'White' : 'Black');
	const isStudentMoveNext = $derived(isSolverMoveIndex(position.history.length));

	function publishRecording(): void {
		position = game.position;
		onchange({ fen, solution: position.history.map((move) => move.uci) });
	}

	function loadFen(event: SubmitEvent): void {
		event.preventDefault();

		const nextFen = fenDraft.trim();
		fenErrorMessage = fenError(nextFen);
		if (fenErrorMessage) return;

		fen = nextFen;
		game = new ChessGame(nextFen);
		publishRecording();
	}

	function undoMove(): void {
		game.undo();
		publishRecording();
	}

	function clearMoves(): void {
		game.reset();
		publishRecording();
	}
</script>

<div class="flex flex-col gap-4">
	<form onsubmit={loadFen}>
		<Field>
			<FieldLabel for="puzzle-fen">Starting position (FEN)</FieldLabel>
			<div class="flex gap-2">
				<Input id="puzzle-fen" bind:value={fenDraft} required spellcheck={false} />
				<Button type="submit" variant="outline">Load</Button>
			</div>
			<FieldDescription>
				Paste a FEN or keep the standard start. Loading a new position clears the moves.
			</FieldDescription>
			{#if fenErrorMessage}
				<FieldError errors={[{ message: fenErrorMessage }]} />
			{/if}
		</Field>
	</form>

	<p class="text-sm">
		The student plays <strong>{studentSide}</strong>. Play both sides to record the solution.
		<span class="text-muted-foreground">
			Next: {isStudentMoveNext ? 'student move' : 'opponent reply'}.
		</span>
	</p>

	<PlayableBoard {game} bind:position {orientation} onmove={publishRecording} />

	<div class="flex items-center justify-between gap-2">
		<MoveList {fen} moves={position.history} />

		<div class="flex shrink-0 gap-1">
			<Button
				variant="outline"
				size="icon"
				aria-label="Undo move"
				disabled={!position.canUndo}
				onclick={undoMove}
			>
				<Undo2Icon />
			</Button>
			<Button
				variant="outline"
				size="icon"
				aria-label="Clear moves"
				disabled={!position.canUndo}
				onclick={clearMoves}
			>
				<RotateCcwIcon />
			</Button>
		</div>
	</div>
</div>
