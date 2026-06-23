<template>
  <UPageCard
    variant="subtle"
    :ui="{
      footer: 'flex flex-row justify-end w-full',
      body: 'w-full',
    }"
  >
    <template #header>
      <LayoutPageCardHeader
        icon="i-tabler-lock"
        :title="$t('modules.users.security.password.title')"
        :description="$t('modules.users.security.password.description')"
      />
    </template>

    <template #body>
      <UForm ref="formRef" class="grid gap-4 w-full" :schema="schema" :state="data">
        <UFormField name="password" :label="$t('modules.users.security.password.fields.password.label')" required>
          <CommonInputsPassword v-model="data.password" autocomplete="new-password" />
        </UFormField>

        <UFormField
          name="confirmPassword"
          :label="$t('modules.users.security.password.fields.confirm-password.label')"
          required
        >
          <CommonInputsPassword v-model="data.confirmPassword" autocomplete="new-password" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <CommonButtonsSave :disabled="!isValid || !dirty" :loading="loading" @click="handleSubmit" />
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
import { z } from 'zod/v4';
import { useApi } from '~/composables/api/api';
import { useErrors } from '~/composables/api/errors';
import { useSchema } from '~/composables/api/schema';
import { useToasts } from '~/composables/app/toasts';
import { useFormDirty } from '~/composables/helpers/form-dirty';
import { usePreventLeave } from '~/composables/helpers/prevent-leave';
import { UserContextKey } from '~/types/symbols/user';
import { injectStrict } from '~/util/inject-strict';

const props = defineProps<{
  userId: string;
}>();

const { t } = useI18n();
const errors = useErrors();
const toasts = useToasts();
const { refresh } = injectStrict(UserContextKey);

const schema = z
  .object({
    password: z.string().max(72).nonempty().default(''),
    confirmPassword: z.string().max(72).nonempty().default(''),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: t('modules.users.security.password.errors.password-mismatch'),
    path: ['confirmPassword'],
  });

const formRef = useTemplateRef('formRef');
const dirty = ref<boolean>(false);
useFormDirty(formRef, dirty);
usePreventLeave(dirty);

const { data, isValid } = useSchema(schema);
const loading = ref<boolean>(false);

const handleSubmit = async () => {
  try {
    loading.value = true;

    await useApi().patch(`/users/${props.userId}/password`, {
      password: data.value.password,
    });
    await refresh();

    data.value = schema.parse({});
    dirty.value = false;

    toasts.success(t('modules.users.security.password.actions.success'));
  } catch (err) {
    errors.handleError(err, t('modules.users.security.password.actions.error'));
  } finally {
    loading.value = false;
  }
};
</script>
