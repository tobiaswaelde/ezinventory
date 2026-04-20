const KEY = 'ezinventory.theme';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const theme = useState<Theme>('theme', () => 'light');

  const loadTheme = () => {
    if (import.meta.client) {
      const local = window.localStorage.getItem(KEY) as Theme | null;
      if (local === 'light' || local === 'dark') {
        theme.value = local;
        return;
      }

      const cookie = document.cookie
        .split('; ')
        .find((part) => part.startsWith(`${KEY}=`))
        ?.split('=')[1] as Theme | undefined;

      if (cookie === 'light' || cookie === 'dark') {
        theme.value = cookie;
      }
    }
  };

  const setTheme = (next: Theme) => {
    theme.value = next;
    if (import.meta.client) {
      window.localStorage.setItem(KEY, next);
      document.cookie = `${KEY}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    }
  };

  return { theme, loadTheme, setTheme };
}
