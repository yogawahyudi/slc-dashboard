'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { PASSWORD_MIN_LENGTH } from '@/features/auth/schemas';
import { useAppForm } from '@/lib/form';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Icons } from '@/components/icons';
import { useCurrentUser } from '@/components/layout/current-user-provider';
import { useMutation } from '@tanstack/react-query';
import { createUserMutation, updateUserMutation } from '../api/mutations';
import type { User } from '../api/types';
import { toast } from 'sonner';
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserValues,
  type UpdateUserValues
} from '../schemas/user';
import { ROLE_OPTIONS, STATUS_OPTIONS } from './users-table/options';

const FORM_ID = 'user-form-sheet';

interface UserFormSheetProps {
  user?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserFormSheet({ user, open, onOpenChange }: UserFormSheetProps) {
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>{user ? 'Ubah akun' : 'Akun baru'}</SheetTitle>
          <SheetDescription>
            {user
              ? `Perbarui data akun NRP ${user.nrp}.`
              : 'Pengguna wajib mengganti password ini saat login pertama.'}
          </SheetDescription>
        </SheetHeader>
        {user ? <EditUserForm user={user} onDone={close} /> : <CreateUserForm onDone={close} />}
      </SheetContent>
    </Sheet>
  );
}

function FormFooter({
  isPending,
  label,
  onCancel
}: {
  isPending: boolean;
  label: string;
  onCancel: () => void;
}) {
  return (
    <SheetFooter>
      <Button type='button' variant='outline' onClick={onCancel}>
        Batal
      </Button>
      <LoadingButton loading={isPending} type='submit' form={FORM_ID}>
        {label}
      </LoadingButton>
    </SheetFooter>
  );
}

function CreateUserForm({ onDone }: { onDone: () => void }) {
  const { mutateAsync, isPending } = useMutation(createUserMutation);

  const form = useAppForm({
    defaultValues: { nrp: '', name: '', role: 'viewer', password: '' } as CreateUserValues,
    validators: { onSubmit: createUserSchema },
    onSubmit: async ({ value }) => {
      try {
        await mutateAsync(value);
        toast.success('Akun dibuat');
        form.reset();
        onDone();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal membuat akun');
      }
    }
  });

  return (
    <>
      <div className='flex-1 overflow-auto'>
        <form
          id={FORM_ID}
          className='space-y-4 p-4 md:p-4'
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField
              name='nrp'
              children={(field) => (
                <field.TextField label='NRP' required inputMode='numeric' placeholder='12345678' />
              )}
            />
            <form.AppField
              name='name'
              children={(field) => <field.TextField label='Nama lengkap' required />}
            />
            <form.AppField
              name='role'
              children={(field) => (
                <field.SelectField
                  label='Role'
                  required
                  options={ROLE_OPTIONS}
                  placeholder='Pilih role'
                />
              )}
            />
            <form.AppField
              name='password'
              children={(field) => (
                <field.TextField
                  label='Password awal'
                  required
                  type='password'
                  autoComplete='new-password'
                  description={`Minimal ${PASSWORD_MIN_LENGTH} karakter. Sampaikan ke pengguna secara aman.`}
                />
              )}
            />
          </FieldGroup>
        </form>
      </div>
      <FormFooter isPending={isPending} label='Buat akun' onCancel={onDone} />
    </>
  );
}

function EditUserForm({ user, onDone }: { user: User; onDone: () => void }) {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const isSelf = currentUser.id === user.id;
  const { mutateAsync, isPending } = useMutation(updateUserMutation);

  const form = useAppForm({
    defaultValues: { name: user.name, role: user.role, status: user.status } as UpdateUserValues,
    validators: { onSubmit: updateUserSchema },
    onSubmit: async ({ value }) => {
      try {
        await mutateAsync({ id: user.id, values: value });
        toast.success('Akun diperbarui');
        // Re-render the dashboard layout so the sidebar shows the new name
        if (isSelf) router.refresh();
        onDone();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memperbarui akun');
      }
    }
  });

  return (
    <>
      <div className='flex-1 overflow-auto'>
        <form
          id={FORM_ID}
          className='space-y-4 p-4 md:p-4'
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField
              name='name'
              children={(field) => <field.TextField label='Nama lengkap' required />}
            />
            <form.AppField
              name='role'
              children={(field) => (
                <field.SelectField
                  label='Role'
                  required
                  options={ROLE_OPTIONS}
                  placeholder='Pilih role'
                  disabled={isSelf}
                  description={isSelf ? 'Anda tidak dapat mengubah role sendiri.' : undefined}
                />
              )}
            />
            <form.AppField
              name='status'
              children={(field) => (
                <field.SelectField
                  label='Status'
                  required
                  options={STATUS_OPTIONS}
                  placeholder='Pilih status'
                  disabled={isSelf}
                />
              )}
            />
          </FieldGroup>
        </form>
      </div>
      <FormFooter isPending={isPending} label='Simpan' onCancel={onDone} />
    </>
  );
}

export function UserFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icons.add className='mr-2 h-4 w-4' /> Tambah akun
      </Button>
      <UserFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
