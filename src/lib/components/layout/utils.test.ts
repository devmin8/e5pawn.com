import { describe, expect, it } from 'vitest';

import { breadcrumbsFor, navItems } from './utils';

describe('navigation', () => {
	it('has a Home item', () => {
		expect(navItems).toEqual([{ title: 'Home', url: '/' }]);
	});

	it('resolves the Home crumb', () => {
		expect(breadcrumbsFor('/')).toEqual([{ label: 'Home' }]);
	});
});
