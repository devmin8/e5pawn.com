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

	async function reactivate() {
		if (submitting) return;

		submitting = true;
		errorMessage = undefined;

		const outcome = await request(`/api/users/${encodeURIComponent(user.id)}/reactivate`, {
			method: 'POST'
		});

		if (outcome.ok) {
			const invalidation = await safeResolve(invalidateAll);
			open = false;
			if (invalidation.ok) {
				toast.success('User is now active');
			} else {
				toast.error('User reactivated, but the list could not refresh. Please reload.');
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
				<Dialog.Title>Reactivate user?</Dialog.Title>
				<Dialog.Description>
					{user.name} will be able to sign in again with their existing password.
				</Dialog.Description>
			</Dialog.Header>

			{#if errorMessage}
				<FieldError errors={[{ message: errorMessage }]} />
			{/if}

			<Dialog.Footer>
				<Button variant="outline" disabled={submitting} onclick={() => (open = false)}>
					Cancel
				</Button>

				<Button disabled={submitting} onclick={reactivate}>
					{submitting ? 'Reactivating…' : 'Reactivate user'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	{/if}
</Dialog.Root>
