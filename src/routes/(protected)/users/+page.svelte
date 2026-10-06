<script lang="ts">
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import UserCheckIcon from '@lucide/svelte/icons/user-check';
	import UserXIcon from '@lucide/svelte/icons/user-x';

	import { RowActions } from '$lib/components/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Table from '$lib/components/ui/table';
	import {
		AddUserDialog,
		DeactivateUserDialog,
		ReactivateUserDialog,
		UpdateUserDialog
	} from '$lib/components/users';
	import type { ListedUser } from '$lib/server/users';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let adding = $state(false);
	let editing = $state(false);
	let deactivating = $state(false);
	let reactivating = $state(false);
	let selectedUser = $state<ListedUser>();
</script>

<svelte:head>
	<title>Users · e5pawn</title>
</svelte:head>

<div class="flex items-center justify-between gap-4">
	<div>
		<h1 class="text-2xl font-semibold">Users</h1>
		<p class="text-muted-foreground text-sm">
			Manage user accounts. Administrator accounts are not listed.
		</p>
	</div>

	<Button onclick={() => (adding = true)}>Add user</Button>
</div>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head>Name</Table.Head>
			<Table.Head>Email</Table.Head>
			<Table.Head>Status</Table.Head>
			<Table.Head class="text-right">Actions</Table.Head>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		{#each data.users as user (user.id)}
			<Table.Row>
				<Table.Cell class="font-medium">{user.name}</Table.Cell>
				<Table.Cell>{user.email}</Table.Cell>
				<Table.Cell>
					<Badge variant={user.inactive ? 'secondary' : 'default'}>
						{user.inactive ? 'Inactive' : 'Active'}
					</Badge>

					{#if !user.inactive && user.mustChangePassword}
						<span class="text-muted-foreground ml-2 text-xs">Password change required</span>
					{/if}
				</Table.Cell>
				<Table.Cell class="text-right">
					<RowActions label={user.name}>
						{#if !user.inactive}
							<DropdownMenu.Item
								onclick={() => {
									selectedUser = user;
									editing = true;
								}}
							>
								<PencilIcon />
								Edit
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								variant="destructive"
								onclick={() => {
									selectedUser = user;
									deactivating = true;
								}}
							>
								<UserXIcon />
								Deactivate
							</DropdownMenu.Item>
						{:else}
							<DropdownMenu.Item
								onclick={() => {
									selectedUser = user;
									reactivating = true;
								}}
							>
								<UserCheckIcon />
								Reactivate
							</DropdownMenu.Item>
						{/if}
					</RowActions>
				</Table.Cell>
			</Table.Row>
		{:else}
			<Table.Row>
				<Table.Cell colspan={4} class="text-muted-foreground py-10 text-center">
					No users yet. Add a user to get started.
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>

<AddUserDialog bind:open={adding} />

{#if selectedUser}
	<UpdateUserDialog bind:open={editing} user={selectedUser} />
	<DeactivateUserDialog bind:open={deactivating} user={selectedUser} />
	<ReactivateUserDialog bind:open={reactivating} user={selectedUser} />
{/if}
