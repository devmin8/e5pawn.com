import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { migrate } from 'drizzle-orm/libsql/migrator';

import type { Database } from '$lib/server/db/create-db';

const SQLITE_SIDECAR_SUFFIXES = ['', '-wal', '-shm', '-journal'];

export async function migrateDatabase(db: Database) {
	const migrationsFolder = join(process.cwd(), 'drizzle');
	if (!existsSync(migrationsFolder)) {
		throw new Error(`Migrations folder not found at ${migrationsFolder}`);
	}

	await migrate(db, { migrationsFolder });
}

export function resolveDatabaseFile(databaseUrl: string) {
	if (!databaseUrl.startsWith('file:')) {
		throw new Error(`Only file: database URLs are supported, got ${databaseUrl}`);
	}

	const path = databaseUrl.startsWith('file://')
		? fileURLToPath(databaseUrl)
		: databaseUrl.slice('file:'.length);
	if (!path) {
		throw new Error('The database URL must include a file path');
	}

	return resolve(path);
}

export async function deleteDatabaseFile(databaseUrl: string) {
	const file = resolveDatabaseFile(databaseUrl);
	await Promise.all(
		SQLITE_SIDECAR_SUFFIXES.map((suffix) => rm(`${file}${suffix}`, { force: true }))
	);

	return file;
}

export function pushDatabaseSchema(databaseUrl: string) {
	return new Promise<void>((resolve, reject) => {
		const child = spawn('pnpm', ['db:push'], {
			stdio: 'inherit',
			env: { ...process.env, DATABASE_URL: databaseUrl }
		});

		child.once('error', reject);
		child.once('exit', (code, signal) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Schema push failed (${signal ?? `exit code ${code}`})`));
			}
		});
	});
}
