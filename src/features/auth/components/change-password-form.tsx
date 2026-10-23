'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FieldGroup } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import { useAppForm } from '@/lib/form';
import { changePassword } from '../actions';
import { changePasswordSchema, PASSWORD_MIN_LENGTH, type ChangePasswordValues } from '../schemas';

export function ChangePasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: changePassword,
    onSuccess: (result) => {
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success('Password berhasil diganti');
      router.replace('/dashboard/overview');
    },
    onError: () => setError('Terjadi kesalahan. Silakan coba lagi.')
  });

  const form = useAppForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    } as ChangePasswordValues,
    validators: { onSubmit: changePasswordSchema },
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
          name='currentPassword'
          children={(field) => (
            <field.TextField
              label='Password lama'
              type='password'
              autoComplete='current-password'
              disabled={isPending}
            />
          )}
        />
        <form.AppField
          name='newPassword'
          children={(field) => (
            <field.TextField
              label='Password baru'
              type='password'
              autoComplete='new-password'
              description={`Minimal ${PASSWORD_MIN_LENGTH} karakter.`}
              disabled={isPending}
            />
          )}
        />
        <form.AppField
          name='confirmPassword'
          children={(field) => (
            <field.TextField
              label='Ulangi password baru'
              type='password'
              autoComplete='new-password'
              disabled={isPending}
            />
          )}
        />
      </FieldGroup>
      <LoadingButton loading={isPending} type='submit' className='w-full'>
        Simpan password
      </LoadingButton>
    </form>
  );
}
