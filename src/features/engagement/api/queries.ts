import { queryOptions } from '@tanstack/react-query';
import {
  getEngagementPost,
  getEngagementPosts,
  getEngagementSummary,
  getSlcUsers
} from './service';
import type { EngagementFilters, EngagementPostsFilters, SlcUsersFilters } from './types';

export const engagementKeys = {
  all: ['engagement'] as const,
  summary: (filters: EngagementFilters) => [...engagementKeys.all, 'summary', filters] as const,
  posts: (filters: EngagementPostsFilters) => [...engagementKeys.all, 'posts', filters] as const,
  post: (postId: string) => [...engagementKeys.all, 'post', postId] as const,
  slc: (filters: SlcUsersFilters) => [...engagementKeys.all, 'slc', filters] as const
};

export const engagementSummaryOptions = (filters: EngagementFilters) =>
  queryOptions({
    queryKey: engagementKeys.summary(filters),
    queryFn: () => getEngagementSummary(filters)
  });

export const engagementPostsOptions = (filters: EngagementPostsFilters) =>
  queryOptions({
    queryKey: engagementKeys.posts(filters),
    queryFn: () => getEngagementPosts(filters)
  });

export const engagementPostOptions = (postId: string) =>
  queryOptions({
    queryKey: engagementKeys.post(postId),
    queryFn: () => getEngagementPost(postId)
  });

export const slcUsersOptions = (filters: SlcUsersFilters) =>
  queryOptions({
    queryKey: engagementKeys.slc(filters),
    queryFn: () => getSlcUsers(filters)
  });
