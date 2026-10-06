import type { Pathname } from '$app/types';

export type Crumb = {
	label: string;
	href?: Pathname;
};

export type NavSubItem = {
	title: string;
	url: Pathname;
};

type NavAudience = 'admin' | 'student';

type NavLeafItem = {
	title: string;
	url: Pathname;
	items?: never;
	// Omit to show the item to everyone.
	audience?: NavAudience;
};

type NavGroupItem = {
	title: string;
	items: readonly [NavSubItem, ...NavSubItem[]];
	url?: never;
};

export type NavItem = NavLeafItem | NavGroupItem;

export function isNavGroup(item: NavItem): item is NavGroupItem {
	return item.items !== undefined;
}

export const navItems: NavItem[] = [
	{
		title: 'Puzzles',
		url: '/puzzles',
		audience: 'admin'
	},
	{
		title: 'My puzzles',
		url: '/my-puzzles',
		audience: 'student'
	},
	{
		title: 'Users',
		url: '/users',
		audience: 'admin'
	}
];

export function navItemsFor(isAdmin: boolean): NavItem[] {
	const audience: NavAudience = isAdmin ? 'admin' : 'student';
	return navItems.filter(
		(item) => isNavGroup(item) || !item.audience || item.audience === audience
	);
}

/** True for the nav item's own page and every page nested under it. */
export function isWithinNavItem(pathname: string, url: string): boolean {
	return pathname === url || (url !== '/' && pathname.startsWith(`${url}/`));
}

/** `pageTitle` names a nested page, turning its nav item into a link back. */
export function breadcrumbsFor(pathname: string, pageTitle?: string): Crumb[] {
	for (const item of navItems) {
		if (isNavGroup(item)) {
			const subItem = item.items.find((entry) => entry.url === pathname);
			if (subItem) {
				return [{ label: item.title }, { label: subItem.title }];
			}

			continue;
		}

		if (isWithinNavItem(pathname, item.url)) {
			if (pageTitle && pathname !== item.url) {
				return [{ label: item.title, href: item.url }, { label: pageTitle }];
			}

			return [{ label: item.title }];
		}
	}

	return [];
}
