<template>
  <UAuthForm
    ref="authForm"
    :title="t('modules.auth.signin.title')"
    icon="i-tabler-user"
    :ui="{ description: 'flex flex-col' }"
    :fields="fields"
    :loading="loading"
    @submit="handleSubmit"
  >
    <template #description>
      <p class="text-center mb-4">{{ t('modules.auth.signin.paragraph') }}</p>
      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        icon="i-tabler-exclamation-circle"
        class="text-left mb-4"
        :title="t('common.labels.error')"
        :description="error"
      />
    </template>

    <template #submit="{ loading }">
      <div class="grid gap-4">
        <UButton
          block
          type="submit"
          color="primary"
          :loading="loading"
          :label="t('modules.auth.signin.form.actions.signin')"
          icon="i-tabler-login"
        />
      </div>
    </template>
  </UAuthForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { useErrors } from '~/composables/api/errors';
import { useAuthStore } from '~/store/auth';
import { type SigninDTO } from '~/types/api/modules/auth';
import { Routes } from '~/types/routes';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { getErrorMessage } = useErrors();

const fields = computed(() => {
  const arr: any[] = [
    {
      name: 'email',
      icon: 'i-tabler-mail',
      type: 'email' as const,
      label: t('modules.auth.signin.form.fields.email.label'),
      placeholder: t('modules.auth.signin.form.fields.email.placeholder'),
      autocomplete: 'email',
    },
    {
      name: 'password',
      icon: 'i-tabler-lock',
      type: 'password' as const,
      label: t('modules.auth.signin.form.fields.password.label'),
      placeholder: t('modules.auth.signin.form.fields.password.placeholder'),
      autocomplete: 'current-password',
    },
  ];

  if (authStore.mfaPending) {
    arr.push({
      name: 'totp',
      type: 'text' as const,
      label: t('modules.auth.signin.form.fields.otp.label'),
      placeholder: t('modules.auth.signin.form.fields.otp.placeholder'),
      autocomplete: 'one-time-code',
    });
  }

  return arr;
});

const loading = ref<boolean>(false);
const error = ref<string | null>(null);

const handleSubmit = async (ev: FormSubmitEvent<SigninDTO>) => {
  try {
    loading.value = true;

    await authStore.signinWithEmailAndPassword({
      email: ev.data.email,
      password: ev.data.password,
      totp: ev.data.totp,
    });

    finishSignin();
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
};

const finishSignin = () => {
  // if user comes from a specific page, redirect to that page after login
  const redirect = route.query.redirect as string | null;
  if (redirect) {
    router.replace(redirect);
  } else {
    router.replace({ name: Routes.Index });
  }
};
</script>
