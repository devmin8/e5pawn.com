<script lang="ts">
	import LockIcon from '@lucide/svelte/icons/lock';
	import PencilIcon from '@lucide/svelte/icons/pencil';

	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { solverOrientation } from '$lib/chess/puzzle';
	import { Button } from '$lib/components/ui/button';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { cn } from '$lib/utils/cn';

	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const solvedCount = $derived(
		data.assignees.filter((assignee) => assignee.status === 'solved').length
	);
	const solverSide = $derived(solverOrientation(data.puzzle.fen) === 'white' ? 'White' : 'Black');

	const solutionUrl = $derived(resolve(`/puzzles/${data.puzzle.id}`));
	const studentsUrl = $derived(resolve(`/puzzles/${data.puzzle.id}/students`));

	function tabClass(href: string): string {
		return cn(
			'-mb-px border-b-2 px-1 pb-2 text-sm font-medium transition-colors',
			page.url.pathname === href
				? 'border-foreground text-foreground'
				: 'text-muted-foreground hover:text-foreground border-transparent'
		);
	}

	function tabCurrent(href: string): 'page' | undefined {
		return page.url.pathname === href ? 'page' : undefined;
	}
</script>

<svelte:head>
	<title>{data.puzzle.title} · e5pawn</title>
</svelte:head>

<div class="flex items-center justify-between gap-4">
	<div>
		<h1 class="text-2xl font-semibold">{data.puzzle.title}</h1>
		<p class="text-muted-foreground text-sm">
			{solverSide} to move · {data.puzzle.maxAttempts ?? 'Unlimited'} attempts · {solvedCount} solved
		</p>
	</div>

	{#if data.editable}
		<Button variant="outline" href={resolve(`/puzzles/${data.puzzle.id}/edit`)}>
			<PencilIcon />
			Edit puzzle
		</Button>
	{:else}
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<span {...props}>
						<Button variant="outline" disabled>
							<LockIcon />
							Edit puzzle
						</Button>
					</span>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content>A student has already attempted it.</Tooltip.Content>
		</Tooltip.Root>
	{/if}
</div>

<nav class="flex gap-4 border-b" aria-label="Puzzle sections">
	<a href={solutionUrl} aria-current={tabCurrent(solutionUrl)} class={tabClass(solutionUrl)}>
		Solution
	</a>
	<a href={studentsUrl} aria-current={tabCurrent(studentsUrl)} class={tabClass(studentsUrl)}>
		Students ({data.assignees.length})
	</a>
</nav>

{@render children()}
