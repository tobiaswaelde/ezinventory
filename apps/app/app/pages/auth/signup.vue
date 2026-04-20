<template>
  <div class="auth-content">
    <UAuthForm
      title="Sign up"
      description="Create an account."
      :fields="signupFields"
      :submit="{ label: 'Create account', color: 'primary', block: true }"
      :loading="submitting"
      @submit="submit"
    >
      <template #validation>
        <UAlert
          v-if="signupError"
          color="error"
          variant="soft"
          title="Signup Error"
          :description="signupError"
        />
      </template>

      <template #footer>
        <p class="auth-switch">
          Already have an account?
          <NuxtLink to="/auth/signin">Sign in</NuxtLink>
        </p>
      </template>
    </UAuthForm>

    <UAuthForm
      title="Register Passkey"
      description="Optionally register a passkey for passwordless login."
      :fields="passkeyFields"
      :submit="{ label: 'Register passkey', color: 'neutral', variant: 'soft', block: true }"
      :loading="passkeySubmitting"
      @submit="submitPasskeyRegister"
    >
      <template #validation>
        <UAlert
          v-if="passkeyError"
          color="error"
          variant="soft"
          title="Passkey Error"
          :description="passkeyError"
        />
        <UAlert
          v-if="passkeyMessage"
          color="success"
          variant="soft"
          title="Passkey"
          :description="passkeyMessage"
        />
      </template>
    </UAuthForm>
  </div>
</template>


<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui';

definePageMeta({
  layout: 'auth'
});

const { register, registerPasskey, isAuthenticated } = useAuth();

const submitting = ref(false);
const passkeySubmitting = ref(false);
const signupError = ref('');
const passkeyError = ref('');
const passkeyMessage = ref('');

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Deutsch', value: 'de' }
];

const signupFields: AuthFormField[] = [
  {
    name: 'displayName',
    type: 'text',
    label: 'Display Name',
    placeholder: 'Alex Doe',
    autocomplete: 'name',
    required: true
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'admin@example.com',
    autocomplete: 'email',
    required: true
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    placeholder: '************',
    autocomplete: 'new-password',
    required: true
  },
  {
    name: 'preferredLanguage',
    type: 'select',
    label: 'Preferred language',
    items: languageOptions.map((option) => option.value)
  }
];

const passkeyFields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'admin@example.com',
    autocomplete: 'email',
    required: true
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    placeholder: '************',
    autocomplete: 'current-password',
    required: true
  },
  {
    name: 'passkeyDeviceName',
    type: 'text',
    label: 'Passkey device name (optional)',
    placeholder: 'MacBook Touch ID'
  }
];

watch(
  () => isAuthenticated.value,
  async (next) => {
    if (next) {
      await navigateTo('/');
    }
  },
  { immediate: true }
);

const submit = async (
  event: FormSubmitEvent<{ email?: string; password?: string; displayName?: string; preferredLanguage?: string }>
): Promise<void> => {
  signupError.value = '';
  passkeyError.value = '';
  passkeyMessage.value = '';

  const email = event.data.email?.trim() ?? '';
  const password = event.data.password ?? '';
  const displayName = event.data.displayName?.trim() ?? '';
  const preferredLanguage = event.data.preferredLanguage === 'de' ? 'de' : 'en';

  if (!email || !password.trim()) {
    signupError.value = 'Please provide email and password.';
    return;
  }

  if (displayName.length < 2) {
    signupError.value = 'Display name must have at least 2 characters.';
    return;
  }

  submitting.value = true;

  try {
    await register({
      email,
      password,
      displayName,
      preferredLanguage
    });
  } catch {
    signupError.value = 'Registration failed. It may be disabled or user already exists.';
  } finally {
    submitting.value = false;
  }
};

const submitPasskeyRegister = async (
  event: FormSubmitEvent<{ email?: string; password?: string; passkeyDeviceName?: string }>
): Promise<void> => {
  signupError.value = '';
  passkeyError.value = '';
  passkeyMessage.value = '';

  const email = event.data.email?.trim() ?? '';
  const password = event.data.password ?? '';
  const passkeyDeviceName = event.data.passkeyDeviceName?.trim() ?? '';

  if (!email || !password.trim()) {
    passkeyError.value = 'Email and password are required for passkey registration.';
    return;
  }

  passkeySubmitting.value = true;

  try {
    const result = await registerPasskey({
      email,
      password,
      deviceName: passkeyDeviceName || undefined
    });

    passkeyMessage.value = `Passkey registered (${result.credentialId.slice(0, 10)}...).`;
  } catch {
    passkeyError.value = 'Passkey registration failed.';
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

.auth-switch {
  margin: 0.25rem 0 0;
  color: rgb(113 113 122);
  font-size: 0.9rem;
}
</style>
