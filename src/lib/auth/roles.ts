// Shared by server and client code — keep this file free of server-only imports.

export const ROLES = ['admin', 'operator', 'viewer'] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  operator: 'Operator',
  viewer: 'Viewer'
};

export function hasRole(role: Role, allowed: readonly Role[]) {
  return allowed.includes(role);
}
