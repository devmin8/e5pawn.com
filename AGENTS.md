# Docs

Built using `sveltekit`, `SQlite`, `pnpm`.

- https://www.shadcn-svelte.com/llms.txt
- https://shadcn-svelte-extras.com/docs/agents.md

# Best practices

- Embrace error as values in `try/catch` scenarious. we have `safeTry` (`$lib/utils/safe-try`), `request` from `request.ts` for `fetch`, `safeResolve` for `async`.
- `Import Order`: external → `$` aliases → relative. Blank line between groups.
- Strip `.js` from imports (shadcn CLIs add them). Format the shadcn components once you add them.
- Ask user for approval to merge.
- `cn` from shadcn-svelte-extras: `import { cn } from '$lib/utils/cn';`.
- Don't inline the type, create a `type Whatever = {}` separately and use it.
- Group related variables; separate types, props, state, and logical steps with blank lines.
- Forms follow login: use HTML validation for required fields, call `onsubmit`; parents validate and submit; servers validate again.
- Route access is decided by route group in `hooks.server.ts`; never add path lists there.
- After a Better Auth upgrade or plugin change, review `/api/auth/*` endpoints against `disabledPaths`.

# Testing

- Test pure business-logic utils only (they may live next to a service); no tests for Svelte components, schemas, services, or HTTP helpers.

# Data

- Dev DB is disposable; use schema push, no migrations until the user says otherwise.

# Review

- Real issues only. No filler, no "if you want", no clickbait.
- Flag missing SOLID abstractions and repo-pattern breaks.
- Code should stay clean, organised, boring, predictable.

# Commit

- Always refer previous commit messages for standard. One line commit message preferred.
- Don't add Co-authored-by: Cursor <cursoragent@cursor.com>.
