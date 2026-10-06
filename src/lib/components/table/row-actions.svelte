<script lang="ts">
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
	import type { Snippet } from 'svelte';

	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	type Props = {
		/** Names the row for screen readers, e.g. the puzzle title. */
		label: string;
		/** Dropdown menu items. */
		children: Snippet;
	};

	let { label, children }: Props = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon-sm" aria-label={`Actions for ${label}`}>
				<EllipsisVerticalIcon />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Content align="end">
		{@render children()}
	</DropdownMenu.Content>
</DropdownMenu.Root>
