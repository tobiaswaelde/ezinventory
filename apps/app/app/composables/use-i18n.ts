import DE_MESSAGES from '~/i18n/locales/de.json';
import EN_MESSAGES from '~/i18n/locales/en.json';

const LOCALE_STORAGE_KEY = 'ezinventory.locale';

type Locale = 'en' | 'de';
type MessageTree = typeof EN_MESSAGES;

const MESSAGES: Record<Locale, MessageTree> = {
  en: EN_MESSAGES,
  de: DE_MESSAGES
};

const LEGACY_KEY_MAP: Record<string, string> = {
  nav_home: 'nav.home',
  nav_inventory: 'nav.inventory',
  nav_labels: 'nav.labels',
  nav_scan: 'nav.scan',
  nav_settings: 'nav.settings',
  language: 'common.language',
  inventory_error_load: 'inventory.error.load',
  inventory_error_location_name_required: 'inventory.error.locationNameRequired',
  inventory_error_code_pattern: 'inventory.error.codePattern',
  inventory_error_fix_location_form: 'inventory.error.fixLocationForm',
  inventory_error_location_required: 'inventory.error.locationRequired',
  inventory_error_fix_container_form: 'inventory.error.fixContainerForm',
  inventory_error_create_location: 'inventory.error.createLocation',
  inventory_error_create_container: 'inventory.error.createContainer',
  inventory_success_location_created: 'inventory.success.locationCreated',
  inventory_success_container_created: 'inventory.success.containerCreated',
  auth_validation_required_email_password: 'auth.validation.requiredEmailPassword',
  auth_validation_invalid_email: 'auth.validation.invalidEmail',
  auth_validation_weak_password: 'auth.validation.weakPassword',
  auth_validation_display_name_too_short: 'auth.validation.displayNameTooShort',
  auth_validation_passkey_email_required: 'auth.validation.passkeyEmailRequired',
  auth_validation_passkey_credentials_required: 'auth.validation.passkeyCredentialsRequired',
  settings_validation_item_category_id_invalid: 'settings.validation.itemCategoryIdInvalid',
  settings_validation_item_sku_required: 'settings.validation.itemSkuRequired',
  settings_validation_item_name_required: 'settings.validation.itemNameRequired',
  settings_validation_item_servings_invalid: 'settings.validation.itemServingsInvalid',
  settings_validation_user_display_name_too_short: 'settings.validation.userDisplayNameTooShort',
  settings_validation_user_email_invalid: 'settings.validation.userEmailInvalid',
  settings_validation_user_password_too_short: 'settings.validation.userPasswordTooShort',
  settings_validation_policy_conditions_invalid: 'settings.validation.policyConditionsInvalid',
  settings_error_fix_user_form: 'settings.error.fixUserForm',
  settings_error_update_registration_mode: 'settings.error.updateRegistrationMode',
  settings_error_load_setup_status: 'settings.error.loadSetupStatus',
  settings_error_load_user_management_data: 'settings.error.loadUserManagementData',
  settings_error_create_user: 'settings.error.createUser',
  settings_error_no_role_selected: 'settings.error.noRoleSelected',
  settings_error_update_user_role: 'settings.error.updateUserRole',
  settings_error_update_user_policies: 'settings.error.updateUserPolicies',
  settings_error_create_policy: 'settings.error.createPolicy',
  settings_message_registration_mode_saved_prefix: 'settings.message.registrationModeSavedPrefix',
  settings_message_user_created_prefix: 'settings.message.userCreatedPrefix',
  settings_message_user_role_updated: 'settings.message.userRoleUpdated',
  settings_message_user_policies_updated: 'settings.message.userPoliciesUpdated',
  settings_message_policy_created: 'settings.message.policyCreated',
  settings_message_valid_payload_sent: 'settings.message.validPayloadSent',
  auth_error_login_failed: 'auth.error.loginFailed',
  auth_error_passkey_login_failed: 'auth.error.passkeyLoginFailed',
  auth_error_passkey_not_supported: 'auth.error.passkeyNotSupported',
  auth_error_registration_failed: 'auth.error.registrationFailed',
  auth_error_registration_disabled: 'auth.error.registrationDisabled',
  auth_error_setup_not_initialized: 'auth.error.setupNotInitialized',
  auth_error_user_already_exists: 'auth.error.userAlreadyExists',
  auth_error_passkey_registration_failed: 'auth.error.passkeyRegistrationFailed',
  labels_error_load_entities: 'labels.error.loadEntities',
  labels_error_generate: 'labels.error.generate',
  labels_validation_no_entity_selected: 'labels.validation.noEntitySelected',
  labels_validation_invalid_copies: 'labels.validation.invalidCopies',
  scan_validation_code_required: 'scan.validation.codeRequired',
  scan_validation_quantity_invalid: 'scan.validation.quantityInvalid',
  scan_validation_no_scanned_item: 'scan.validation.noScannedItem',
  scan_error_item_not_found: 'scan.error.itemNotFound',
  scan_error_secure_context_required: 'scan.error.secureContextRequired',
  scan_error_scanning: 'scan.error.scanning',
  scan_error_scanner_start: 'scan.error.scannerStart',
  scan_message_scanner_active: 'scan.message.scannerActive',
  scan_message_matched_item_prefix: 'scan.message.matchedItemPrefix',
  scan_message_quick_action_planned: 'scan.message.quickActionPlanned',
  scan_message_prepared_stock_out_prefix: 'scan.message.preparedStockOutPrefix'
};

function resolveMessage(messages: MessageTree, path: string): string | null {
  const tokens = path.split('.');
  let node: unknown = messages;

  for (const token of tokens) {
    if (!node || typeof node !== 'object' || !(token in node)) {
      return null;
    }

    node = (node as Record<string, unknown>)[token];
  }

  return typeof node === 'string' ? node : null;
}

export function useI18n() {
  const { isAuthenticated, updatePreferredLanguage, user } = useAuth();

  const locale = useState<Locale>('i18n.locale', () => 'en');

  const t = (key: string): string => {
    const normalizedKey = LEGACY_KEY_MAP[key] ?? key;
    return resolveMessage(MESSAGES[locale.value], normalizedKey) ?? resolveMessage(MESSAGES.en, normalizedKey) ?? key;
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
