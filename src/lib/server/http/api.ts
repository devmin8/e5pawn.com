import {
	error,
	isHttpError,
	isRedirect,
	json,
	type RequestEvent,
	type RequestHandler
} from '@sveltejs/kit';

import { INTERNAL_ERROR_MESSAGE } from '$lib/server/errors';
import { safeResolve } from '$lib/utils/safe-resolve';
import type { SafeTryResult } from '$lib/utils/safe-try';

type RouteParams = Partial<Record<string, string>>;

type ApiHandler<Params extends RouteParams> = (
	event: RequestEvent<Params>,
	user: NonNullable<App.Locals['user']>
) => Promise<Response>;

type ApiError = {
	message: string;
};

export function requireAuthenticatedUser(
	user: App.Locals['user']
): NonNullable<App.Locals['user']> {
	if (!user) {
		error(401, 'Unauthorized');
	}

	return user;
}

export function requireAdmin(user: App.Locals['user']) {
	const actor = requireAuthenticatedUser(user);
	if (actor.role !== 'admin') error(403, 'Administrator access required');
	return actor;
}

export function protectedApi<Params extends RouteParams>(
	handler: ApiHandler<Params>
): RequestHandler<Params> {
	return async (event) => {
		const { user } = event.locals;
		if (!user) {
			return apiError(401, 'Unauthorized');
		}

		const outcome = await safeResolve(() => handler(event, user));
		if (outcome.ok) return outcome.result;

		// SvelteKit error()/redirect() must be rethrown so the framework can handle them.
		if (isHttpError(outcome.error) || isRedirect(outcome.error)) throw outcome.error;

		console.error('API request failed', outcome.error);
		return apiError(500, INTERNAL_ERROR_MESSAGE);
	};
}

export function apiError(status: number, message: string) {
	return json({ message } satisfies ApiError, { status });
}

export function badRequest(message: string) {
	return apiError(400, message);
}

export function validationError(issues: readonly { message?: string }[], fallbackMessage: string) {
	return badRequest(issues[0]?.message ?? fallbackMessage);
}

export function readJson(request: Request): Promise<SafeTryResult<unknown>> {
	return safeResolve(() => request.json());
}
