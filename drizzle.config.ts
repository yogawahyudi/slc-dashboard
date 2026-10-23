import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';

// Load .env.local / .env the same way Next.js does
loadEnvConfig(process.cwd());

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
  strict: true,
  verbose: true
});
