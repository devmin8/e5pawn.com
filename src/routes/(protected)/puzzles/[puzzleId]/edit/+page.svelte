<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { PuzzleEditor } from '$lib/components/puzzles';
	import type { PuzzleInput } from '$lib/schemas/puzzle.schema';
	import { request } from '$lib/utils/request';
	import { safeResolve } from '$lib/utils/safe-resolve';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let submitting = $state(false);
	let errorMessage = $state<string>();

	const puzzleUrl = $derived(resolve(`/puzzles/${data.puzzle.id}`));

	async function onsubmit(input: PuzzleInput) {
		submitting = true;
		errorMessage = undefined;

		const outcome = await request(`/api/puzzles/${encodeURIComponent(data.puzzle.id)}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input)
		});

		if (outcome.ok) {
			toast.success('Puzzle updated');
			const navigation = await safeResolve(() => goto(puzzleUrl, { invalidateAll: true }));
			if (!navigation.ok) toast.error('Puzzle updated, but navigation failed. Please reload.');
		} else {
			errorMessage = outcome.error.message;
		}

		submitting = false;
	}
</script>

<svelte:head>
	<title>Edit {data.puzzle.title} · e5pawn</title>
</svelte:head>

<div>
	<a class="text-muted-foreground text-sm hover:underline" href={puzzleUrl}>← {data.puzzle.title}</a
	>
	<h1 class="text-2xl font-semibold">Edit puzzle</h1>
	<p class="text-muted-foreground text-sm">
		Nobody has attempted this puzzle yet, so the position, solution, and attempts can still change.
	</p>
</div>

<PuzzleEditor initial={data.puzzle} {submitting} {errorMessage} {onsubmit} />
