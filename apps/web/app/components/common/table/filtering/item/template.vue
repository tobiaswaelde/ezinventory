<template>
  <li class="flex flex-row gap-2 items-center">
    <span class="grow truncate text-sm text-muted">
      {{ label }}
    </span>

    <div>
      <slot name="operator"></slot>
    </div>
    <div>
      <slot name="value"></slot>
    </div>

    <UButton
      color="error"
      variant="outline"
      size="sm"
      icon="i-tabler-x"
      :aria-label="$t('common.table.filtering.actions.remove.label')"
      @click="handleRemove"
    />
  </li>
</template>

<script setup lang="ts">
import type { Filtering } from '~/types/table/filtering';

const props = defineProps<{
  id: string;
  label: string;
}>();
const filtering = defineModel<Filtering>('filtering', { required: true });

const handleRemove = () => {
  filtering.value.filters = filtering.value.filters.filter((f) => f.id !== props.id);
};
</script>
