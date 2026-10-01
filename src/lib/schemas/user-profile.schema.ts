import * as v from 'valibot';

export const NAME_MAX_LENGTH = 100;

export const UserProfileSchema = v.object({
	name: v.pipe(
		v.string(),
		v.trim(),
		v.nonEmpty('Name is required'),
		v.maxLength(NAME_MAX_LENGTH, `Name must be ${NAME_MAX_LENGTH} characters or fewer`)
	),
	email: v.pipe(v.string(), v.trim(), v.toLowerCase(), v.email('Enter a valid email address'))
});

export type UserProfileInput = v.InferOutput<typeof UserProfileSchema>;
