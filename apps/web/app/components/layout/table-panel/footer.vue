<template>
  <LayoutFooter :ui="{ slots: { left: 'flex items-center', right: 'flex items-center gap-1.5' } }">
    <template #left>
      <span v-if="totalItems" class="hidden sm:flex text-sm text-muted">
        {{ $t('common.table.pagination.show-items', { start: rowStart, end: rowEnd, total: totalItems }) }}
      </span>
    </template>

    <template #right>
      <USelect v-model="itemsPerPage" :items="[1, 2, 10, 25, 50, 100]" class="w-24" />
      <UPagination
        :items-per-page="itemsPerPage"
        :total="totalItems"
        v-model:page="page"
        first-icon="i-tabler-chevrons-left"
        last-icon="i-tabler-chevrons-right"
        previous-icon="i-tabler-chevron-left"
        next-icon="i-tabler-chevron-right"
      />
    </template>
  </LayoutFooter>
</template>

<script setup lang="ts">
const totalItems = defineModel<number>('totalItems', { required: false, default: 0 });
const itemsPerPage = defineModel<number>('itemsPerPage', { required: true });
const page = defineModel<number>('page', { required: true });

defineShortcuts({
  shift_arrowright: () => handleNextPage(),
  shift_arrowleft: () => handlePrevPage(),
  ctrl_shift_arrowright: () => handleLastPage(),
  ctrl_shift_arrowleft: () => handleFirstPage(),
});

const rowStart = computed<number>(() => {
  return (page.value - 1) * itemsPerPage.value + 1;
});
const rowEnd = computed<number>(() => {
  const end = rowStart.value - 1 + itemsPerPage.value;
  return Math.min(end, totalItems.value);
});
const totalPages = computed(() => {
  return Math.ceil(totalItems.value / itemsPerPage.value);
});

const handleNextPage = () => {
  if (page.value < totalPages.value) {
    page.value++;
  }
};
const handlePrevPage = () => {
  if (page.value > 1) {
    page.value--;
  }
};
const handleLastPage = () => {
  page.value = totalPages.value;
};
const handleFirstPage = () => {
  page.value = 1;
};
</script>
