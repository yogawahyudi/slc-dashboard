import type { EngagementFilters, SlcUsersFilters } from '../api/types';
import { getScopePlatforms, getUnit, isDivisionId, isPlatformId } from './org-tree';

export type EngagementParams = {
  unit: string | null;
  platform: string | null;
  post: string | null;
  division: string | null;
};

/**
 * URL params -> filters. Unknown ids fall back to "not selected", so the server
 * prefetch and the client query always build the same key.
 */
export function toEngagementFilters(params: EngagementParams): EngagementFilters {
  const unitId = getUnit(params.unit)?.id ?? null;
  const platform =
    isPlatformId(params.platform) &&
    getScopePlatforms(unitId).some((item) => item.id === params.platform)
      ? params.platform
      : null;
  const postId = unitId && platform ? params.post : null;
  const divisionId = isDivisionId(params.division) ? params.division : null;

  return { unitId, platform, postId, divisionId };
}

export type SlcTableParams = {
  page: number;
  perPage: number;
  name: string | null;
  division: string | null;
  satuan: string | null;
  action: string | null;
  /** JSON sorting state, as stored in the URL */
  sort: string | null;
};

/** Detail SLC table URL params -> service filters; shared by the server prefetch and the client. */
export function toSlcUsersFilters(postId: string, params: SlcTableParams): SlcUsersFilters {
  return {
    postId,
    page: params.page,
    limit: params.perPage,
    ...(params.name && { search: params.name }),
    ...(params.division && { divisions: params.division }),
    ...(params.satuan && { units: params.satuan }),
    ...(params.action && { actions: params.action }),
    ...(params.sort && { sort: params.sort })
  };
}
