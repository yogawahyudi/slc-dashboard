import type { Role } from '@/lib/auth/roles';

export const USER_STATUSES = ['active', 'inactive'] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export type User = {
  id: string;
  nrp: string;
  name: string;
  role: Role;
  status: UserStatus;
  mustChangePassword: boolean;
  /** Sign-in is locked after too many failed attempts (evaluated when the list was fetched) */
  isLocked: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export type UserFilters = {
  page?: number;
  limit?: number;
  search?: string;
  /** Comma-separated roles, as written to the URL by the data table */
  roles?: string;
  /** Comma-separated statuses */
  statuses?: string;
  /** JSON `[{ id, desc }]` from the data table */
  sort?: string;
};

export type UsersResponse = {
  users: User[];
  total: number;
};

// Errors are returned, not thrown: thrown Server Action messages are hidden in production
export type MutationResult = { ok: true } | { ok: false; error: string };
