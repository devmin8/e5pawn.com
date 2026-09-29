<script lang="ts">
	import { cn } from '$lib/utils/cn';

	let { class: className }: { class?: string } = $props();
</script>

<div
	class={cn(
		'relative flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_1px_2px_rgb(0_0_0/0.3),inset_0_1px_0_rgb(255_255_255/0.25)] ring-1 ring-black/10 dark:ring-white/15',
		className
	)}
	role="img"
	aria-label="e5pawn"
>
	<div
		class="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/25"
		aria-hidden="true"
	></div>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 64 64"
		class="relative size-[22px] drop-shadow-[0_1px_1px_rgb(0_0_0/0.3)]"
		aria-hidden="true"
	>
		<g fill="currentColor">
			<path
				d="M32 7.5v11.5M26.25 12h11.5"
				stroke="currentColor"
				stroke-width="5.4"
				stroke-linecap="round"
				fill="none"
			/>
			<circle cx="18.6" cy="25.6" r="2.3" />
			<circle cx="45.4" cy="25.6" r="2.3" />
			<path
				d="M20 24.5c2.5-2 6.8-3 12-3s9.5 1 12 3l-2.2 10a2.4 2.4 0 0 1-2.3 1.7H24.5a2.4 2.4 0 0 1-2.3-1.7L20 24.5Z"
			/>
			<rect x="22.5" y="38.5" width="19" height="3" rx="1.5" />
			<rect x="24.5" y="43" width="15" height="2.4" rx="1.2" />
			<path d="M27 46.5h10l2.7 6.8a1.5 1.5 0 0 1-1.4 2H25.7a1.5 1.5 0 0 1-1.4-2L27 46.5Z" />
			<rect x="22.5" y="55.6" width="19" height="2.8" rx="1.4" />
			<rect x="20" y="58.6" width="24" height="2.6" rx="1.3" />
		</g>
	</svg>
</div>
