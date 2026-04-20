<script setup lang="ts">
import type { RegistrationMode } from '~/types/api/setup';

const { user } = useAuth();
const { createItem, createUserByAdmin, getSetupStatus, updateRegistrationMode } = useApiClient();

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
  role: 'STAFF' as 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER',
  preferredLanguage: 'en' as 'de' | 'en'
});
const userSaving = ref(false);
const userMessage = ref('');

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
  } catch {
    userMessage.value = 'Could not create user. Check permissions or duplicate email.';
  } finally {
    userSaving.value = false;
  }
};

onMounted(() => {
  void loadSetupStatus();
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
        <option value="VIEWER">VIEWER</option>
        <option value="STAFF">STAFF</option>
        <option value="MANAGER">MANAGER</option>
        <option value="ADMIN">ADMIN</option>
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
