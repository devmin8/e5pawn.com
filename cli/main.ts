import { safeResolve } from '$lib/utils/safe-resolve';

import { CreateUserCommand } from './commands/create-user';
import { MigrateDbCommand } from './commands/migrate-db';
import { ResetDbCommand } from './commands/reset-db';
import { Cli } from './utils/cli';

const cli = new Cli({
	title: 'e5pawn CLI',
	description: 'Manage e5pawn data from the command line.'
})
	.register(MigrateDbCommand)
	.register(CreateUserCommand)
	.register(ResetDbCommand);

const result = await safeResolve(() => cli.run(process.argv.slice(2)));
if (!result.ok) {
	console.error(result.error instanceof Error ? result.error.message : result.error);
	process.exitCode = 1;
}
