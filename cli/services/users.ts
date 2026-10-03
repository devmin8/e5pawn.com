import { betterAuth } from 'better-auth/minimal';

import type { CreateUserInput } from '$lib/schemas/create-user.schema';
import { createAuthOptions } from '$lib/server/auth/create-auth-options';
import type { Database } from '$lib/server/db/create-db';
import type { EnvData } from '$lib/server/env.schema';

type ProvisioningEnv = Pick<EnvData, 'BETTER_AUTH_SECRET' | 'BETTER_AUTH_URL'>;

export async function createUser(db: Database, env: ProvisioningEnv, user: CreateUserInput) {
	const provisioningAuth = betterAuth(
		createAuthOptions({
			db,
			baseURL: env.BETTER_AUTH_URL,
			secret: env.BETTER_AUTH_SECRET
		})
	);

	// Better Auth supports trusted server provisioning without an HTTP request or session.
	await provisioningAuth.api.createUser({ body: { ...user, role: 'admin' } });
}
