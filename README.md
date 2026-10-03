# e5pawn

Chess puzzles app (SvelteKit + SQLite + Better Auth boilerplate).

# How to run

- Install [portless](https://portless.sh/).
- Copy `.env.example` to `.env`:
  ```bash
  cp .env.example .env
  ```
- Generate a secret and set it as `BETTER_AUTH_SECRET` in `.env`:
  ```bash
  openssl rand -hex 32
  ```
- Run `pnpm install`.
- Run `pnpm dev`
- Open http://e5pawn.localhost in browser.

# Database

During development, run `pnpm db:push` to apply schema changes directly to the disposable database. Do not generate migrations yet.

Once migrations are prepared in `drizzle/`, apply them with:

```bash
pnpm cli migrate-db
```

To delete the local database, push the current schema and create an admin:

```bash
pnpm cli reset-db --email admin@example.com --name "Admin"
```

The password is prompted for and validated before the database is deleted. Reset supports only local `file:` databases and is disabled when `NODE_ENV=production`.

# User management

Public signup is disabled. Create an admin locally (password prompt):

```bash
pnpm cli create-user --email admin@example.com --name "Admin"
```

Run `pnpm cli --help` or `pnpm cli <command> --help` for command details. The bundled CLI is available through `node build/cli/main.js` after building.

Admins manage non-admin accounts at `/users`. New users must replace their initial password before accessing the app. Deactivated users remain listed as Inactive; their data and email are retained.

Route access is set by route group in `src/hooks.server.ts`: `(public)` is open, `(onboarding)` needs sign-in, and `(protected)` also needs the initial password replaced. Admin checks stay in the routes.

# Docker

Deferred until go-live migrations are prepared; use local development and schema push for now.
