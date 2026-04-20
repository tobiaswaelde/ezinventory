<template>
  <div class="auth-content">
    <h1>Sign in</h1>
    <p class="text-muted">Sign in with password or passkey.</p>

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="soft"
      title="Authentication Error"
      :description="errorMessage"
    />

    <div class="field">
      <label for="email">Email</label>
      <UInput id="email" v-model="form.email" type="email" autocomplete="email" placeholder="admin@example.com" />
    </div>

    <div class="field">
      <label for="password">Password</label>
      <UInput id="password" v-model="form.password" type="password" autocomplete="current-password" placeholder="************" />
    </div>

    <div class="auth-actions">
      <UButton color="primary" :loading="submitting" @click="submit">Sign in</UButton>
      <UButton color="neutral" variant="soft" :loading="passkeySubmitting" @click="submitPasskey">
        Sign in with passkey
      </UButton>
    </div>

    <p class="auth-switch">
      No account yet?
      <NuxtLink to="/auth/signup">Create one</NuxtLink>
    </p>
  </div>
</template>


<script setup lang="ts">
definePageMeta({
  layout: 'auth'
});

const { login, loginWithPasskey, isAuthenticated } = useAuth();

const submitting = ref(false);
const passkeySubmitting = ref(false);
const errorMessage = ref('');

const form = reactive({
  email: '',
  password: ''
});

watch(
  () => isAuthenticated.value,
  async (next) => {
    if (next) {
      const redirect = useRoute().query.redirect;
      await navigateTo(typeof redirect === 'string' ? redirect : '/');
    }
  },
  { immediate: true }
);

const submit = async (): Promise<void> => {
  errorMessage.value = '';

  if (!form.email.trim() || !form.password.trim()) {
    errorMessage.value = 'Please provide email and password.';
    return;
  }

  submitting.value = true;

  try {
    await login({ email: form.email.trim(), password: form.password });
  } catch {
    errorMessage.value = 'Login failed. Please verify your credentials.';
  } finally {
    submitting.value = false;
  }
};

const submitPasskey = async (): Promise<void> => {
  errorMessage.value = '';

  if (!form.email.trim()) {
    errorMessage.value = 'Email is required for passkey login.';
    return;
  }

  passkeySubmitting.value = true;

  try {
    await loginWithPasskey(form.email.trim());
  } catch {
    errorMessage.value = 'Passkey login failed.';
  } finally {
    passkeySubmitting.value = false;
  }
};
</script>


<style scoped>
.auth-content {
  display: grid;
  gap: 0.75rem;
}

.auth-content h1 {
  margin: 0;
}

.auth-actions {
  display: grid;
  gap: 0.5rem;
}

.auth-switch {
  margin: 0.25rem 0 0;
  color: rgb(113 113 122);
  font-size: 0.9rem;
}
</style>
