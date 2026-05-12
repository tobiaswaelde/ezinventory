import { type CommandPaletteItem, type NavigationMenuItem } from '#ui/types';
import type { RouteLocationRaw } from 'vue-router';
import { Routes } from '~/types/routes';

export const useNavigationItems = () => {
  const { t } = useI18n();

  const route = useRoute();
  const router = useRouter();

  const isSubrouteOf = (parent: RouteLocationRaw): boolean => {
    const parentRoute = router.resolve(parent);
    return route.path.startsWith(parentRoute.path);
  };

  const items = computed<NavigationMenuItem[][]>(
    () =>
      [
        //#region dashboard
        [
          {
            label: t('core.navigation.dashboard'),
            icon: 'i-tabler-dashboard',
            to: { name: Routes.Dashboard },
          },
        ],
        //#endregion
        //#region inventory
        [
          { type: 'label', label: t('core.navigation.inventory.label') },
          {
            label: t('core.navigation.inventory.warehouses'),
            icon: 'i-tabler-building-warehouse',
          },
          {
            label: t('core.navigation.inventory.storages'),
            icon: 'i-tabler-forklift',
          },
          {
            label: t('core.navigation.inventory.shelf-places'),
            icon: 'i-tabler-layout-grid',
          },
          {
            label: t('core.navigation.inventory.items'),
            icon: 'i-tabler-packages',
          },
        ],
        //#endregion
        //#region admin
        [
          { type: 'label', label: t('core.navigation.administration.label') },
          {
            label: t('core.navigation.administration.users'),
            icon: 'i-tabler-users',
            to: { name: Routes.AdminUsers },
          },
        ],
        //#endregion
      ] satisfies NavigationMenuItem[][],
  );

  const navigationItems = computed<NavigationMenuItem[][]>(() => {
    return items.value.map((group) =>
      group.map(
        (item) =>
          ({
            ...item,
            active: item.to ? isSubrouteOf(item.to) : false,
          }) as NavigationMenuItem,
      ),
    );
  });

  const commandPaletteItems = computed<CommandPaletteItem[]>(() => {
    return items.value.flat().map((item) => {
      return {
        ...item,
        chip: undefined,
      } satisfies CommandPaletteItem;
    });
  });

  return { navigationItems, commandPaletteItems };
};
