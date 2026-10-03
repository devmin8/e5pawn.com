import * as v from 'valibot';

import { CreateUserSchema } from '$lib/schemas/create-user.schema';
import type { UserProfileInput } from '$lib/schemas/user-profile.schema';

import type { CommandOption } from './command';
import { promptForPassword } from './prompt';

export const userOptions = [
	{
		key: 'email',
		name: '--email <email>',
		flag: 'email',
		description: 'Admin email',
		required: true
	},
	{
		key: 'name',
		name: '--name <name>',
		flag: 'name',
		description: 'Admin display name',
		required: true
	}
] satisfies CommandOption[];

export async function promptForUser(profile: UserProfileInput) {
	const password = await promptForPassword();
	const parsed = v.safeParse(CreateUserSchema, { ...profile, password });
	if (!parsed.success) {
		throw new Error(parsed.issues.map((issue) => issue.message).join('\n'));
	}

	return parsed.output;
}
