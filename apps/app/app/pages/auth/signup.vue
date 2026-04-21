<template>
  <div class="grid gap-3">
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
        <p class="mt-1 text-sm text-muted">
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
import {
  validateSignupInput,
  validatePasskeyRegistrationInput,
  normalizeEmail,
  normalizeText
} from '~/utils/auth-validation';

definePageMeta({
  layout: 'auth'
});

const { register, registerPasskey, isAuthenticated } = useAuth();
const { t } = useI18n();

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

  const normalizedEmail = normalizeEmail(event.data.email);
  const password = event.data.password ?? '';
  const displayName = normalizeText(event.data.displayName);
  const preferredLanguage = event.data.preferredLanguage === 'de' ? 'de' : 'en';

  const validationError = validateSignupInput({
    email: normalizedEmail,
    password,
    displayName
  });
  if (validationError) {
    signupError.value = t(validationError as never);
    return;
  }

  submitting.value = true;

  try {
    await register({
      email: normalizedEmail,
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

  const email = normalizeEmail(event.data.email);
  const password = event.data.password ?? '';
  const passkeyDeviceName = normalizeText(event.data.passkeyDeviceName);

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
