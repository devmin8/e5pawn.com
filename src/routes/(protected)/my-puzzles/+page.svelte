<script lang="ts">
	import EyeIcon from '@lucide/svelte/icons/eye';
	import PlayIcon from '@lucide/svelte/icons/play';

	import { resolve } from '$app/paths';
	import { AssignmentStatusBadge } from '$lib/components/puzzles';
	import { RowActions } from '$lib/components/table';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Table from '$lib/components/ui/table';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>My puzzles · e5pawn</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-semibold">My puzzles</h1>
	<p class="text-muted-foreground text-sm">Puzzles your coach has assigned to you.</p>
</div>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head>Title</Table.Head>
			<Table.Head>Status</Table.Head>
			<Table.Head>Attempts left</Table.Head>
			<Table.Head class="text-right">Actions</Table.Head>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		{#each data.assignments as assignment (assignment.id)}
			<Table.Row>
				<Table.Cell class="font-medium">{assignment.title}</Table.Cell>
				<Table.Cell>
					<AssignmentStatusBadge
						status={assignment.status}
						attemptsUsed={assignment.attemptsUsed}
					/>
				</Table.Cell>
				<Table.Cell>
					{assignment.status === 'assigned' ? (assignment.attemptsLeft ?? 'Unlimited') : '—'}
				</Table.Cell>
				<Table.Cell class="text-right">
					<RowActions label={assignment.title}>
						<DropdownMenu.Item>
							{#snippet child({ props })}
								<a {...props} href={resolve(`/my-puzzles/${assignment.id}`)}>
									{#if assignment.status === 'assigned'}
										<PlayIcon />
										Solve
									{:else}
										<EyeIcon />
										Review
									{/if}
								</a>
							{/snippet}
						</DropdownMenu.Item>
					</RowActions>
				</Table.Cell>
			</Table.Row>
		{:else}
			<Table.Row>
				<Table.Cell colspan={4} class="text-muted-foreground py-10 text-center">
					No puzzles assigned yet.
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
