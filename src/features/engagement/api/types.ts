import type { DivisionId } from '@/config/divisions';
import type { PlatformId } from '@/config/social-platforms';

export type EngagementMetrics = {
  likes: number;
  comments: number;
  shares: number;
};

/** Selection on the page; null = not selected yet. Build it with `toEngagementFilters`. */
export type EngagementFilters = {
  unitId: string | null;
  platform: PlatformId | null;
  postId: string | null;
  /** Counts only the engagement from this division */
  divisionId: DivisionId | null;
};

export type EngagementPostsFilters = {
  unitId: string;
  platform: PlatformId;
};

export type EngagementTotals = EngagementMetrics & {
  posts: number;
};

/** One bar in a breakdown chart (a unit, a platform, a division, or a post). */
export type EngagementRow = EngagementTotals & {
  id: string;
  label: string;
};

export type EngagementPost = EngagementMetrics & {
  id: string;
  unitId: string;
  unitName: string;
  platform: PlatformId;
  caption: string;
  postedAt: string;
};

export type EngagementSummary = {
  /** Selected unit plus everything below it, filtered by platform and division when chosen. */
  totals: EngagementTotals;
  /**
   * Per division: for the selected post (only the chosen division when filtered), or
   * across the scope while no post and no division is chosen; otherwise null.
   */
  byDivision: EngagementRow[] | null;
  /** Per child unit of the selection (or per top-level unit); null when there are no children. */
  byUnit: EngagementRow[] | null;
  /** Per platform; null once a platform is chosen. */
  byPlatform: EngagementRow[] | null;
  /** Top posts of the selected unit's own account; only when unit + platform are chosen. */
  byPost: EngagementRow[] | null;
  /** The selected post; null when none (or the id does not match the unit/platform). */
  post: EngagementPost | null;
};

export type EngagementPostsResponse = {
  posts: EngagementPost[];
};

/** SLC = share, like, comment by personnel */
export type SlcAction = 'likes' | 'comments' | 'shares';

/** One person who did SLC on a post. */
export type SlcUser = {
  id: string;
  name: string;
  nrp: string;
  rank: string;
  divisionId: DivisionId;
  divisionLabel: string;
  unitId: string;
  unitName: string;
  account: string;
  liked: boolean;
  commented: boolean;
  shared: boolean;
  /** First SLC action on the post */
  actedAt: string;
};

export type SlcUsersFilters = {
  postId: string;
  page: number;
  limit: number;
  search?: string;
  /** Comma-separated ids */
  divisions?: string;
  units?: string;
  actions?: string;
  /** JSON sorting state from the data table */
  sort?: string;
};

export type SlcUsersResponse = {
  users: SlcUser[];
  total: number;
  /** Over all rows matching the filters, not just this page */
  counts: EngagementMetrics & { people: number };
};
