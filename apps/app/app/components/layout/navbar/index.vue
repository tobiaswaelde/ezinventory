<template>
  <UDashboardNavbar :title="title" :ui="{ right: 'gap-3' }">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>

    <template #right>
      <LayoutNavbarUserMenu />
    </template>
  </UDashboardNavbar>
</template>

<script setup lang="ts">
defineProps<{ title: string }>();
</script>
