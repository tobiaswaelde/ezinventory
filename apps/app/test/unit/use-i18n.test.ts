import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('useI18n', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('translates keys and persists locale with authenticated sync', async () => {
    const updatePreferredLanguage = vi.fn().mockResolvedValue(undefined);
    const auth = {
      isAuthenticated: { value: true },
      user: { value: { preferredLanguage: 'en' } },
      updatePreferredLanguage
    };

    const state = new Map<string, { value: unknown }>();

    vi.stubGlobal('useAuth', () => auth);
    vi.stubGlobal('useState', (key: string, init: () => unknown) => {
      if (!state.has(key)) {
        state.set(key, { value: init() });
      }

      return state.get(key);
    });

    (process as { client?: boolean }).client = true;

    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      }
    });

    const { useI18n } = await import('../../app/composables/use-i18n');
    const { locale, t, setLocale } = useI18n();

    expect(locale.value).toBe('en');
    expect(t('nav_home')).toBe('Home');

    await setLocale('de');

    expect(locale.value).toBe('de');
    expect(t('nav_settings')).toBe('Einstellungen');
    expect(storage.get('ezinventory.locale')).toBe('de');
    expect(updatePreferredLanguage).toHaveBeenCalledWith('de');
  });

  it('initializes from user preferred language or localStorage', async () => {
    const auth = {
      isAuthenticated: { value: false },
      user: { value: { preferredLanguage: 'de' } },
      updatePreferredLanguage: vi.fn()
    };

    const state = new Map<string, { value: unknown }>();

    vi.stubGlobal('useAuth', () => auth);
    vi.stubGlobal('useState', (key: string, init: () => unknown) => {
      if (!state.has(key)) {
        state.set(key, { value: init() });
      }

      return state.get(key);
    });

    (process as { client?: boolean }).client = true;

    const storage = new Map<string, string>([['ezinventory.locale', 'en']]);
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: vi.fn()
    });

    const { useI18n } = await import('../../app/composables/use-i18n');
    const i18n = useI18n();

    i18n.initLocale();
    expect(i18n.locale.value).toBe('de');

    auth.user.value = null;
    i18n.initLocale();
    expect(i18n.locale.value).toBe('en');
  });
});
