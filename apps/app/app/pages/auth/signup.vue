<template>
  <div class="auth-content">
    <h1>Sign up</h1>
    <p class="text-muted">Create an account and optionally register a passkey.</p>

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="soft"
      title="Signup Error"
      :description="errorMessage"
    />
    <UAlert
      v-if="passkeyMessage"
      color="success"
      variant="soft"
      title="Passkey"
      :description="passkeyMessage"
    />

    <div class="field">
      <label for="displayName">Display Name</label>
      <UInput id="displayName" v-model="form.displayName" type="text" autocomplete="name" placeholder="Alex Doe" />
    </div>

    <div class="field">
      <label for="email">Email</label>
      <UInput id="email" v-model="form.email" type="email" autocomplete="email" placeholder="admin@example.com" />
    </div>

    <div class="field">
      <label for="password">Password</label>
      <UInput id="password" v-model="form.password" type="password" autocomplete="new-password" placeholder="************" />
    </div>

    <div class="field">
      <label for="preferredLanguage">Preferred language</label>
      <USelect id="preferredLanguage" v-model="form.preferredLanguage" :items="['en', 'de']" />
    </div>

    <div class="auth-actions">
      <UButton color="primary" :loading="submitting" @click="submit">Create account</UButton>
    </div>

    <div class="field">
      <label for="passkeyDeviceName">Passkey device name (optional)</label>
      <UInput id="passkeyDeviceName" v-model="form.passkeyDeviceName" type="text" placeholder="MacBook Touch ID" />
    </div>

    <UButton color="neutral" variant="soft" :loading="passkeySubmitting" @click="submitPasskeyRegister">
      Register passkey
    </UButton>

    <p class="auth-switch">
      Already have an account?
      <NuxtLink to="/auth/signin">Sign in</NuxtLink>
    </p>
  </div>
</template>


<script setup lang="ts">
definePageMeta({
  layout: 'auth'
});

const { register, registerPasskey, isAuthenticated } = useAuth();

const submitting = ref(false);
const passkeySubmitting = ref(false);
const errorMessage = ref('');
const passkeyMessage = ref('');

const form = reactive({
  email: '',
  password: '',
  displayName: '',
  preferredLanguage: 'en' as 'de' | 'en',
  passkeyDeviceName: ''
});

watch(
  () => isAuthenticated.value,
  async (next) => {
    if (next) {
      await navigateTo('/');
    }
  },
  { immediate: true }
);

const submit = async (): Promise<void> => {
  errorMessage.value = '';
  passkeyMessage.value = '';

  if (!form.email.trim() || !form.password.trim()) {
    errorMessage.value = 'Please provide email and password.';
    return;
  }

  if (form.displayName.trim().length < 2) {
    errorMessage.value = 'Display name must have at least 2 characters.';
    return;
  }

  submitting.value = true;

  try {
    await register({
      email: form.email.trim(),
      password: form.password,
      displayName: form.displayName.trim(),
      preferredLanguage: form.preferredLanguage
    });
  } catch {
    errorMessage.value = 'Registration failed. It may be disabled or user already exists.';
  } finally {
    submitting.value = false;
  }
};

const submitPasskeyRegister = async (): Promise<void> => {
  errorMessage.value = '';
  passkeyMessage.value = '';

  if (!form.email.trim() || !form.password.trim()) {
    errorMessage.value = 'Email and password are required for passkey registration.';
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
    errorMessage.value = 'Passkey registration failed.';
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
