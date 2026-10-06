<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { FieldError } from '$lib/components/ui/field';
	import type { PuzzleAssignee } from '$lib/server/puzzles';
	import { request } from '$lib/utils/request';
	import { safeResolve } from '$lib/utils/safe-resolve';

	type Props = {
		open?: boolean;
		puzzleId: string;
		assignees: PuzzleAssignee[];
		onunassigned?: () => void;
	};

	const NAMES_SHOWN = 5;

	let { open = $bindable(false), puzzleId, assignees, onunassigned }: Props = $props();

	let submitting = $state(false);
	let errorMessage = $state<string>();

	const shownNames = $derived(assignees.slice(0, NAMES_SHOWN).map((assignee) => assignee.name));
	const hiddenCount = $derived(assignees.length - shownNames.length);

	async function unassign() {
		if (submitting) return;

		submitting = true;
		errorMessage = undefined;

		const outcome = await request(`/api/puzzles/${encodeURIComponent(puzzleId)}/assignments`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ studentIds: assignees.map((assignee) => assignee.studentId) })
		});

		if (outcome.ok) {
			const invalidation = await safeResolve(invalidateAll);
			open = false;
			onunassigned?.();
			if (invalidation.ok) {
				toast.success('Students unassigned');
			} else {
				toast.error('Students unassigned, but the page could not refresh. Please reload.');
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
		if (!isOpen) errorMessage = undefined;
	}}
>
	{#if open}
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>
					Unassign {assignees.length}
					{assignees.length === 1 ? 'student' : 'students'}?
				</Dialog.Title>
				<Dialog.Description>
					{shownNames.join(', ')}{#if hiddenCount}&nbsp;and {hiddenCount} more{/if} will no longer see
					this puzzle. You can assign it again later.
				</Dialog.Description>
			</Dialog.Header>

			{#if errorMessage}
				<FieldError errors={[{ message: errorMessage }]} />
			{/if}

			<Dialog.Footer>
				<Button variant="outline" disabled={submitting} onclick={() => (open = false)}>
					Cancel
				</Button>
				<Button variant="destructive" disabled={submitting} onclick={unassign}>
					{submitting ? 'Unassigning…' : 'Unassign'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	{/if}
</Dialog.Root>
