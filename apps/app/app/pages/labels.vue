<template>
  <section class="card no-print">
    <h1>Label Generator</h1>
    <p>Create QR + barcode labels and print as A4 grid for desktop printers or PDF export.</p>
    <UAlert v-if="loading" color="neutral" variant="soft" title="Loading" description="Loading items and containers..." />
    <UAlert v-if="errorMessage" color="red" variant="soft" title="Label Generation Error" :description="errorMessage" />

    <div class="field">
      <label for="source-type">Source</label>
      <USelect
        id="source-type"
        v-model="sourceType"
        :items="sourceTypeOptions"
        label-key="label"
        value-key="value"
      />
    </div>

    <div class="field">
      <label for="copies">Copies Per Entity</label>
      <UInput id="copies" v-model.number="copiesPerEntity" type="number" min="1" step="1" />
    </div>

    <div class="toolbar">
      <UButton color="neutral" variant="soft" @click="selectAllVisible">Select All</UButton>
      <UButton color="neutral" variant="soft" @click="clearSelection">Clear</UButton>
    </div>

    <div class="selector-list">
      <label v-for="row in sourceOptions" :key="row.id" class="selector-item">
        <UCheckbox :model-value="selectedEntityIds.includes(row.id)" @update:model-value="toggleEntity(row.id)" />
        <span>
          <strong>{{ row.displayName }}</strong>
          <small>{{ row.code }}</small>
        </span>
      </label>
    </div>

    <div class="toolbar">
      <UButton color="primary" variant="solid" :disabled="generating" @click="generateLabels">
        {{ generating ? 'Generating...' : 'Generate Labels' }}
      </UButton>
      <UButton color="neutral" variant="soft" :disabled="labelRows.length === 0" @click="printSheet">Print / Save PDF</UButton>
    </div>
  </section>

  <section v-if="labelRows.length > 0" class="labels-sheet">
    <article v-for="row in labelRows" :key="row.uid" class="label-card">
      <header>
        <strong>{{ row.displayName }}</strong>
        <small>{{ row.kind.toUpperCase() }}</small>
      </header>
      <img :src="qrByUid[row.uid]" alt="QR Code" class="qr-image" />
      <svg :data-barcode-value="row.code" class="barcode-svg"></svg>
      <footer>{{ row.code }}</footer>
    </article>
  </section>
</template>


<script setup lang="ts">
import type { ContainerResponse, ItemResponse } from '@ezinventory/contracts';

type LabelSourceType = 'items' | 'containers';

type LabelRow = {
  uid: string;
  kind: 'item' | 'container';
  entityId: string;
  displayName: string;
  code: string;
  qrCodeValue: string;
};

const { isAuthenticated } = useAuth();
const { listContainers, listItems } = useApiClient();

const loading = ref(false);
const generating = ref(false);
const errorMessage = ref('');

const sourceType = ref<LabelSourceType>('items');
const copiesPerEntity = ref(1);
const selectedEntityIds = ref<string[]>([]);

const items = ref<ItemResponse[]>([]);
const containers = ref<ContainerResponse[]>([]);
const labelRows = ref<LabelRow[]>([]);
const qrByUid = ref<Record<string, string>>({});

const sourceOptions = computed(() => {
  if (sourceType.value === 'items') {
    return items.value.map((item) => ({
      id: item.id,
      displayName: item.name,
      code: item.sku,
      qrCodeValue: item.qrCodeValue,
      kind: 'item' as const
    }));
  }

  return containers.value.map((container) => ({
    id: container.id,
    displayName: container.name,
    code: container.code,
    qrCodeValue: container.qrCodeValue,
    kind: 'container' as const
  }));
});

const sourceTypeOptions = [
  { label: 'Items', value: 'items' },
  { label: 'Containers', value: 'containers' }
] as const;

const refreshData = async (): Promise<void> => {
  if (!isAuthenticated.value) {
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    const [nextItems, nextContainers] = await Promise.all([listItems(), listContainers()]);
    items.value = nextItems;
    containers.value = nextContainers;
  } catch {
    errorMessage.value = 'Could not load entities for labels.';
  } finally {
    loading.value = false;
  }
};

const toggleEntity = (id: string): void => {
  if (selectedEntityIds.value.includes(id)) {
    selectedEntityIds.value = selectedEntityIds.value.filter((value) => value !== id);
    return;
  }

  selectedEntityIds.value = [...selectedEntityIds.value, id];
};

const selectAllVisible = (): void => {
  selectedEntityIds.value = sourceOptions.value.map((option) => option.id);
};

const clearSelection = (): void => {
  selectedEntityIds.value = [];
};

const renderBarcodes = async (): Promise<void> => {
  const jsBarcodeModule = await import('jsbarcode');
  const jsBarcode = jsBarcodeModule.default;

  const barcodeElements = Array.from(document.querySelectorAll<SVGElement>('[data-barcode-value]'));

  for (const element of barcodeElements) {
    const value = element.dataset.barcodeValue;

    if (!value) {
      continue;
    }

    jsBarcode(element, value, {
      format: 'CODE128',
      displayValue: false,
      margin: 0,
      width: 1.35,
      height: 34
    });
  }
};

const generateLabels = async (): Promise<void> => {
  errorMessage.value = '';

  if (selectedEntityIds.value.length === 0) {
    errorMessage.value = 'Select at least one entity.';
    return;
  }

  if (!Number.isInteger(copiesPerEntity.value) || copiesPerEntity.value < 1) {
    errorMessage.value = 'Copies per entity must be an integer >= 1.';
    return;
  }

  const selectedSet = new Set(selectedEntityIds.value);
  const selectedRows = sourceOptions.value.filter((row) => selectedSet.has(row.id));

  const nextRows: LabelRow[] = [];

  for (const row of selectedRows) {
    for (let copy = 1; copy <= copiesPerEntity.value; copy += 1) {
      nextRows.push({
        uid: `${row.kind}-${row.id}-${copy}`,
        kind: row.kind,
        entityId: row.id,
        displayName: row.displayName,
        code: row.code,
        qrCodeValue: row.qrCodeValue
      });
    }
  }

  generating.value = true;

  try {
    const qrCodeModule = await import('qrcode');
    const nextQrByUid: Record<string, string> = {};

    for (const row of nextRows) {
      nextQrByUid[row.uid] = await qrCodeModule.toDataURL(row.qrCodeValue, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 180
      });
    }

    labelRows.value = nextRows;
    qrByUid.value = nextQrByUid;

    await nextTick();
    await renderBarcodes();
  } catch {
    errorMessage.value = 'Could not generate labels.';
  } finally {
    generating.value = false;
  }
};

const printSheet = (): void => {
  window.print();
};

watch(
  () => sourceType.value,
  () => {
    selectedEntityIds.value = [];
  }
);

watch(
  () => isAuthenticated.value,
  async (next) => {
    if (next) {
      await refreshData();
    }
  },
  { immediate: true }
);
</script>


<style scoped>
.toolbar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}

.selector-list {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.75rem;
  max-height: 260px;
  overflow: auto;
  border: 1px solid #d9dde4;
  border-radius: 0.75rem;
  padding: 0.5rem;
}

.selector-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.selector-item small {
  display: block;
  color: #5d6778;
}

.labels-sheet {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 1rem;
}

.label-card {
  border: 1px solid #cfd5de;
  border-radius: 8px;
  padding: 8px;
  display: grid;
  align-content: start;
  gap: 6px;
  min-height: 130px;
  background: #fff;
}

.label-card header {
  display: flex;
  justify-content: space-between;
  gap: 0.25rem;
}

.label-card header small {
  color: #6a7486;
  font-size: 0.7rem;
}

.qr-image {
  width: 88px;
  height: 88px;
}

.barcode-svg {
  width: 100%;
  height: 34px;
}

.label-card footer {
  font-size: 0.75rem;
  color: #374151;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 9mm;
  }

  .no-print {
    display: none;
  }

  .labels-sheet {
    margin: 0;
    gap: 4mm;
    grid-template-columns: repeat(3, 1fr);
  }

  .label-card {
    break-inside: avoid;
    min-height: 30mm;
    border-color: #000;
  }
}
</style>
