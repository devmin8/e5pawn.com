<script lang="ts">
	import { toast } from 'svelte-sonner';
	import * as v from 'valibot';

	import { invalidateAll } from '$app/navigation';
	import * as Dialog from '$lib/components/ui/dialog';
	import { CreateUserSchema } from '$lib/schemas/create-user.schema';
	import type { FormValues } from '$lib/utils/form';
	import { request } from '$lib/utils/request';
	import { safeResolve } from '$lib/utils/safe-resolve';

	import UserForm from './user-form.svelte';

	type Props = { open?: boolean };

	let { open = $bindable(false) }: Props = $props();

	let submitting = $state(false);
	let errorMessage = $state<string>();

	async function onsubmit(input: FormValues) {
		const parsed = v.safeParse(CreateUserSchema, input);
		if (!parsed.success) {
			errorMessage = parsed.issues[0].message;
			return;
		}

		submitting = true;
		errorMessage = undefined;

		const outcome = await request('/api/users', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(parsed.output)
		});

		if (outcome.ok) {
			const invalidation = await safeResolve(invalidateAll);
			open = false;
			if (invalidation.ok) {
				toast.success('User created');
			} else {
				toast.error('User created, but the list could not refresh. Please reload.');
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
				<Dialog.Title>Add user</Dialog.Title>
				<Dialog.Description>Create an account with an initial password.</Dialog.Description>
			</Dialog.Header>

			<UserForm {submitting} {errorMessage} {onsubmit} />
		</Dialog.Content>
	{/if}
</Dialog.Root>
