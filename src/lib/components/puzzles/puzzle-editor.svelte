<script lang="ts">
	import { DEFAULT_POSITION } from 'chess.js';
	import { untrack } from 'svelte';
	import * as v from 'valibot';

	import { solutionError } from '$lib/chess/puzzle';
	import { DEFAULT_MAX_ATTEMPTS, PuzzleSchema, type PuzzleInput } from '$lib/schemas/puzzle.schema';
	import type { FormValues } from '$lib/utils/form';

	import PuzzleForm from './puzzle-form.svelte';
	import PuzzleRecorder, { type RecordedPuzzle } from './puzzle-recorder.svelte';

	type Props = {
		/** Pre-filled when editing an existing puzzle. */
		initial?: PuzzleInput;
		submitting?: boolean;
		errorMessage?: string;
		onsubmit: (input: PuzzleInput) => Promise<void>;
	};

	let {
		initial = { title: '', fen: DEFAULT_POSITION, solution: [], maxAttempts: DEFAULT_MAX_ATTEMPTS },
		submitting = false,
		errorMessage,
		onsubmit
	}: Props = $props();

	let recording = $state.raw<RecordedPuzzle>(
		untrack(() => ({ fen: initial.fen, solution: initial.solution }))
	);
	let validationMessage = $state<string>();

	const cannotSaveReason = $derived(solutionError(recording.fen, recording.solution));

	async function submitForm(values: FormValues) {
		const parsed = v.safeParse(PuzzleSchema, {
			...recording,
			title: values.title,
			maxAttempts: values.maxAttempts ? Number(values.maxAttempts) : null
		});
		if (!parsed.success) {
			validationMessage = parsed.issues[0].message;
			return;
		}

		validationMessage = undefined;
		await onsubmit(parsed.output);
	}
</script>

<div class="grid gap-6 md:grid-cols-[minmax(0,32rem)_1fr]">
	<PuzzleRecorder {initial} onchange={(nextRecording) => (recording = nextRecording)} />
	<PuzzleForm
		{initial}
		{submitting}
		{cannotSaveReason}
		errorMessage={validationMessage ?? errorMessage}
		onsubmit={submitForm}
	/>
</div>
