<script lang="ts">
	import * as v from 'valibot';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import { ChangePasswordForm } from '$lib/components/users';
	import { ChangePasswordSchema } from '$lib/schemas/change-password.schema';
	import type { FormValues } from '$lib/utils/form';
	import { request } from '$lib/utils/request';
	import { safeResolve } from '$lib/utils/safe-resolve';

	let submitting = $state(false);
	let errorMessage = $state<string>();

	async function onsubmit(input: FormValues) {
		const parsed = v.safeParse(ChangePasswordSchema, input);
		if (!parsed.success) {
			errorMessage = parsed.issues[0].message;
			return;
		}

		submitting = true;
		errorMessage = undefined;

		const outcome = await request('/api/account/initial-password', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(parsed.output)
		});

		if (outcome.ok) {
			const navigation = await safeResolve(() => goto(resolve('/'), { invalidateAll: true }));
			if (!navigation.ok) errorMessage = 'Password changed, but navigation failed. Please reload.';
		} else {
			errorMessage = outcome.error.message;
		}

		submitting = false;
	}

	async function onsignout() {
		if (submitting) return;

		submitting = true;
		errorMessage = undefined;

		const outcome = await safeResolve(() => authClient.signOut());
		if (!outcome.ok || outcome.result.error) {
			errorMessage = 'Unable to sign out. Please try again.';
		} else {
			const navigation = await safeResolve(() => goto(resolve('/login'), { invalidateAll: true }));
			if (!navigation.ok) errorMessage = 'Signed out, but navigation failed. Please reload.';
		}

		submitting = false;
	}
</script>

<svelte:head>
	<title>Change your password · e5pawn</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center px-4">
	<ChangePasswordForm {submitting} {errorMessage} {onsubmit} {onsignout} />
</div>
