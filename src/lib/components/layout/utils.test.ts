import { describe, expect, it } from 'vitest';

import { breadcrumbsFor } from './utils';

describe('navigation', () => {
	it('resolves the Users crumb', () => {
		expect(breadcrumbsFor('/users')).toEqual([{ label: 'Users' }]);
	});

	it('resolves the Home crumb', () => {
		expect(breadcrumbsFor('/')).toEqual([{ label: 'Home' }]);
	});
});
