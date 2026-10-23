import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { validateEnvSessionToken } from './env-users';
import { authMode } from './mode';
import { hasRole, type Role } from './roles';
import { readSessionCookie, validateSessionToken } from './session';

// Data Access Layer: every auth check goes through here (see Next.js authentication guide)

export type CurrentUser = {
  id: string;
  nrp: string;
  name: string;
  role: Role;
  mustChangePassword: boolean;
};

/** Stand-in user while AUTH_DISABLED=true (development only). Admin, so every menu shows. */
const DEV_USER: CurrentUser = {
  id: '00000000-0000-0000-0000-000000000000',
  nrp: '00000000',
  name: 'Mode tanpa login',
  role: 'admin',
  mustChangePassword: false
};

let warnedAuthDisabled = false;

/**
 * Validated database session + full user row (null outside database mode).
 * Server-only; never pass the result to the client.
 */
export const getSession = cache(async () => {
  if (authMode !== 'database') return null;
  const token = await readSessionCookie();
  return token ? validateSessionToken(token) : null;
});

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (authMode === 'disabled') {
    if (!warnedAuthDisabled) {
      warnedAuthDisabled = true;
      console.warn('[auth] AUTH_DISABLED=true: login dinonaktifkan, semua request sebagai admin');
    }
    return DEV_USER;
  }

  if (authMode === 'env') {
    const token = await readSessionCookie();
    return token ? validateEnvSessionToken(token) : null;
  }

  const current = await getSession();
  if (!current) return null;

  const { id, nrp, name, role, mustChangePassword } = current.user;
  return { id, nrp, name, role, mustChangePassword };
});

/** For pages and layouts: redirect to sign-in (or the forced password change) when needed. */
export async function requireUser({ allowPasswordChange = false } = {}) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/sign-in');
  if (user.mustChangePassword && !allowPasswordChange) redirect('/auth/change-password');
  return user;
}

/** For pages: send users without one of `roles` back to the overview. */
export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!hasRole(user.role, roles)) redirect('/dashboard/overview');
  return user;
}

/**
 * For Server Actions: an expired session (or a pending forced password change) redirects
 * the browser like a page would; a missing role throws.
 */
export async function authorize(...roles: Role[]) {
  const user = await requireUser();
  if (roles.length > 0 && !hasRole(user.role, roles)) throw new Error('Forbidden');
  return user;
}

/** For Route Handlers: returns a 401/403 response to send back, or null when access is allowed. */
export async function guardRoute(...roles: Role[]) {
  const user = await getCurrentUser();
  if (!user || user.mustChangePassword) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (roles.length > 0 && !hasRole(user.role, roles)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  return null;
}
