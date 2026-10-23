import { ROLE_LABELS, ROLES } from '@/lib/auth/roles';
import { USER_STATUSES, type UserStatus } from '../../api/types';

export const ROLE_OPTIONS = ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }));

export const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Aktif',
  inactive: 'Nonaktif'
};

export const STATUS_OPTIONS = USER_STATUSES.map((status) => ({
  value: status,
  label: STATUS_LABELS[status]
}));
