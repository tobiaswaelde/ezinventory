<template>
  <div class="flex flex-col gap-1">
    <div class="flex flex-row items-center gap-2">
      <UIcon v-if="icon" class="size-5 shrink-0" :name="icon" :class="iconColor" :aria-hidden="true" />
      <span class="text-highlighted text-base font-semibold text-pretty">
        {{ title }}
      </span>
    </div>
    <span v-if="description" class="text-muted text-[15px] text-pretty">
      {{ description }}
    </span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description?: string;
    icon?: string;
    iconColor?: string;
  }>(),
  {
    iconColor: 'text-primary',
  },
);
</script>
