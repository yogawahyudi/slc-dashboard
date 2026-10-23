'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { useCurrentUser } from '@/components/layout/current-user-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { unlockUserMutation, updateUserMutation } from '../../api/mutations';
import type { User } from '../../api/types';
import { Icons } from '@/components/icons';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ResetPasswordDialog } from '../reset-password-dialog';
import { UserFormSheet } from '../user-form-sheet';

interface CellActionProps {
  data: User;
}

export function CellAction({ data }: CellActionProps) {
  const currentUser = useCurrentUser();
  const isSelf = currentUser.id === data.id;
  const isActive = data.status === 'active';

  const [statusOpen, setStatusOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const statusMutation = useMutation(updateUserMutation);
  const unlockMutation = useMutation(unlockUserMutation);

  const unlock = () =>
    unlockMutation.mutate(data.id, {
      onSuccess: () => toast.success(`Kunci login ${data.name} dibuka`),
      onError: (error) => toast.error(error.message)
    });

  const toggleStatus = () =>
    statusMutation.mutate(
      {
        id: data.id,
        values: { name: data.name, role: data.role, status: isActive ? 'inactive' : 'active' }
      },
      {
        onSuccess: () => {
          toast.success(isActive ? 'Akun dinonaktifkan' : 'Akun diaktifkan');
          setStatusOpen(false);
        },
        onError: (error) => toast.error(error.message)
      }
    );

  return (
    <>
      <AlertModal
        isOpen={statusOpen}
        onClose={() => setStatusOpen(false)}
        onConfirm={toggleStatus}
        loading={statusMutation.isPending}
        title={isActive ? `Nonaktifkan ${data.name}?` : `Aktifkan ${data.name}?`}
        description={
          isActive
            ? 'Pengguna akan langsung keluar dari semua perangkat dan tidak bisa login.'
            : 'Pengguna dapat login kembali dengan password yang sama.'
        }
        confirmLabel={isActive ? 'Nonaktifkan' : 'Aktifkan'}
      />
      <UserFormSheet user={data} open={editOpen} onOpenChange={setEditOpen} />
      <ResetPasswordDialog user={data} open={resetOpen} onOpenChange={setResetOpen} />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0' />}>
          <span className='sr-only'>Buka menu</span>
          <Icons.ellipsis className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Icons.edit className='mr-2 h-4 w-4' /> Ubah
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isSelf} onClick={() => setResetOpen(true)}>
              <Icons.lock className='mr-2 h-4 w-4' /> Reset password
            </DropdownMenuItem>
            {data.isLocked && (
              <DropdownMenuItem disabled={unlockMutation.isPending} onClick={unlock}>
                <Icons.check className='mr-2 h-4 w-4' /> Buka kunci
              </DropdownMenuItem>
            )}
            <DropdownMenuItem disabled={isSelf} onClick={() => setStatusOpen(true)}>
              {isActive ? (
                <>
                  <Icons.circleX className='mr-2 h-4 w-4' /> Nonaktifkan
                </>
              ) : (
                <>
                  <Icons.circleCheck className='mr-2 h-4 w-4' /> Aktifkan
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
