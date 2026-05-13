<template>
  <UForm :schema="createUserSchema" :state="data" class="grid grid-cols-2 gap-4" ref="formRef">
    <UFormField name="role" :label="$t('modules.users.fields.role.label')" required class="col-span-2">
      <EnumsUserRoleSelect v-model="data.role" class="w-full" />
    </UFormField>

    <UFormField name="profile.firstname" :label="$t('modules.users.fields.firstname.label')" required>
      <UInput
        v-model="data.profile.firstname"
        leading-icon="i-tabler-user"
        :placeholder="$t('modules.users.fields.firstname.placeholder')"
      />
    </UFormField>

    <UFormField name="profile.lastname" :label="$t('modules.users.fields.lastname.label')" required>
      <UInput
        v-model="data.profile.lastname"
        leading-icon="i-tabler-user"
        :placeholder="$t('modules.users.fields.lastname.placeholder')"
      />
    </UFormField>

    <UFormField name="email" :label="$t('modules.users.fields.email.label')" required class="col-span-2">
      <UInput
        type="email"
        v-model="data.email"
        :placeholder="$t('modules.users.fields.email.placeholder')"
        leading-icon="i-tabler-at"
      />
    </UFormField>

    <UFormField name="password" :label="$t('modules.users.fields.password.label')" required class="col-span-2">
      <CommonInputsPassword
        v-model="data.password"
        :placeholder="$t('modules.users.fields.password.placeholder')"
        leading-icon="i-tabler-lock"
      />
    </UFormField>

    <USeparator class="col-span-2" :label="$t('modules.users.fields.preferences.label')" />

    <UFormField name="preferences.language" :label="$t('modules.users.fields.preferences.language')">
      <CommonInputsSelectLanguage v-model="data.preferences.language" />
    </UFormField>

    <UFormField name="preferences.timezone" :label="$t('modules.users.fields.preferences.timezone')">
      <CommonInputsSelectTimezone v-model="data.preferences.timezone" />
    </UFormField>
  </UForm>
</template>

<script setup lang="ts">
import { useFormDirty } from '~/composables/helpers/form-dirty';
import { usePreventLeave } from '~/composables/helpers/prevent-leave';
import { createUserSchema, type CreateUserDTO } from '~/types/api/modules/user';

const data = defineModel<CreateUserDTO>({ required: true });
const dirty = defineModel<boolean>('dirty');

const formRef = useTemplateRef('formRef');
useFormDirty(formRef, dirty);
usePreventLeave(dirty);
</script>
