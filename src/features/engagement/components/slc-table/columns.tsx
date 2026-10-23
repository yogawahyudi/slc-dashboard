'use client';

import type { Column, ColumnDef } from '@tanstack/react-table';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { divisions } from '@/config/divisions';
import type { Option } from '@/types/data-table';
import type { SlcUser } from '../../api/types';
import { formatDateTime } from '../../lib/format';

export const SLC_ACTION_OPTIONS: Option[] = [
  { value: 'likes', label: 'Like', icon: Icons.heart },
  { value: 'comments', label: 'Komentar', icon: Icons.chat },
  { value: 'shares', label: 'Share', icon: Icons.share }
];

const DIVISION_OPTIONS: Option[] = divisions.map((division) => ({
  value: division.id,
  label: division.label
}));

// Column ids double as URL keys for filters and as sort ids (whitelisted by the service)
export const SLC_COLUMN_IDS = [
  'name',
  'nrp',
  'rank',
  'division',
  'satuan',
  'account',
  'action',
  'actedAt'
];

function header(title: string) {
  return function SlcColumnHeader({ column }: { column: Column<SlcUser, unknown> }) {
    return <DataTableColumnHeader column={column} title={title} />;
  };
}

/** `unitOptions`: the post's unit and the units below it, for the Satuan filter. */
export function getSlcColumns(unitOptions: Option[]): ColumnDef<SlcUser>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: header('Nama'),
      cell: ({ row }) => <span className='font-medium'>{row.original.name}</span>,
      meta: {
        label: 'Nama',
        placeholder: 'Cari nama, NRP, atau akun…',
        variant: 'text',
        icon: Icons.search
      },
      enableColumnFilter: true
    },
    {
      id: 'nrp',
      accessorKey: 'nrp',
      header: header('NRP'),
      cell: ({ row }) => <span className='font-mono text-xs'>{row.original.nrp}</span>
    },
    {
      id: 'rank',
      accessorKey: 'rank',
      header: header('Pangkat')
    },
    {
      id: 'division',
      accessorKey: 'divisionLabel',
      header: header('Divisi'),
      meta: { label: 'Divisi', variant: 'multiSelect', options: DIVISION_OPTIONS },
      enableColumnFilter: true
    },
    {
      id: 'satuan',
      accessorKey: 'unitName',
      header: header('Satuan'),
      meta: { label: 'Satuan', variant: 'multiSelect', options: unitOptions },
      enableColumnFilter: true
    },
    {
      id: 'account',
      accessorKey: 'account',
      header: 'Akun',
      cell: ({ row }) => <span className='text-muted-foreground'>{row.original.account}</span>,
      enableSorting: false
    },
    {
      id: 'action',
      // An accessor makes the column filterable (the service does the actual filtering)
      accessorFn: (row) =>
        [row.liked && 'likes', row.commented && 'comments', row.shared && 'shares'].filter(Boolean),
      header: 'SLC',
      cell: ({ row }) => (
        <div className='flex flex-wrap gap-1'>
          {row.original.liked && (
            <Badge variant='outline'>
              <Icons.heart />
              Like
            </Badge>
          )}
          {row.original.commented && (
            <Badge variant='outline'>
              <Icons.chat />
              Komentar
            </Badge>
          )}
          {row.original.shared && (
            <Badge variant='outline'>
              <Icons.share />
              Share
            </Badge>
          )}
        </div>
      ),
      enableSorting: false,
      meta: { label: 'Aksi SLC', variant: 'multiSelect', options: SLC_ACTION_OPTIONS },
      enableColumnFilter: true
    },
    {
      id: 'actedAt',
      accessorKey: 'actedAt',
      header: header('Waktu SLC'),
      cell: ({ row }) => (
        <span className='whitespace-nowrap'>{formatDateTime(row.original.actedAt)} WIB</span>
      )
    }
  ];
}
