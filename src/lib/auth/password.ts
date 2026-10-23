import 'server-only';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

/** This many wrong passwords in a row lock sign-in for the account for LOCKOUT_MS. */
export const MAX_FAILED_LOGINS = 5;
export const LOCKOUT_MS = 15 * 60 * 1000;

// Stored format: scrypt$N$r$p$<salt base64>$<hash base64>
const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;

function deriveKey(
  password: string,
  salt: Buffer,
  n: number,
  r: number,
  p: number,
  length: number
) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, length, { N: n, r, p }, (error, key) =>
      error ? reject(error) : resolve(key)
    );
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await deriveKey(password, salt, N, R, P, KEY_LENGTH);
  return ['scrypt', N, R, P, salt.toString('base64'), hash.toString('base64')].join('$');
}

export async function verifyPassword(password: string, stored: string) {
  const [algorithm, n, r, p, salt, hash] = stored.split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;

  const expected = Buffer.from(hash, 'base64');
  try {
    const actual = await deriveKey(
      password,
      Buffer.from(salt, 'base64'),
      Number(n),
      Number(r),
      Number(p),
      expected.length
    );
    return timingSafeEqual(actual, expected);
  } catch {
    // Malformed stored hash
    return false;
  }
}

let dummyHash: Promise<string> | undefined;

/** Burn the same time as a real check so unknown NRPs can't be detected by timing. */
export async function verifyDummyPassword(password: string) {
  dummyHash ??= hashPassword(randomBytes(16).toString('hex'));
  await verifyPassword(password, await dummyHash);
}
