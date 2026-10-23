// Shared by the proxy and server code — keep this file free of server-only imports.

export const SESSION_COOKIE = 'slc_session';

/** A session ends after this much inactivity (sliding, enforced in the database). */
export const SESSION_IDLE_TIMEOUT_MS = 60 * 60 * 1000;

/** A session never lives longer than this after sign-in, however active the user is. */
export const SESSION_ABSOLUTE_TIMEOUT_MS = 12 * 60 * 60 * 1000;

export function sessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    // Set SESSION_COOKIE_SECURE=false only when production is served over plain HTTP
    secure: process.env.NODE_ENV === 'production' && process.env.SESSION_COOKIE_SECURE !== 'false',
    sameSite: 'lax' as const,
    path: '/',
    expires
  };
}
