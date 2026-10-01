<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { FieldGroup, Field, FieldLabel, FieldError } from '$lib/components/ui/field';
	import { PASSWORD_MAX_LENGTH } from '$lib/schemas/password.schema';
	import type { FormValues } from '$lib/utils/form';

	type Props = {
		submitting?: boolean;
		errorMessage?: string;
		onsubmit: (input: FormValues) => Promise<void>;
	};

	let { submitting = false, errorMessage, onsubmit }: Props = $props();
	let form: HTMLFormElement;

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		await onsubmit(Object.fromEntries(new FormData(form)));
	}
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title>Login to your account</Card.Title>
		<Card.Description>Enter your email below to login to your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form bind:this={form} onsubmit={handleSubmit}>
			<FieldGroup>
				{#if errorMessage}
					<FieldError errors={[{ message: errorMessage }]} />
				{/if}

				<Field>
					<FieldLabel for="login-email">Email</FieldLabel>
					<Input
						id="login-email"
						name="email"
						type="email"
						placeholder="m@example.com"
						autocomplete="email"
						required
					/>
				</Field>

				<Field>
					<FieldLabel for="login-password">Password</FieldLabel>
					<Input
						id="login-password"
						name="password"
						type="password"
						autocomplete="current-password"
						required
						maxlength={PASSWORD_MAX_LENGTH}
					/>
				</Field>

				<Field>
					<Button type="submit" class="w-full" disabled={submitting}>
						{submitting ? 'Signing in…' : 'Login'}
					</Button>
				</Field>
			</FieldGroup>
		</form>
	</Card.Content>
</Card.Root>
