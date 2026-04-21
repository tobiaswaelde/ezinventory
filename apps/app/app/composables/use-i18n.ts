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
    inventory_success_container_created: 'Container created.',
    auth_validation_required_email_password: 'Please provide email and password.',
    auth_validation_invalid_email: 'Please provide a valid email address.',
    auth_validation_weak_password: 'Password must have at least 8 characters.',
    auth_validation_display_name_too_short: 'Display name must have at least 2 characters.',
    auth_validation_passkey_email_required: 'Email is required for passkey login.',
    auth_validation_passkey_credentials_required: 'Email and password are required for passkey registration.',
    settings_validation_item_category_id_invalid: 'Category ID must be a valid UUID v4.',
    settings_validation_item_sku_required: 'SKU is required.',
    settings_validation_item_name_required: 'Name is required.',
    settings_validation_item_servings_invalid: 'Servings must be an integer >= 1.',
    settings_validation_user_display_name_too_short: 'Display name must be at least 2 characters.',
    settings_validation_user_email_invalid: 'Valid email is required.',
    settings_validation_user_password_too_short: 'Password must be at least 8 characters.',
    settings_validation_policy_conditions_invalid: 'Conditions must be a valid JSON object (or left empty).',
    settings_error_fix_user_form: 'Please fix the user form errors.',
    settings_error_update_registration_mode: 'Could not update registration mode.',
    settings_error_load_setup_status: 'Could not load current setup status.',
    settings_error_load_user_management_data: 'Could not load user management data.',
    settings_error_create_user: 'Could not create user. Check permissions or duplicate email.',
    settings_error_no_role_selected: 'No role selected for this user.',
    settings_error_update_user_role: 'Could not update user role.',
    settings_error_update_user_policies: 'Could not update user policies.',
    settings_error_create_policy: 'Could not create permission policy. Verify JSON in conditions.',
    settings_message_registration_mode_saved_prefix: 'Registration mode saved:',
    settings_message_user_created_prefix: 'User created:',
    settings_message_user_role_updated: 'User role updated.',
    settings_message_user_policies_updated: 'User policies updated.',
    settings_message_policy_created: 'Permission policy created.',
    settings_message_valid_payload_sent: 'Valid payload sent to API.',
    auth_error_login_failed: 'Login failed. Please verify your credentials.',
    auth_error_passkey_login_failed: 'Passkey login failed.',
    auth_error_registration_failed: 'Registration failed. It may be disabled or user already exists.',
    auth_error_passkey_registration_failed: 'Passkey registration failed.',
    labels_error_load_entities: 'Could not load entities for labels.',
    labels_error_generate: 'Could not generate labels.',
    labels_validation_no_entity_selected: 'Select at least one entity.',
    labels_validation_invalid_copies: 'Copies per entity must be an integer >= 1.',
    scan_validation_code_required: 'Please provide a scanned code.',
    scan_validation_quantity_invalid: 'Quantity must be an integer >= 1.',
    scan_validation_no_scanned_item: 'No scanned item available.',
    scan_error_item_not_found: 'No item found for this code.',
    scan_error_secure_context_required: 'Camera scanning requires HTTPS or localhost.',
    scan_error_scanning: 'Scanning error occurred.',
    scan_error_scanner_start: 'Could not start camera scanner.',
    scan_message_scanner_active: 'Scanner active. Point camera at a QR code.',
    scan_message_matched_item_prefix: 'Matched item:',
    scan_message_quick_action_planned: 'This quick action is planned next. Stock-out is currently implemented first.',
    scan_message_prepared_stock_out_prefix: 'Prepared stock-out for'
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
    inventory_success_container_created: 'Container erstellt.',
    auth_validation_required_email_password: 'Bitte E-Mail und Passwort angeben.',
    auth_validation_invalid_email: 'Bitte eine gueltige E-Mail-Adresse angeben.',
    auth_validation_weak_password: 'Passwort muss mindestens 8 Zeichen lang sein.',
    auth_validation_display_name_too_short: 'Anzeigename muss mindestens 2 Zeichen lang sein.',
    auth_validation_passkey_email_required: 'E-Mail ist fuer Passkey-Login erforderlich.',
    auth_validation_passkey_credentials_required: 'E-Mail und Passwort sind fuer Passkey-Registrierung erforderlich.',
    settings_validation_item_category_id_invalid: 'Category-ID muss eine gueltige UUID v4 sein.',
    settings_validation_item_sku_required: 'SKU ist erforderlich.',
    settings_validation_item_name_required: 'Name ist erforderlich.',
    settings_validation_item_servings_invalid: 'Portionen muessen eine ganze Zahl >= 1 sein.',
    settings_validation_user_display_name_too_short: 'Anzeigename muss mindestens 2 Zeichen lang sein.',
    settings_validation_user_email_invalid: 'Gueltige E-Mail ist erforderlich.',
    settings_validation_user_password_too_short: 'Passwort muss mindestens 8 Zeichen lang sein.',
    settings_validation_policy_conditions_invalid: 'Conditions muessen ein gueltiges JSON-Objekt sein (oder leer bleiben).',
    settings_error_fix_user_form: 'Bitte korrigiere die Fehler im Benutzerformular.',
    settings_error_update_registration_mode: 'Registrierungsmodus konnte nicht aktualisiert werden.',
    settings_error_load_setup_status: 'Aktueller Setup-Status konnte nicht geladen werden.',
    settings_error_load_user_management_data: 'Benutzerverwaltungsdaten konnten nicht geladen werden.',
    settings_error_create_user: 'Benutzer konnte nicht erstellt werden. Berechtigungen oder doppelte E-Mail pruefen.',
    settings_error_no_role_selected: 'Keine Rolle fuer diesen Benutzer ausgewaehlt.',
    settings_error_update_user_role: 'Benutzerrolle konnte nicht aktualisiert werden.',
    settings_error_update_user_policies: 'Benutzer-Policies konnten nicht aktualisiert werden.',
    settings_error_create_policy: 'Permission-Policy konnte nicht erstellt werden. JSON in Conditions pruefen.',
    settings_message_registration_mode_saved_prefix: 'Registrierungsmodus gespeichert:',
    settings_message_user_created_prefix: 'Benutzer erstellt:',
    settings_message_user_role_updated: 'Benutzerrolle aktualisiert.',
    settings_message_user_policies_updated: 'Benutzer-Policies aktualisiert.',
    settings_message_policy_created: 'Permission-Policy erstellt.',
    settings_message_valid_payload_sent: 'Gueltige Nutzlast an API gesendet.',
    auth_error_login_failed: 'Login fehlgeschlagen. Bitte Zugangsdaten pruefen.',
    auth_error_passkey_login_failed: 'Passkey-Login fehlgeschlagen.',
    auth_error_registration_failed: 'Registrierung fehlgeschlagen. Sie ist evtl. deaktiviert oder Nutzer existiert bereits.',
    auth_error_passkey_registration_failed: 'Passkey-Registrierung fehlgeschlagen.',
    labels_error_load_entities: 'Eintraege fuer Labels konnten nicht geladen werden.',
    labels_error_generate: 'Labels konnten nicht generiert werden.',
    labels_validation_no_entity_selected: 'Bitte mindestens einen Eintrag auswaehlen.',
    labels_validation_invalid_copies: 'Kopien pro Eintrag muessen eine ganze Zahl >= 1 sein.',
    scan_validation_code_required: 'Bitte einen gescannten Code angeben.',
    scan_validation_quantity_invalid: 'Menge muss eine ganze Zahl >= 1 sein.',
    scan_validation_no_scanned_item: 'Kein gescannter Artikel verfuegbar.',
    scan_error_item_not_found: 'Kein Artikel fuer diesen Code gefunden.',
    scan_error_secure_context_required: 'Kamera-Scan erfordert HTTPS oder localhost.',
    scan_error_scanning: 'Beim Scannen ist ein Fehler aufgetreten.',
    scan_error_scanner_start: 'Kamera-Scanner konnte nicht gestartet werden.',
    scan_message_scanner_active: 'Scanner aktiv. Kamera auf einen QR-Code richten.',
    scan_message_matched_item_prefix: 'Gefundener Artikel:',
    scan_message_quick_action_planned: 'Diese Schnellaktion folgt als Naechstes. Aktuell ist zuerst Stock-out umgesetzt.',
    scan_message_prepared_stock_out_prefix: 'Stock-out vorbereitet fuer'
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
