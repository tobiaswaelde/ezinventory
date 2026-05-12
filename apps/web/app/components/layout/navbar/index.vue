<template>
  <UDashboardNavbar :title="title" :ui="{ right: 'gap-3' }">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>
    <template #right>
      <!-- <LayoutNavbarActions /> -->
      <!-- <LayoutNavbarNotifications /> -->
      <LayoutNavbarUserMenu />
    </template>
  </UDashboardNavbar>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
}>();
</script>
