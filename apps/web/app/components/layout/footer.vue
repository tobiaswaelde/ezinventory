<template>
  <div :class="'border-t border-default'">
    <div :class="'w-full h-14 p-4 sm:px-6 py-3 flex items-center justify-between'">
      <slot name="default">
        <div :class="ui?.slots?.left">
          <slot name="left"> </slot>
        </div>

        <div :class="ui?.slots?.center">
          <slot name="center"> </slot>
        </div>

        <div :class="ui?.slots?.right">
          <slot name="right"> </slot>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  ui?: {
    slots?: {
      left?: string;
      center?: string;
      right?: string;
    };
  };
}>();
</script>
