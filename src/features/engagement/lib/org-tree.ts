import { divisions, type Division, type DivisionId } from '@/config/divisions';
import { orgLevels, orgStructure, type OrgUnit } from '@/config/org-structure';
import { socialPlatforms, type PlatformId, type SocialPlatform } from '@/config/social-platforms';

// Read-only helpers over src/config/org-structure.ts (plus the platform and division
// lists), shared by the UI and the mock data.

type IndexedUnit = {
  unit: OrgUnit;
  parentId: string | null;
  depth: number;
};

function buildIndex(units: OrgUnit[]) {
  const index = new Map<string, IndexedUnit>();

  const visit = (list: OrgUnit[], parentId: string | null, depth: number) => {
    for (const unit of list) {
      if (index.has(unit.id)) {
        throw new Error(
          `[org-structure] id satuan "${unit.id}" dipakai lebih dari sekali. ` +
            'Setiap id di src/config/org-structure.ts harus unik.'
        );
      }
      index.set(unit.id, { unit, parentId, depth });
      visit(unit.children ?? [], unit.id, depth + 1);
    }
  };

  visit(units, null, 0);
  return index;
}

const unitIndex = buildIndex(orgStructure);

export function getUnit(id: string | null | undefined): OrgUnit | null {
  return id ? (unitIndex.get(id)?.unit ?? null) : null;
}

export function getUnitDepth(id: string): number {
  return unitIndex.get(id)?.depth ?? 0;
}

/** Children of a unit; `null` gives the top-level units. */
export function getChildren(id: string | null): OrgUnit[] {
  if (id === null) return orgStructure;
  return getUnit(id)?.children ?? [];
}

/** Units from the top level down to `id` (inclusive); empty for an unknown id. */
export function getPath(id: string | null): OrgUnit[] {
  const path: OrgUnit[] = [];
  let current = id ? unitIndex.get(id) : undefined;
  while (current) {
    path.unshift(current.unit);
    current = current.parentId ? unitIndex.get(current.parentId) : undefined;
  }
  return path;
}

/** `id` and every unit below it; `null` gives every unit in the structure. */
export function getDescendantIds(id: string | null): string[] {
  const roots = id === null ? orgStructure : [getUnit(id)].filter((u) => u !== null);
  const ids: string[] = [];
  const visit = (list: OrgUnit[]) => {
    for (const unit of list) {
      ids.push(unit.id);
      visit(unit.children ?? []);
    }
  };
  visit(roots);
  return ids;
}

export function getAllUnits(): OrgUnit[] {
  return Array.from(unitIndex.values(), (entry) => entry.unit);
}

export function getLevelLabel(depth: number): string {
  return orgLevels[depth] ?? `Level ${depth + 1}`;
}

export function isPlatformId(value: string | null | undefined): value is PlatformId {
  return socialPlatforms.some((platform) => platform.id === value);
}

export function getPlatform(id: PlatformId): SocialPlatform {
  return socialPlatforms.find((platform) => platform.id === id)!;
}

/** Platforms the unit's own account is on. */
export function getUnitPlatforms(id: string): SocialPlatform[] {
  const own = getUnit(id)?.platforms;
  return own
    ? socialPlatforms.filter((platform) => own.includes(platform.id))
    : [...socialPlatforms];
}

/** Platforms used anywhere in the scope (the unit or below it); `null` = whole structure. */
export function getScopePlatforms(id: string | null): SocialPlatform[] {
  const used = new Set<PlatformId>();
  for (const unitId of getDescendantIds(id)) {
    for (const platform of getUnitPlatforms(unitId)) used.add(platform.id);
  }
  return socialPlatforms.filter((platform) => used.has(platform.id));
}

export function isDivisionId(value: string | null | undefined): value is DivisionId {
  return divisions.some((division) => division.id === value);
}

export function getDivision(id: DivisionId): Division {
  return divisions.find((division) => division.id === id)!;
}
