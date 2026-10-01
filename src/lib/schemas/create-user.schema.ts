import * as v from 'valibot';

import { PasswordSchema } from './password.schema';
import { UserProfileSchema } from './user-profile.schema';

export const CreateUserSchema = v.object({
	...UserProfileSchema.entries,
	password: PasswordSchema
});

export type CreateUserInput = v.InferOutput<typeof CreateUserSchema>;
