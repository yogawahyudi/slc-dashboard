'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FieldGroup } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import { useAppForm } from '@/lib/form';
import { signIn } from '../actions';
import { safeRedirectPath, signInSchema, type SignInValues } from '../schemas';

export function SignInForm({ next }: { next?: string }) {
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: signIn,
    onSuccess: (result) => {
      if (!result.ok) {
        setError(result.error);
        form.setFieldValue('password', '');
        return;
      }
      // Full page load: start the session with a fresh client-side cache
      window.location.assign(
        result.mustChangePassword ? '/auth/change-password' : safeRedirectPath(next)
      );
    },
    onError: () => setError('Terjadi kesalahan. Silakan coba lagi.')
  });

  const form = useAppForm({
    defaultValues: { nrp: '', password: '' } as SignInValues,
    validators: { onSubmit: signInSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      // onError already shows the message; keep the rejection from going unhandled
      await mutateAsync(value).catch(() => {});
    }
  });

  return (
    <form
      className='w-full space-y-4'
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {error && (
        <Alert variant='destructive'>
          <Icons.alertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <FieldGroup>
        <form.AppField
          name='nrp'
          children={(field) => (
            <field.TextField
              label='NRP'
              inputMode='numeric'
              autoComplete='username'
              placeholder='Masukkan NRP'
              disabled={isPending}
            />
          )}
        />
        <form.AppField
          name='password'
          children={(field) => (
            <field.TextField
              label='Password'
              type='password'
              autoComplete='current-password'
              placeholder='Masukkan password'
              disabled={isPending}
            />
          )}
        />
      </FieldGroup>
      <LoadingButton loading={isPending} type='submit' className='w-full'>
        Masuk
      </LoadingButton>
    </form>
  );
}
