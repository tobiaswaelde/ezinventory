<script setup lang="ts">
import type {
  CaslAction,
  CaslSubject,
  ManagedUser,
  PermissionPolicy,
  RegistrationMode,
  UserRole
} from '~/types/api/setup';

const { user } = useAuth();
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
const policyCreating = ref(false);
const policyMessage = ref('');

const validateItem = (): boolean => {
  itemErrors.categoryId = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(itemForm.categoryId)
    ? ''
    : 'categoryId must be a UUID v4';

  itemErrors.sku = itemForm.sku.trim().length > 0 ? '' : 'SKU is required';
  itemErrors.name = itemForm.name.trim().length > 0 ? '' : 'Name is required';

  if (itemForm.servings.trim().length > 0) {
    const servings = Number(itemForm.servings);
    itemErrors.servings = Number.isInteger(servings) && servings >= 1 ? '' : 'Servings must be an integer >= 1';
  } else {
    itemErrors.servings = '';
  }

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

  alert('Valid payload sent to API.');
};

const saveRegistrationMode = async (): Promise<void> => {
  modeMessage.value = '';
  modeSaving.value = true;

  try {
    const result = await updateRegistrationMode({ mode: registrationMode.value });
    modeMessage.value = `Registration mode saved: ${result.mode}`;
  } catch {
    modeMessage.value = 'Could not update registration mode.';
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
    modeMessage.value = 'Could not load current setup status.';
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
    usersMessage.value = 'Could not load user management data.';
  } finally {
    usersLoading.value = false;
  }
};

const createManagedUser = async (): Promise<void> => {
  userMessage.value = '';

  if (!newUserForm.email.trim() || !newUserForm.password.trim() || !newUserForm.displayName.trim()) {
    userMessage.value = 'Email, password and display name are required.';
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

    userMessage.value = `User created: ${created.email} (${created.role})`;
    newUserForm.password = '';
    await loadAdminData();
  } catch {
    userMessage.value = 'Could not create user. Check permissions or duplicate email.';
  } finally {
    userSaving.value = false;
  }
};

const saveUserRole = async (targetUserId: string): Promise<void> => {
  usersMessage.value = '';
  roleSavingByUser.value[targetUserId] = true;

  try {
    await updateUserRole(targetUserId, roleDraftByUser.value[targetUserId]);
    usersMessage.value = 'User role updated.';
    await loadAdminData();
  } catch {
    usersMessage.value = 'Could not update user role.';
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
    usersMessage.value = 'User policies updated.';
    await loadAdminData();
  } catch {
    usersMessage.value = 'Could not update user policies.';
  } finally {
    policySavingByUser.value[targetUserId] = false;
  }
};

const createPolicy = async (): Promise<void> => {
  policyMessage.value = '';
  policyCreating.value = true;

  try {
    let conditions: Record<string, unknown> | undefined;

    if (newPolicyForm.conditionsJson.trim().length > 0) {
      const parsed = JSON.parse(newPolicyForm.conditionsJson) as unknown;

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Conditions must be a JSON object.');
      }

      conditions = parsed as Record<string, unknown>;
    }

    await createPermissionPolicy({
      action: newPolicyForm.action,
      subject: newPolicyForm.subject,
      inverted: newPolicyForm.inverted,
      reason: newPolicyForm.reason.trim() || undefined,
      conditions
    });

    policyMessage.value = 'Permission policy created.';
    newPolicyForm.reason = '';
    newPolicyForm.conditionsJson = '';
    await loadAdminData();
  } catch {
    policyMessage.value = 'Could not create permission policy. Verify JSON in conditions.';
  } finally {
    policyCreating.value = false;
  }
};

onMounted(async () => {
  await loadSetupStatus();
  await loadAdminData();
});
</script>

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
      <select id="registrationMode" v-model="registrationMode">
        <option value="ADMIN_ONLY">ADMIN_ONLY</option>
        <option value="OPEN">OPEN</option>
      </select>
    </div>

    <button class="scan-btn" :disabled="modeSaving || !setupInitialized" @click="saveRegistrationMode">
      {{ modeSaving ? 'Saving...' : 'Save Mode' }}
    </button>
    <p v-if="modeMessage">{{ modeMessage }}</p>
  </section>

  <section v-if="isAdmin" class="card">
    <h2>Create User (Admin)</h2>

    <div class="field">
      <label for="displayName">Display Name</label>
      <input id="displayName" v-model="newUserForm.displayName" placeholder="Team Member" />
    </div>

    <div class="field">
      <label for="email">Email</label>
      <input id="email" v-model="newUserForm.email" type="email" placeholder="team.member@example.com" />
    </div>

    <div class="field">
      <label for="password">Password</label>
      <input id="password" v-model="newUserForm.password" type="password" placeholder="************" />
    </div>

    <div class="field">
      <label for="role">Role</label>
      <select id="role" v-model="newUserForm.role">
        <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
      </select>
    </div>

    <div class="field">
      <label for="preferredLanguage">Preferred Language</label>
      <select id="preferredLanguage" v-model="newUserForm.preferredLanguage">
        <option value="en">English</option>
        <option value="de">Deutsch</option>
      </select>
    </div>

    <button class="scan-btn" :disabled="userSaving" @click="createManagedUser">
      {{ userSaving ? 'Creating...' : 'Create User' }}
    </button>
    <p v-if="userMessage">{{ userMessage }}</p>
  </section>

  <section v-if="isAdmin" class="card">
    <h2>Permission Policies</h2>
    <p>Create reusable policy entries and assign them to individual users below.</p>

    <div class="field">
      <label for="policy-action">Action</label>
      <select id="policy-action" v-model="newPolicyForm.action">
        <option v-for="action in actionOptions" :key="action" :value="action">{{ action }}</option>
      </select>
    </div>

    <div class="field">
      <label for="policy-subject">Subject</label>
      <select id="policy-subject" v-model="newPolicyForm.subject">
        <option v-for="subject in subjectOptions" :key="subject" :value="subject">{{ subject }}</option>
      </select>
    </div>

    <div class="field">
      <label for="policy-reason">Reason (optional)</label>
      <input id="policy-reason" v-model="newPolicyForm.reason" placeholder="Temporary stock-taking access" />
    </div>

    <div class="field">
      <label for="policy-conditions">Conditions JSON (optional)</label>
      <textarea id="policy-conditions" v-model="newPolicyForm.conditionsJson" rows="3" placeholder='{"id":{"$eq":"..."}}'></textarea>
    </div>

    <label class="checkbox-row">
      <input v-model="newPolicyForm.inverted" type="checkbox" />
      <span>Inverted (`cannot` rule)</span>
    </label>

    <button class="nav-btn" :disabled="policyCreating" @click="createPolicy">
      {{ policyCreating ? 'Creating...' : 'Create Policy' }}
    </button>

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
        <select :id="`role-${managedUser.id}`" v-model="roleDraftByUser[managedUser.id]">
          <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
        </select>
      </div>

      <button class="nav-btn" :disabled="roleSavingByUser[managedUser.id]" @click="saveUserRole(managedUser.id)">
        {{ roleSavingByUser[managedUser.id] ? 'Saving role...' : 'Save Role' }}
      </button>

      <div class="policy-grid">
        <label v-for="policy in permissionPolicies" :key="policy.id" class="policy-check-row">
          <input
            :checked="(policyDraftByUser[managedUser.id] ?? []).includes(policy.id)"
            type="checkbox"
            @change="togglePolicyForUser(managedUser.id, policy.id)"
          />
          <span>{{ policy.inverted ? 'cannot' : 'can' }} {{ policy.action }} {{ policy.subject }}</span>
        </label>
      </div>

      <button class="scan-btn" :disabled="policySavingByUser[managedUser.id]" @click="saveUserPolicies(managedUser.id)">
        {{ policySavingByUser[managedUser.id] ? 'Saving policies...' : 'Save Policies' }}
      </button>
    </article>
  </section>

  <section class="card">
    <h2>Validation Demo</h2>
    <p>This form validates client-side before sending to DTO-validated API endpoints.</p>

    <div class="field">
      <label for="categoryId">Category UUID v4</label>
      <input id="categoryId" v-model="itemForm.categoryId" placeholder="550e8400-e29b-41d4-a716-446655440001" />
      <p v-if="itemErrors.categoryId" class="error">{{ itemErrors.categoryId }}</p>
    </div>

    <div class="field">
      <label for="sku">SKU</label>
      <input id="sku" v-model="itemForm.sku" placeholder="SPAGHETTI-SAUCE-001" />
      <p v-if="itemErrors.sku" class="error">{{ itemErrors.sku }}</p>
    </div>

    <div class="field">
      <label for="name">Name</label>
      <input id="name" v-model="itemForm.name" placeholder="Spaghetti Sauce" />
      <p v-if="itemErrors.name" class="error">{{ itemErrors.name }}</p>
    </div>

    <div class="field">
      <label for="servings">Servings (optional)</label>
      <input id="servings" v-model="itemForm.servings" placeholder="3" />
      <p v-if="itemErrors.servings" class="error">{{ itemErrors.servings }}</p>
    </div>

    <button class="scan-btn" @click="submitItem">Submit</button>
  </section>
</template>

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
