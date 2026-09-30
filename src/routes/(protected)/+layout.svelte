<script lang="ts">
	import { AppHeader, AppSidebar } from '$lib/components/layout';
	import * as Sidebar from '$lib/components/ui/sidebar';

	let { children } = $props();
</script>

<Sidebar.Provider class="h-svh">
	<AppSidebar />
	<Sidebar.Inset class="min-h-0 overflow-hidden">
		<AppHeader />
		<div class="flex min-h-0 flex-1 p-4">
			<div
				class="bg-card text-card-foreground flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-auto border p-4 md:p-6"
			>
				{@render children()}
			</div>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
