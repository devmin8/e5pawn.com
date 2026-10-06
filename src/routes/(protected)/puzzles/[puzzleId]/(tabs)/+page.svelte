<script lang="ts">
	import { solverOrientation } from '$lib/chess/puzzle';
	import { LineViewer } from '$lib/components/chess';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<section class="flex max-w-lg flex-col gap-3">
	<LineViewer
		fen={data.puzzle.fen}
		moves={data.puzzle.solution}
		orientation={solverOrientation(data.puzzle.fen)}
	/>
</section>
