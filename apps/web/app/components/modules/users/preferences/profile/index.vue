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
        icon="i-tabler-user"
        :title="$t('modules.users.preferences.profile.title')"
        :description="$t('modules.users.preferences.profile.description')"
      />
    </template>

    <template #body>
      <ModulesPreferencesProfileForm v-model="data" v-model:dirty="dirty" />
    </template>

    <template #footer>
      <CommonButtonsSave :disabled="!isValid || !dirty" :loading="loading" @click="handleSave" />
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
import { useRouteParams } from '@vueuse/router';
import { useApi } from '~/composables/api/api';
import { useSchema } from '~/composables/api/schema';
import { useToasts } from '~/composables/app/toasts';
import { updateUserProfileSchema, type UserProfileDTO } from '~/types/api/modules/user-profile';
import { UserContextKey } from '~/types/symbols/user';
import { buildTitle } from '~/util/app';
import { injectStrict } from '~/util/inject-strict';

const props = defineProps<{
  userId: string;
  profile: UserProfileDTO;
}>();

const { t } = useI18n();
const toasts = useToasts();
const { refresh } = injectStrict(UserContextKey);

useHead({
  title: buildTitle(
    t('modules.users.preferences.navigation.profile.label'),
    t('core.navbar.user-menu.preferences.label'),
  ),
});

const { data, isValid } = useSchema(updateUserProfileSchema, { ...props.profile });

const dirty = ref<boolean>(false);

const loading = ref<boolean>(false);

const handleSave = async () => {
  if (!data.value) return;

  try {
    loading.value = true;

    await useApi().patch(`/users/${props.userId}/profile`, data.value);
    await refresh();

    data.value = updateUserProfileSchema.parse({ ...props.profile });
    dirty.value = false;

    toasts.success(t('modules.users.preferences.profile.form.actions.success'));
  } catch (err) {
    toasts.error(t('modules.users.preferences.profile.form.actions.error'));
  } finally {
    loading.value = false;
  }
};
</script>
