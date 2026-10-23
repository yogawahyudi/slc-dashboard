'use client';

import { useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { getSortingStateParser } from '@/lib/parsers';
import type { Option } from '@/types/data-table';
import { slcUsersOptions } from '../../api/queries';
import { toSlcUsersFilters } from '../../lib/filters';
import { StatCards } from '../engagement-charts';
import { getSlcColumns, SLC_COLUMN_IDS } from './columns';

const listParser = parseAsArrayOf(parseAsString, ',');

export function SlcTable({ postId, unitOptions }: { postId: string; unitOptions: Option[] }) {
  const columns = useMemo(() => getSlcColumns(unitOptions), [unitOptions]);
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    // Same parser as useDataTable uses for multiSelect filters: nuqs shares the parsed
    // value between hooks on one key, so a string parser here would receive an array
    division: listParser,
    satuan: listParser,
    action: listParser,
    sort: getSortingStateParser(SLC_COLUMN_IDS).withDefault([])
  });

  const filters = toSlcUsersFilters(postId, {
    page: params.page,
    perPage: params.perPage,
    name: params.name,
    division: params.division?.join(',') || null,
    satuan: params.satuan?.join(',') || null,
    action: params.action?.join(',') || null,
    sort: params.sort.length > 0 ? JSON.stringify(params.sort) : null
  });

  const { data } = useSuspenseQuery(slcUsersOptions(filters));

  const { table } = useDataTable({
    data: data.users,
    columns,
    pageCount: Math.ceil(data.total / params.perPage),
    shallow: true,
    debounceMs: 500
  });

  return (
    <div className='flex flex-1 flex-col gap-4'>
      {/* Counts cover every row matching the filters, not just this page */}
      <StatCards
        items={[
          { label: 'Personel', value: data.counts.people, icon: 'teams' },
          { label: 'Like', value: data.counts.likes, icon: 'heart' },
          { label: 'Komentar', value: data.counts.comments, icon: 'chat' },
          { label: 'Share', value: data.counts.shares, icon: 'share' }
        ]}
      />
      {/* DataTable fills the remaining height (its rows sit in an absolute scroll area);
          the cards above can leave little room, so keep a usable minimum */}
      <div className='flex min-h-[32rem] flex-1 flex-col'>
        <DataTable table={table}>
          <DataTableToolbar table={table} />
        </DataTable>
      </div>
    </div>
  );
}
