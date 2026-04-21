import type { NavigationMenuItem } from '@nuxt/ui';

export function useNavigationItems() {
  const route = useRoute();
  const { t } = useI18n();

  const isSubrouteOf = (path: string): boolean => {
    if (path === '/') {
      return route.path === '/';
    }

    return route.path.startsWith(path);
  };

  const navigationItems = computed<NavigationMenuItem[][]>(() => [
    [
      {
        label: t('nav_home'),
        icon: 'i-tabler-home',
        to: '/',
        active: isSubrouteOf('/')
      },
      {
        label: t('nav_inventory'),
        icon: 'i-tabler-box-multiple',
        to: '/inventory',
        active: isSubrouteOf('/inventory')
      },
      {
        label: t('nav_labels'),
        icon: 'i-tabler-sticker-2',
        to: '/labels',
        active: isSubrouteOf('/labels')
      },
      {
        label: t('nav_scan'),
        icon: 'i-tabler-scan',
        to: '/scan',
        active: isSubrouteOf('/scan')
      }
    ],
    [
      {
        type: 'label',
        label: 'System'
      },
      {
        label: t('nav_users'),
        icon: 'i-tabler-users',
        to: '/users',
        active: isSubrouteOf('/users')
      },
      {
        label: t('nav_settings'),
        icon: 'i-tabler-settings',
        to: '/settings',
        active: isSubrouteOf('/settings')
      }
    ]
  ]);

  return {
    navigationItems
  };
}
