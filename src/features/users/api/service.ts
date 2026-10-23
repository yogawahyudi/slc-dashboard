'use server';

// ============================================================
// User Service — Data Access Layer (Server Actions + Drizzle)
// ============================================================
// Every function runs on the server and is restricted to admins.
// Queries (queries.ts) and components import from here.
// ============================================================

import { and, asc, count, desc, eq, ilike, inArray, or, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { authorize } from '@/lib/auth/dal';
import { hashPassword } from '@/lib/auth/password';
import { ROLES } from '@/lib/auth/roles';
import { invalidateUserSessions } from '@/lib/auth/session';
import {
  createUserSchema,
  resetPasswordSchema,
  updateUserSchema,
  type CreateUserValues,
  type ResetPasswordValues,
  type UpdateUserValues
} from '../schemas/user';
import {
  USER_STATUSES,
  type MutationResult,
  type User,
  type UserFilters,
  type UsersResponse
} from './types';

// Never select passwordHash or lockout fields for the client
const userColumns = {
  id: users.id,
  nrp: users.nrp,
  name: users.name,
  role: users.role,
  status: users.status,
  mustChangePassword: users.mustChangePassword,
  lockedUntil: users.lockedUntil,
  lastLoginAt: users.lastLoginAt,
  createdAt: users.createdAt
};

// Column ids from the data table that may be sorted on
const sortableColumns = {
  nrp: users.nrp,
  name: users.name,
  lastLoginAt: users.lastLoginAt
};

function parseList<T extends string>(value: string | undefined, allowed: readonly T[]): T[] {
  if (!value) return [];
  return value.split(/[.,]/).filter((v): v is T => (allowed as readonly string[]).includes(v));
}

function parseSort(sort: string | undefined): SQL[] {
  if (!sort) return [];
  try {
    const items = JSON.parse(sort) as { id: string; desc: boolean }[];
    return items.flatMap(({ id, desc: isDesc }) => {
      const column = sortableColumns[id as keyof typeof sortableColumns];
      return column ? [isDesc ? desc(column) : asc(column)] : [];
    });
  } catch {
    return [];
  }
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, '\\$&');
}

export async function getUsers(filters: UserFilters): Promise<UsersResponse> {
  await authorize('admin');

  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 10));
  const roles = parseList(filters.roles, ROLES);
  const statuses = parseList(filters.statuses, USER_STATUSES);
  const search = filters.search?.trim();

  const conditions: (SQL | undefined)[] = [];
  if (search) {
    const pattern = `%${escapeLike(search)}%`;
    conditions.push(or(ilike(users.name, pattern), ilike(users.nrp, pattern)));
  }
  if (roles.length > 0) conditions.push(inArray(users.role, roles));
  if (statuses.length > 0) conditions.push(inArray(users.status, statuses));
  const where = and(...conditions);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select(userColumns)
      .from(users)
      .where(where)
      .orderBy(...parseSort(filters.sort), asc(users.name))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ total: count() }).from(users).where(where)
  ]);

  const now = new Date();
  const result: User[] = rows.map(({ lockedUntil, ...row }) => ({
    ...row,
    isLocked: !!lockedUntil && lockedUntil > now,
    lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString()
  }));

  return { users: result, total };
}

export async function createUser(values: CreateUserValues): Promise<MutationResult> {
  await authorize('admin');

  const parsed = createUserSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { nrp, name, role, password } = parsed.data;

  const [created] = await db
    .insert(users)
    .values({ nrp, name, role, passwordHash: await hashPassword(password) })
    .onConflictDoNothing({ target: users.nrp })
    .returning({ id: users.id });

  if (!created) return { ok: false, error: `NRP ${nrp} sudah terdaftar` };
  return { ok: true };
}

export async function updateUser(id: string, values: UpdateUserValues): Promise<MutationResult> {
  const admin = await authorize('admin');

  const parsed = updateUserSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { name, role, status } = parsed.data;

  // The acting admin always stays an active admin, so at least one admin always remains
  if (id === admin.id && (role !== 'admin' || status !== 'active')) {
    return { ok: false, error: 'Anda tidak dapat mengubah role atau menonaktifkan akun sendiri' };
  }

  const [updated] = await db
    .update(users)
    .set({ name, role, status })
    .where(eq(users.id, id))
    .returning({ id: users.id });
  if (!updated) return { ok: false, error: 'Akun tidak ditemukan' };

  // Role changes apply on the next request (the session reads the role from the DB);
  // deactivation signs the user out everywhere right away
  if (status === 'inactive') await invalidateUserSessions(id);

  return { ok: true };
}

export async function resetUserPassword(
  id: string,
  values: ResetPasswordValues
): Promise<MutationResult> {
  const admin = await authorize('admin');
  if (id === admin.id) {
    return { ok: false, error: 'Gunakan menu Ganti password untuk akun Anda sendiri' };
  }

  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const [updated] = await db
    .update(users)
    .set({
      passwordHash: await hashPassword(parsed.data.password),
      mustChangePassword: true,
      failedLoginCount: 0,
      lockedUntil: null
    })
    .where(eq(users.id, id))
    .returning({ id: users.id });
  if (!updated) return { ok: false, error: 'Akun tidak ditemukan' };

  await invalidateUserSessions(id);
  return { ok: true };
}

export async function unlockUser(id: string): Promise<MutationResult> {
  await authorize('admin');

  const [updated] = await db
    .update(users)
    .set({ failedLoginCount: 0, lockedUntil: null })
    .where(eq(users.id, id))
    .returning({ id: users.id });
  if (!updated) return { ok: false, error: 'Akun tidak ditemukan' };

  return { ok: true };
}
