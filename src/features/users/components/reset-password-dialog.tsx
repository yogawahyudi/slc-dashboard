'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import { PASSWORD_MIN_LENGTH } from '@/features/auth/schemas';
import { useAppForm } from '@/lib/form';
import { resetUserPasswordMutation } from '../api/mutations';
import type { User } from '../api/types';
import { resetPasswordSchema, type ResetPasswordValues } from '../schemas/user';

interface ResetPasswordDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetPasswordDialog({ user, open, onOpenChange }: ResetPasswordDialogProps) {
  const { mutateAsync, isPending } = useMutation(resetUserPasswordMutation);

  const form = useAppForm({
    defaultValues: { password: '', confirmPassword: '' } as ResetPasswordValues,
    validators: { onSubmit: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      try {
        await mutateAsync({ id: user.id, values: value });
        toast.success(`Password ${user.name} direset`);
        form.reset();
        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal mereset password');
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Atur password sementara untuk {user.name} (NRP {user.nrp}). Pengguna akan keluar dari
            semua perangkat dan wajib mengganti password saat login berikutnya.
          </DialogDescription>
        </DialogHeader>
        <form
          id='reset-password-form'
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField
              name='password'
              children={(field) => (
                <field.TextField
                  label='Password sementara'
                  type='password'
                  autoComplete='new-password'
                  description={`Minimal ${PASSWORD_MIN_LENGTH} karakter.`}
                  required
                />
              )}
            />
            <form.AppField
              name='confirmPassword'
              children={(field) => (
                <field.TextField
                  label='Ulangi password'
                  type='password'
                  autoComplete='new-password'
                  required
                />
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <LoadingButton loading={isPending} type='submit' form='reset-password-form'>
            Reset password
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
