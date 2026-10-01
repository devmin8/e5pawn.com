<script lang="ts">
	import * as v from 'valibot';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import { LoginForm } from '$lib/components/login';
	import { ToggleTheme } from '$lib/components/toggle-theme';
	import { LoginSchema } from '$lib/schemas/login.schema';
	import type { FormValues } from '$lib/utils/form';
	import { safeResolve } from '$lib/utils/safe-resolve';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let submitting = $state(false);
	let errorMessage = $state<string | undefined>();

	async function onsubmit(input: FormValues) {
		const result = v.safeParse(LoginSchema, input);

		if (!result.success) {
			errorMessage = result.issues[0]?.message ?? 'Please check your sign-in details';
			return;
		}

		submitting = true;
		errorMessage = undefined;

		const outcome = await safeResolve(() => authClient.signIn.email(result.output));
		if (!outcome.ok) {
			errorMessage = 'Unable to sign in. Check your connection and try again.';
		} else if (outcome.result.error) {
			const error = outcome.result.error;
			errorMessage =
				error.status === 429
					? 'Too many sign-in attempts. Try again later.'
					: error.message || 'Sign in failed';
		} else {
			const navigation = await safeResolve(() =>
				goto(resolve(data.redirectTo as '/'), { invalidateAll: true })
			);
			if (!navigation.ok) errorMessage = 'Signed in, but navigation failed. Please reload.';
		}

		submitting = false;
	}
</script>

<div class="relative flex h-screen items-center justify-center px-4">
	<div class="absolute top-4 right-4">
		<ToggleTheme />
	</div>
	<LoginForm {submitting} {errorMessage} {onsubmit} />
</div>
