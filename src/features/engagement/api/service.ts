// ============================================================
// Engagement Service — Data Access Layer
// ============================================================
// This is the ONLY file you modify when connecting to real social media data.
// Queries (queries.ts) and components import from here — they never change.
//
// To use a real source, replace the function bodies below, e.g.:
// - Server Actions + Drizzle: add 'use server', call `authorize()` from
//   @/lib/auth/dal, then aggregate from your posts table
// - Route Handlers / external API: `apiClient<EngagementSummary>('/engagement?...')`
//
// The org structure itself stays in src/config/org-structure.ts.
//
// Current: Mock (deterministic fake data, see src/constants/mock-engagement.ts)
// ============================================================

import { fakeEngagement } from '@/constants/mock-engagement';
import type {
  EngagementFilters,
  EngagementPost,
  EngagementPostsFilters,
  EngagementPostsResponse,
  EngagementSummary,
  SlcUsersFilters,
  SlcUsersResponse
} from './types';

export async function getEngagementSummary(filters: EngagementFilters): Promise<EngagementSummary> {
  return fakeEngagement.getSummary(filters);
}

export async function getEngagementPosts(
  filters: EngagementPostsFilters
): Promise<EngagementPostsResponse> {
  return fakeEngagement.getPosts(filters);
}

export async function getEngagementPost(postId: string): Promise<EngagementPost | null> {
  return fakeEngagement.getPost(postId);
}

/** Personnel who did SLC (like, comment, share) on one post. */
export async function getSlcUsers(filters: SlcUsersFilters): Promise<SlcUsersResponse> {
  return fakeEngagement.getSlcUsers(filters);
}
