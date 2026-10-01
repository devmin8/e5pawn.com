<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Field,
		FieldError,
		FieldGroup,
		FieldLabel,
		FieldDescription
	} from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '$lib/schemas/password.schema';
	import { NAME_MAX_LENGTH } from '$lib/schemas/user-profile.schema';
	import type { UserProfile } from '$lib/server/users';
	import type { FormValues } from '$lib/utils/form';

	type Props = {
		user?: UserProfile;
		submitting?: boolean;
		errorMessage?: string;
		onsubmit: (input: FormValues) => Promise<void>;
	};

	let { user, submitting = false, errorMessage, onsubmit }: Props = $props();
	let form: HTMLFormElement;

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		await onsubmit(Object.fromEntries(new FormData(form)));
	}
</script>

<form bind:this={form} onsubmit={handleSubmit}>
	<FieldGroup>
		{#if errorMessage}
			<FieldError errors={[{ message: errorMessage }]} />
		{/if}

		<Field>
			<FieldLabel for="user-name">Name</FieldLabel>
			<Input
				id="user-name"
				name="name"
				value={user?.name ?? ''}
				autocomplete="name"
				required
				maxlength={NAME_MAX_LENGTH}
			/>
		</Field>

		<Field>
			<FieldLabel for="user-email">Email</FieldLabel>
			<Input
				id="user-email"
				name="email"
				type="email"
				value={user?.email ?? ''}
				autocomplete="email"
				required
			/>
		</Field>

		{#if !user}
			<Field>
				<FieldLabel for="user-password">Initial password</FieldLabel>
				<Input
					id="user-password"
					name="password"
					type="password"
					autocomplete="new-password"
					required
					minlength={PASSWORD_MIN_LENGTH}
					maxlength={PASSWORD_MAX_LENGTH}
				/>
				<FieldDescription>
					The user must choose a new password on their first login.
				</FieldDescription>
			</Field>
		{/if}

		<Field>
			<Button type="submit" disabled={submitting} class="w-full">
				{submitting ? 'Saving…' : user ? 'Save changes' : 'Create user'}
			</Button>
		</Field>
	</FieldGroup>
</form>
