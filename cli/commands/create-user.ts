import { createUser } from '$cli/services/users';
import { Command, command, type CommandDefinition } from '$cli/utils/command';
import { loadCliEnv } from '$cli/utils/env';
import { promptForUser, userOptions } from '$cli/utils/user-input';
import { UserProfileSchema, type UserProfileInput } from '$lib/schemas/user-profile.schema';
import { createDb } from '$lib/server/db/create-db';

const createUserDefinition = {
	name: 'create-user',
	title: 'Create user',
	description: 'Create an admin. The password is prompted for without echoing it.',
	options: userOptions
} satisfies CommandDefinition;

@command(createUserDefinition)
export class CreateUserCommand extends Command<typeof UserProfileSchema> {
	readonly schema = UserProfileSchema;

	protected async execute(profile: UserProfileInput) {
		const env = loadCliEnv();
		const user = await promptForUser(profile);
		const db = createDb(env.DATABASE_URL);

		try {
			await createUser(db, env, user);
			console.log(`Created admin: ${user.email}`);
		} finally {
			db.$client.close();
		}
	}
}
