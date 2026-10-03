import * as v from 'valibot';

import { migrateDatabase } from '$cli/services/database';
import { Command, command, type CommandDefinition } from '$cli/utils/command';
import { loadCliEnv } from '$cli/utils/env';
import { createDb } from '$lib/server/db/create-db';

const migrateDbDefinition = {
	name: 'migrate-db',
	title: 'Migrate database',
	description: 'Apply generated migrations to the database.',
	options: []
} satisfies CommandDefinition;

const MigrateDbInput = v.object({});

@command(migrateDbDefinition)
export class MigrateDbCommand extends Command<typeof MigrateDbInput> {
	readonly schema = MigrateDbInput;

	protected async execute() {
		const { DATABASE_URL } = loadCliEnv();
		const db = createDb(DATABASE_URL);

		try {
			await migrateDatabase(db);
			console.log('Migrations applied');
		} finally {
			db.$client.close();
		}
	}
}
