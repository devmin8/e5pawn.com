<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { FieldError } from '$lib/components/ui/field';
	import type { UserProfile } from '$lib/server/users';
	import { request } from '$lib/utils/request';
	import { safeResolve } from '$lib/utils/safe-resolve';

	type Props = {
		open?: boolean;
		user: UserProfile;
	};

	let { open = $bindable(false), user }: Props = $props();

	let submitting = $state(false);
	let errorMessage = $state<string>();

	async function deactivate() {
		if (submitting) return;

		submitting = true;
		errorMessage = undefined;

		const outcome = await request(`/api/users/${encodeURIComponent(user.id)}`, {
			method: 'DELETE'
		});

		if (outcome.ok) {
			const invalidation = await safeResolve(invalidateAll);
			open = false;
			if (invalidation.ok) {
				toast.success('User is now inactive');
			} else {
				toast.error('User deactivated, but the list could not refresh. Please reload.');
			}
		} else {
			errorMessage = outcome.error.message;
		}

		submitting = false;
	}
</script>

<Dialog.Root
	bind:open
	onOpenChange={(next) => {
		if (!next) errorMessage = undefined;
	}}
>
	{#if open}
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Deactivate user?</Dialog.Title>
				<Dialog.Description>
					{user.name} will lose access immediately. Their account and data will be retained. This cannot
					be undone from this page.
				</Dialog.Description>
			</Dialog.Header>

			{#if errorMessage}
				<FieldError errors={[{ message: errorMessage }]} />
			{/if}

			<Dialog.Footer>
				<Button variant="outline" disabled={submitting} onclick={() => (open = false)}>
					Cancel
				</Button>

				<Button variant="destructive" disabled={submitting} onclick={deactivate}>
					{submitting ? 'Deactivating…' : 'Deactivate user'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	{/if}
</Dialog.Root>
