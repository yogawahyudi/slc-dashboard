import * as z from 'zod';
import { newPasswordSchema, nrpSchema } from '@/features/auth/schemas';
import { ROLES } from '@/lib/auth/roles';
import { USER_STATUSES } from '../api/types';

const nameSchema = z
  .string()
  .trim()
  .min(3, { message: 'Nama minimal 3 karakter' })
  .max(120, { message: 'Nama maksimal 120 karakter' });

const roleSchema = z.enum(ROLES, { message: 'Pilih role' });

export const createUserSchema = z.object({
  nrp: nrpSchema,
  name: nameSchema,
  role: roleSchema,
  password: newPasswordSchema
});

export type CreateUserValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: nameSchema,
  role: roleSchema,
  status: z.enum(USER_STATUSES, { message: 'Pilih status' })
});

export type UpdateUserValues = z.infer<typeof updateUserSchema>;

export const resetPasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword']
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
