<template>
  <UNavigationMenu
    orientation="vertical"
    tooltip
    popover
    :collapsed="collapsed"
    :items="navigationItems"
  />
</template>

<script setup lang="ts">
import { useNavigationItems } from '~/composables/app/navigation-items';

defineProps<{ collapsed?: boolean }>();

const { navigationItems } = useNavigationItems();
</script>

