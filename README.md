<h1 align="center">Admin Dashboard Template with Next.js &amp; Shadcn UI</h1>

<div align="center">Free, open source admin dashboard starter built with Next.js 16, shadcn/ui, Tailwind CSS, and TypeScript</div>

<div align="center">
  <a href="https://dub.sh/shadcn-dashboard"><strong>View Demo</strong></a>
</div>

<br />

<div align="center">
  <img src="/public/shadcn-dashboard.png" alt="Shadcn Dashboard Cover" style="max-width: 100%; border-radius: 8px;" />
</div>

<br />

<p align="center">
  <a href="https://github.com/Kiranism/next-shadcn-dashboard-starter/stargazers"><img src="https://img.shields.io/github/stars/Kiranism/next-shadcn-dashboard-starter?style=social" alt="GitHub stars" /></a>
  <a href="https://github.com/Kiranism/next-shadcn-dashboard-starter/network/members"><img src="https://img.shields.io/github/forks/Kiranism/next-shadcn-dashboard-starter?style=social" alt="Forks" /></a>
  <a href="https://github.com/Kiranism/next-shadcn-dashboard-starter/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Kiranism/next-shadcn-dashboard-starter" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js" />
</p>

## Overview

A free, open source (MIT) admin dashboard starter built with Next.js 16, shadcn/ui on Base UI primitives, TypeScript, and Tailwind CSS v4.

Every feature is a working, production-ready implementation, not static demo UI. Tables search, filter, sort, and paginate for real. Forms validate and mutate with cache invalidation.

Clone it, strip what you don't need with the built-in cleanup script, and start building on patterns you'd write yourself. It works well as a base for SaaS apps, internal tools, and admin panels.

### Why This Template

Most dashboard templates are static demo boilerplates: screens that look finished but need rebuilding the moment you wire in real data. This starter takes the opposite approach:

- **Everything actually works.** Data tables run end-to-end: server prefetch, client-side React Query cache, and URL-synced search, filtering, sorting, and pagination via nuqs. Forms are built from reusable, composable fields with Zod validation, including advanced patterns like multi-step and dialog/sheet forms, with real create/update mutations and cache invalidation on success.
- **Industry-standard implementations.** The data layer follows the official TanStack Query SSR pattern (server prefetch + `HydrationBoundary` + `useSuspenseQuery`), typed end to end, organized in a feature-based structure with a clean API layer per feature. These are patterns you copy into production code as-is, not mockups you rebuild from scratch.
- **Minimal by design.** Deliberately lean, with no bloated boilerplate, so you spend your time tweaking it to your use case, not deleting someone else's code. The built-in [cleanup script](#cleanup-script-start-minimal-in-60-seconds) strips any feature you don't need in under a minute.

### Tech Stack

- Framework - [Next.js 16](https://nextjs.org/16)
- Language - [TypeScript](https://www.typescriptlang.org)
- Styling - [Tailwind CSS v4](https://tailwindcss.com)
- Components - [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com) primitives
- Charts - [Recharts](https://recharts.org) • [Evil Charts](https://evilcharts.com/)
- Database - [PostgreSQL](https://www.postgresql.org) + [Drizzle ORM](https://orm.drizzle.team)
- Auth - custom NRP + password sign-in with database sessions (no third-party auth service)
- Schema validation - [Zod](https://zod.dev)
- Data fetching - [TanStack React Query](https://tanstack.com/query)
- State management - [Zustand](https://zustand-demo.pmnd.rs)
- Search param state - [Nuqs](https://nuqs.47ng.com/)
- Tables - [TanStack Data Tables](https://ui.shadcn.com/docs/components/data-table) • [Dice Table](https://www.diceui.com/docs/components/data-table)
- Forms - [TanStack Form](https://tanstack.com/form) + [Zod](https://zod.dev)
- Command+K interface - [kbar](https://kbar.vercel.app/)
- Linter / Formatter - [OxLint](https://oxc.rs/docs/guide/usage/linter) • [Oxfmt](https://oxc.rs/docs/guide/usage/formatter)
- Pre-commit hooks - [Husky](https://typicode.github.io/husky/)
- Themes - [tweakcn](https://tweakcn.com/)

_Looking for a TanStack Start version? Here's the [repo](https://git.new/tanstack-start-dashboard)._

## Features

- Sign-in with NRP + password, database sessions, login lockout, and forced password change
- Role-based access (admin / operator / viewer) for menus, pages, and Server Actions
- Pre-built dashboard layout with sidebar, header, and content area
- Analytics overview page with cards and charts
- Data tables with React Query prefetch, client-side cache, search, filter, and pagination
- Infobar component for tips, status messages, or contextual notes on any page
- shadcn/ui components on Base UI primitives, styled with Tailwind CSS
- Six-plus themes with a theme switcher
- Feature-based folder structure
- A starting point for SaaS dashboards, internal tools, and client admin panels

## Use Cases

A few things you can build with it:

- SaaS admin dashboards
- Internal tools and operations panels
- Analytics dashboards
- Client project admin panels
- A boilerplate for new Next.js shadcn projects

## Pages

| Page                                                                                                                                                                  | Notes                                                                                                                                                                                |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Dashboard Overview](https://shadcn-dashboard.kiranism.dev/dashboard)                                                                                                 | Cards and Recharts graphs. Parallel routes give each section its own loading and error state.                                                                                       |
| [Product List (Table)](https://shadcn-dashboard.kiranism.dev/dashboard/product)                                                                                       | TanStack Table plus React Query (server prefetch, client cache) with nuqs URL state for search, filter, and pagination. `shallow: true` keeps interactions on the client.           |
| [Create Product Form](https://shadcn-dashboard.kiranism.dev/dashboard/product/new)                                                                                    | TanStack Form and Zod with `useMutation` for create and update. Cache is invalidated on success.                                                                                    |
| [Users (Table)](https://shadcn-dashboard.kiranism.dev/dashboard/users)                                                                                                | Account management, admin only: create accounts, change role/status, reset passwords, unlock. Server Actions + Drizzle behind React Query with nuqs.                               |
| Sign in / Change password (`/auth/sign-in`, `/auth/change-password`)                                                                                                  | NRP + password sign-in; new and reset accounts must change their password first.                                                                                                    |
| [React Query Demo](https://shadcn-dashboard.kiranism.dev/dashboard/react-query)                                                                                       | A Pokemon API example showing the server prefetch, `HydrationBoundary`, and `useSuspenseQuery` pattern with client-side cache. |
| [Notifications](https://shadcn-dashboard.kiranism.dev/dashboard/notifications)                                                                                        | Notification center with a header badge, popover preview, and a full page with All / Unread / Read tabs. Includes mark-as-read and mark-all-as-read. |
| [Not Found](https://shadcn-dashboard.kiranism.dev/dashboard/notfound)                                                                                                 | A root-level not-found page.                                                                                                                                                        |

## Folder Structure

```plaintext
src/
├── app/                           # Next.js App Router directory
│   ├── auth/                      # Sign-in and change-password pages
│   ├── dashboard/                 # Dashboard route group
│   │   ├── overview/              # Analytics with parallel routes
│   │   ├── product/               # Product CRUD pages (React Query)
│   │   ├── users/                 # Users table (React Query + nuqs)
│   │   ├── react-query/           # React Query demo page
│   │   ├── notifications/         # Notifications page
│   └── api/                       # API routes
│
├── components/                    # Shared components
│   ├── ui/                        # UI primitives (buttons, inputs, dialogs, etc.)
│   ├── layout/                    # Layout components (header, sidebar, etc.)
│   ├── themes/                    # Theme system (selector, mode toggle, config)
│   └── kbar/                      # Command+K interface
│
├── features/                      # Feature-based modules
│   ├── auth/                      # Sign-in / sign-out / change-password actions and forms
│   ├── overview/                  # Dashboard analytics (charts, cards)
│   ├── products/                  # Product listing, form, tables (React Query)
│   ├── users/                     # Account management (Server Actions + Drizzle)
│   ├── react-query-demo/          # React Query demo (Pokemon API)
│   ├── notifications/             # Notification center & store
│
├── lib/                           # Core utilities (query-client, searchparams, etc.)
│   ├── auth/                      # Sessions, password hashing, roles, Data Access Layer
│   └── db/                        # Drizzle client and schema
├── proxy.ts                       # Optimistic sign-in redirect (cookie check only)
├── hooks/                         # Custom hooks
├── config/                        # Navigation, infobar, data table config
├── constants/                     # Mock data
├── styles/                        # Global CSS & theme files
│   └── themes/                    # Individual theme CSS files
└── types/                         # TypeScript types
```

## Getting Started

> [!NOTE]
> This starter uses Next.js 16 (App Router) with React 19 and shadcn/ui. To run it locally:

Clone the repo:

```
git clone https://github.com/Kiranism/next-shadcn-dashboard-starter.git
```

You need Node.js 22, npm 11.10 or newer, and a running PostgreSQL server.

- `npm install`
- Create an empty database, e.g. `createdb slc_polri`
- Copy the example env file: `cp env.example.txt .env.local`
- Set `DATABASE_URL` in `.env.local`
- `npm run db:migrate` to create the tables (SQL migrations live in `drizzle/`)
- `npm run db:seed-admin` to create the first admin. It prompts for NRP and name (or reads `ADMIN_NRP` / `ADMIN_NAME` / `ADMIN_PASSWORD`) and prints a temporary password when none is set
- `npm run dev`, then sign in at `/auth/sign-in` and change the temporary password

More accounts are created by an admin on the Users page; there is no public sign-up.

> [!TIP]
> No database yet? Put `AUTH_DISABLED=true` in `.env.local` and run `npm run dev`: sign-in is skipped and you're treated as an admin (account management stays unavailable). Production builds ignore this setting.
>
> Need real sign-in without a database (also in production)? Set `AUTH_USERS` and `AUTH_SECRET` instead — see `env.example.txt`.

##### Environment variables

See `env.example.txt` for the variables you need: the database connection, the session cookie setting, and the first-admin seed values.

##### Database scripts

- `npm run db:generate` creates a new SQL migration after you change `src/lib/db/schema.ts`
- `npm run db:migrate` applies pending migrations
- `npm run db:studio` opens Drizzle Studio to browse the data

The app should now be running at http://localhost:3000.

> [!WARNING]
> After cloning or forking, be careful when pulling the latest changes. Updates can cause merge conflicts.

---

## Cleanup Script: Start Minimal in 60 Seconds

Most starters make you hand-delete demo pages and rip out dependencies. This one ships with a cleanup script that removes the optional features you don't need (folders, files, dependencies, docs, and env entries), leaving a minimal base to build on. Run `--list` to see what's removable:

```bash
npm run cleanup -- --interactive    # interactive mode
npm run cleanup -- --list           # see available features
npm run cleanup -- --dry-run chat   # preview before removing
npm run cleanup -- kanban chat      # remove specific features
```

Run `npm run cleanup -- --help` for all options (flags and feature names go after `--`). The replacement files it writes live in `scripts/cleanup-templates/` as real, typechecked code. When you're done, delete `scripts/cleanup.js`, `scripts/cleanup-templates/`, and the `cleanup` entry in `package.json`.

## FAQ

**Is it production ready?**
Yes. Every feature is a complete, working implementation: authentication, CRUD flows, table search/filter/sort/pagination, and form validation with mutations all function end-to-end. It's a starting point for real applications, not a visual mockup.

**How is this different from other dashboard templates?**
Most dashboard templates are static demo boilerplates: screens that look finished but need rebuilding once you wire in real data. Here the tables, forms, auth, and account management all work end-to-end, the implementations follow official TanStack and Next.js patterns, and a cleanup script keeps the base minimal so you tweak it to your use case instead of deleting code.

**Is it free for commercial use?**
Yes. MIT-licensed and free for both personal and commercial projects: no paid tier, no license keys.

**How do I remove demo pages or features I don't need?**
Run `npm run cleanup -- --interactive` and pick what to strip, or `npm run cleanup -- --list` to see what can be removed.

**Does it support Next.js 16, React 19, and Tailwind CSS v4?**
Yes. The template is built on Next.js 16 (App Router), React 19, and Tailwind CSS v4, with shadcn/ui on Base UI primitives, and is actively maintained to track new releases.

**Which package manager does it use?**
npm 11.10 or newer, with `package-lock.json` committed. `.npmrc` sets `min-release-age=7` so freshly published package versions aren't installed until they're a week old; older npm versions ignore that setting, so `devEngines` in `package.json` warns when you use one.

**Does it work with AI coding assistants?**
Yes. The repo ships AGENTS.md and CLAUDE.md with the project's conventions, plus a bundled Claude Code skill (`.claude/skills/kiranism-shadcn-dashboard`) that teaches agents how to add pages, tables, forms, and navigation the template way. Works with Claude Code, Cursor, and any tool that reads AGENTS.md.

**What data fetching pattern does it use?**
TanStack React Query with the official SSR pattern: `prefetchQuery` on the server, `HydrationBoundary` with `dehydrate` for hydration, and `useSuspenseQuery` on the client, plus nuqs for URL-synced search-param state. Mutations invalidate the cache on success.

**How do I deploy it?**
Deploy to Vercel out of the box, or use the included Node.js Dockerfile (Next.js standalone output mode). See the [deployment guide](./docs/deployment.md).

## Deploy

Deploy to Vercel out of the box, or use the included Node.js Dockerfile (Next.js standalone output mode). Full guide: [docs/deployment.md](./docs/deployment.md).

### Support

If this template saved you some time, a star is appreciated. You can also [buy me a coffee](https://buymeacoffee.com/kir4n) if you'd like.

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow?style=flat-square&logo=buymeacoffee)](https://buymeacoffee.com/kir4n)

<!--

SEO keywords:

open source admin dashboard, nextjs admin dashboard, nextjs dashboard template,

shadcn ui dashboard, admin dashboard starter, next.js 16, typescript dashboard,

dashboard ui template, nextjs shadcn admin panel, react admin dashboard,

tailwind css admin dashboard, production ready admin dashboard template,

free react admin dashboard, nextjs 16 dashboard starter, working crud dashboard

-->

