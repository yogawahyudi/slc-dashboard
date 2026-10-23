'use client';

import { Suspense, useState, useTransition } from 'react';
import { parseAsString, useQueryStates } from 'nuqs';

import type { DivisionId } from '@/config/divisions';
import type { PlatformId } from '@/config/social-platforms';
import { cn } from '@/lib/utils';
import { toEngagementFilters, type EngagementParams } from '../lib/filters';
import { getScopePlatforms } from '../lib/org-tree';
import type { EngagementMetric } from './engagement-bar-chart';
import { EngagementCharts } from './engagement-charts';
import { EngagementFilters } from './engagement-filters';
import { EngagementChartsSkeleton } from './engagement-skeleton';

export function EngagementDashboard() {
  // Transition keeps the current charts on screen (dimmed) while the next selection loads
  const [isPending, startTransition] = useTransition();
  const [params, setParams] = useQueryStates(
    {
      unit: parseAsString,
      platform: parseAsString,
      post: parseAsString,
      division: parseAsString
    },
    // Push so the browser back button steps back up the drill-down
    { history: 'push' }
  );
  const [metric, setMetric] = useState<EngagementMetric>('total');

  const filters = toEngagementFilters(params);

  const update = (next: Partial<EngagementParams>) =>
    startTransition(() => {
      void setParams(next);
    });

  const selectUnit = (unitId: string | null) => {
    const keepPlatform =
      filters.platform !== null &&
      getScopePlatforms(unitId).some((platform) => platform.id === filters.platform);
    update({ unit: unitId, platform: keepPlatform ? filters.platform : null, post: null });
  };
  const selectPlatform = (platform: PlatformId | null) => update({ platform, post: null });
  const selectPost = (post: string | null) => update({ post });
  // Division only filters the numbers, so the rest of the selection stays
  const selectDivision = (division: DivisionId | null) => update({ division });
  const reset = () => update({ unit: null, platform: null, post: null, division: null });

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <EngagementFilters
        filters={filters}
        onSelectUnit={selectUnit}
        onSelectPlatform={selectPlatform}
        onSelectPost={selectPost}
        onSelectDivision={selectDivision}
        onReset={reset}
      />
      <div
        aria-busy={isPending}
        className={cn('transition-opacity', isPending && 'pointer-events-none opacity-60')}
      >
        <Suspense fallback={<EngagementChartsSkeleton />}>
          <EngagementCharts
            filters={filters}
            metric={metric}
            onMetricChange={setMetric}
            onSelectUnit={selectUnit}
            onSelectPlatform={selectPlatform}
            onSelectPost={selectPost}
            onSelectDivision={selectDivision}
          />
        </Suspense>
      </div>
    </div>
  );
}
