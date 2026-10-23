import type { DivisionId } from '@/config/divisions';
import type { EngagementPost, SlcAction } from '../api/types';

/** Detail SLC page of a post, optionally pre-filtered to a division and an action. */
export function slcDetailHref(
  postId: string,
  filters: { division?: DivisionId | null; action?: SlcAction } = {}
) {
  const params = new URLSearchParams();
  if (filters.division) params.set('division', filters.division);
  if (filters.action) params.set('action', filters.action);
  const query = params.toString();
  return `/dashboard/engagement/slc/${encodeURIComponent(postId)}${query ? `?${query}` : ''}`;
}

/** Back to the engagement page with this post selected. */
export function engagementPostHref(post: EngagementPost) {
  const params = new URLSearchParams({ unit: post.unitId, platform: post.platform, post: post.id });
  return `/dashboard/engagement?${params}`;
}
