/**
 * Create the first admin account.
 *
 *   npm run db:seed-admin
 *
 * Reads ADMIN_NRP, ADMIN_NAME and ADMIN_PASSWORD from the environment (or .env.local) and
 * prompts for NRP and name when they're missing. Without ADMIN_PASSWORD a random temporary
 * password is generated and printed once. The admin must change it at first sign-in.
 * An NRP that already exists is left untouched.
 *
 * Runs with `tsx --conditions=react-server` so `import 'server-only'` resolves to a no-op.
 */
import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { loadEnvConfig } from '@next/env';
import type { ZodType } from 'zod';

function parseOrExit<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    console.error(result.error.issues[0]?.message ?? 'Input tidak valid');
    process.exit(1);
  }
  return result.data;
}

async function main() {
  loadEnvConfig(process.cwd());
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL belum diatur. Salin env.example.txt ke .env.local dan isi.');
  }

  // Imported after the env is loaded: the pool reads DATABASE_URL when its module loads
  const { db } = await import('../src/lib/db');
  const { users } = await import('../src/lib/db/schema');
  const { hashPassword } = await import('../src/lib/auth/password');
  const { newPasswordSchema, nrpSchema } = await import('../src/features/auth/schemas');

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const nrp = parseOrExit(nrpSchema, process.env.ADMIN_NRP || (await rl.question('NRP admin: ')));
  const name = (process.env.ADMIN_NAME || (await rl.question('Nama admin: '))).trim();
  rl.close();
  if (name.length < 3) {
    console.error('Nama minimal 3 karakter');
    process.exit(1);
  }

  const generated = !process.env.ADMIN_PASSWORD;
  const password = generated
    ? randomBytes(12).toString('base64url')
    : parseOrExit(newPasswordSchema, process.env.ADMIN_PASSWORD);

  const [created] = await db
    .insert(users)
    .values({ nrp, name, role: 'admin', passwordHash: await hashPassword(password) })
    .onConflictDoNothing({ target: users.nrp })
    .returning({ id: users.id });

  if (!created) {
    console.log(`NRP ${nrp} sudah terdaftar; tidak ada yang diubah.`);
    return;
  }

  console.log(`Admin ${name} (NRP ${nrp}) dibuat.`);
  if (generated) console.log(`Password sementara: ${password}`);
  console.log('Password ini wajib diganti saat login pertama.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // Print the driver's cause, not Drizzle's message (which includes the query params)
    const cause = error instanceof Error && error.cause instanceof Error ? error.cause : error;
    console.error(cause instanceof Error ? cause.message : cause);
    process.exit(1);
  });
