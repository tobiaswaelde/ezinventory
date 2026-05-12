<template>
  <UDashboardSidebar
    id="default"
    collapsible
    resizable
    class="bg-elevated/25"
    :ui="{
      footer: 'flex-col items-stretch',
    }"
  >
    <template #header="{ collapsed }">
      <UButton
        color="neutral"
        variant="ghost"
        :avatar="{ src: logo, size: 'lg' }"
        :label="collapsed ? undefined : `OpenCRM`"
        :square="collapsed"
        :class="[!collapsed && 'py-2']"
        :block="collapsed"
        class="w-full p-0.5"
        :to="{ name: Routes.Index }"
      />
    </template>

    <template #default="{ collapsed }">
      <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" icon="i-tabler-search" />
      <LayoutSidebarNavigation :collapsed="collapsed" />
    </template>

    <template #footer="{ collapsed }">
      <LayoutSidebarFooter :collapsed="collapsed" />
    </template>
  </UDashboardSidebar>
</template>

<script setup lang="ts">
import logo from '~/assets/icon/logo.svg';
import { Routes } from '~/types/routes';
</script>
