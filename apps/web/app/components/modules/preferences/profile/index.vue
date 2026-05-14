<template>
  <UPageCard variant="subtle" :ui="{ footer: 'flex flex-row justify-end w-full', body: 'w-full' }">
    <template #header>
      <LayoutPageCardHeader
        icon="i-tabler-user"
        :title="$t('modules.preferences.profile.title')"
        :description="$t('modules.preferences.profile.description')"
      />
    </template>

    <template #body>
      <ModulesPreferencesProfileForm v-model="data" v-model:dirty="dirty" />
    </template>

    <template #footer>
      <UButton
        color="neutral"
        type="submit"
        class="w-fit lg:ms-auto"
        icon="i-tabler:device-floppy"
        :label="$t('common.labels.save')"
        :disabled="!isValid || !dirty"
        :loading="loading"
        @click="handleSave"
      />
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/api/api';
import { useSchema } from '~/composables/api/schema';
import { useToasts } from '~/composables/app/toasts';
import { useAuthStore } from '~/store/auth';
import { updateUserProfileSchema } from '~/types/api/modules/user-profile';
import { buildTitle } from '~/util/app';

const { t } = useI18n();
const authStore = useAuthStore();
const toasts = useToasts();

useHead({
  title: buildTitle(t('modules.preferences.navigation.profile.label'), t('core.navbar.user-menu.preferences.label')),
});

const { data, isValid } = useSchema(updateUserProfileSchema, { ...authStore.currentUser?.profile });

const dirty = ref<boolean>(false);

const loading = ref<boolean>(false);

const handleSave = async () => {
  if (!data.value) return;

  try {
    loading.value = true;

    await useApi().patch('/users/me/profile', data.value);
    await authStore.getCurrentUser();

    data.value = updateUserProfileSchema.parse({ ...authStore.currentUser?.profile });
    dirty.value = false;

    toasts.success(t('modules.preferences.profile.form.actions.success'));
  } catch (err) {
    toasts.error(t('modules.preferences.profile.form.actions.error'));
  } finally {
    loading.value = false;
  }
};
</script>
