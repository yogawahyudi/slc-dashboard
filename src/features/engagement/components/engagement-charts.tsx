'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSuspenseQuery } from '@tanstack/react-query';

import { Icons } from '@/components/icons';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { DivisionId } from '@/config/divisions';
import type { PlatformId } from '@/config/social-platforms';
import { cn } from '@/lib/utils';
import { engagementSummaryOptions } from '../api/queries';
import type {
  EngagementFilters,
  EngagementPost,
  EngagementRow,
  EngagementTotals
} from '../api/types';
import { formatNumber, formatShortDate } from '../lib/format';
import { slcDetailHref } from '../lib/routes';
import { getLevelLabel, getUnit, getUnitDepth, isDivisionId, isPlatformId } from '../lib/org-tree';
import {
  getMetricValue,
  GroupedBarChart,
  HorizontalBarChart,
  metricLabels,
  type EngagementMetric
} from './engagement-bar-chart';

export type StatItem = {
  label: string;
  value: number;
  icon: keyof typeof Icons;
};

export function StatCards({ items }: { items: StatItem[] }) {
  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
      {items.map((item) => {
        const Icon = Icons[item.icon];
        return (
          <Card key={item.label} className='@container/card'>
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className='text-2xl font-semibold @[250px]/card:text-3xl'>
                {formatNumber(item.value)}
              </CardTitle>
              <CardAction>
                <Icon className='text-muted-foreground size-5' />
              </CardAction>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}

function BreakdownCard({
  title,
  description,
  rows,
  metric,
  onSelect,
  className
}: {
  title: string;
  description: string;
  rows: EngagementRow[];
  metric: EngagementMetric;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  const rowById = new Map(rows.map((row) => [row.id, row]));
  const data = rows
    .map((row) => ({ id: row.id, label: row.label, value: getMetricValue(row, metric) }))
    .toSorted((a, b) => b.value - a.value);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <HorizontalBarChart
          data={data}
          valueLabel={metricLabels[metric]}
          onSelect={onSelect}
          details={(id) => {
            const row = rowById.get(id)!;
            return [
              { label: 'Like', value: row.likes, active: metric === 'likes' },
              { label: 'Komentar', value: row.comments, active: metric === 'comments' },
              { label: 'Share', value: row.shares, active: metric === 'shares' },
              { label: 'Postingan', value: row.posts }
            ];
          }}
        />
      </CardContent>
    </Card>
  );
}

/** Selected post: the totals, then like/komentar/share per division. */
function PostByDivision({
  post,
  totals,
  rows,
  divisionId
}: {
  post: EngagementPost;
  totals: EngagementTotals;
  rows: EngagementRow[];
  divisionId: DivisionId | null;
}) {
  const router = useRouter();

  return (
    <div className='flex flex-col gap-4'>
      <StatCards
        items={[
          { label: 'Like', value: totals.likes, icon: 'heart' },
          { label: 'Komentar', value: totals.comments, icon: 'chat' },
          { label: 'Share', value: totals.shares, icon: 'share' },
          {
            label: 'Total engagement',
            value: totals.likes + totals.comments + totals.shares,
            icon: 'trendingUp'
          }
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>Like, komentar, dan share per divisi</CardTitle>
          {/* min-w-0: a nowrap grid item would otherwise widen the card on phones */}
          <CardDescription className='min-w-0 truncate'>
            {formatShortDate(post.postedAt)} · {post.caption}
          </CardDescription>
          <CardAction>
            <Link
              href={slcDetailHref(post.id, { division: divisionId })}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <Icons.teams />
              Lihat semua personel SLC
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className='flex flex-col gap-2'>
          <p className='text-muted-foreground text-xs'>
            Klik batang untuk melihat personel yang melakukan aksi itu.
          </p>
          <GroupedBarChart
            rows={rows}
            onSelect={(division, action) =>
              isDivisionId(division) && router.push(slcDetailHref(post.id, { division, action }))
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function EngagementCharts({
  filters,
  metric,
  onMetricChange,
  onSelectUnit,
  onSelectPlatform,
  onSelectPost,
  onSelectDivision
}: {
  filters: EngagementFilters;
  metric: EngagementMetric;
  onMetricChange: (metric: EngagementMetric) => void;
  onSelectUnit: (unitId: string) => void;
  onSelectPlatform: (platform: PlatformId) => void;
  onSelectPost: (postId: string) => void;
  onSelectDivision: (divisionId: DivisionId) => void;
}) {
  const { data } = useSuspenseQuery(engagementSummaryOptions(filters));

  if (data.post) {
    return (
      <PostByDivision
        post={data.post}
        totals={data.totals}
        rows={data.byDivision ?? []}
        divisionId={filters.divisionId}
      />
    );
  }

  if (data.totals.posts === 0) {
    return (
      <Empty className='border'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <Icons.chartBar />
          </EmptyMedia>
          <EmptyTitle>Belum ada postingan</EmptyTitle>
          <EmptyDescription>
            Tidak ada postingan untuk cakupan ini. Coba pilih satuan atau media sosial lain.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const unitName = getUnit(filters.unitId)?.name;
  const childLevel = getLevelLabel(filters.unitId ? getUnitDepth(filters.unitId) + 1 : 0);
  const breakdowns = [
    {
      key: 'unit',
      title: `Per ${childLevel}`,
      description: 'Termasuk satuan di bawahnya. Klik batang untuk membuka satuan itu.',
      rows: data.byUnit,
      minRows: 2,
      onSelect: onSelectUnit
    },
    {
      key: 'platform',
      title: 'Per media sosial',
      description: 'Klik batang untuk memilih media sosial itu.',
      rows: data.byPlatform,
      minRows: 2,
      onSelect: (id: string) => isPlatformId(id) && onSelectPlatform(id)
    },
    {
      key: 'division',
      title: 'Per divisi',
      description: 'Klik batang untuk memfilter divisi itu.',
      rows: data.byDivision,
      minRows: 2,
      onSelect: (id: string) => isDivisionId(id) && onSelectDivision(id)
    },
    {
      key: 'post',
      title: 'Postingan teratas',
      description: `Engagement tertinggi dari akun ${unitName}. Klik batang untuk melihat rincian per divisi.`,
      rows: data.byPost,
      minRows: 1,
      onSelect: onSelectPost
    }
  ].filter(
    (breakdown): breakdown is typeof breakdown & { rows: EngagementRow[] } =>
      !!breakdown.rows && breakdown.rows.length >= breakdown.minRows
  );

  // Post labels are long, so that card is full width. The others sit two per row; an
  // odd one out at the end also goes full width instead of leaving a gap.
  const halfWidthKeys = breakdowns
    .filter((breakdown) => breakdown.key !== 'post')
    .map((breakdown) => breakdown.key);
  const isFullWidth = (key: string) =>
    key === 'post' || (halfWidthKeys.length % 2 === 1 && key === halfWidthKeys.at(-1));

  return (
    <div className='flex flex-col gap-4'>
      <StatCards
        items={[
          { label: 'Total like', value: data.totals.likes, icon: 'heart' },
          { label: 'Total komentar', value: data.totals.comments, icon: 'chat' },
          { label: 'Total share', value: data.totals.shares, icon: 'share' },
          { label: 'Jumlah postingan', value: data.totals.posts, icon: 'post' }
        ]}
      />
      {breakdowns.length > 0 && (
        <>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <h3 className='text-lg font-semibold tracking-tight'>Rincian</h3>
            <ToggleGroup
              variant='outline'
              size='sm'
              spacing={0}
              aria-label='Metrik'
              value={[metric]}
              onValueChange={(value) => {
                if (value[0]) onMetricChange(value[0] as EngagementMetric);
              }}
            >
              {(Object.keys(metricLabels) as EngagementMetric[]).map((key) => (
                <ToggleGroupItem key={key} value={key}>
                  {metricLabels[key]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            {breakdowns.map((breakdown) => (
              <BreakdownCard
                key={breakdown.key}
                title={breakdown.title}
                description={breakdown.description}
                rows={breakdown.rows}
                metric={metric}
                onSelect={breakdown.onSelect}
                className={cn(isFullWidth(breakdown.key) && 'lg:col-span-2')}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
