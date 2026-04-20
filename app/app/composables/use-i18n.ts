const LOCALE_STORAGE_KEY = 'ezinventory.locale';

const MESSAGES = {
  en: {
    nav_home: 'Home',
    nav_inventory: 'Inventory',
    nav_labels: 'Labels',
    nav_scan: 'Scan QR',
    nav_settings: 'Settings',
    language: 'Language'
  },
  de: {
    nav_home: 'Start',
    nav_inventory: 'Inventar',
    nav_labels: 'Etiketten',
    nav_scan: 'QR scannen',
    nav_settings: 'Einstellungen',
    language: 'Sprache'
  }
} as const;

type Locale = keyof typeof MESSAGES;

export function useI18n() {
  const { isAuthenticated, updatePreferredLanguage, user } = useAuth();

  const locale = useState<Locale>('i18n.locale', () => 'en');

  const t = (key: keyof (typeof MESSAGES)['en']): string => {
    return MESSAGES[locale.value][key] ?? MESSAGES.en[key] ?? key;
  };

  const setLocale = async (nextLocale: Locale): Promise<void> => {
    locale.value = nextLocale;

    if (process.client) {
      localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    }

    if (isAuthenticated.value && user.value?.preferredLanguage !== nextLocale) {
      await updatePreferredLanguage(nextLocale);
    }
  };

  const initLocale = (): void => {
    if (user.value?.preferredLanguage === 'de' || user.value?.preferredLanguage === 'en') {
      locale.value = user.value.preferredLanguage;
      return;
    }

    if (!process.client) {
      return;
    }

    const fromStorage = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (fromStorage === 'de' || fromStorage === 'en') {
      locale.value = fromStorage;
    }
  };

  return {
    locale,
    t,
    setLocale,
    initLocale
  };
}
