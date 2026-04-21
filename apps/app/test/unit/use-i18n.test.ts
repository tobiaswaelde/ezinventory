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
    expect(t('nav.home')).toBe('Home');
    expect(t('auth_error_passkey_not_supported')).toBe(
      'This browser does not support passkeys. Use password sign-in instead.'
    );
    expect(t('auth_error_registration_disabled')).toBe(
      'Public registration is disabled. Ask an admin to open registration.'
    );

    await setLocale('de');

    expect(locale.value).toBe('de');
    expect(t('nav_settings')).toBe('Einstellungen');
    expect(t('nav.settings')).toBe('Einstellungen');
    expect(t('auth_error_passkey_not_supported')).toBe(
      'Dieser Browser unterstützt keine Passkeys. Nutze stattdessen Passwort-Login.'
    );
    expect(t('auth_error_registration_disabled')).toBe(
      'Öffentliche Registrierung ist deaktiviert. Bitte Admin kontaktieren.'
    );
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

  it('does not touch storage on server and skips profile sync when not needed', async () => {
    const updatePreferredLanguage = vi.fn().mockResolvedValue(undefined);
    const auth = {
      isAuthenticated: { value: false },
      user: { value: null },
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

    (process as { client?: boolean }).client = false;

    const storageGet = vi.fn();
    vi.stubGlobal('localStorage', {
      getItem: storageGet,
      setItem: vi.fn()
    });

    const { useI18n } = await import('../../app/composables/use-i18n');
    const i18n = useI18n();

    i18n.initLocale();
    expect(storageGet).not.toHaveBeenCalled();

    await i18n.setLocale('en');
    expect(updatePreferredLanguage).not.toHaveBeenCalled();
  });

  it('handles unknown translation keys and initLocale from storage with en fallback path', async () => {
    const auth = {
      isAuthenticated: { value: false },
      user: { value: null },
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

    expect(i18n.t('missing_key' as never)).toBe('missing_key');
    expect(i18n.t('nav' as never)).toBe('nav');

    i18n.locale.value = 'de';
    i18n.initLocale();
    expect(i18n.locale.value).toBe('en');

    storage.set('ezinventory.locale', 'de');
    i18n.locale.value = 'en';
    i18n.initLocale();
    expect(i18n.locale.value).toBe('de');

    storage.set('ezinventory.locale', 'fr');
    i18n.locale.value = 'en';
    i18n.initLocale();
    expect(i18n.locale.value).toBe('en');
  });
});
