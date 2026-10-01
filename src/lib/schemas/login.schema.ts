import * as v from 'valibot';

import { PASSWORD_MAX_LENGTH } from './password.schema';

export const LoginSchema = v.object({
	email: v.pipe(
		v.string(),
		v.trim(),
		v.nonEmpty('Email is required'),
		v.email('Enter a valid email address')
	),
	password: v.pipe(
		v.string(),
		v.nonEmpty('Password is required'),
		v.maxLength(PASSWORD_MAX_LENGTH, `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer`)
	)
});

export type LoginInput = v.InferOutput<typeof LoginSchema>;
