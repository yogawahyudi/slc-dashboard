'use server';

import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/dal';
import { hashPassword, verifyDummyPassword, verifyPassword } from '@/lib/auth/password';
import {
  createSession,
  deleteSessionCookie,
  invalidateSession,
  invalidateSessionToken,
  invalidateUserSessions,
  readSessionCookie,
  setSessionCookie
} from '@/lib/auth/session';
import {
  changePasswordSchema,
  signInSchema,
  type ChangePasswordValues,
  type SignInValues
} from './schemas';

// Errors are returned, not thrown: thrown Server Action messages are hidden in production
export type ActionResult = { ok: true } | { ok: false; error: string };

const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
// One message for unknown NRP, wrong password and locked account, so none can be told apart
const SIGN_IN_FAILED =
  'NRP atau password salah, atau akun sedang dikunci sementara. Coba lagi dalam beberapa menit.';

export async function signIn(
  values: SignInValues
): Promise<{ ok: true; mustChangePassword: boolean } | { ok: false; error: string }> {
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: SIGN_IN_FAILED };
  const { nrp, password } = parsed.data;

  const user = await db.query.users.findFirst({ where: eq(users.nrp, nrp) });

  // Unknown or locked: burn the same time as a real check, never test the real password
  if (!user || (user.lockedUntil && user.lockedUntil > new Date())) {
    await verifyDummyPassword(password);
    return { ok: false, error: SIGN_IN_FAILED };
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    // Increment atomically so parallel attempts can't skip the lockout
    const [updated] = await db
      .update(users)
      .set({ failedLoginCount: sql`${users.failedLoginCount} + 1` })
      .where(eq(users.id, user.id))
      .returning({ failedLoginCount: users.failedLoginCount });

    if (updated.failedLoginCount >= MAX_FAILED_LOGINS) {
      await db
        .update(users)
        .set({ failedLoginCount: 0, lockedUntil: new Date(Date.now() + LOCKOUT_MS) })
        .where(eq(users.id, user.id));
    }
    return { ok: false, error: SIGN_IN_FAILED };
  }

  // Only someone who knows the password learns that the account is inactive
  if (user.status !== 'active') {
    return { ok: false, error: 'Akun Anda tidak aktif. Hubungi admin.' };
  }

  await db
    .update(users)
    .set({ failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() })
    .where(eq(users.id, user.id));

  // Drop the session behind any cookie this browser still carries
  const previousToken = await readSessionCookie();
  if (previousToken) await invalidateSessionToken(previousToken);

  const { token, cookieExpiresAt } = await createSession(user.id);
  await setSessionCookie(token, cookieExpiresAt);

  return { ok: true, mustChangePassword: user.mustChangePassword };
}

/** The client follows up with a full page load so no cached data outlives the session. */
export async function signOut(): Promise<ActionResult> {
  const current = await getSession();
  if (current) await invalidateSession(current.session.id);
  await deleteSessionCookie();
  return { ok: true };
}

export async function changePassword(values: ChangePasswordValues): Promise<ActionResult> {
  const current = await getSession();
  if (!current) return { ok: false, error: 'Sesi berakhir. Silakan login kembali.' };

  const parsed = changePasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }
  const { currentPassword, newPassword } = parsed.data;

  if (newPassword === current.user.nrp) {
    return { ok: false, error: 'Password tidak boleh sama dengan NRP' };
  }
  if (!(await verifyPassword(currentPassword, current.user.passwordHash))) {
    return { ok: false, error: 'Password lama salah' };
  }

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(newPassword), mustChangePassword: false })
    .where(eq(users.id, current.user.id));

  // Sign out every other device; keep this session
  await invalidateUserSessions(current.user.id, current.session.id);

  return { ok: true };
}
