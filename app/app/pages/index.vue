<script setup lang="ts">
const { theme, loadTheme, setTheme } = useTheme();
const { login, logout, isAuthenticated, user, initialized } = useAuth();

const form = reactive({
  email: '',
  password: ''
});

const submitting = ref(false);
const errorMessage = ref('');

onMounted(() => {
  loadTheme();
});

const submitLogin = async (): Promise<void> => {
  errorMessage.value = '';

  if (!form.email.trim() || !form.password.trim()) {
    errorMessage.value = 'Please provide email and password.';
    return;
  }

  submitting.value = true;

  try {
    await login({ email: form.email.trim(), password: form.password });
    form.password = '';
  } catch {
    errorMessage.value = 'Login failed. Please verify your credentials.';
  } finally {
    submitting.value = false;
  }
};

const submitLogout = async (): Promise<void> => {
  await logout();
};
</script>

<template>
  <section class="card">
    <h1>EZ Inventory</h1>
    <p>Mobile-first inventory management bootstrap is running.</p>
    <p><strong>Theme:</strong> {{ theme }}</p>
    <button class="nav-btn" @click="setTheme(theme === 'light' ? 'dark' : 'light')">
      Toggle Theme
    </button>
  </section>

  <section class="card">
    <h2>Authentication</h2>

    <p v-if="!initialized">Checking local session...</p>

    <template v-else-if="isAuthenticated && user">
      <p><strong>Signed in as:</strong> {{ user.email }}</p>
      <p><strong>Role:</strong> {{ user.role }}</p>
      <button class="nav-btn" @click="submitLogout">Logout</button>
    </template>

    <template v-else>
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" autocomplete="email" placeholder="admin@example.com" />
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" autocomplete="current-password" placeholder="************" />
      </div>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <button class="scan-btn" :disabled="submitting" @click="submitLogin">
        {{ submitting ? 'Signing in...' : 'Login' }}
      </button>
    </template>
  </section>

  <section class="card">
    <h2>Quick Navigation</h2>
    <p>Use the center scan button in the mobile navbar for QR-first workflows.</p>
  </section>
</template>
