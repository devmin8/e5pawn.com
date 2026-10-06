<script lang="ts">
	import EyeIcon from '@lucide/svelte/icons/eye';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import UsersIcon from '@lucide/svelte/icons/users';

	import { resolve } from '$app/paths';
	import { RowActions } from '$lib/components/table';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Table from '$lib/components/ui/table';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Puzzles · e5pawn</title>
</svelte:head>

<div class="flex items-center justify-between gap-4">
	<div>
		<h1 class="text-2xl font-semibold">Puzzles</h1>
		<p class="text-muted-foreground text-sm">Create puzzles and assign them to your students.</p>
	</div>

	<Button href={resolve('/puzzles/new')}>New puzzle</Button>
</div>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head>Title</Table.Head>
			<Table.Head>Attempts allowed</Table.Head>
			<Table.Head>Assigned</Table.Head>
			<Table.Head>Solved</Table.Head>
			<Table.Head class="text-right">Actions</Table.Head>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		{#each data.puzzles as puzzle (puzzle.id)}
			<Table.Row>
				<Table.Cell class="font-medium">
					<a class="hover:underline" href={resolve(`/puzzles/${puzzle.id}`)}>{puzzle.title}</a>
				</Table.Cell>
				<Table.Cell>{puzzle.maxAttempts ?? 'Unlimited'}</Table.Cell>
				<Table.Cell>
					<a class="hover:underline" href={resolve(`/puzzles/${puzzle.id}/students`)}>
						{puzzle.assignedCount}
					</a>
				</Table.Cell>
				<Table.Cell>{puzzle.solvedCount}</Table.Cell>
				<Table.Cell class="text-right">
					<RowActions label={puzzle.title}>
						<DropdownMenu.Item>
							{#snippet child({ props })}
								<a {...props} href={resolve(`/puzzles/${puzzle.id}/students`)}>
									<UsersIcon />
									Manage students
								</a>
							{/snippet}
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item>
							{#snippet child({ props })}
								<a {...props} href={resolve(`/puzzles/${puzzle.id}`)}>
									<EyeIcon />
									View puzzle
								</a>
							{/snippet}
						</DropdownMenu.Item>
						<DropdownMenu.Item disabled={!puzzle.editable}>
							{#snippet child({ props })}
								<a {...props} href={resolve(`/puzzles/${puzzle.id}/edit`)}>
									<PencilIcon />
									Edit puzzle
								</a>
							{/snippet}
						</DropdownMenu.Item>
					</RowActions>
				</Table.Cell>
			</Table.Row>
		{:else}
			<Table.Row>
				<Table.Cell colspan={5} class="text-muted-foreground py-10 text-center">
					No puzzles yet. Create one to get started.
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
