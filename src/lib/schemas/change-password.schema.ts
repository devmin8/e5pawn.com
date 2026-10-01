import * as v from 'valibot';

import { PASSWORD_MAX_LENGTH, PasswordSchema } from './password.schema';

export const ChangePasswordSchema = v.pipe(
	v.object({
		currentPassword: v.pipe(
			v.string(),
			v.nonEmpty('Current password is required'),
			v.maxLength(
				PASSWORD_MAX_LENGTH,
				`Password must be ${PASSWORD_MAX_LENGTH} characters or fewer`
			)
		),
		newPassword: PasswordSchema,
		confirmPassword: v.string()
	}),
	v.forward(
		v.partialCheck(
			[['newPassword'], ['confirmPassword']],
			(input) => input.newPassword === input.confirmPassword,
			'Passwords do not match'
		),
		['confirmPassword']
	),
	v.forward(
		v.partialCheck(
			[['currentPassword'], ['newPassword']],
			(input) => input.currentPassword !== input.newPassword,
			'Choose a password different from your current password'
		),
		['newPassword']
	)
);

export type ChangePasswordInput = v.InferOutput<typeof ChangePasswordSchema>;
