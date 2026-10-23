import { NavGroup } from '@/types';

/**
 * Navigation configuration with role-based visibility
 *
 * This configuration is used for both the sidebar navigation and Cmd+K bar.
 * Items are organized into groups, each rendered with a SidebarGroupLabel.
 *
 * Role-based access:
 * Set `access: { roles: ['admin'] }` to show an item only to those roles
 * (roles: admin, operator, viewer — see src/lib/auth/roles.ts). Items without
 * `access` are visible to every signed-in user.
 *
 * Hiding a menu item is UX only: also guard the page with `requireRole()`
 * and its Server Actions with `authorize()` from src/lib/auth/dal.ts.
 */
export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Engagement Medsos',
        url: '/dashboard/engagement',
        icon: 'chartBar',
        shortcut: ['e', 'e'],
        isActive: false,
        items: []
      },
      {
        title: 'Product',
        url: '/dashboard/product',
        icon: 'product',
        shortcut: ['p', 'p'],
        isActive: false,
        items: []
      },
      {
        title: 'Users',
        url: '/dashboard/users',
        icon: 'teams',
        shortcut: ['u', 'u'],
        isActive: false,
        items: [],
        access: { roles: ['admin'] }
      }
    ]
  },
  {
    label: 'Elements',
    items: [
      {
        title: 'Forms',
        url: '#',
        icon: 'forms',
        isActive: true,
        items: [
          {
            title: 'Basic Form',
            url: '/dashboard/forms/basic',
            icon: 'forms',
            shortcut: ['f', 'f']
          },
          {
            title: 'Multi-Step Form',
            url: '/dashboard/forms/multi-step',
            icon: 'forms'
          },
          {
            title: 'Sheet & Dialog',
            url: '/dashboard/forms/sheet-form',
            icon: 'forms'
          },
          {
            title: 'Advanced Patterns',
            url: '/dashboard/forms/advanced',
            icon: 'forms'
          }
        ]
      },
      {
        title: 'React Query',
        url: '/dashboard/react-query',
        icon: 'code',
        isActive: false,
        items: []
      },
      {
        title: 'Icons',
        url: '/dashboard/elements/icons',
        icon: 'palette',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: '',
    items: [
      {
        title: 'Account',
        url: '#',
        icon: 'account',
        isActive: true,
        items: [
          {
            title: 'Notifications',
            url: '/dashboard/notifications',
            icon: 'notification',
            shortcut: ['n', 'n']
          },
          {
            title: 'Ganti password',
            url: '/auth/change-password',
            icon: 'lock'
          }
        ]
      }
    ]
  }
];
