export type Theme = 'light' | 'dark';

export function useTheme() {
  const colorMode = useColorMode();

  const theme = computed<Theme>(() => {
    if (colorMode.preference === 'dark' || colorMode.preference === 'light') {
      return colorMode.preference;
    }

    return colorMode.value === 'dark' ? 'dark' : 'light';
  });

  const loadTheme = () => {
    if (colorMode.preference !== 'dark' && colorMode.preference !== 'light') {
      colorMode.preference = colorMode.value === 'dark' ? 'dark' : 'light';
    }
  };

  const setTheme = (next: Theme) => {
    colorMode.preference = next;
  };

  return { theme, loadTheme, setTheme };
}
