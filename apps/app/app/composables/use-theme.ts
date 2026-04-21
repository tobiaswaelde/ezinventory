export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const colorMode = useColorMode();

  const theme = computed<Theme>(() => {
    if (colorMode.preference === 'dark' || colorMode.preference === 'light' || colorMode.preference === 'system') {
      return colorMode.preference;
    }

    return colorMode.value === 'dark' ? 'dark' : 'light';
  });

  const loadTheme = () => {
    if (colorMode.preference !== 'dark' && colorMode.preference !== 'light' && colorMode.preference !== 'system') {
      colorMode.preference = 'system';
    }
  };

  const setTheme = (next: Theme) => {
    colorMode.preference = next;
  };

  return { theme, loadTheme, setTheme };
}
