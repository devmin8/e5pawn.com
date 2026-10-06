<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	import { untrack } from 'svelte';
	import { toast } from 'svelte-sonner';

	import { invalidateAll } from '$app/navigation';
	import { ChessGame } from '$lib/chess/game';
	import { solverOrientation } from '$lib/chess/puzzle';
	import { MoveList, PlayableBoard } from '$lib/components/chess';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { PuzzleMoveOutcome, StudentAssignmentDetails } from '$lib/server/puzzles';
	import { request } from '$lib/utils/request';
	import { safeResolve } from '$lib/utils/safe-resolve';

	type Props = {
		assignment: StudentAssignmentDetails;
	};

	type Feedback = 'your-turn' | 'correct' | 'checking' | 'wrong';

	const OPPONENT_REPLY_DELAY_MS = 400;

	let { assignment }: Props = $props();

	const fen = untrack(() => assignment.fen);
	const game = new ChessGame(fen);
	const orientation = solverOrientation(fen);
	const studentSide = orientation === 'white' ? 'White' : 'Black';
	const assignmentUrl = $derived(`/api/assignments/${encodeURIComponent(assignment.id)}`);

	let position = $state.raw(game.position);
	let feedback = $state<Feedback>('your-turn');
	let confirmingGiveUp = $state(false);
	let givingUp = $state(false);

	const canMove = $derived(feedback === 'your-turn' || feedback === 'correct');
	const attemptsLeftText = $derived.by(() => {
		const { attemptsLeft } = assignment;
		if (attemptsLeft === null) return 'Unlimited attempts';
		return `${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} left`;
	});

	function wait(milliseconds: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, milliseconds));
	}

	async function refreshAssignment(): Promise<void> {
		const invalidation = await safeResolve(invalidateAll);
		if (!invalidation.ok) toast.error('Could not refresh the puzzle. Please reload.');
	}

	async function submitMove(): Promise<void> {
		const feedbackBeforeMove = feedback;
		feedback = 'checking';

		const outcome = await request<PuzzleMoveOutcome>(`${assignmentUrl}/moves`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ moves: game.position.history.map((move) => move.uci) })
		});

		if (!outcome.ok) {
			game.undo();
			position = game.position;
			feedback = feedbackBeforeMove;
			toast.error(outcome.error.message);
			return;
		}

		const result = outcome.result;
		if (result.kind === 'correct') {
			await wait(OPPONENT_REPLY_DELAY_MS);
			game.moveUci(result.opponentReply);
			position = game.position;
			feedback = 'correct';
			return;
		}

		// Solved or wrong both end the attempt; the page shows the result once it refreshes.
		if (result.kind === 'wrong') feedback = 'wrong';
		await refreshAssignment();
	}

	function tryAgain(): void {
		game.reset();
		position = game.position;
		feedback = 'your-turn';
	}

	async function giveUp(): Promise<void> {
		givingUp = true;

		const outcome = await request(`${assignmentUrl}/give-up`, { method: 'POST' });
		if (outcome.ok) {
			confirmingGiveUp = false;
			await refreshAssignment();
		} else {
			toast.error(outcome.error.message);
		}

		givingUp = false;
	}
</script>

<div class="grid gap-6 md:grid-cols-[minmax(0,32rem)_1fr]">
	<PlayableBoard {game} bind:position {orientation} disabled={!canMove} onmove={submitMove} />

	<div class="flex flex-col gap-4">
		<div class="rounded-md border p-4">
			{#if feedback === 'your-turn'}
				<p class="font-medium">Your turn</p>
				<p class="text-muted-foreground text-sm">Find the best move for {studentSide}.</p>
			{:else if feedback === 'correct'}
				<p class="flex items-center gap-2 font-medium text-green-700 dark:text-green-400">
					<CheckIcon class="size-4" /> Best move! Keep going.
				</p>
			{:else if feedback === 'checking'}
				<p class="text-muted-foreground text-sm">Checking…</p>
			{:else}
				<p class="text-destructive flex items-center gap-2 font-medium">
					<XIcon class="size-4" /> That’s not the move.
				</p>
				<p class="text-muted-foreground text-sm">Take another look and try again.</p>
			{/if}
		</div>

		<p class="text-muted-foreground text-sm">{attemptsLeftText}</p>

		<MoveList {fen} moves={position.history} />

		<div class="flex flex-wrap gap-2">
			{#if feedback === 'wrong'}
				<Button onclick={tryAgain}>Try again</Button>
			{/if}
			<Button
				variant="ghost"
				disabled={feedback === 'checking'}
				onclick={() => (confirmingGiveUp = true)}
			>
				Give up and show solution
			</Button>
		</div>
	</div>
</div>

<Dialog.Root bind:open={confirmingGiveUp}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Show the solution?</Dialog.Title>
			<Dialog.Description>
				The puzzle will be marked as failed and you won’t be able to try it again.
			</Dialog.Description>
		</Dialog.Header>

		<Dialog.Footer>
			<Button variant="outline" disabled={givingUp} onclick={() => (confirmingGiveUp = false)}>
				Keep trying
			</Button>
			<Button variant="destructive" disabled={givingUp} onclick={giveUp}>
				{givingUp ? 'Revealing…' : 'Show solution'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
