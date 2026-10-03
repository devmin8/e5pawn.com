import { parseArgs } from 'node:util';

import * as v from 'valibot';

import { safeTry } from '$lib/utils/safe-try';

export type CommandOption = {
	key: string;
	name: string;
	flag: string;
	description: string;
	required?: boolean;
};

export type CommandDefinition = {
	name: string;
	title: string;
	description: string;
	options: CommandOption[];
};

export type CommandConstructor = new () => CommandInstance;
export type CommandInstance = { run(args: string[]): Promise<void> };
type CommandSchema = v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
type StringOption = { type: 'string' };
type RawInput = Record<string, unknown>;

const definitions = new WeakMap<CommandConstructor, CommandDefinition>();

export abstract class Command<TSchema extends CommandSchema> {
	abstract readonly schema: TSchema;

	async run(args: string[]) {
		const definition = getCommandDefinition(this.constructor as CommandConstructor);
		const rawInput = parseCommandArgs(definition, args);
		const result = v.safeParse(this.schema, rawInput);

		if (!result.success) {
			throw new CommandInputError(
				definition,
				result.issues.map((issue) => issue.message)
			);
		}

		await this.execute(result.output);
	}

	protected abstract execute(input: v.InferOutput<TSchema>): Promise<void>;
}

export class CommandInputError extends Error {
	constructor(definition: CommandDefinition, messages: string[]) {
		super(`${messages.join('\n')}\n\n${formatCommandHelp(definition)}`);
	}
}

export function command(definition: CommandDefinition) {
	return (target: CommandConstructor) => {
		definitions.set(target, definition);
	};
}

export function getCommandDefinition(commandConstructor: CommandConstructor) {
	const definition = definitions.get(commandConstructor);
	if (!definition) {
		throw new Error(`${commandConstructor.name} is missing a command definition`);
	}

	return definition;
}

export function formatCommandHelp(definition: CommandDefinition) {
	const optionList = [
		...definition.options.map(formatOption),
		formatOption({
			key: 'help',
			name: '-h, --help',
			flag: 'help',
			description: 'Show command help'
		})
	];

	return [
		definition.title,
		'',
		definition.description,
		'',
		'Usage:',
		`  pnpm cli ${definition.name} [options]`,
		'',
		'Options:',
		...optionList
	].join('\n');
}

function parseCommandArgs(definition: CommandDefinition, args: string[]) {
	const optionConfig: Record<string, StringOption> = {};
	for (const option of definition.options) {
		optionConfig[option.flag] = { type: 'string' };
	}

	const parsed = safeTry(() => parseArgs({ args, options: optionConfig, strict: true }));
	if (!parsed.ok) {
		throw new CommandInputError(definition, [
			parsed.error instanceof Error ? parsed.error.message : String(parsed.error)
		]);
	}

	const rawInput: RawInput = {};
	for (const option of definition.options) {
		rawInput[option.key] = parsed.result.values[option.flag];
	}

	return rawInput;
}

function formatOption(option: CommandOption) {
	const label = option.required ? `${option.name} (required)` : option.name;
	return `  ${label}${' '.repeat(Math.max(1, 34 - label.length))}${option.description}`;
}
