import { deleteDatabaseFile, pushDatabaseSchema } from '$cli/services/database';
import { createUser } from '$cli/services/users';
import { Command, command, type CommandDefinition } from '$cli/utils/command';
import { loadCliEnv } from '$cli/utils/env';
import { promptForUser, userOptions } from '$cli/utils/user-input';
import { UserProfileSchema, type UserProfileInput } from '$lib/schemas/user-profile.schema';
import { createDb } from '$lib/server/db/create-db';

const resetDbDefinition = {
	name: 'reset-db',
	title: 'Reset database',
	description:
		'Delete the local database, push the schema and create an admin. The password is prompted for without echoing it.',
	options: userOptions
} satisfies CommandDefinition;

@command(resetDbDefinition)
export class ResetDbCommand extends Command<typeof UserProfileSchema> {
	readonly schema = UserProfileSchema;

	protected async execute(profile: UserProfileInput) {
		if (process.env.NODE_ENV === 'production') {
			throw new Error('reset-db is disabled when NODE_ENV=production');
		}

		const env = loadCliEnv();
		// Validate the prompted password before deleting the database.
		const user = await promptForUser(profile);
		const file = await deleteDatabaseFile(env.DATABASE_URL);
		console.log(`Deleted ${file}`);

		await pushDatabaseSchema(env.DATABASE_URL);
		console.log('Schema applied');
		const db = createDb(env.DATABASE_URL);

		try {
			await createUser(db, env, user);
			console.log(`Created admin: ${user.email}`);
		} finally {
			db.$client.close();
		}
	}
}
