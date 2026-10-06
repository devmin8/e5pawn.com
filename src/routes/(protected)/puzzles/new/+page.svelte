<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { PuzzleEditor } from '$lib/components/puzzles';
	import type { PuzzleInput } from '$lib/schemas/puzzle.schema';
	import { request } from '$lib/utils/request';
	import { safeResolve } from '$lib/utils/safe-resolve';

	type CreatedPuzzle = { puzzleId: string };

	let submitting = $state(false);
	let errorMessage = $state<string>();

	async function onsubmit(input: PuzzleInput) {
		submitting = true;
		errorMessage = undefined;

		const outcome = await request<CreatedPuzzle>('/api/puzzles', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input)
		});

		if (outcome.ok) {
			toast.success('Puzzle saved');
			const puzzleUrl = resolve(`/puzzles/${outcome.result.puzzleId}`);
			const navigation = await safeResolve(() => goto(puzzleUrl));
			if (!navigation.ok) toast.error('Puzzle saved, but navigation failed. Please reload.');
		} else {
			errorMessage = outcome.error.message;
		}

		submitting = false;
	}
</script>

<svelte:head>
	<title>New puzzle · e5pawn</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-semibold">New puzzle</h1>
	<p class="text-muted-foreground text-sm">
		Set up a position, play the solution, and save whenever it ends on the student’s move.
	</p>
</div>

<PuzzleEditor {submitting} {errorMessage} {onsubmit} />
