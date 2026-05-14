<template>
  <UForm ref="formRef" :schema="updateUserProfileSchema" :state="data" class="grid grid-cols-2 gap-4">
    <UFormField name="profile.firstname" :label="$t('modules.users.fields.firstname.label')" required>
      <UInput
        v-model="data.firstname"
        leading-icon="i-tabler-user"
        :placeholder="$t('modules.users.fields.firstname.placeholder')"
      />
    </UFormField>

    <UFormField name="profile.lastname" :label="$t('modules.users.fields.lastname.label')" required>
      <UInput
        v-model="data.lastname"
        leading-icon="i-tabler-user"
        :placeholder="$t('modules.users.fields.lastname.placeholder')"
      />
    </UFormField>
  </UForm>
</template>

<script setup lang="ts">
import { useFormDirty } from '~/composables/helpers/form-dirty';
import { usePreventLeave } from '~/composables/helpers/prevent-leave';
import { updateUserProfileSchema, type UpdateUserProfileDTO } from '~/types/api/modules/user-profile';

const data = defineModel<UpdateUserProfileDTO>({ required: true });
const dirty = defineModel<boolean>('dirty');

const formRef = useTemplateRef('formRef');
useFormDirty(formRef, dirty);
usePreventLeave(dirty);
</script>
