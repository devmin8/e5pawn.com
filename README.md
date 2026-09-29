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

# DB migration commands

- Run `db:push` to push schema changes directly to the database.
- Run `db:generate` to generate SQL migration files from schema changes.
- Run `db:migrate` to apply generated migrations to the database.

# Docker

```bash
docker compose build
docker compose up
```

Open http://localhost:3000. Public signup is disabled; create a user in the running container (password prompt):

```bash
docker compose exec -it web node build/scripts/create-user.js --email test@test.com --name "Test user"
```
