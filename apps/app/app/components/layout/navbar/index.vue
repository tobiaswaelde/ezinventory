<template>
  <UDashboardNavbar :title="title">
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
