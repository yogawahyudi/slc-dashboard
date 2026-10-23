'use client';

import { useMemo } from 'react';
import { useCurrentUser } from '@/components/layout/current-user-provider';
import { hasRole, type Role } from '@/lib/auth/roles';
import type { NavGroup, NavItem } from '@/types';

// Hides menu entries the user's role can't open. This is UX only — pages and
// Server Actions enforce access themselves via requireRole() / authorize().
function filterItems(items: NavItem[], role: Role): NavItem[] {
  return items.flatMap((item) => {
    if (item.access?.roles && !hasRole(role, item.access.roles)) return [];
    if (!item.items?.length) return [item];

    const children = filterItems(item.items, role);
    // Drop pure group headers whose children were all hidden
    if (children.length === 0 && item.url === '#') return [];
    return [{ ...item, items: children }];
  });
}

export function useFilteredNavItems(items: NavItem[]) {
  const { role } = useCurrentUser();
  return useMemo(() => filterItems(items, role), [items, role]);
}

export function useFilteredNavGroups(groups: NavGroup[]) {
  const { role } = useCurrentUser();
  return useMemo(
    () =>
      groups
        .map((group) => ({ ...group, items: filterItems(group.items, role) }))
        .filter((group) => group.items.length > 0),
    [groups, role]
  );
}
