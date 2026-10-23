import * as z from 'zod';

// NRP anggota Polri: 8 digit; PNS Polri login dengan NIP 18 digit
export const nrpSchema = z
  .string()
  .trim()
  .regex(/^(\d{8}|\d{18})$/, { message: 'NRP harus 8 digit (atau NIP 18 digit)' });

export const PASSWORD_MIN_LENGTH = 10;

export const newPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, { message: `Password minimal ${PASSWORD_MIN_LENGTH} karakter` })
  .max(128, { message: 'Password maksimal 128 karakter' });

export const signInSchema = z.object({
  nrp: nrpSchema,
  password: z.string().min(1, { message: 'Password wajib diisi' })
});

export type SignInValues = z.infer<typeof signInSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Password lama wajib diisi' }),
    newPassword: newPasswordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword']
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'Password baru harus berbeda dari password lama',
    path: ['newPassword']
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

/** Only allow redirects back into the dashboard (blocks open redirects like `//evil.com`). */
export function safeRedirectPath(next: string | null | undefined) {
  return next && /^\/dashboard(\/|$|\?)/.test(next) ? next : '/dashboard/overview';
}
