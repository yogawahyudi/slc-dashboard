import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { and, eq, lt, ne } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { sessions, users } from '@/lib/db/schema';
import {
  SESSION_ABSOLUTE_TIMEOUT_MS,
  SESSION_COOKIE,
  SESSION_IDLE_TIMEOUT_MS,
  sessionCookieOptions
} from './cookie';

// Extend the idle deadline at most once every 5 minutes to limit database writes
const RENEW_INTERVAL_MS = 5 * 60 * 1000;

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const now = Date.now();

  await db
    .delete(sessions)
    .where(and(eq(sessions.userId, userId), lt(sessions.expiresAt, new Date(now))));
  await db.insert(sessions).values({
    id: hashToken(token),
    userId,
    expiresAt: new Date(now + SESSION_IDLE_TIMEOUT_MS)
  });

  // The cookie lasts until the absolute timeout; the idle timeout is enforced in the database
  return { token, cookieExpiresAt: new Date(now + SESSION_ABSOLUTE_TIMEOUT_MS) };
}

export async function validateSessionToken(token: string) {
  const sessionId = hashToken(token);
  const [row] = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);
  if (!row) return null;

  const { session, user } = row;
  const now = Date.now();
  const absoluteEnd = session.createdAt.getTime() + SESSION_ABSOLUTE_TIMEOUT_MS;

  if (session.expiresAt.getTime() <= now || absoluteEnd <= now || user.status !== 'active') {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  // Database writes are fine during render (cookie writes are not), so slide the idle deadline here
  if (session.expiresAt.getTime() - now < SESSION_IDLE_TIMEOUT_MS - RENEW_INTERVAL_MS) {
    session.expiresAt = new Date(Math.min(now + SESSION_IDLE_TIMEOUT_MS, absoluteEnd));
    await db
      .update(sessions)
      .set({ expiresAt: session.expiresAt })
      .where(eq(sessions.id, sessionId));
  }

  return { session, user };
}

export async function invalidateSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function invalidateSessionToken(token: string) {
  await invalidateSession(hashToken(token));
}

export async function invalidateUserSessions(userId: string, exceptSessionId?: string) {
  await db
    .delete(sessions)
    .where(
      exceptSessionId
        ? and(eq(sessions.userId, userId), ne(sessions.id, exceptSessionId))
        : eq(sessions.userId, userId)
    );
}

// Cookies can only be written from Server Actions and Route Handlers
export async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
}

export async function deleteSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function readSessionCookie() {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}
