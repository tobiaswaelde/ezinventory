<template></template>

<script setup lang="ts">
import { Routes } from '~/types/routes';

navigateTo(
  { name: Routes.Dashboard },
  {
    replace: true,
    // redirectCode: 301
  },
);
</script>
