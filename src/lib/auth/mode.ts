// Shared by the proxy and server code — keep this file free of server-only imports.

/**
 * Development-only escape hatch: AUTH_DISABLED=true skips sign-in so the dashboard runs
 * without a database (everyone is the built-in DEV_USER admin, see dal.ts).
 * Production builds always ignore it: NODE_ENV is inlined at build time.
 */
export const isAuthDisabled =
  process.env.AUTH_DISABLED === 'true' && process.env.NODE_ENV !== 'production';

/**
 * - `database`: accounts and sessions in PostgreSQL (default)
 * - `env`: fixed accounts from AUTH_USERS and signed session cookies, no database (env-users.ts)
 * - `disabled`: no sign-in at all (AUTH_DISABLED=true, development only)
 */
export type AuthMode = 'database' | 'env' | 'disabled';

export const authMode: AuthMode = isAuthDisabled
  ? 'disabled'
  : process.env.AUTH_USERS?.trim()
    ? 'env'
    : 'database';
