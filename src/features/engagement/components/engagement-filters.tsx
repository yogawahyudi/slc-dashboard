'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { divisions, type DivisionId } from '@/config/divisions';
import type { OrgUnit } from '@/config/org-structure';
import type { PlatformId } from '@/config/social-platforms';
import type { EngagementFilters as Filters } from '../api/types';
import {
  getChildren,
  getDivision,
  getLevelLabel,
  getPath,
  getPlatform,
  getScopePlatforms,
  isDivisionId,
  isPlatformId
} from '../lib/org-tree';
import { EngagementPostSelect } from './engagement-post-select';
import { FilterSelect } from './filter-select';

type LevelSelect = {
  depth: number;
  parentId: string | null;
  options: OrgUnit[];
  value: string | null;
};

/** One dropdown per level, down to the first unselected level or a unit without children. */
function getLevelSelects(path: OrgUnit[]): LevelSelect[] {
  const levels: LevelSelect[] = [];
  for (let depth = 0; depth <= path.length; depth++) {
    const parentId = depth === 0 ? null : path[depth - 1].id;
    const options = getChildren(parentId);
    if (options.length === 0) break;
    levels.push({ depth, parentId, options, value: path[depth]?.id ?? null });
  }
  return levels;
}

export function EngagementFilters({
  filters,
  onSelectUnit,
  onSelectPlatform,
  onSelectPost,
  onSelectDivision,
  onReset
}: {
  filters: Filters;
  onSelectUnit: (unitId: string | null) => void;
  onSelectPlatform: (platform: PlatformId | null) => void;
  onSelectPost: (postId: string | null) => void;
  onSelectDivision: (divisionId: DivisionId | null) => void;
  onReset: () => void;
}) {
  const path = getPath(filters.unitId);
  const trail = [
    ...(path.length ? path.map((unit) => unit.name) : ['Semua satuan']),
    ...(filters.divisionId ? [getDivision(filters.divisionId).label] : []),
    filters.platform ? getPlatform(filters.platform).label : 'Semua media sosial'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cakupan data</CardTitle>
        <CardDescription>{trail.join(' › ')}</CardDescription>
        {(filters.unitId || filters.platform || filters.divisionId) && (
          <CardAction>
            <Button variant='ghost' size='sm' onClick={onReset}>
              <Icons.close />
              Reset
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        {/* Structure: one dropdown per level, then the division */}
        <div className='flex flex-wrap gap-3'>
          {getLevelSelects(path).map((level) => {
            const levelLabel = getLevelLabel(level.depth);
            return (
              <FilterSelect
                key={level.depth}
                id={`engagement-level-${level.depth}`}
                label={levelLabel}
                value={level.value}
                options={[
                  { value: null, label: `Semua ${levelLabel}` },
                  ...level.options.map((unit) => ({ value: unit.id, label: unit.name }))
                ]}
                // "Semua" goes back up to the parent level
                onValueChange={(unitId) => onSelectUnit(unitId ?? level.parentId)}
              />
            );
          })}
          <FilterSelect
            id='engagement-division'
            label='Divisi'
            value={filters.divisionId}
            options={[
              { value: null, label: 'Semua divisi' },
              ...divisions.map((division) => ({ value: division.id, label: division.label }))
            ]}
            onValueChange={(divisionId) =>
              onSelectDivision(isDivisionId(divisionId) ? divisionId : null)
            }
          />
        </div>
        {/* Content: social media and post side by side */}
        <div className='flex flex-wrap gap-3 border-t pt-4'>
          <FilterSelect
            id='engagement-platform'
            label='Media sosial'
            value={filters.platform}
            options={[
              { value: null, label: 'Semua media sosial' },
              ...getScopePlatforms(filters.unitId).map((platform) => ({
                value: platform.id,
                label: platform.label,
                icon: platform.icon
              }))
            ]}
            onValueChange={(platform) => onSelectPlatform(isPlatformId(platform) ? platform : null)}
          />
          <EngagementPostSelect filters={filters} onSelectPost={onSelectPost} />
        </div>
      </CardContent>
    </Card>
  );
}
