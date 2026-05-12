<template>
  <UNavigationMenu orientation="vertical" tooltip popover :collapsed="collapsed" :items="navigationItems" />
  <UDashboardSearch
    :groups="[{ id: 'links', items: commandPaletteItems }]"
    :fuse="{ resultLimit: commandPaletteItems.length }"
  />
</template>

<script setup lang="ts">
import { useNavigationItems } from '~/composables/app/navigation';

defineProps<{ collapsed?: boolean }>();

const { navigationItems, commandPaletteItems } = useNavigationItems();
</script>
