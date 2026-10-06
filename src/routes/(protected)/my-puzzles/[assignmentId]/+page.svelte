<script lang="ts">
	import { solverOrientation } from '$lib/chess/puzzle';
	import { LineViewer } from '$lib/components/chess';
	import { PuzzleSolver } from '$lib/components/puzzles';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const assignment = $derived(data.assignment);
</script>

<svelte:head>
	<title>{assignment.title} · e5pawn</title>
</svelte:head>

<h1 class="text-2xl font-semibold">{assignment.title}</h1>

{#if assignment.solution}
	<div class="rounded-md border p-4">
		{#if assignment.status === 'solved'}
			<p class="font-medium text-green-700 dark:text-green-400">Solved!</p>
			<p class="text-muted-foreground text-sm">
				You found it in {assignment.attemptsUsed}
				{assignment.attemptsUsed === 1 ? 'attempt' : 'attempts'}. Step through the solution below.
			</p>
		{:else}
			<p class="text-destructive font-medium">Not solved</p>
			<p class="text-muted-foreground text-sm">
				Step through the solution below to learn the idea.
			</p>
		{/if}
	</div>

	<div class="max-w-lg">
		<LineViewer
			fen={assignment.fen}
			moves={assignment.solution}
			orientation={solverOrientation(assignment.fen)}
		/>
	</div>
{:else}
	{#key assignment.id}
		<PuzzleSolver {assignment} />
	{/key}
{/if}
