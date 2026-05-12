import type { BadgeProps } from '#ui/types';
import { UserRole } from '~/types/api/enums/user-role';

export const useUserRole = (value?: Ref<UserRole | undefined>) => {
  const { t } = useI18n();

  const getLabel = (role?: UserRole) => {
    return t(`enums.user-role.${role}`);
  };

  const getColor = (role?: UserRole): BadgeProps['color'] => {
    switch (role) {
      case UserRole.Admin:
        return 'red';
      case UserRole.User:
        return 'blue';
      default:
        return undefined;
    }
  };

  const getIcon = (role?: UserRole): string | undefined => {
    switch (role) {
      case UserRole.Admin:
        return 'i-tabler-crown';
      case UserRole.User:
        return 'i-tabler-user';
      default:
        return undefined;
    }
  };

  const label = computed(() => getLabel(toValue(value)));
  const color = computed(() => getColor(toValue(value)));
  const icon = computed(() => getIcon(toValue(value)));

  return {
    label,
    color,
    icon,
    getLabel,
    getColor,
    getIcon,
  };
};
