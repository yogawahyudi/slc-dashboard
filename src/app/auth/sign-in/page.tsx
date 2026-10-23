import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/dal';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { SignInForm } from '@/features/auth/components/sign-in-form';
import { safeRedirectPath } from '@/features/auth/schemas';

export const metadata: Metadata = {
  title: 'Masuk'
};

type PageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function SignInPage({ searchParams }: PageProps) {
  const { next } = await searchParams;
  const nextPath = typeof next === 'string' ? next : undefined;

  const user = await getCurrentUser();
  if (user) {
    redirect(user.mustChangePassword ? '/auth/change-password' : safeRedirectPath(nextPath));
  }

  return (
    <AuthShell title='Masuk' description='Gunakan NRP dan password akun Anda.'>
      <SignInForm next={nextPath} />
    </AuthShell>
  );
}
