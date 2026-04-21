<template>
  <div class="grid gap-3">
    <UAuthForm
      title="Sign up"
      description="Create an account."
      :fields="signupFields"
      :submit="signupSubmit"
      :loading="submitting"
      @submit="submit"
    >
      <template #description>
        <p class="text-sm text-muted">
          Create an account.
        </p>
        <UAlert
          v-if="signupBlockedReason"
          class="mt-3"
          color="warning"
          variant="soft"
          title="Registration unavailable"
          :description="signupBlockedReason"
        />
      </template>

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
  </div>
</template>


<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui';
import {
  validateSignupInput,
  normalizeEmail,
  normalizeText
} from '~/utils/auth-validation';

definePageMeta({
  layout: 'auth'
});

const { register, isAuthenticated } = useAuth();
const { t } = useI18n();
const { getSetupStatus } = useApiClient();

const submitting = ref(false);
const signupError = ref('');
const signupBlockedReason = ref('');
const signupStatusLoading = ref(true);

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

const signupSubmit = computed(() => ({
  label: signupStatusLoading.value ? 'Checking setup...' : 'Create account',
  color: 'primary' as const,
  block: true,
  disabled: signupStatusLoading.value || submitting.value || Boolean(signupBlockedReason.value)
}));

onMounted(async () => {
  signupStatusLoading.value = true;

  try {
    const status = await getSetupStatus();

    if (!status.setupInitialized) {
      signupBlockedReason.value = t('auth_error_setup_not_initialized');
      return;
    }

    if (status.registrationMode !== 'OPEN') {
      signupBlockedReason.value = t('auth_error_registration_disabled');
      return;
    }

    signupBlockedReason.value = '';
  } catch {
    signupBlockedReason.value = '';
  } finally {
    signupStatusLoading.value = false;
  }
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

const submit = async (
  event: FormSubmitEvent<{ email?: string; password?: string; displayName?: string; preferredLanguage?: string }>
): Promise<void> => {
  signupError.value = '';

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

  if (signupBlockedReason.value) {
    signupError.value = signupBlockedReason.value;
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
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number } | undefined)?.statusCode;

    if (statusCode === 403) {
      signupError.value = t('auth_error_registration_disabled');
    } else if (statusCode === 404) {
      signupError.value = t('auth_error_setup_not_initialized');
    } else if (statusCode === 409) {
      signupError.value = t('auth_error_user_already_exists');
    } else {
      signupError.value = t('auth_error_registration_failed');
    }
  } finally {
    submitting.value = false;
  }
};
</script>
