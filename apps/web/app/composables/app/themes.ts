import type { DropdownMenuItem } from '#ui/types';
import { useMouse } from '@vueuse/core';

const TRANSITION_DURATION = 600;

export type Theme = 'system' | 'light' | 'dark';

export const useThemes = () => {
  const { t } = useI18n();
  const colorMode = useColorMode();
  const { x: mouseX, y: mouseY } = useMouse();

  const themes = computed<{ value: Theme; label: string; icon: string }[]>(() => [
    {
      value: 'system',
      label: t('enums.color-mode.system'),
      icon: 'i-tabler-device-desktop',
    },
    {
      value: 'light',
      label: t('enums.color-mode.light'),
      icon: 'i-tabler-sun',
    },
    {
      value: 'dark',
      label: t('enums.color-mode.dark'),
      icon: 'i-tabler-moon',
    },
  ]);

  const dropdownMenuItems = computed<DropdownMenuItem[]>(() => {
    return themes.value.map(({ value, label, icon }) => ({
      type: 'checkbox',
      label,
      icon,
      checked: colorMode.preference === value,
      onSelect: (e) => {
        e.preventDefault();
        setTheme(value as Theme, mouseX.value, mouseY.value);
      },
    }));
  });

  const setTheme = (theme: Theme, startX?: number, startY?: number) => {
    // fallback if browser does not support view transitions
    if (!document.startViewTransition) {
      colorMode.preference = theme;
      return;
    }

    // calculate transition radius
    const x = startX ?? 0;
    const y = startY ?? window.innerHeight;
    const maxX = Math.max(x, window.innerWidth - x);
    const maxY = Math.max(y, window.innerHeight - y);
    const endRadius = Math.hypot(maxX, maxY);

    // start view transition
    const transition = document.startViewTransition(() => {
      colorMode.preference = theme;
    });

    // execute transition effect
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`, // start circle at click position
            `circle(${endRadius}px at ${x}px ${y}px)`, // end circle at calculated radius
          ],
        },
        {
          duration: TRANSITION_DURATION,
          easing: 'cubic-bezier(.76,.32,.29,.99)',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    });
  };

  return {
    colorMode,
    themes,
    dropdownMenuItems,
    setTheme,
  };
};
