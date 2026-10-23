import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { engagementPostOptions, slcUsersOptions } from '../api/queries';
import { toSlcUsersFilters } from '../lib/filters';
import { SlcDetail } from './slc-detail';

export default function SlcListingPage({ postId }: { postId: string }) {
  const filters = toSlcUsersFilters(postId, {
    page: searchParamsCache.get('page'),
    perPage: searchParamsCache.get('perPage'),
    name: searchParamsCache.get('name'),
    division: searchParamsCache.get('division'),
    satuan: searchParamsCache.get('satuan'),
    action: searchParamsCache.get('action'),
    sort: searchParamsCache.get('sort')
  });

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(engagementPostOptions(postId));
  void queryClient.prefetchQuery(slcUsersOptions(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SlcDetail postId={postId} />
    </HydrationBoundary>
  );
}
