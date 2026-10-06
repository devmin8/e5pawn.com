import * as v from 'valibot';

export const MAX_STUDENTS_PER_REQUEST = 1000;

/** Students to assign to, or unassign from, a puzzle. */
export const PuzzleStudentsSchema = v.object({
	studentIds: v.pipe(
		v.array(v.pipe(v.string(), v.nonEmpty())),
		v.minLength(1, 'Choose at least one student'),
		v.maxLength(
			MAX_STUDENTS_PER_REQUEST,
			`Choose at most ${MAX_STUDENTS_PER_REQUEST} students at a time`
		)
	)
});

export type PuzzleStudentsInput = v.InferOutput<typeof PuzzleStudentsSchema>;
