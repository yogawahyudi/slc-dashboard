'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSuspenseQuery } from '@tanstack/react-query';

import { Icons } from '@/components/icons';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { engagementPostOptions } from '../api/queries';
import { formatDateTime } from '../lib/format';
import { getDescendantIds, getPlatform, getUnit } from '../lib/org-tree';
import { engagementPostHref } from '../lib/routes';
import { SlcTable } from './slc-table';

export function SlcDetail({ postId }: { postId: string }) {
  const { data: post } = useSuspenseQuery(engagementPostOptions(postId));

  // Personnel come from the post's unit and the units below it
  const unitId = post?.unitId ?? null;
  const unitOptions = useMemo(
    () =>
      unitId ? getDescendantIds(unitId).map((id) => ({ value: id, label: getUnit(id)!.name })) : [],
    [unitId]
  );

  if (!post) {
    return (
      <Empty className='border'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <Icons.post />
          </EmptyMedia>
          <EmptyTitle>Postingan tidak ditemukan</EmptyTitle>
          <EmptyDescription>Postingan ini tidak ada atau sudah tidak tersedia.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link
            href='/dashboard/engagement'
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <Icons.chevronLeft />
            Kembali ke Engagement Medsos
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  const platform = getPlatform(post.platform);
  const PlatformIcon = Icons[platform.icon];

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <PlatformIcon className='text-muted-foreground size-4 shrink-0' />
            {post.unitName} · {platform.label}
          </CardTitle>
          <CardDescription>
            {formatDateTime(post.postedAt)} WIB · {post.caption}
          </CardDescription>
          <CardAction>
            <Link
              href={engagementPostHref(post)}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <Icons.chevronLeft />
              Kembali ke grafik
            </Link>
          </CardAction>
        </CardHeader>
      </Card>
      <Suspense fallback={<DataTableSkeleton columnCount={8} rowCount={10} filterCount={4} />}>
        <SlcTable postId={post.id} unitOptions={unitOptions} />
      </Suspense>
    </div>
  );
}
