'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ROLE_LABELS } from '@/lib/auth/roles';
import type { User } from '../../api/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { CellAction } from './cell-action';
import { ROLE_OPTIONS, STATUS_LABELS, STATUS_OPTIONS } from './options';

// Fixed time zone so the server render and the browser agree on the text
const dateTimeFormat = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Jakarta'
});

export const columns: ColumnDef<User>[] = [
  {
    id: 'nrp',
    accessorKey: 'nrp',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='NRP' />
    ),
    cell: ({ row }) => <span className='font-mono'>{row.original.nrp}</span>
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Nama' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <span className='font-medium'>{row.original.name}</span>
        {row.original.mustChangePassword && (
          <Badge variant='outline' className='text-xs'>
            Wajib ganti password
          </Badge>
        )}
      </div>
    ),
    meta: {
      label: 'Nama',
      placeholder: 'Cari nama atau NRP...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'role',
    accessorKey: 'role',
    enableSorting: false,
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => <Badge variant='outline'>{ROLE_LABELS[row.original.role]}</Badge>,
    enableColumnFilter: true,
    meta: {
      label: 'Role',
      variant: 'multiSelect' as const,
      options: ROLE_OPTIONS
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    enableSorting: false,
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const { status, isLocked } = row.original;
      return (
        <div className='flex items-center gap-2'>
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {STATUS_LABELS[status]}
          </Badge>
          {isLocked && <Badge variant='destructive'>Terkunci</Badge>}
        </div>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      variant: 'multiSelect' as const,
      options: STATUS_OPTIONS
    }
  },
  {
    id: 'lastLoginAt',
    accessorKey: 'lastLoginAt',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Login terakhir' />
    ),
    cell: ({ row }) => {
      const { lastLoginAt } = row.original;
      return lastLoginAt ? (
        dateTimeFormat.format(new Date(lastLoginAt))
      ) : (
        <span className='text-muted-foreground'>Belum pernah</span>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
