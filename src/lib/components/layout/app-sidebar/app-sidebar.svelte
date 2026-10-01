<script lang="ts">
	import type { ComponentProps } from 'svelte';

	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import { toast } from 'svelte-sonner';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { isNavGroup, navItems } from '$lib/components/layout/utils';
	import { safeResolve } from '$lib/utils/safe-resolve';

	type Props = ComponentProps<typeof Sidebar.Root>;

	let { ref = $bindable(null), ...restProps }: Props = $props();

	const pathname = $derived(page.url.pathname);
	const visibleNavItems = $derived(
		navItems.filter((item) => isNavGroup(item) || !item.adminOnly || page.data.isAdmin)
	);

	const sidebar = Sidebar.useSidebar();

	let signingOut = $state(false);

	function closeMobileSidebar() {
		if (sidebar.isMobile) sidebar.setOpenMobile(false);
	}

	async function signOut() {
		if (signingOut) return;
		signingOut = true;
		closeMobileSidebar();
		const outcome = await safeResolve(() => authClient.signOut());
		if (!outcome.ok || outcome.result.error) {
			toast.error('Unable to sign out. Please try again.');
		} else {
			const navigation = await safeResolve(() => goto(resolve('/login'), { invalidateAll: true }));
			if (!navigation.ok) toast.error('Signed out, but navigation failed. Please reload.');
		}
		signingOut = false;
	}
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg" class="gap-3">
					{#snippet child({ props })}
						<a href={resolve('/')} {...props} onclick={closeMobileSidebar}>
							<div class="flex flex-col gap-2 leading-none">
								<span class="text-[15px] font-bold tracking-tight">
									<span class="text-sidebar-primary">e5</span><span>pawn</span>
								</span>
								<span
									class="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase"
									>Learn & Improve</span
								>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.Menu>
				{#each visibleNavItems as item (item.title)}
					<Sidebar.MenuItem>
						{#if isNavGroup(item)}
							<Sidebar.MenuButton
								class="font-medium hover:bg-transparent hover:text-sidebar-foreground active:bg-transparent active:text-sidebar-foreground"
							>
								{#snippet child({ props })}
									<span {...props}>{item.title}</span>
								{/snippet}
							</Sidebar.MenuButton>

							<Sidebar.MenuSub>
								{#each item.items as subItem (subItem.title)}
									<Sidebar.MenuSubItem>
										<Sidebar.MenuSubButton isActive={pathname === subItem.url}>
											{#snippet child({ props })}
												<a href={resolve(subItem.url)} {...props} onclick={closeMobileSidebar}
													>{subItem.title}</a
												>
											{/snippet}
										</Sidebar.MenuSubButton>
									</Sidebar.MenuSubItem>
								{/each}
							</Sidebar.MenuSub>
						{:else}
							<Sidebar.MenuButton class="font-medium" isActive={pathname === item.url}>
								{#snippet child({ props })}
									<a href={resolve(item.url)} {...props} onclick={closeMobileSidebar}
										>{item.title}</a
									>
								{/snippet}
							</Sidebar.MenuButton>
						{/if}
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="font-medium" tooltipContent="Sign out" onclick={signOut}>
					<LogOutIcon />
					<span>{signingOut ? 'Signing out…' : 'Sign out'}</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
