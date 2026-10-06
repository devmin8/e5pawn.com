<script lang="ts">
	import { untrack } from 'svelte';

	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		Field,
		FieldDescription,
		FieldError,
		FieldGroup,
		FieldLabel
	} from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { DEFAULT_MAX_ATTEMPTS, MAX_ATTEMPTS, TITLE_MAX_LENGTH } from '$lib/schemas/puzzle.schema';
	import type { FormValues } from '$lib/utils/form';

	type PuzzleFormValues = {
		title: string;
		/** Null means unlimited attempts. */
		maxAttempts: number | null;
	};

	type Props = {
		/** Pre-filled when editing an existing puzzle. */
		initial?: PuzzleFormValues;
		submitting?: boolean;
		errorMessage?: string;
		/** Why the recorded solution can't be saved yet; disables saving while set. */
		cannotSaveReason?: string;
		onsubmit: (input: FormValues) => Promise<void>;
	};

	let {
		initial = { title: '', maxAttempts: DEFAULT_MAX_ATTEMPTS },
		submitting = false,
		errorMessage,
		cannotSaveReason,
		onsubmit
	}: Props = $props();
	let form: HTMLFormElement;

	let unlimitedAttempts = $state(untrack(() => initial.maxAttempts === null));

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
			<FieldLabel for="puzzle-title">Title</FieldLabel>
			<Input
				id="puzzle-title"
				name="title"
				placeholder="Back rank mate"
				value={initial.title}
				required
				maxlength={TITLE_MAX_LENGTH}
			/>
		</Field>

		<Field>
			<FieldLabel for="puzzle-max-attempts">Attempts allowed</FieldLabel>
			<!-- Disabled inputs are left out of FormData, so a missing value means unlimited. -->
			<Input
				id="puzzle-max-attempts"
				name="maxAttempts"
				type="number"
				value={initial.maxAttempts ?? DEFAULT_MAX_ATTEMPTS}
				min={1}
				max={MAX_ATTEMPTS}
				required={!unlimitedAttempts}
				disabled={unlimitedAttempts}
			/>
			<FieldDescription>A wrong move ends an attempt. The student can then retry.</FieldDescription>
		</Field>

		<Field orientation="horizontal">
			<Checkbox id="puzzle-unlimited-attempts" bind:checked={unlimitedAttempts} />
			<FieldLabel for="puzzle-unlimited-attempts">Unlimited attempts</FieldLabel>
		</Field>

		<Field>
			<Button type="submit" class="w-full" disabled={submitting || !!cannotSaveReason}>
				{submitting ? 'Saving…' : 'Save puzzle'}
			</Button>
			{#if cannotSaveReason}
				<FieldDescription>{cannotSaveReason}</FieldDescription>
			{/if}
		</Field>
	</FieldGroup>
</form>
