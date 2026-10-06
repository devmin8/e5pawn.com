<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import SearchIcon from '@lucide/svelte/icons/search';
	import UserMinusIcon from '@lucide/svelte/icons/user-minus';
	import { SvelteSet } from 'svelte/reactivity';

	import {
		AssignmentStatusBadge,
		AssignStudentsDialog,
		UnassignStudentsDialog
	} from '$lib/components/puzzles';
	import {
		assignmentProgress,
		assignmentProgressLabels,
		matchesStudentSearch,
		type AssignmentProgress
	} from '$lib/components/puzzles/utils';
	import { RowActions } from '$lib/components/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Table from '$lib/components/ui/table';
	import type { PuzzleAssignee } from '$lib/server/puzzles';

	import type { PageProps } from './$types';

	type ProgressFilter = AssignmentProgress | 'all';

	let { data }: PageProps = $props();

	let query = $state('');
	let progressFilter = $state<ProgressFilter>('all');
	const selectedIds = new SvelteSet<string>();

	let assigning = $state(false);
	let unassigning = $state(false);
	let unassignTargets = $state<PuzzleAssignee[]>([]);

	const filterLabels: Record<ProgressFilter, string> = {
		all: 'All statuses',
		...assignmentProgressLabels
	};

	const visibleAssignees = $derived(
		data.assignees.filter(
			(assignee) =>
				matchesStudentSearch(assignee, query) &&
				(progressFilter === 'all' || assignmentProgress(assignee) === progressFilter)
		)
	);
	const removableVisible = $derived(visibleAssignees.filter((assignee) => !isLocked(assignee)));
	// Pruned against fresh data so students removed elsewhere drop out of the selection.
	const selectedAssignees = $derived(
		data.assignees.filter((assignee) => selectedIds.has(assignee.studentId) && !isLocked(assignee))
	);
	const selectedVisibleCount = $derived(
		removableVisible.filter((assignee) => selectedIds.has(assignee.studentId)).length
	);
	const allVisibleSelected = $derived(
		removableVisible.length > 0 && selectedVisibleCount === removableVisible.length
	);

	/** Students who already attempted the puzzle keep it. */
	function isLocked(assignee: PuzzleAssignee): boolean {
		return assignee.attemptsUsed > 0;
	}

	function toggleAssignee(assignee: PuzzleAssignee): void {
		if (selectedIds.has(assignee.studentId)) selectedIds.delete(assignee.studentId);
		else selectedIds.add(assignee.studentId);
	}

	function toggleVisible(): void {
		const deselect = allVisibleSelected;

		for (const assignee of removableVisible) {
			if (deselect) selectedIds.delete(assignee.studentId);
			else selectedIds.add(assignee.studentId);
		}
	}

	function confirmUnassign(targets: PuzzleAssignee[]): void {
		unassignTargets = targets;
		unassigning = true;
	}

	function clearUnassigned(): void {
		for (const target of unassignTargets) selectedIds.delete(target.studentId);
	}
</script>

<div class="flex flex-wrap items-center gap-2">
	<InputGroup.Root class="w-full sm:w-72">
		<InputGroup.Input bind:value={query} placeholder="Search by name or email" />
		<InputGroup.Addon>
			<SearchIcon />
		</InputGroup.Addon>
	</InputGroup.Root>

	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="outline">
					{filterLabels[progressFilter]}
					<ChevronDownIcon />
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="start">
			<DropdownMenu.RadioGroup bind:value={progressFilter}>
				{#each Object.entries(filterLabels) as [value, label] (value)}
					<DropdownMenu.RadioItem {value}>{label}</DropdownMenu.RadioItem>
				{/each}
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Content>
	</DropdownMenu.Root>

	<div class="ml-auto flex items-center gap-2">
		{#if selectedAssignees.length}
			<Button variant="ghost" onclick={() => selectedIds.clear()}>Clear selection</Button>
			<Button variant="destructive" onclick={() => confirmUnassign(selectedAssignees)}>
				<UserMinusIcon />
				Unassign {selectedAssignees.length}
			</Button>
		{/if}
		<Button onclick={() => (assigning = true)}>Assign students</Button>
	</div>
</div>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head class="w-10">
				<Checkbox
					aria-label="Select all shown students who haven’t attempted"
					checked={allVisibleSelected}
					indeterminate={selectedVisibleCount > 0 && !allVisibleSelected}
					disabled={!removableVisible.length}
					onCheckedChange={toggleVisible}
				/>
			</Table.Head>
			<Table.Head>Student</Table.Head>
			<Table.Head>Status</Table.Head>
			<Table.Head class="text-right">Attempts used</Table.Head>
			<Table.Head class="w-12 text-right">
				<span class="sr-only">Actions</span>
			</Table.Head>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		{#each visibleAssignees as assignee (assignee.assignmentId)}
			{@const locked = isLocked(assignee)}
			<Table.Row data-state={selectedIds.has(assignee.studentId) ? 'selected' : undefined}>
				<Table.Cell>
					<Checkbox
						aria-label={`Select ${assignee.name}`}
						checked={selectedIds.has(assignee.studentId)}
						disabled={locked}
						title={locked ? 'Already attempted, so it can’t be unassigned' : undefined}
						onCheckedChange={() => toggleAssignee(assignee)}
					/>
				</Table.Cell>
				<Table.Cell>
					<div class="flex items-center gap-2 font-medium">
						{assignee.name}
						{#if assignee.inactive}
							<Badge variant="secondary">Inactive</Badge>
						{/if}
					</div>
					<div class="text-muted-foreground text-xs">{assignee.email}</div>
				</Table.Cell>
				<Table.Cell>
					<AssignmentStatusBadge status={assignee.status} attemptsUsed={assignee.attemptsUsed} />
				</Table.Cell>
				<Table.Cell class="text-right">{assignee.attemptsUsed}</Table.Cell>
				<Table.Cell class="text-right">
					<RowActions label={assignee.name}>
						<DropdownMenu.Item
							variant="destructive"
							disabled={locked}
							onclick={() => confirmUnassign([assignee])}
						>
							<UserMinusIcon />
							Unassign
						</DropdownMenu.Item>
					</RowActions>
				</Table.Cell>
			</Table.Row>
		{:else}
			<Table.Row>
				<Table.Cell colspan={5} class="text-muted-foreground py-10 text-center">
					{data.assignees.length
						? 'No students match your filters.'
						: 'Not assigned to anyone yet. Use “Assign students” to get started.'}
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>

<AssignStudentsDialog
	bind:open={assigning}
	puzzleId={data.puzzle.id}
	students={data.unassignedStudents}
/>

<UnassignStudentsDialog
	bind:open={unassigning}
	puzzleId={data.puzzle.id}
	assignees={unassignTargets}
	onunassigned={clearUnassigned}
/>
