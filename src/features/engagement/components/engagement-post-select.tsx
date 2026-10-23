'use client';

import { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';

import type { PlatformId } from '@/config/social-platforms';
import { engagementPostsOptions } from '../api/queries';
import type { EngagementFilters } from '../api/types';
import { formatShortDate } from '../lib/format';
import { FilterSelect } from './filter-select';

const POST_SELECT_CLASS = 'min-w-64 flex-[2]';

function PlaceholderSelect({ label }: { label: string }) {
  return (
    <FilterSelect
      id='post'
      label='Postingan'
      value={null}
      options={[{ value: null, label }]}
      onValueChange={() => {}}
      disabled
      className={POST_SELECT_CLASS}
    />
  );
}

export function EngagementPostSelect({
  filters,
  onSelectPost
}: {
  filters: EngagementFilters;
  onSelectPost: (postId: string | null) => void;
}) {
  const { unitId, platform } = filters;

  if (!unitId || !platform) {
    return <PlaceholderSelect label='Pilih satuan & media sosial dulu' />;
  }

  return (
    <Suspense fallback={<PlaceholderSelect label='Memuat postingan…' />}>
      <PostOptions
        unitId={unitId}
        platform={platform}
        value={filters.postId}
        onSelectPost={onSelectPost}
      />
    </Suspense>
  );
}

function PostOptions({
  unitId,
  platform,
  value,
  onSelectPost
}: {
  unitId: string;
  platform: PlatformId;
  value: string | null;
  onSelectPost: (postId: string | null) => void;
}) {
  const { data } = useSuspenseQuery(engagementPostsOptions({ unitId, platform }));

  if (data.posts.length === 0) {
    return <PlaceholderSelect label='Akun ini belum punya postingan' />;
  }

  return (
    <FilterSelect
      id='post'
      label='Postingan'
      value={data.posts.some((post) => post.id === value) ? value : null}
      options={[
        { value: null, label: 'Semua postingan' },
        ...data.posts.map((post) => ({
          value: post.id,
          label: `${formatShortDate(post.postedAt)} · ${post.caption}`
        }))
      ]}
      onValueChange={onSelectPost}
      className={POST_SELECT_CLASS}
    />
  );
}
