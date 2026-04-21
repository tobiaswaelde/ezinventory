<template>
  <div class="grid gap-4">
    <ModulesSettingsPageHeaderCard :email="user?.email ?? 'n/a'" :role="user?.role ?? 'n/a'" />

    <UDashboardToolbar>
      <UNavigationMenu :items="tabItems" highlight class="-mx-1 flex-1" />
    </UDashboardToolbar>

    <div v-if="activeTab === 'general'" class="grid gap-4">
      <ModulesSettingsRegistrationModeCard
        v-if="isAdmin"
        :setup-initialized="setupInitialized"
        :registration-mode="registrationMode"
        :registration-mode-options="registrationModeOptions"
        :mode-saving="modeSaving"
        :mode-message="modeMessage"
        :on-save="saveRegistrationMode"
        :on-update-registration-mode="setRegistrationMode"
      />

      <ModulesSettingsCreateUserCard
        v-if="isAdmin"
        :new-user-form="newUserForm"
        :new-user-errors="newUserErrors"
        :role-select-options="roleSelectOptions"
        :language-options="languageOptions"
        :user-saving="userSaving"
        :user-message="userMessage"
        :on-create="createManagedUser"
      />

      <ModulesSettingsPermissionPoliciesCard
        v-if="isAdmin"
        :new-policy-form="newPolicyForm"
        :new-policy-errors="newPolicyErrors"
        :action-select-options="actionSelectOptions"
        :subject-select-options="subjectSelectOptions"
        :policy-creating="policyCreating"
        :policy-message="policyMessage"
        :permission-policies="permissionPolicies"
        :on-create-policy="createPolicy"
      />

      <ModulesSettingsUserPermissionsCard
        v-if="isAdmin"
        :users-loading="usersLoading"
        :users-message="usersMessage"
        :managed-users="managedUsers"
        :permission-policies="permissionPolicies"
        :role-draft-by-user="roleDraftByUser"
        :policy-draft-by-user="policyDraftByUser"
        :role-saving-by-user="roleSavingByUser"
        :policy-saving-by-user="policySavingByUser"
        :role-select-options="roleSelectOptions"
        :on-toggle-policy-for-user="togglePolicyForUser"
        :on-save-user-role="saveUserRole"
        :on-save-user-policies="saveUserPolicies"
      />
    </div>

    <div v-if="activeTab === 'security'" class="grid gap-4">
      <ModulesSettingsPasskeysCard
        :passkey-supported="passkeySupported"
        :passkey-not-supported-text="t('auth_error_passkey_not_supported')"
        :passkey-email="passkeyEmail"
        :passkey-form="passkeyForm"
        :passkey-submitting="passkeySubmitting"
        :passkey-error="passkeyError"
        :passkey-message="passkeyMessage"
        :passkeys="passkeys"
        :passkey-deleting-by-id="passkeyDeletingById"
        :on-register="registerProfilePasskey"
        :on-delete="deleteProfilePasskey"
        :format-date="formatDate"
      />
    </div>

    <div v-if="activeTab === 'validation'" class="grid gap-4">
      <ModulesSettingsValidationDemoCard :item-form="itemForm" :item-errors="itemErrors" :on-submit="submitItem" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import type {
  CaslAction,
  CaslSubject,
  ManagedUser,
  PermissionPolicy,
  RegistrationMode,
  UserRole
} from '@ezinventory/contracts';
import {
  validateItemInput,
  validateManagedUserInput,
  validatePolicyConditionsJson
} from '~/utils/settings-validation';
import {
  normalizeEmail,
  normalizeText,
  validatePasskeyRegistrationInput
} from '~/utils/auth-validation';

const route = useRoute();
const { user, registerPasskey, listPasskeys, deletePasskey } = useAuth();
const { t } = useI18n();
const {
  createItem,
  createPermissionPolicy,
  createUserByAdmin,
  getSetupStatus,
  listPermissionPolicies,
  listUsers,
  replaceUserPolicies,
  updateRegistrationMode,
  updateUserRole
} = useApiClient();

const roleOptions: UserRole[] = ['VIEWER', 'STAFF', 'MANAGER', 'ADMIN'];
const actionOptions: CaslAction[] = ['read', 'create', 'update', 'delete', 'scan', 'stock-out'];
const subjectOptions: CaslSubject[] = ['Category', 'Item', 'Location', 'Container', 'Stock', 'User', 'Auth', 'all'];
const registrationModeOptions = [
  { label: 'ADMIN_ONLY', value: 'ADMIN_ONLY' },
  { label: 'OPEN', value: 'OPEN' }
] as const;
const roleSelectOptions = roleOptions.map((role) => ({ label: role, value: role }));
const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Deutsch', value: 'de' }
] as const;
const actionSelectOptions = actionOptions.map((action) => ({ label: action, value: action }));
const subjectSelectOptions = subjectOptions.map((subject) => ({ label: subject, value: subject }));

const isAdmin = computed(() => user.value?.role === 'ADMIN');

const activeTab = computed<'general' | 'security' | 'validation'>(() => {
  const tab = route.query.tab;
  if (tab === 'security' || tab === 'validation' || tab === 'general') {
    return tab;
  }

  return 'general';
});

const tabItems = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: 'General',
      icon: 'i-tabler-settings',
      to: { path: '/settings', query: { tab: 'general' } },
      active: activeTab.value === 'general'
    },
    {
      label: 'Security',
      icon: 'i-tabler-shield',
      to: { path: '/settings', query: { tab: 'security' } },
      active: activeTab.value === 'security'
    },
    {
      label: 'Validation',
      icon: 'i-tabler-checkup-list',
      to: { path: '/settings', query: { tab: 'validation' } },
      active: activeTab.value === 'validation'
    }
  ]
]);

const setupInitialized = ref(false);
const passkeySupported = ref(true);
const passkeySubmitting = ref(false);
const passkeyError = ref('');
const passkeyMessage = ref('');
const passkeyForm = reactive({
  password: '',
  deviceName: ''
});
const passkeyEmail = computed(() => normalizeEmail(user.value?.email));
const passkeys = ref<Array<{ id: string; deviceName: string | null; createdAt: string; lastUsedAt: string | null }>>([]);
const passkeyDeletingById = ref<Record<string, boolean>>({});

const itemForm = reactive({
  categoryId: '',
  sku: '',
  name: '',
  servings: ''
});
const itemErrors = reactive<Record<string, string>>({});

const registrationMode = ref<RegistrationMode>('ADMIN_ONLY');
const modeSaving = ref(false);
const modeMessage = ref('');

const newUserForm = reactive({
  email: '',
  password: '',
  displayName: '',
  role: 'STAFF' as UserRole,
  preferredLanguage: 'en' as 'de' | 'en'
});
const newUserErrors = reactive({
  email: '',
  password: '',
  displayName: ''
});
const userSaving = ref(false);
const userMessage = ref('');

const managedUsers = ref<ManagedUser[]>([]);
const permissionPolicies = ref<PermissionPolicy[]>([]);
const usersLoading = ref(false);
const usersMessage = ref('');
const roleSavingByUser = ref<Record<string, boolean>>({});
const policySavingByUser = ref<Record<string, boolean>>({});
const roleDraftByUser = ref<Record<string, UserRole>>({});
const policyDraftByUser = ref<Record<string, string[]>>({});

const newPolicyForm = reactive({
  action: 'read' as CaslAction,
  subject: 'Item' as CaslSubject,
  inverted: false,
  reason: '',
  conditionsJson: ''
});
const newPolicyErrors = reactive({
  conditionsJson: ''
});
const policyCreating = ref(false);
const policyMessage = ref('');

const validateItem = (): boolean => {
  const errors = validateItemInput(itemForm);

  itemErrors.categoryId = errors.categoryId ? t(errors.categoryId as never) : '';
  itemErrors.sku = errors.sku ? t(errors.sku as never) : '';
  itemErrors.name = errors.name ? t(errors.name as never) : '';
  itemErrors.servings = errors.servings ? t(errors.servings as never) : '';

  return !itemErrors.categoryId && !itemErrors.sku && !itemErrors.name && !itemErrors.servings;
};

const submitItem = async (): Promise<void> => {
  if (!validateItem()) return;

  await createItem({
    categoryId: itemForm.categoryId,
    sku: itemForm.sku,
    name: itemForm.name,
    servings: itemForm.servings ? Number(itemForm.servings) : undefined
  });

  alert(t('settings_message_valid_payload_sent'));
};

const saveRegistrationMode = async (): Promise<void> => {
  modeMessage.value = '';
  modeSaving.value = true;

  try {
    const result = await updateRegistrationMode({ mode: registrationMode.value });
    modeMessage.value = `${t('settings_message_registration_mode_saved_prefix')} ${result.mode}`;
  } catch {
    modeMessage.value = t('settings_error_update_registration_mode');
  } finally {
    modeSaving.value = false;
  }
};

const setRegistrationMode = (value: string | undefined): void => {
  if (value === 'OPEN' || value === 'ADMIN_ONLY') {
    registrationMode.value = value;
  }
};

const loadSetupStatus = async (): Promise<void> => {
  modeMessage.value = '';

  try {
    const status = await getSetupStatus();
    setupInitialized.value = status.setupInitialized;
    registrationMode.value = status.registrationMode;
  } catch {
    modeMessage.value = t('settings_error_load_setup_status');
  }
};

const hydrateUserDrafts = (): void => {
  const nextRoleDrafts: Record<string, UserRole> = {};
  const nextPolicyDrafts: Record<string, string[]> = {};

  for (const row of managedUsers.value) {
    nextRoleDrafts[row.id] = row.role;
    nextPolicyDrafts[row.id] = [...row.policyIds];
  }

  roleDraftByUser.value = nextRoleDrafts;
  policyDraftByUser.value = nextPolicyDrafts;
};

const loadAdminData = async (): Promise<void> => {
  if (!isAdmin.value) {
    return;
  }

  usersMessage.value = '';
  usersLoading.value = true;

  try {
    const [users, policies] = await Promise.all([listUsers(), listPermissionPolicies()]);
    managedUsers.value = users;
    permissionPolicies.value = policies;
    hydrateUserDrafts();
  } catch {
    usersMessage.value = t('settings_error_load_user_management_data');
  } finally {
    usersLoading.value = false;
  }
};

const createManagedUser = async (): Promise<void> => {
  userMessage.value = '';
  newUserErrors.email = '';
  newUserErrors.password = '';
  newUserErrors.displayName = '';

  const errors = validateManagedUserInput(newUserForm);
  newUserErrors.displayName = errors.displayName ? t(errors.displayName as never) : '';
  newUserErrors.email = errors.email ? t(errors.email as never) : '';
  newUserErrors.password = errors.password ? t(errors.password as never) : '';

  if (newUserErrors.displayName || newUserErrors.email || newUserErrors.password) {
    userMessage.value = t('settings_error_fix_user_form');
    return;
  }

  userSaving.value = true;

  try {
    const created = await createUserByAdmin({
      email: newUserForm.email.trim(),
      password: newUserForm.password,
      displayName: newUserForm.displayName.trim(),
      role: newUserForm.role,
      preferredLanguage: newUserForm.preferredLanguage
    });

    userMessage.value = `${t('settings_message_user_created_prefix')} ${created.email} (${created.role})`;
    newUserForm.password = '';
    await loadAdminData();
  } catch {
    userMessage.value = t('settings_error_create_user');
  } finally {
    userSaving.value = false;
  }
};

const saveUserRole = async (targetUserId: string): Promise<void> => {
  usersMessage.value = '';
  roleSavingByUser.value[targetUserId] = true;

  try {
    const nextRole = roleDraftByUser.value[targetUserId];
    if (!nextRole) {
      usersMessage.value = t('settings_error_no_role_selected');
      return;
    }

    await updateUserRole(targetUserId, nextRole);
    usersMessage.value = t('settings_message_user_role_updated');
    await loadAdminData();
  } catch {
    usersMessage.value = t('settings_error_update_user_role');
  } finally {
    roleSavingByUser.value[targetUserId] = false;
  }
};

const togglePolicyForUser = (targetUserId: string, policyId: string): void => {
  const selected = policyDraftByUser.value[targetUserId] ?? [];

  if (selected.includes(policyId)) {
    policyDraftByUser.value[targetUserId] = selected.filter((id) => id !== policyId);
    return;
  }

  policyDraftByUser.value[targetUserId] = [...selected, policyId];
};

const saveUserPolicies = async (targetUserId: string): Promise<void> => {
  usersMessage.value = '';
  policySavingByUser.value[targetUserId] = true;

  try {
    await replaceUserPolicies(targetUserId, policyDraftByUser.value[targetUserId] ?? []);
    usersMessage.value = t('settings_message_user_policies_updated');
    await loadAdminData();
  } catch {
    usersMessage.value = t('settings_error_update_user_policies');
  } finally {
    policySavingByUser.value[targetUserId] = false;
  }
};

const createPolicy = async (): Promise<void> => {
  policyMessage.value = '';
  newPolicyErrors.conditionsJson = '';
  policyCreating.value = true;

  try {
    let conditions: Record<string, unknown> | undefined;

    const conditionsError = validatePolicyConditionsJson(newPolicyForm.conditionsJson);
    if (conditionsError) {
      newPolicyErrors.conditionsJson = t(conditionsError as never);
      policyMessage.value = t('settings_error_create_policy');
      return;
    }

    if (newPolicyForm.conditionsJson.trim().length > 0) {
      conditions = JSON.parse(newPolicyForm.conditionsJson) as Record<string, unknown>;
    }

    await createPermissionPolicy({
      action: newPolicyForm.action,
      subject: newPolicyForm.subject,
      inverted: newPolicyForm.inverted,
      reason: newPolicyForm.reason.trim() || undefined,
      conditions
    });

    policyMessage.value = t('settings_message_policy_created');
    newPolicyForm.reason = '';
    newPolicyForm.conditionsJson = '';
    newPolicyErrors.conditionsJson = '';
    await loadAdminData();
  } catch {
    if (!newPolicyErrors.conditionsJson) {
      newPolicyErrors.conditionsJson = t('settings_validation_policy_conditions_invalid');
    }
    policyMessage.value = t('settings_error_create_policy');
  } finally {
    policyCreating.value = false;
  }
};

const registerProfilePasskey = async (): Promise<void> => {
  passkeyError.value = '';
  passkeyMessage.value = '';

  if (!passkeySupported.value) {
    passkeyError.value = t('auth_error_passkey_not_supported');
    return;
  }

  const email = passkeyEmail.value;
  const password = passkeyForm.password;
  const deviceName = normalizeText(passkeyForm.deviceName);
  const validationError = validatePasskeyRegistrationInput({ email, password });

  if (validationError) {
    passkeyError.value = t(validationError as never);
    return;
  }

  passkeySubmitting.value = true;

  try {
    const result = await registerPasskey({
      email,
      password,
      deviceName: deviceName || undefined
    });

    passkeyForm.password = '';
    passkeyForm.deviceName = '';
    passkeyMessage.value = `Passkey registered (${result.credentialId.slice(0, 10)}...).`;
    await loadProfilePasskeys();
  } catch {
    passkeyError.value = t('auth_error_passkey_registration_failed');
  } finally {
    passkeySubmitting.value = false;
  }
};

const loadProfilePasskeys = async (): Promise<void> => {
  if (!user.value) {
    passkeys.value = [];
    return;
  }

  try {
    passkeys.value = await listPasskeys();
  } catch {
    passkeys.value = [];
  }
};

const deleteProfilePasskey = async (id: string): Promise<void> => {
  passkeyError.value = '';
  passkeyMessage.value = '';
  passkeyDeletingById.value[id] = true;

  try {
    await deletePasskey(id);
    passkeyMessage.value = 'Passkey deleted.';
    await loadProfilePasskeys();
  } catch {
    passkeyError.value = 'Could not delete passkey.';
  } finally {
    passkeyDeletingById.value[id] = false;
  }
};

const formatDate = (value: string): string => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

onMounted(async () => {
  passkeySupported.value = typeof window !== 'undefined' && 'PublicKeyCredential' in window;
  await loadProfilePasskeys();
  await loadSetupStatus();
  await loadAdminData();
});
</script>
