# Deployment

The starter deploys to Vercel out of the box, or anywhere Docker runs. `next.config.ts` sets `output: 'standalone'`, so production builds are optimized for self-hosting.

Every deployment needs a PostgreSQL database. The build itself doesn't touch it; the running app and the `db:*` scripts do.

## Vercel (Recommended)

1. Connect the repository to Vercel
2. Add environment variables in the dashboard (at least `DATABASE_URL`)
3. Run the migrations against the production database (see below)
4. Deploy

For other platforms, see the [Next.js deployment docs](https://nextjs.org/docs/app/getting-started/deploying).

## Environment Variables for Production

Ensure these are set in your deployment platform:

- `DATABASE_URL` — PostgreSQL connection string (runtime only; not needed by `npm run build`)
- `SESSION_COOKIE_SECURE` — leave empty. Session cookies are `Secure` in production, so the app must be served over HTTPS; set `false` only if it really runs on plain HTTP
- All `NEXT_PUBLIC_*` variables for client-side access

## Database migrations

Migrations are SQL files in `drizzle/`, applied with drizzle-kit. Run them from a machine with the repository and access to the database, before starting a new version:

```bash
DATABASE_URL=postgres://… npm run db:migrate
```

On a fresh database, also create the first admin (prints a temporary password unless `ADMIN_PASSWORD` is set):

```bash
DATABASE_URL=postgres://… ADMIN_NRP=12345678 ADMIN_NAME="Admin SLC" npm run db:seed-admin
```

The standalone Docker image contains neither drizzle-kit nor the migration files, so don't run these inside the app container.

## Behind a reverse proxy

Sign-in, sign-out and all account management run as Server Actions, which Next.js rejects when the request's `Origin` doesn't match its host. Behind nginx or another proxy, forward the original host (`proxy_set_header Host $host;` and `X-Forwarded-Host`), or list the public origin in `experimental.serverActions.allowedOrigins` in `next.config.ts`.

## Docker

A production-ready Node.js `Dockerfile` is included. Pass `NEXT_PUBLIC_*` variables as `--build-arg` at build time and runtime secrets via `-e` at run time.

Build the image:

```bash
docker build \
  -t shadcn-dashboard .
```

Run the container:

```bash
docker run -d -p 3000:3000 \
  --restart unless-stopped \
  -e DATABASE_URL=postgres://user:password@db-host:5432/slc_polri \
  --name shadcn-dashboard \
  shadcn-dashboard
```
