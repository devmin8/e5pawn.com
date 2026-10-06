<script lang="ts">
	import SearchIcon from '@lucide/svelte/icons/search';
	import { SvelteSet } from 'svelte/reactivity';
	import { toast } from 'svelte-sonner';
	import * as v from 'valibot';

	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Dialog from '$lib/components/ui/dialog';
	import { FieldError } from '$lib/components/ui/field';
	import * as InputGroup from '$lib/components/ui/input-group';
	import { PuzzleStudentsSchema } from '$lib/schemas/puzzle-students.schema';
	import type { UserProfile } from '$lib/server/users';
	import { request } from '$lib/utils/request';
	import { safeResolve } from '$lib/utils/safe-resolve';

	import { matchesStudentSearch } from './utils';

	type Props = {
		open?: boolean;
		puzzleId: string;
		/** Active students who don't have the puzzle yet. */
		students: UserProfile[];
	};

	let { open = $bindable(false), puzzleId, students }: Props = $props();

	let submitting = $state(false);
	let errorMessage = $state<string>();

	let query = $state('');
	const selectedIds = new SvelteSet<string>();

	const visibleStudents = $derived(
		students.filter((student) => matchesStudentSearch(student, query))
	);
	const visibleSelectedCount = $derived(
		visibleStudents.filter((student) => selectedIds.has(student.id)).length
	);
	const allVisibleSelected = $derived(
		visibleStudents.length > 0 && visibleSelectedCount === visibleStudents.length
	);

	function toggleStudent(studentId: string): void {
		if (selectedIds.has(studentId)) selectedIds.delete(studentId);
		else selectedIds.add(studentId);
	}

	function toggleVisible(): void {
		const deselect = allVisibleSelected;

		for (const student of visibleStudents) {
			if (deselect) selectedIds.delete(student.id);
			else selectedIds.add(student.id);
		}
	}

	function reset(): void {
		query = '';
		selectedIds.clear();
		errorMessage = undefined;
	}

	async function assign() {
		const parsed = v.safeParse(PuzzleStudentsSchema, { studentIds: [...selectedIds] });
		if (!parsed.success) {
			errorMessage = parsed.issues[0].message;
			return;
		}

		submitting = true;
		errorMessage = undefined;

		const outcome = await request(`/api/puzzles/${encodeURIComponent(puzzleId)}/assignments`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(parsed.output)
		});

		if (outcome.ok) {
			const invalidation = await safeResolve(invalidateAll);
			open = false;
			reset();
			if (invalidation.ok) {
				toast.success('Students assigned');
			} else {
				toast.error('Students assigned, but the page could not refresh. Please reload.');
			}
		} else {
			errorMessage = outcome.error.message;
		}

		submitting = false;
	}
</script>

<Dialog.Root
	bind:open
	onOpenChange={(isOpen) => {
		if (!isOpen) reset();
	}}
>
	{#if open}
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Assign students</Dialog.Title>
				<Dialog.Description
					>Only students who don’t have this puzzle yet are listed.</Dialog.Description
				>
			</Dialog.Header>

			{#if students.length}
				<InputGroup.Root>
					<InputGroup.Input bind:value={query} placeholder="Search by name or email" />
					<InputGroup.Addon>
						<SearchIcon />
					</InputGroup.Addon>
				</InputGroup.Root>

				<div class="flex items-center justify-between gap-4 text-xs">
					<span class="text-muted-foreground">
						{selectedIds.size} selected · {visibleStudents.length} shown
					</span>
					<button
						type="button"
						class="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-50"
						disabled={!visibleStudents.length}
						onclick={toggleVisible}
					>
						{allVisibleSelected ? 'Deselect shown' : 'Select shown'}
					</button>
				</div>

				<ul class="max-h-[50vh] overflow-y-auto rounded-md border">
					{#each visibleStudents as student (student.id)}
						<li class="border-b last:border-b-0">
							<label class="hover:bg-muted/50 flex cursor-pointer items-center gap-3 px-3 py-2">
								<Checkbox
									checked={selectedIds.has(student.id)}
									onCheckedChange={() => toggleStudent(student.id)}
								/>
								<span class="flex min-w-0 flex-col">
									<span class="truncate text-sm">{student.name}</span>
									<span class="text-muted-foreground truncate text-xs">{student.email}</span>
								</span>
							</label>
						</li>
					{:else}
						<li class="text-muted-foreground py-6 text-center text-sm">No students found.</li>
					{/each}
				</ul>
			{:else}
				<p class="text-muted-foreground py-6 text-center text-sm">
					Every active student already has this puzzle.
				</p>
			{/if}

			{#if errorMessage}
				<FieldError errors={[{ message: errorMessage }]} />
			{/if}

			<Dialog.Footer>
				<Button variant="outline" disabled={submitting} onclick={() => (open = false)}>
					Cancel
				</Button>
				<Button disabled={submitting || !selectedIds.size} onclick={assign}>
					{#if submitting}
						Assigning…
					{:else}
						Assign {selectedIds.size || ''}
						{selectedIds.size === 1 ? 'student' : 'students'}
					{/if}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	{/if}
</Dialog.Root>
