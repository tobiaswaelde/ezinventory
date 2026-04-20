<template>
  <UDashboardSidebar id="default" collapsible resizable class="bg-elevated/40" :ui="{ footer: 'flex-col items-stretch' }">
    <template #header="slotProps">
      <UButton
        color="neutral"
        variant="ghost"
        :label="slotProps?.collapsed ? undefined : 'EZ Inventory'"
        :square="Boolean(slotProps?.collapsed)"
        :class="[!slotProps?.collapsed && 'py-2']"
        :block="Boolean(slotProps?.collapsed)"
        class="w-full p-0.5"
        to="/"
      />
    </template>

    <template #default="slotProps">
      <UDashboardSearchButton :collapsed="Boolean(slotProps?.collapsed)" class="bg-transparent ring-default" icon="i-tabler-search" />
      <LayoutSidebarNavigation :collapsed="Boolean(slotProps?.collapsed)" />
    </template>

    <template #footer="slotProps">
      <UNavigationMenu
        orientation="vertical"
        tooltip
        popover
        :collapsed="Boolean(slotProps?.collapsed)"
        :items="[
          {
            label: t('nav_scan'),
            icon: 'i-tabler-scan',
            to: '/scan'
          },
          {
            label: 'API Docs',
            icon: 'i-tabler-api',
            to: apiDocsUrl.value,
            target: '_blank'
          }
        ]"
      />
    </template>
  </UDashboardSidebar>
</template>

<script setup lang="ts">
const { t } = useI18n();
const config = useRuntimeConfig();

const apiDocsUrl = computed(() => {
  return `${String(config.public.apiBaseUrl).replace(/\/api\/v1$/, '')}/api/docs`;
});
</script>
