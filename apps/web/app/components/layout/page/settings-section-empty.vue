<template>
  <div
    :class="[
      'flex w-full flex-row items-center justify-start rounded-xl border border-gray-300/30 bg-gray-600/5 px-4 py-4 dark:border-gray-600/30 dark:bg-white/5',
      $props['class'],
    ]"
  >
    <div class="flex flex-1 flex-col items-start gap-6 md:flex-row md:items-center md:gap-8">
      <Icon v-if="icon" class="m-2 h-20 w-20 shrink-0 opacity-20 md:h-28 md:w-28" :name="icon" />

      <div class="flex flex-col items-start">
        <div class="text-highlighted text-base font-semibold text-pretty">{{ title }}</div>
        <div class="text-toned mt-1 text-[15px] text-pretty">
          {{ description }}
        </div>

        <div class="mt-4 flex flex-row items-center gap-4">
          <slot name="buttons">
            <UButton
              v-if="button"
              class="w-auto"
              color="neutral"
              :icon="buttonIcon"
              :label="button"
              :loading="buttonLoading"
              @click="$emit('btnClick')"
            />
          </slot>
        </div>

        <slot name="body" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    class?: string | any;
    description?: string;
    icon?: string;
    button?: string;
    buttonIcon?: string;
    buttonLoading?: boolean;
    variant?: 'subtle' | 'naked' | 'solid' | 'outline' | 'soft' | 'ghost' | undefined;
  }>(),
  {
    variant: 'subtle',
    buttonIcon: 'i-tabler-plus',
    bottonLoading: false,
  },
);
</script>
