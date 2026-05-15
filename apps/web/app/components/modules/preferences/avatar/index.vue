<template>
  <UPageCard variant="subtle" :ui="{ footer: 'flex flex-row justify-end w-full', body: 'w-full' }">
    <template #header>
      <LayoutPageCardHeader
        icon="i-tabler-photo"
        :title="$t('modules.preferences.avatar.title')"
        :description="$t('modules.preferences.avatar.description')"
      />
    </template>

    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4 w-64">
        <UFormField
          name="avatar"
          :label="$t('modules.preferences.avatar.form.fields.avatar.label')"
          :description="$t('modules.preferences.avatar.form.fields.avatar.description')"
        >
          <UFileUpload v-slot="{ open }" v-model="uploadModel" accept="image/*">
            <div class="flex flex-wrap items-center gap-3">
              <UAvatar size="lg" icon="i-lucide-image" :src="avatarPreviewUrl" />
              <UButton
                :label="
                  croppedAvatar
                    ? $t('modules.preferences.avatar.form.actions.select-new')
                    : $t('modules.preferences.avatar.form.actions.select')
                "
                color="neutral"
                variant="outline"
                @click="open()"
              />
            </div>
          </UFileUpload>
        </UFormField>
      </UForm>

      <CommonInputsImageCrop v-if="fileToCrop" v-model:open="cropOpen" :image="fileToCrop" @cropped="handleCropped" />
    </template>

    <template #footer>
      <UButton
        v-if="hasPersistedAvatar"
        color="error"
        variant="outline"
        icon="i-tabler-trash"
        :label="$t('modules.preferences.avatar.form.actions.delete')"
        :loading="loadingDelete"
        @click="handleDeleteAvatar"
      />
      <UButton
        color="neutral"
        type="submit"
        class="w-fit lg:ms-auto"
        icon="i-tabler:device-floppy"
        :label="$t('common.labels.save')"
        :disabled="!croppedAvatar"
        :loading="loading"
        @click="handleSubmit"
      />
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
import { z } from 'zod/v4';
import { useApi } from '~/composables/api/api';
import { useToasts } from '~/composables/app/toasts';
import { useAuthStore } from '~/store/auth';
import { FormatUtil } from '~/util/format';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const { t } = useI18n();
const authStore = useAuthStore();
const toasts = useToasts();

const cropOpen = ref<boolean>(false);
const loading = ref<boolean>(false);
const loadingDelete = ref<boolean>(false);

const fileToCrop = ref<File | undefined>();
const croppedAvatar = ref<File | undefined>();
const croppedPreviewUrl = ref<string | undefined>();

const schema = z.object({
  avatar: z
    .instanceof(File, {
      message: t('modules.preferences.avatar.form.errors.avatar-submit-invalid-file'),
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: t('modules.preferences.avatar.form.errors.avatar-submit-invalid-size', {
        size: FormatUtil.bytes(MAX_FILE_SIZE),
      }),
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: t('modules.preferences.avatar.form.errors.avatar-submit-invalid-type'),
    }),
});
type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  avatar: undefined,
});
const uploadModel = ref<File | undefined>();

const avatarPreviewUrl = computed<string | undefined>(() => {
  return croppedPreviewUrl.value ?? authStore.currentUser?.profile?.avatarUrl;
});
const hasPersistedAvatar = computed<boolean>(() => !!authStore.currentUser?.profile?.avatarUrl);

watch(uploadModel, (value) => {
  if (!value) return;

  state.avatar = value;
  fileToCrop.value = value;
  cropOpen.value = true;
});

const handleCropped = (file: File) => {
  if (croppedPreviewUrl.value) {
    URL.revokeObjectURL(croppedPreviewUrl.value);
  }

  croppedAvatar.value = file;
  croppedPreviewUrl.value = URL.createObjectURL(file);
  state.avatar = undefined;
  uploadModel.value = undefined;
  fileToCrop.value = undefined;
};

watch(cropOpen, (isOpen) => {
  if (!isOpen) {
    state.avatar = undefined;
    uploadModel.value = undefined;
    fileToCrop.value = undefined;
  }
});

onBeforeUnmount(() => {
  if (croppedPreviewUrl.value) {
    URL.revokeObjectURL(croppedPreviewUrl.value);
  }
});

const clearCroppedState = () => {
  if (croppedPreviewUrl.value) {
    URL.revokeObjectURL(croppedPreviewUrl.value);
  }
  croppedAvatar.value = undefined;
  croppedPreviewUrl.value = undefined;
};

const handleSubmit = async () => {
  try {
    const result = await schema.safeParseAsync({ avatar: croppedAvatar.value });

    if (!result.success) {
      for (const issue of result.error.issues) {
        toasts.error(issue.message);
      }
      return;
    }

    const formData = new FormData();
    if (!croppedAvatar.value) {
      toasts.error(t('modules.preferences.avatar.form.errors.avatar-submit-empty-form'));
      return;
    }
    loading.value = true;

    formData.append('file', croppedAvatar.value);
    const res = await useApi().put('/users/me/avatar', formData);

    if (res.status === 200) {
      toasts.success(t('modules.preferences.avatar.form.actions.upload-success'));
      clearCroppedState();
    } else {
      toasts.error(t('modules.preferences.avatar.form.errors.avatar-submit-submission-error'));
    }
    await authStore.getCurrentUser();
  } catch (err) {
    toasts.error(t('modules.preferences.avatar.form.errors.avatar-submit-submission-error'));
  } finally {
    loading.value = false;
  }
};

const handleDeleteAvatar = async () => {
  try {
    loadingDelete.value = true;

    const res = await useApi().delete('/users/me/avatar');
    if (res.status === 200 || res.status === 204) {
      clearCroppedState();
      await authStore.getCurrentUser();
      toasts.success(t('modules.preferences.avatar.form.actions.delete-success'));
    } else {
      toasts.error(t('modules.preferences.avatar.form.errors.avatar-delete-submission-error'));
    }
  } catch (err) {
    toasts.error(t('modules.preferences.avatar.form.errors.avatar-delete-submission-error'));
  } finally {
    loadingDelete.value = false;
  }
};
</script>
