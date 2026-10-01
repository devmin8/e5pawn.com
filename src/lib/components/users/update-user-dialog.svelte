<script lang="ts">
	import { toast } from 'svelte-sonner';
	import * as v from 'valibot';

	import { invalidateAll } from '$app/navigation';
	import * as Dialog from '$lib/components/ui/dialog';
	import { UserProfileSchema } from '$lib/schemas/user-profile.schema';
	import type { UserProfile } from '$lib/server/users';
	import type { FormValues } from '$lib/utils/form';
	import { request } from '$lib/utils/request';
	import { safeResolve } from '$lib/utils/safe-resolve';

	import UserForm from './user-form.svelte';

	type Props = {
		open?: boolean;
		user: UserProfile;
	};

	let { open = $bindable(false), user }: Props = $props();

	let submitting = $state(false);
	let errorMessage = $state<string>();

	async function onsubmit(input: FormValues) {
		const parsed = v.safeParse(UserProfileSchema, input);
		if (!parsed.success) {
			errorMessage = parsed.issues[0].message;
			return;
		}

		submitting = true;
		errorMessage = undefined;

		const outcome = await request(`/api/users/${encodeURIComponent(user.id)}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(parsed.output)
		});

		if (outcome.ok) {
			const invalidation = await safeResolve(invalidateAll);
			open = false;
			if (invalidation.ok) {
				toast.success('User updated');
			} else {
				toast.error('User updated, but the list could not refresh. Please reload.');
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
				<Dialog.Title>Edit user</Dialog.Title>
				<Dialog.Description>Update the user's name and email address.</Dialog.Description>
			</Dialog.Header>

			<UserForm {user} {submitting} {errorMessage} {onsubmit} />
		</Dialog.Content>
	{/if}
</Dialog.Root>
