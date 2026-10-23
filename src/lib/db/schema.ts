import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
// Relative import: drizzle-kit loads this file without the `@/` path alias
import { ROLES } from '../auth/roles';

export const userRole = pgEnum('user_role', ROLES);
export const userStatus = pgEnum('user_status', ['active', 'inactive']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  nrp: varchar('nrp', { length: 18 }).notNull().unique(),
  name: varchar('name', { length: 120 }).notNull(),
  role: userRole('role').notNull().default('viewer'),
  status: userStatus('status').notNull().default('active'),
  passwordHash: text('password_hash').notNull(),
  mustChangePassword: boolean('must_change_password').notNull().default(true),
  failedLoginCount: integer('failed_login_count').notNull().default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
});

// `id` is the SHA-256 hash of the session token; the raw token only lives in the cookie
export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index('sessions_user_id_idx').on(table.userId)]
);

export type UserRow = typeof users.$inferSelect;
export type UserStatus = (typeof userStatus.enumValues)[number];
