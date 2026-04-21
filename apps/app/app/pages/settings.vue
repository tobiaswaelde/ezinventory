<template>
  <section class="card">
    <h1>Settings</h1>
    <p>Authenticated as: <strong>{{ user?.email ?? 'n/a' }}</strong> ({{ user?.role ?? 'n/a' }})</p>
  </section>

  <section v-if="isAdmin" class="card">
    <h2>Registration Mode</h2>
    <p>Control whether public registration is open or admin-only.</p>
    <p><strong>Setup initialized:</strong> {{ setupInitialized ? 'yes' : 'no' }}</p>

    <div class="field">
      <label for="registrationMode">Mode</label>
      <USelect
        id="registrationMode"
        v-model="registrationMode"
        :items="registrationModeOptions"
        label-key="label"
        value-key="value"
      />
    </div>

    <UButton color="primary" variant="solid" :disabled="modeSaving || !setupInitialized" @click="saveRegistrationMode">
      {{ modeSaving ? 'Saving...' : 'Save Mode' }}
    </UButton>
    <p v-if="modeMessage">{{ modeMessage }}</p>
  </section>

  <section v-if="isAdmin" class="card">
    <h2>Create User (Admin)</h2>

    <div class="field">
      <label for="displayName">Display Name</label>
      <UInput id="displayName" v-model="newUserForm.displayName" placeholder="Team Member" />
      <p v-if="newUserErrors.displayName" class="error">{{ newUserErrors.displayName }}</p>
    </div>

    <div class="field">
      <label for="email">Email</label>
      <UInput id="email" v-model="newUserForm.email" type="email" placeholder="team.member@example.com" />
      <p v-if="newUserErrors.email" class="error">{{ newUserErrors.email }}</p>
    </div>

    <div class="field">
      <label for="password">Password</label>
      <UInput id="password" v-model="newUserForm.password" type="password" placeholder="************" />
      <p v-if="newUserErrors.password" class="error">{{ newUserErrors.password }}</p>
    </div>

    <div class="field">
      <label for="role">Role</label>
      <USelect
        id="role"
        v-model="newUserForm.role"
        :items="roleSelectOptions"
        label-key="label"
        value-key="value"
      />
    </div>

    <div class="field">
      <label for="preferredLanguage">Preferred Language</label>
      <USelect
        id="preferredLanguage"
        v-model="newUserForm.preferredLanguage"
        :items="languageOptions"
        label-key="label"
        value-key="value"
      />
    </div>

    <UButton color="primary" variant="solid" :disabled="userSaving" @click="createManagedUser">
      {{ userSaving ? 'Creating...' : 'Create User' }}
    </UButton>
    <p v-if="userMessage">{{ userMessage }}</p>
  </section>

  <section v-if="isAdmin" class="card">
    <h2>Permission Policies</h2>
    <p>Create reusable policy entries and assign them to individual users below.</p>

    <div class="field">
      <label for="policy-action">Action</label>
      <USelect
        id="policy-action"
        v-model="newPolicyForm.action"
        :items="actionSelectOptions"
        label-key="label"
        value-key="value"
      />
    </div>

    <div class="field">
      <label for="policy-subject">Subject</label>
      <USelect
        id="policy-subject"
        v-model="newPolicyForm.subject"
        :items="subjectSelectOptions"
        label-key="label"
        value-key="value"
      />
    </div>

    <div class="field">
      <label for="policy-reason">Reason (optional)</label>
      <UInput id="policy-reason" v-model="newPolicyForm.reason" placeholder="Temporary stock-taking access" />
    </div>

    <div class="field">
      <label for="policy-conditions">Conditions JSON (optional)</label>
      <UTextarea id="policy-conditions" v-model="newPolicyForm.conditionsJson" :rows="3" placeholder='{"id":{"$eq":"..."}}' />
      <p v-if="newPolicyErrors.conditionsJson" class="error">{{ newPolicyErrors.conditionsJson }}</p>
    </div>

    <label class="checkbox-row">
      <UCheckbox v-model="newPolicyForm.inverted" />
      <span>Inverted (`cannot` rule)</span>
    </label>

    <UButton color="neutral" variant="soft" :disabled="policyCreating" @click="createPolicy">
      {{ policyCreating ? 'Creating...' : 'Create Policy' }}
    </UButton>

    <p v-if="policyMessage">{{ policyMessage }}</p>

    <div class="policy-catalog">
      <article v-for="policy in permissionPolicies" :key="policy.id" class="policy-item">
        <strong>{{ policy.inverted ? 'cannot' : 'can' }} {{ policy.action }} {{ policy.subject }}</strong>
        <small>{{ policy.reason ?? 'No reason provided' }}</small>
        <small>ID: {{ policy.id }}</small>
      </article>
    </div>
  </section>

  <section v-if="isAdmin" class="card">
    <h2>User Permissions</h2>
    <p>Assign role and user-specific fine-grained policy IDs.</p>
    <p v-if="usersLoading">Loading users...</p>
    <p v-if="usersMessage">{{ usersMessage }}</p>

    <article v-for="managedUser in managedUsers" :key="managedUser.id" class="managed-user">
      <header>
        <strong>{{ managedUser.displayName }}</strong>
        <small>{{ managedUser.email }}</small>
      </header>

      <div class="field">
        <label :for="`role-${managedUser.id}`">Role</label>
        <USelect
          :id="`role-${managedUser.id}`"
          v-model="roleDraftByUser[managedUser.id]"
          :items="roleSelectOptions"
          label-key="label"
          value-key="value"
        />
      </div>

      <UButton color="neutral" variant="soft" :disabled="roleSavingByUser[managedUser.id]" @click="saveUserRole(managedUser.id)">
        {{ roleSavingByUser[managedUser.id] ? 'Saving role...' : 'Save Role' }}
      </UButton>

      <div class="policy-grid">
        <label v-for="policy in permissionPolicies" :key="policy.id" class="policy-check-row">
          <UCheckbox
            :model-value="(policyDraftByUser[managedUser.id] ?? []).includes(policy.id)"
            @update:model-value="togglePolicyForUser(managedUser.id, policy.id)"
          />
          <span>{{ policy.inverted ? 'cannot' : 'can' }} {{ policy.action }} {{ policy.subject }}</span>
        </label>
      </div>

      <UButton color="primary" variant="solid" :disabled="policySavingByUser[managedUser.id]" @click="saveUserPolicies(managedUser.id)">
        {{ policySavingByUser[managedUser.id] ? 'Saving policies...' : 'Save Policies' }}
      </UButton>
    </article>
  </section>

  <section class="card">
    <h2>Validation Demo</h2>
    <p>This form validates client-side before sending to DTO-validated API endpoints.</p>

    <div class="field">
      <label for="categoryId">Category UUID v4</label>
      <UInput id="categoryId" v-model="itemForm.categoryId" placeholder="550e8400-e29b-41d4-a716-446655440001" />
      <p v-if="itemErrors.categoryId" class="error">{{ itemErrors.categoryId }}</p>
    </div>

    <div class="field">
      <label for="sku">SKU</label>
      <UInput id="sku" v-model="itemForm.sku" placeholder="SPAGHETTI-SAUCE-001" />
      <p v-if="itemErrors.sku" class="error">{{ itemErrors.sku }}</p>
    </div>

    <div class="field">
      <label for="name">Name</label>
      <UInput id="name" v-model="itemForm.name" placeholder="Spaghetti Sauce" />
      <p v-if="itemErrors.name" class="error">{{ itemErrors.name }}</p>
    </div>

    <div class="field">
      <label for="servings">Servings (optional)</label>
      <UInput id="servings" v-model="itemForm.servings" placeholder="3" />
      <p v-if="itemErrors.servings" class="error">{{ itemErrors.servings }}</p>
    </div>

    <UButton color="primary" variant="solid" @click="submitItem">Submit</UButton>
  </section>
</template>


<script setup lang="ts">
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

const { user } = useAuth();
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
const setupInitialized = ref(false);

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

onMounted(async () => {
  await loadSetupStatus();
  await loadAdminData();
});
</script>


<style scoped>
.checkbox-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin: 0.5rem 0 0.75rem;
}

.policy-catalog {
  display: grid;
  gap: 0.4rem;
  margin-top: 0.75rem;
}

.policy-item {
  border: 1px solid #d6dce6;
  border-radius: 0.6rem;
  padding: 0.5rem;
  display: grid;
  gap: 0.2rem;
}

.policy-item small {
  color: #586274;
}

.managed-user {
  border: 1px solid #d6dce6;
  border-radius: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}

.managed-user header {
  display: grid;
  margin-bottom: 0.5rem;
}

.managed-user header small {
  color: #5a6476;
}

.policy-grid {
  display: grid;
  gap: 0.4rem;
  margin: 0.75rem 0;
  max-height: 180px;
  overflow: auto;
  border: 1px solid #d7dce5;
  border-radius: 0.6rem;
  padding: 0.5rem;
}

.policy-check-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

textarea {
  width: 100%;
  border-radius: 0.6rem;
  border: 1px solid #d3d8e0;
  font: inherit;
  padding: 0.65rem 0.75rem;
}
</style>
