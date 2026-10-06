<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { BadgeVariant } from '$lib/components/ui/badge/badge.svelte';
	import type { AssignmentStatus } from '$lib/server/db/schema';

	import { assignmentProgress, assignmentProgressLabels, type AssignmentProgress } from './utils';

	type Props = {
		status: AssignmentStatus;
		attemptsUsed: number;
	};

	let { status, attemptsUsed }: Props = $props();

	const variants: Record<AssignmentProgress, BadgeVariant> = {
		todo: 'secondary',
		'in-progress': 'secondary',
		solved: 'default',
		failed: 'destructive'
	};

	const progress = $derived(assignmentProgress({ status, attemptsUsed }));
</script>

<Badge variant={variants[progress]}>{assignmentProgressLabels[progress]}</Badge>
