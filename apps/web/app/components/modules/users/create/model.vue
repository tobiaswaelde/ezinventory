<template>
  <CommonButtonsNew @click="open = true" />

  <CommonFormModal
    v-model:open="open"
    :title="$t('modules.users.create.modal.title')"
    :description="$t('modules.users.create.modal.description')"
    :dismissable="canClose"
    :is-valid="isValid"
    :submit-fn="handleSubmit"
    @error="useErrors().handleError"
  >
    <ModulesUsersCreateForm v-model="data" @update:dirty="canClose = !$event" />
  </CommonFormModal>
</template>

<script setup lang="ts">
import { useErrors } from '~/composables/api/errors';
import { useModuleApi } from '~/composables/api/module-api';
import { useSchema } from '~/composables/api/schema';
import { useModal } from '~/composables/app/modal';
import { createUserSchema, type UserDTO } from '~/types/api/modules/user';

const emit = defineEmits<{
  (e: 'created', data: UserDTO): void;
}>();

const { open, canClose } = useModal();
const { data, isValid } = useSchema(createUserSchema);

const handleSubmit = async () => {
  const res = await useModuleApi('users').create(data.value);
  return emit('created', res.data);
};
</script>
