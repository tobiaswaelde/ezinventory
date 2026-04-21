import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('useTheme', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('uses explicit light/dark preference as theme', async () => {
    const colorMode = { preference: 'dark', value: 'light' };
    vi.stubGlobal('useColorMode', () => colorMode);

    const { useTheme } = await import('../../app/composables/use-theme');
    const { theme } = useTheme();

    expect(theme.value).toBe('dark');
  });

  it('falls back to colorMode.value and can set/load theme', async () => {
    const colorMode: { preference: string; value: 'light' | 'dark' } = { preference: 'system', value: 'light' };
    vi.stubGlobal('useColorMode', () => colorMode);

    const { useTheme } = await import('../../app/composables/use-theme');
    const { theme, loadTheme, setTheme } = useTheme();

    expect(theme.value).toBe('light');

    setTheme('dark');
    expect(colorMode.preference).toBe('dark');

    colorMode.preference = 'system';
    colorMode.value = 'dark';
    loadTheme();
    expect(colorMode.preference).toBe('dark');
  });
});
