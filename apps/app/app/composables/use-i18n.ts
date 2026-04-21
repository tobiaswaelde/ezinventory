const LOCALE_STORAGE_KEY = 'ezinventory.locale';

const MESSAGES = {
  en: {
    nav_home: 'Home',
    nav_inventory: 'Inventory',
    nav_labels: 'Labels',
    nav_scan: 'Scan QR',
    nav_settings: 'Settings',
    language: 'Language',
    inventory_error_load: 'Could not load inventory structure.',
    inventory_error_location_name_required: 'Name is required.',
    inventory_error_code_pattern: 'Code must be 2-40 chars, uppercase letters/numbers/hyphen only.',
    inventory_error_fix_location_form: 'Please fix the location form errors.',
    inventory_error_location_required: 'Location is required.',
    inventory_error_fix_container_form: 'Please fix the container form errors.',
    inventory_error_create_location: 'Could not create location.',
    inventory_error_create_container: 'Could not create container.',
    inventory_success_location_created: 'Location created.',
    inventory_success_container_created: 'Container created.'
  },
  de: {
    nav_home: 'Start',
    nav_inventory: 'Inventar',
    nav_labels: 'Etiketten',
    nav_scan: 'QR scannen',
    nav_settings: 'Einstellungen',
    language: 'Sprache',
    inventory_error_load: 'Inventarstruktur konnte nicht geladen werden.',
    inventory_error_location_name_required: 'Name ist erforderlich.',
    inventory_error_code_pattern: 'Code muss 2-40 Zeichen haben und nur Großbuchstaben/Ziffern/Bindestriche enthalten.',
    inventory_error_fix_location_form: 'Bitte korrigiere die Fehler im Standort-Formular.',
    inventory_error_location_required: 'Standort ist erforderlich.',
    inventory_error_fix_container_form: 'Bitte korrigiere die Fehler im Container-Formular.',
    inventory_error_create_location: 'Standort konnte nicht erstellt werden.',
    inventory_error_create_container: 'Container konnte nicht erstellt werden.',
    inventory_success_location_created: 'Standort erstellt.',
    inventory_success_container_created: 'Container erstellt.'
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
