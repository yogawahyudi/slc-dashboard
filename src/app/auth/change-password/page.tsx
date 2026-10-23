import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/dal';
import { isAuthDisabled } from '@/lib/auth/mode';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { ChangePasswordForm } from '@/features/auth/components/change-password-form';

export const metadata: Metadata = {
  title: 'Ganti password'
};

export default async function ChangePasswordPage() {
  // No accounts (and no database) while sign-in is switched off
  if (isAuthDisabled) redirect('/dashboard/overview');

  const user = await requireUser({ allowPasswordChange: true });

  return (
    <AuthShell
      title='Ganti password'
      description={
        user.mustChangePassword
          ? 'Anda wajib mengganti password sebelum melanjutkan.'
          : 'Masukkan password lama dan password baru Anda.'
      }
    >
      <ChangePasswordForm />
      {!user.mustChangePassword && (
        <Link
          href='/dashboard/overview'
          className='text-muted-foreground hover:text-foreground text-center text-sm underline-offset-4 hover:underline'
        >
          Kembali ke dashboard
        </Link>
      )}
    </AuthShell>
  );
}
