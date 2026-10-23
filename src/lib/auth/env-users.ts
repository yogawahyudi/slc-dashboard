import 'server-only';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { newPasswordSchema, nrpSchema } from '@/features/auth/schemas';
import { SESSION_ABSOLUTE_TIMEOUT_MS } from './cookie';
import type { CurrentUser } from './dal';
import { LOCKOUT_MS, MAX_FAILED_LOGINS } from './password';
import { ROLES, type Role } from './roles';

// Fixed accounts for running without a database (authMode 'env'):
//   AUTH_USERS="nrp:name:role:password;nrp:name:role:password"
// Sessions are HMAC-signed cookies (AUTH_SECRET) instead of database rows.

type EnvUser = { nrp: string; name: string; role: Role; password: string };

type TokenPayload = { nrp: string; exp: number };

let cachedUsers: Map<string, EnvUser> | undefined;

/** One `nrp:name:role:password` entry, or the reason it's invalid. */
function parseEntry(entry: string): EnvUser | string {
  // The password is everything after the third ':' so it may contain ':' itself
  const [nrpPart = '', namePart = '', rolePart = '', ...passwordParts] = entry.split(':');
  const password = passwordParts.join(':');

  const nrp = nrpSchema.safeParse(nrpPart);
  if (!nrp.success) return nrp.error.issues[0]?.message ?? 'NRP tidak valid';
  const name = namePart.trim();
  if (!name) return 'nama wajib diisi';
  const role = rolePart.trim() as Role;
  if (!ROLES.includes(role)) return `role harus salah satu dari ${ROLES.join(', ')}`;
  const validPassword = newPasswordSchema.safeParse(password);
  if (!validPassword.success) {
    return validPassword.error.issues[0]?.message ?? 'password tidak valid';
  }

  return { nrp: nrp.data, name, role, password };
}

function parseEnvUsers(raw: string) {
  const users = new Map<string, EnvUser>();
  const entries = raw
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean);

  entries.forEach((entry, index) => {
    const user = parseEntry(entry);
    // Never echo the entry itself: it holds a password
    const prefix = `[auth] AUTH_USERS akun ke-${index + 1}`;
    if (typeof user === 'string') throw new Error(`${prefix}: ${user}`);
    if (users.has(user.nrp)) throw new Error(`${prefix}: NRP ${user.nrp} sudah dipakai akun lain`);
    users.set(user.nrp, user);
  });

  if (users.size === 0) throw new Error('[auth] AUTH_USERS tidak berisi akun');
  return users;
}

function getEnvUsers() {
  cachedUsers ??= parseEnvUsers(process.env.AUTH_USERS ?? '');
  return cachedUsers;
}

function getSecret() {
  const secret = process.env.AUTH_SECRET ?? '';
  if (secret.length < 32) {
    throw new Error(
      '[auth] AUTH_SECRET wajib diisi (min. 32 karakter) saat memakai AUTH_USERS. Buat dengan: ' +
        `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`
    );
  }
  return secret;
}

function sha256(value: string) {
  return createHash('sha256').update(value).digest();
}

const DUMMY_PASSWORD = randomBytes(16).toString('hex');

// No database to count failures in: they live in memory, per server instance, until restart
const failedLogins = new Map<string, { count: number; lockedUntil: number }>();

/** The account for `nrp` when the password matches and it isn't locked out, otherwise null. */
export function verifyEnvUserPassword(nrp: string, password: string) {
  const user = getEnvUsers().get(nrp);
  const failures = failedLogins.get(nrp);
  const locked = (failures?.lockedUntil ?? 0) > Date.now();

  // Always compare, so unknown and locked accounts take as long as real ones
  const expected = user && !locked ? user.password : DUMMY_PASSWORD;
  const matches = timingSafeEqual(sha256(password), sha256(expected));
  if (!user || locked) return null;

  if (matches) {
    failedLogins.delete(nrp);
    return user;
  }

  const count = (failures?.count ?? 0) + 1;
  failedLogins.set(
    nrp,
    count >= MAX_FAILED_LOGINS
      ? { count: 0, lockedUntil: Date.now() + LOCKOUT_MS }
      : { count, lockedUntil: 0 }
  );
  return null;
}

// Signing over the password too ends a user's sessions once their password is changed
function sign(payload: string, user: EnvUser) {
  return createHmac('sha256', getSecret()).update(`${payload}.${user.password}`).digest();
}

/**
 * The cookie is the whole session, valid until the absolute timeout. There is no sliding
 * idle timeout here: cookies can't be rewritten while a page renders.
 */
export function createEnvSession(user: EnvUser) {
  const cookieExpiresAt = new Date(Date.now() + SESSION_ABSOLUTE_TIMEOUT_MS);
  const data: TokenPayload = { nrp: user.nrp, exp: cookieExpiresAt.getTime() };
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  return { token: `${payload}.${sign(payload, user).toString('base64url')}`, cookieExpiresAt };
}

function readPayload(payload: string): TokenPayload | null {
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof data?.nrp === 'string' && typeof data?.exp === 'number' ? data : null;
  } catch {
    return null;
  }
}

export function validateEnvSessionToken(token: string): CurrentUser | null {
  const [payload, signature, ...extra] = token.split('.');
  if (!payload || !signature || extra.length > 0) return null;

  const data = readPayload(payload);
  if (!data || data.exp <= Date.now()) return null;

  // A user removed from AUTH_USERS loses access on the next request
  const user = getEnvUsers().get(data.nrp);
  if (!user) return null;

  const actual = Buffer.from(signature, 'base64url');
  const expected = sign(payload, user);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  return {
    id: user.nrp,
    nrp: user.nrp,
    name: user.name,
    role: user.role,
    mustChangePassword: false
  };
}
