import { APIError } from 'better-auth/api';
import { and, asc, eq } from 'drizzle-orm';

import type { ChangePasswordInput } from '$lib/schemas/change-password.schema';
import type { CreateUserInput } from '$lib/schemas/create-user.schema';
import type { UserProfileInput } from '$lib/schemas/user-profile.schema';
import type { auth } from '$lib/server/auth';
import type { Database } from '$lib/server/db/create-db';
import { user } from '$lib/server/db/schema';
import { INTERNAL_ERROR_MESSAGE, type ServiceError } from '$lib/server/errors';
import { safeResolve } from '$lib/utils/safe-resolve';

export type ListedUser = Pick<
	typeof user.$inferSelect,
	'id' | 'name' | 'email' | 'inactive' | 'mustChangePassword'
>;

export type UserProfile = Pick<ListedUser, 'id' | 'name' | 'email'>;
type UpdateUserInput = UserProfileInput & { userId: string };
type InitialPasswordInput = ChangePasswordInput & { userId: string };

type UserResult = { ok: true } | ServiceError;

type ManagedUserResult = { ok: true; user: typeof user.$inferSelect } | ServiceError;

type UserAuth = Pick<
	typeof auth.api,
	'createUser' | 'adminUpdateUser' | 'banUser' | 'unbanUser' | 'changePassword'
>;

type UserContext = {
	db: Database;
	auth: UserAuth;
	headers: Headers;
};

async function callAuth(operation: () => Promise<unknown>): Promise<UserResult> {
	const outcome = await safeResolve(operation);
	if (outcome.ok) return { ok: true };

	if (outcome.error instanceof APIError && outcome.error.statusCode < 500) {
		return {
			ok: false,
			status: outcome.error.statusCode,
			message: outcome.error.body?.message ?? 'Unable to complete the user operation'
		};
	}

	console.error('User operation failed', outcome.error);
	return { ok: false, status: 500, message: INTERNAL_ERROR_MESSAGE };
}

async function managedUser(db: Database, userId: string): Promise<ManagedUserResult> {
	const [target] = await db
		.select()
		.from(user)
		.where(and(eq(user.id, userId), eq(user.role, 'user')));

	if (!target) return { ok: false, status: 404, message: 'User not found' };

	return { ok: true, user: target };
}

async function editableUser(db: Database, userId: string): Promise<ManagedUserResult> {
	const target = await managedUser(db, userId);
	if (target.ok && target.user.inactive) {
		return { ok: false, status: 409, message: 'Inactive users cannot be changed' };
	}

	return target;
}

// Reads take the database only; mutations take UserContext for Better Auth and request headers.
export async function listUsers(db: Database): Promise<ListedUser[]> {
	return db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			inactive: user.inactive,
			mustChangePassword: user.mustChangePassword
		})
		.from(user)
		.where(eq(user.role, 'user'))
		.orderBy(asc(user.name), asc(user.id));
}

export async function listActiveStudents(db: Database): Promise<UserProfile[]> {
	return db
		.select({ id: user.id, name: user.name, email: user.email })
		.from(user)
		.where(and(eq(user.role, 'user'), eq(user.inactive, false)))
		.orderBy(asc(user.name), asc(user.id));
}

export async function createUser(
	context: UserContext,
	input: CreateUserInput
): Promise<UserResult> {
	return callAuth(() =>
		context.auth.createUser({
			headers: context.headers,
			body: { ...input, data: { mustChangePassword: true } }
		})
	);
}

export async function updateUser(
	context: UserContext,
	input: UpdateUserInput
): Promise<UserResult> {
	const target = await editableUser(context.db, input.userId);
	if (!target.ok) return target;

	return callAuth(() =>
		context.auth.adminUpdateUser({
			headers: context.headers,
			body: {
				userId: target.user.id,
				data: {
					name: input.name,
					email: input.email,
					...(target.user.email !== input.email ? { emailVerified: false } : {})
				}
			}
		})
	);
}

export async function deactivateUser(context: UserContext, userId: string): Promise<UserResult> {
	const target = await editableUser(context.db, userId);
	if (!target.ok) return target;

	// Better Auth blocks future logins and revokes every existing session.
	return callAuth(() =>
		context.auth.banUser({
			headers: context.headers,
			body: { userId, banReason: 'Account deactivated by administrator' }
		})
	);
}

export async function reactivateUser(context: UserContext, userId: string): Promise<UserResult> {
	const target = await managedUser(context.db, userId);
	if (!target.ok) return target;
	if (!target.user.inactive) {
		return { ok: false, status: 409, message: 'User is already active' };
	}

	return callAuth(() =>
		context.auth.unbanUser({
			headers: context.headers,
			body: { userId }
		})
	);
}

export async function changeInitialPassword(
	context: UserContext,
	input: InitialPasswordInput
): Promise<UserResult> {
	const changed = await callAuth(() =>
		context.auth.changePassword({
			headers: context.headers,
			body: {
				currentPassword: input.currentPassword,
				newPassword: input.newPassword,
				revokeOtherSessions: true
			}
		})
	);
	if (!changed.ok) return changed;

	// Only clear the requirement after Better Auth successfully changes the credential.
	const completed = await safeResolve(() =>
		context.db.update(user).set({ mustChangePassword: false }).where(eq(user.id, input.userId))
	);
	if (completed.ok) return { ok: true };

	console.error(
		'Password changed but first-login requirement could not be cleared',
		completed.error
	);
	return {
		ok: false,
		status: 500,
		message:
			'Your password changed, but setup could not finish. Retry using your new password as the current password, then choose another new password.'
	};
}
