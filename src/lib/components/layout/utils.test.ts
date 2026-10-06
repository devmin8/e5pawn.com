import { describe, expect, it } from 'vitest';

import { breadcrumbsFor, isWithinNavItem, navItemsFor } from './utils';

describe('navigation', () => {
	it('resolves the Users crumb', () => {
		expect(breadcrumbsFor('/users')).toEqual([{ label: 'Users' }]);
	});

	it('resolves the parent crumb for nested pages', () => {
		expect(breadcrumbsFor('/puzzles/new')).toEqual([{ label: 'Puzzles' }]);
		expect(breadcrumbsFor('/my-puzzles/abc')).toEqual([{ label: 'My puzzles' }]);
	});

	it('links back to the nav item when a nested page names itself', () => {
		expect(breadcrumbsFor('/puzzles/abc/students', 'Test 1')).toEqual([
			{ label: 'Puzzles', href: '/puzzles' },
			{ label: 'Test 1' }
		]);
		expect(breadcrumbsFor('/puzzles', 'Test 1')).toEqual([{ label: 'Puzzles' }]);
	});

	it('has no crumbs for pages outside the navigation', () => {
		expect(breadcrumbsFor('/somewhere')).toEqual([]);
	});

	it('treats nested pages as part of their nav item', () => {
		expect(isWithinNavItem('/puzzles', '/puzzles')).toBe(true);
		expect(isWithinNavItem('/puzzles/new', '/puzzles')).toBe(true);
		expect(isWithinNavItem('/puzzles-archive', '/puzzles')).toBe(false);
	});

	it('shows each audience only its own items', () => {
		const titles = (isAdmin: boolean) => navItemsFor(isAdmin).map((item) => item.title);
		expect(titles(true)).toEqual(['Puzzles', 'Users']);
		expect(titles(false)).toEqual(['My puzzles']);
	});
});
