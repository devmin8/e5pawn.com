import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2';

import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '$lib/schemas/password.schema';
import type { createDb } from '$lib/server/db/create-db';
import * as schema from '$lib/server/db/schema';

import { adminPlugin } from './admin-plugin';

type CreateAuthOptions = {
	baseURL: string;
	db: ReturnType<typeof createDb>;
	secret: string;
};

export function createAuthOptions({ baseURL, db, secret }: CreateAuthOptions) {
	return {
		// User management is exposed only through our server service, not generic HTTP APIs.
		disabledPaths: [
			...Object.values(adminPlugin.endpoints).map((endpoint) => endpoint.path),
			'/change-password',
			'/update-user'
		],
		plugins: [adminPlugin] as [typeof adminPlugin],
		user: {
			additionalFields: {
				mustChangePassword: {
					type: 'boolean' as const,
					required: true,
					defaultValue: false,
					input: false
				}
			}
		},
		baseURL,
		secret,
		emailAndPassword: {
			enabled: true,
			disableSignUp: true,
			minPasswordLength: PASSWORD_MIN_LENGTH,
			maxPasswordLength: PASSWORD_MAX_LENGTH
		},
		database: drizzleAdapter(db, {
			provider: 'sqlite',
			schema
		})
	};
}
