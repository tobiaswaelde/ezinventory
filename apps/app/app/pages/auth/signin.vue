<template>
  <div class="grid gap-3">
    <UAuthForm
      title="Sign in"
      description="Sign in with your password."
      :fields="passwordFields"
      :submit="{ label: 'Sign in', color: 'primary', block: true }"
      :loading="submitting"
      @submit="submit"
    >
      <template #validation>
        <UAlert
          v-if="signinError"
          color="error"
          variant="soft"
          title="Authentication Error"
          :description="signinError"
        />
      </template>

      <template #footer>
        <p class="mt-1 text-sm text-muted">
          No account yet?
          <NuxtLink to="/auth/signup">Create one</NuxtLink>
        </p>
      </template>
    </UAuthForm>

    <UAuthForm
      title="Passkey"
      description="Sign in with your registered passkey."
      :fields="passkeyFields"
      :submit="{ label: 'Sign in with passkey', color: 'neutral', variant: 'soft', block: true }"
      :loading="passkeySubmitting"
      @submit="submitPasskey"
    >
      <template #validation>
        <UAlert
          v-if="passkeyError"
          color="error"
          variant="soft"
          title="Passkey Error"
          :description="passkeyError"
        />
      </template>
    </UAuthForm>
  </div>
</template>


<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui';
import {
  validateSigninInput,
  validatePasskeySigninInput,
  normalizeEmail
} from '~/utils/auth-validation';

definePageMeta({
  layout: 'auth'
});

const { login, loginWithPasskey, isAuthenticated } = useAuth();
const { t } = useI18n();

const submitting = ref(false);
const passkeySubmitting = ref(false);
const signinError = ref('');
const passkeyError = ref('');

const passwordFields: AuthFormField[] = [
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
  }
];

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

const submit = async (event: FormSubmitEvent<{ email?: string; password?: string }>): Promise<void> => {
  signinError.value = '';
  passkeyError.value = '';

  const email = normalizeEmail(event.data.email);
  const password = event.data.password ?? '';

  const validationError = validateSigninInput({ email, password });
  if (validationError) {
    signinError.value = t(validationError as never);
    return;
  }

  submitting.value = true;

  try {
    await login({ email, password });
  } catch {
    signinError.value = t('auth_error_login_failed');
  } finally {
    submitting.value = false;
  }
};

const submitPasskey = async (event: FormSubmitEvent<{ email?: string }>): Promise<void> => {
  signinError.value = '';
  passkeyError.value = '';

  const email = normalizeEmail(event.data.email);

  const validationError = validatePasskeySigninInput({ email });
  if (validationError) {
    passkeyError.value = t(validationError as never);
    return;
  }

  passkeySubmitting.value = true;

  try {
    await loginWithPasskey(email);
  } catch {
    passkeyError.value = t('auth_error_passkey_login_failed');
  } finally {
    passkeySubmitting.value = false;
  }
};
</script>
