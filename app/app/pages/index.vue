<script setup lang="ts">
const { theme, loadTheme, setTheme } = useTheme();
const { login, register, registerPasskey, loginWithPasskey, logout, isAuthenticated, user, initialized } = useAuth();

const mode = ref<'login' | 'register'>('login');
const form = reactive({
  email: '',
  password: '',
  displayName: '',
  preferredLanguage: 'en' as 'de' | 'en',
  passkeyDeviceName: ''
});

const submitting = ref(false);
const passkeySubmitting = ref(false);
const errorMessage = ref('');
const passkeyMessage = ref('');

onMounted(() => {
  loadTheme();
});

const submitAuth = async (): Promise<void> => {
  errorMessage.value = '';
  passkeyMessage.value = '';

  if (!form.email.trim() || !form.password.trim()) {
    errorMessage.value = 'Please provide email and password.';
    return;
  }

  if (mode.value === 'register' && form.displayName.trim().length < 2) {
    errorMessage.value = 'Display name must have at least 2 characters.';
    return;
  }

  submitting.value = true;

  try {
    if (mode.value === 'login') {
      await login({ email: form.email.trim(), password: form.password });
    } else {
      await register({
        email: form.email.trim(),
        password: form.password,
        displayName: form.displayName.trim(),
        preferredLanguage: form.preferredLanguage
      });
    }

    form.password = '';
  } catch {
    errorMessage.value =
      mode.value === 'login'
        ? 'Login failed. Please verify your credentials.'
        : 'Registration failed. It may be disabled or the user already exists.';
  } finally {
    submitting.value = false;
  }
};

const submitPasskeyLogin = async (): Promise<void> => {
  errorMessage.value = '';
  passkeyMessage.value = '';

  if (!form.email.trim()) {
    errorMessage.value = 'Email is required for passkey login.';
    return;
  }

  passkeySubmitting.value = true;

  try {
    await loginWithPasskey(form.email.trim());
    passkeyMessage.value = 'Passkey login successful.';
  } catch {
    errorMessage.value = 'Passkey login failed. Ensure a passkey is already registered for this user.';
  } finally {
    passkeySubmitting.value = false;
  }
};

const submitPasskeyRegister = async (): Promise<void> => {
  errorMessage.value = '';
  passkeyMessage.value = '';

  if (!form.email.trim() || !form.password.trim()) {
    errorMessage.value = 'Email and password are required to register a passkey.';
    return;
  }

  passkeySubmitting.value = true;

  try {
    const result = await registerPasskey({
      email: form.email.trim(),
      password: form.password,
      deviceName: form.passkeyDeviceName.trim() || undefined
    });

    passkeyMessage.value = `Passkey registered (${result.credentialId.slice(0, 10)}...).`;
  } catch {
    errorMessage.value = 'Passkey registration failed. Verify email/password and platform passkey support.';
  } finally {
    passkeySubmitting.value = false;
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
        <label>Mode</label>
        <select v-model="mode">
          <option value="login">Login</option>
          <option value="register">Register</option>
        </select>
      </div>

      <div v-if="mode === 'register'" class="field">
        <label for="displayName">Display Name</label>
        <input id="displayName" v-model="form.displayName" type="text" autocomplete="name" placeholder="Alex Doe" />
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" autocomplete="email" placeholder="admin@example.com" />
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" autocomplete="current-password" placeholder="************" />
      </div>

      <div v-if="mode === 'register'" class="field">
        <label for="preferredLanguage">Preferred Language</label>
        <select id="preferredLanguage" v-model="form.preferredLanguage">
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
      </div>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="passkeyMessage">{{ passkeyMessage }}</p>

      <button class="scan-btn" :disabled="submitting" @click="submitAuth">
        {{ submitting ? 'Submitting...' : mode === 'login' ? 'Login' : 'Register' }}
      </button>

      <hr style="margin: 1rem 0; border: 0; border-top: 1px solid #ddd" />

      <div class="field">
        <label for="passkeyDeviceName">Passkey Device Name (optional)</label>
        <input id="passkeyDeviceName" v-model="form.passkeyDeviceName" type="text" placeholder="MacBook Touch ID" />
      </div>

      <button class="nav-btn" :disabled="passkeySubmitting" @click="submitPasskeyLogin">
        {{ passkeySubmitting ? 'Processing...' : 'Login with Passkey' }}
      </button>
      <button class="nav-btn" :disabled="passkeySubmitting" @click="submitPasskeyRegister">
        {{ passkeySubmitting ? 'Processing...' : 'Register Passkey' }}
      </button>
    </template>
  </section>

  <section class="card">
    <h2>Quick Navigation</h2>
    <p>Use the center scan button in the mobile navbar for QR-first workflows.</p>
  </section>
</template>
