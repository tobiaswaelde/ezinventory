<template>
  <UDashboardGroup unit="rem" storage="local" storage-key="ezinventory">
    <LayoutSidebar />

    <UDashboardPanel>
      <LayoutNavbar :title="title" />

      <UDashboardPanelContent>
        <div class="container">
          <slot />
        </div>
      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<script setup lang="ts">
const route = useRoute();
const { t } = useI18n();

const title = computed(() => {
  if (route.path === '/inventory') return t('nav_inventory');
  if (route.path === '/labels') return t('nav_labels');
  if (route.path === '/scan') return t('nav_scan');
  if (route.path === '/settings') return t('nav_settings');
  return t('nav_home');
});
</script>
