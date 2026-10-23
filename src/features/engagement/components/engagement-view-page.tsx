import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { engagementPostsOptions, engagementSummaryOptions } from '../api/queries';
import { toEngagementFilters } from '../lib/filters';
import { EngagementDashboard } from './engagement-dashboard';

export default function EngagementViewPage() {
  const filters = toEngagementFilters({
    unit: searchParamsCache.get('unit'),
    platform: searchParamsCache.get('platform'),
    post: searchParamsCache.get('post'),
    division: searchParamsCache.get('division')
  });

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(engagementSummaryOptions(filters));
  if (filters.unitId && filters.platform) {
    void queryClient.prefetchQuery(
      engagementPostsOptions({ unitId: filters.unitId, platform: filters.platform })
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EngagementDashboard />
    </HydrationBoundary>
  );
}
