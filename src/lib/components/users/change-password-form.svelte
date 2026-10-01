<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Field, FieldError, FieldGroup, FieldLabel } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '$lib/schemas/password.schema';
	import type { FormValues } from '$lib/utils/form';

	type Props = {
		submitting?: boolean;
		errorMessage?: string;
		onsubmit: (input: FormValues) => Promise<void>;
		onsignout: () => Promise<void>;
	};

	let { submitting = false, errorMessage, onsubmit, onsignout }: Props = $props();
	let form: HTMLFormElement;

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		await onsubmit(Object.fromEntries(new FormData(form)));
	}
</script>

<Card.Root class="w-full max-w-sm">
	<Card.Header>
		<Card.Title>Choose your own password</Card.Title>
		<Card.Description>
			Replace the initial password provided by your administrator before continuing.
		</Card.Description>
	</Card.Header>

	<Card.Content>
		<form bind:this={form} onsubmit={handleSubmit}>
			<FieldGroup>
				{#if errorMessage}
					<FieldError errors={[{ message: errorMessage }]} />
				{/if}

				<Field>
					<FieldLabel for="current-password">Current password</FieldLabel>
					<Input
						id="current-password"
						name="currentPassword"
						type="password"
						autocomplete="current-password"
						required
						maxlength={PASSWORD_MAX_LENGTH}
					/>
				</Field>

				<Field>
					<FieldLabel for="new-password">New password</FieldLabel>
					<Input
						id="new-password"
						name="newPassword"
						type="password"
						autocomplete="new-password"
						required
						minlength={PASSWORD_MIN_LENGTH}
						maxlength={PASSWORD_MAX_LENGTH}
					/>
				</Field>

				<Field>
					<FieldLabel for="confirm-password">Confirm new password</FieldLabel>
					<Input
						id="confirm-password"
						name="confirmPassword"
						type="password"
						autocomplete="new-password"
						required
						minlength={PASSWORD_MIN_LENGTH}
						maxlength={PASSWORD_MAX_LENGTH}
					/>
				</Field>

				<Field>
					<Button type="submit" class="w-full" disabled={submitting}>
						{submitting ? 'Changing password…' : 'Change password'}
					</Button>
				</Field>
			</FieldGroup>
		</form>

		<Button class="mt-4 w-full" variant="ghost" disabled={submitting} onclick={onsignout}>
			Sign out
		</Button>
	</Card.Content>
</Card.Root>
