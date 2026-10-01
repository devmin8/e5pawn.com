import { parseArgs } from 'node:util';

import { betterAuth } from 'better-auth/minimal';
import * as v from 'valibot';

import { CreateUserSchema } from '$lib/schemas/create-user.schema';
import { createAuthOptions } from '$lib/server/auth/create-auth-options';
import { createDb } from '$lib/server/db/create-db';
import { getEnvData } from '$lib/server/env.schema';
import { loadEnvFileIfExists } from '$lib/server/load-env';

loadEnvFileIfExists();

const { DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL } = getEnvData();
const db = createDb(DATABASE_URL);

type Options = {
	email?: string;
	name?: string;
};

function usage() {
	return [
		'Usage: pnpm create-user --email <email> --name <name>',
		'',
		'You will be prompted for a password without echoing it to the terminal.'
	].join('\n');
}

function getOptions(): Options {
	const { values } = parseArgs({
		args: process.argv.slice(2),
		options: {
			email: { type: 'string' },
			name: { type: 'string' },
			help: { type: 'boolean', short: 'h' }
		},
		strict: true
	});

	if (values.help) {
		console.log(usage());
		process.exit(0);
	}

	return values;
}

function promptForPassword() {
	if (!process.stdin.isTTY) {
		throw new Error('A TTY is required to enter the password securely.');
	}

	return new Promise<string>((resolve, reject) => {
		let password = '';
		const stdin = process.stdin;
		const cleanup = () => {
			stdin.off('data', onData);
			stdin.setRawMode(false);
			stdin.pause();
			process.stdout.write('\n');
		};
		const onData = (data: Buffer) => {
			const input = data.toString();
			if (input === '\r' || input === '\n') {
				cleanup();
				resolve(password);
			} else if (input === '\u0003') {
				cleanup();
				reject(new Error('Password prompt cancelled'));
			} else if (input === '\u007f') {
				password = password.slice(0, -1);
			} else {
				password += input;
			}
		};

		process.stdout.write('Password: ');
		stdin.setRawMode(true);
		stdin.setEncoding('utf8');
		stdin.resume();
		stdin.on('data', onData);
	});
}

async function main() {
	const options = getOptions();
	const email = options.email?.trim().toLowerCase();
	const name = options.name?.trim();

	if (!email || !name) throw new Error(`--email and --name are required\n\n${usage()}`);

	const password = await promptForPassword();
	const parsed = v.safeParse(CreateUserSchema, { email, name, password });
	if (!parsed.success) throw new Error(parsed.issues[0].message);

	// This instance exists only for deployment provisioning.
	const provisioningAuth = betterAuth({
		...createAuthOptions({
			db,
			baseURL: BETTER_AUTH_URL,
			secret: BETTER_AUTH_SECRET
		})
	});

	// With no HTTP request or session, Better Auth supports trusted server provisioning.
	await provisioningAuth.api.createUser({ body: { ...parsed.output, role: 'admin' } });
	console.log(`Created admin: ${email}`);
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? `Error: ${error.message}` : error);
	process.exitCode = 1;
});
