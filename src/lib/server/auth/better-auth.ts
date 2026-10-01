import { betterAuth } from 'better-auth';
import { sveltekitCookies } from 'better-auth/svelte-kit';

import { BETTER_AUTH_SECRET, BETTER_AUTH_URL } from '$app/env/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';

import { createAuthOptions } from './create-auth-options';

const options = createAuthOptions({
	db,
	baseURL: BETTER_AUTH_URL,
	secret: BETTER_AUTH_SECRET
});

export const auth = betterAuth({
	...options,
	advanced: {
		ipAddress: { ipAddressHeaders: ['x-client-ip'] }
	},
	rateLimit: {
		enabled: true,
		customRules: {
			'/sign-in/email': { window: 60, max: 5 }
		}
	},
	plugins: [...options.plugins, sveltekitCookies(getRequestEvent)]
});
