<template>
  <div class="grid gap-4">
    <ModulesAuthHeader title="Sign in" description="Sign in with your password or passkey." />

    <UAuthForm
      title="Sign in"
      :fields="passwordFields"
      :submit="passwordSubmit"
      :loading="submitting"
      @submit="submitPassword"
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
      :fields="passkeyFields"
      :submit="passkeySubmit"
      :loading="passkeySubmitting"
      @submit="submitPasskey"
    >
      <template #description>
        <p class="text-sm text-muted">
          Sign in with your registered passkey.
        </p>
        <UAlert
          v-if="!passkeySupported"
          class="mt-3"
          color="warning"
          variant="soft"
          title="Passkeys unavailable"
          :description="t('auth_error_passkey_not_supported')"
        />
      </template>
    </UAuthForm>
  </div>
</template>

<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui';
import {
  normalizeEmail,
  validatePasskeySigninInput,
  validateSigninInput
} from '~/utils/auth-validation';

const { login, loginWithPasskey, isAuthenticated } = useAuth();
const { t } = useI18n();
const route = useRoute();

const submitting = ref(false);
const passkeySubmitting = ref(false);
const signinError = ref('');
const passkeySupported = ref(true);

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

const passwordSubmit = computed(() => ({
  label: 'Sign in',
  color: 'primary' as const,
  block: true,
  disabled: passkeySubmitting.value
}));

const passkeySubmit = computed(() => ({
  label: 'Sign in with passkey',
  color: 'neutral' as const,
  variant: 'soft' as const,
  block: true,
  disabled: submitting.value || !passkeySupported.value
}));

onMounted(() => {
  passkeySupported.value = typeof window !== 'undefined' && 'PublicKeyCredential' in window;
});

watch(
  () => isAuthenticated.value,
  async (next) => {
    if (next) {
      const redirect = route.query.redirect;
      await navigateTo(typeof redirect === 'string' ? redirect : '/');
    }
  },
  { immediate: true }
);

const submitPassword = async (event: FormSubmitEvent<{ email?: string; password?: string }>): Promise<void> => {
  signinError.value = '';

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

  if (!passkeySupported.value) {
    signinError.value = t('auth_error_passkey_not_supported');
    return;
  }

  const email = normalizeEmail(event.data.email);

  const validationError = validatePasskeySigninInput({ email });
  if (validationError) {
    signinError.value = t(validationError as never);
    return;
  }

  passkeySubmitting.value = true;

  try {
    await loginWithPasskey(email);
  } catch {
    signinError.value = t('auth_error_passkey_login_failed');
  } finally {
    passkeySubmitting.value = false;
  }
};
</script>
