<template>
  <section class="card">
    <h1>Inventory Structure</h1>
    <p>Create locations and freely nested containers (shelf > box > bin > ...).</p>
    <UAlert v-if="loading" color="neutral" variant="soft" title="Loading" description="Loading inventory structure..." />
    <UAlert v-if="errorMessage" color="red" variant="soft" title="Error" :description="errorMessage" />
    <UAlert v-if="successMessage" color="green" variant="soft" title="Success" :description="successMessage" />
  </section>

  <section class="card">
    <h2>Create Location</h2>

    <div class="field">
      <label for="location-name">Name</label>
      <UInput id="location-name" v-model="locationForm.name" type="text" placeholder="Garage" />
      <p v-if="locationErrors.name" class="error">{{ locationErrors.name }}</p>
    </div>

    <div class="field">
      <label for="location-code">Code</label>
      <UInput id="location-code" v-model="locationForm.code" type="text" placeholder="GARAGE" />
      <p v-if="locationErrors.code" class="error">{{ locationErrors.code }}</p>
    </div>

    <div class="field">
      <label for="location-description">Description</label>
      <UTextarea id="location-description" v-model="locationForm.description" :rows="2" placeholder="Optional" />
    </div>

    <div class="field">
      <label for="location-icon">Icon (optional)</label>
      <CommonInputsSelectIcon id="location-icon" v-model="locationForm.icon" placeholder="Select location icon" />
    </div>

    <div class="form-actions">
      <UButton color="neutral" variant="soft" @click="submitLocation">Save Location</UButton>
    </div>
  </section>

  <section class="card">
    <h2>Create Container</h2>

    <div class="field">
      <label for="container-location">Location</label>
      <USelect
        id="container-location"
        v-model="containerForm.locationId"
        :items="locationOptions"
        label-key="label"
        value-key="value"
        placeholder="Select location"
      />
      <p v-if="containerErrors.locationId" class="error">{{ containerErrors.locationId }}</p>
    </div>

    <div class="field">
      <label for="container-parent">Parent container (optional)</label>
      <USelect
        id="container-parent"
        v-model="containerForm.parentContainerId"
        :items="parentContainerOptions"
        label-key="label"
        value-key="value"
      />
    </div>

    <div class="field">
      <label for="container-type">Type</label>
      <USelect
        id="container-type"
        v-model="containerForm.type"
        :items="containerTypeOptions"
        label-key="label"
        value-key="value"
      />
    </div>

    <div class="field">
      <label for="container-name">Name</label>
      <UInput id="container-name" v-model="containerForm.name" type="text" placeholder="Freezer Drawer 1" />
      <p v-if="containerErrors.name" class="error">{{ containerErrors.name }}</p>
    </div>

    <div class="field">
      <label for="container-code">Code</label>
      <UInput id="container-code" v-model="containerForm.code" type="text" placeholder="FREEZER-DRAWER-1" />
      <p v-if="containerErrors.code" class="error">{{ containerErrors.code }}</p>
    </div>

    <div class="field">
      <label for="container-description">Description</label>
      <UTextarea id="container-description" v-model="containerForm.description" :rows="2" placeholder="Optional" />
    </div>

    <div class="field">
      <label for="container-icon">Icon (optional)</label>
      <CommonInputsSelectIcon id="container-icon" v-model="containerForm.icon" placeholder="Select container icon" />
    </div>

    <div class="form-actions">
      <UButton color="primary" variant="solid" @click="submitContainer">Save Container</UButton>
    </div>
  </section>

  <section class="card">
    <h2>Current Tree</h2>

    <div v-for="location in sortedLocations" :key="location.id" class="location-block">
      <h3 class="location-title">
        <UIcon v-if="toUiIconName(location.iconSet, location.iconName)" :name="toUiIconName(location.iconSet, location.iconName) as string" />
        {{ location.name }} ({{ location.code }})
      </h3>

      <ul class="container-list">
        <li
          v-for="row in buildTree(containersByLocation.get(location.id) ?? [])"
          :key="row.node.id"
          class="container-row"
          :style="{ paddingLeft: `${row.depth * 16}px` }"
        >
          <strong class="container-title">
            <UIcon v-if="toUiIconName(row.node.iconSet, row.node.iconName)" :name="toUiIconName(row.node.iconSet, row.node.iconName) as string" />
            {{ row.node.name }}
          </strong>
          <span>{{ row.node.type }}</span>
          <small>{{ row.node.code }}</small>
        </li>
      </ul>
    </div>
  </section>
</template>


<script setup lang="ts">
import type { ContainerResponse, ContainerType, LocationResponse } from '@ezinventory/contracts';
import {
  validateContainerInput,
  validateLocationInput
} from '~/utils/inventory-validation';

const { isAuthenticated } = useAuth();
const { t } = useI18n();
const { createContainer, createLocation, listContainers, listLocations } = useApiClient();

const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const locations = ref<LocationResponse[]>([]);
const containers = ref<ContainerResponse[]>([]);

const locationForm = reactive({
  name: '',
  code: '',
  description: '',
  icon: undefined as string | undefined
});
const locationErrors = reactive({
  name: '',
  code: ''
});

const containerForm = reactive({
  locationId: '',
  parentContainerId: '',
  type: 'BOX' as ContainerType,
  name: '',
  code: '',
  description: '',
  icon: undefined as string | undefined
});
const containerErrors = reactive({
  locationId: '',
  name: '',
  code: ''
});

const sortedLocations = computed(() => {
  return [...locations.value].sort((a, b) => a.name.localeCompare(b.name));
});

const locationOptions = computed(() => {
  return sortedLocations.value.map((location) => ({
    label: `${location.name} (${location.code})`,
    value: location.id
  }));
});

const availableParents = computed(() => {
  if (!containerForm.locationId) {
    return [] as ContainerResponse[];
  }

  return containers.value.filter((container) => container.locationId === containerForm.locationId);
});

const parentContainerOptions = computed(() => {
  return [
    { label: 'No parent (root)', value: '' },
    ...availableParents.value.map((container) => ({
      label: `${container.name} (${container.code})`,
      value: container.id
    }))
  ];
});

const containerTypeOptions = [
  { label: 'Shelf', value: 'SHELF' },
  { label: 'Box', value: 'BOX' },
  { label: 'Fridge', value: 'FRIDGE' },
  { label: 'Bin', value: 'BIN' },
  { label: 'Custom', value: 'CUSTOM' }
] as const;

const containersByLocation = computed(() => {
  const map = new Map<string, ContainerResponse[]>();

  for (const location of locations.value) {
    const rows = containers.value.filter((container) => container.locationId === location.id);
    map.set(location.id, rows);
  }

  return map;
});

const buildTree = (rows: ContainerResponse[]): Array<{ node: ContainerResponse; depth: number }> => {
  const byParent = new Map<string | null, ContainerResponse[]>();

  for (const row of rows) {
    const key = row.parentContainerId ?? null;
    const group = byParent.get(key) ?? [];
    group.push(row);
    byParent.set(key, group);
  }

  for (const group of byParent.values()) {
    group.sort((a, b) => a.name.localeCompare(b.name));
  }

  const result: Array<{ node: ContainerResponse; depth: number }> = [];

  const visit = (parentId: string | null, depth: number): void => {
    const children = byParent.get(parentId) ?? [];

    for (const child of children) {
      result.push({ node: child, depth });
      visit(child.id, depth + 1);
    }
  };

  visit(null, 0);

  return result;
};

const toUiIconName = (iconSet?: string | null, iconName?: string | null): string | null => {
  if (!iconSet || !iconName) {
    return null;
  }

  if (iconSet === 'TABLER') {
    return `i-tabler-${iconName}`;
  }

  if (iconSet === 'LUCIDE') {
    return `i-lucide-${iconName}`;
  }

  return null;
};

const parseSelectedIcon = (icon?: string): { iconSet?: 'TABLER'; iconName?: string } => {
  if (!icon) {
    return {};
  }

  if (icon.startsWith('i-tabler-')) {
    return {
      iconSet: 'TABLER',
      iconName: icon.replace(/^i-tabler-/, '')
    };
  }

  return {};
};

const refreshData = async (): Promise<void> => {
  if (!isAuthenticated.value) {
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    const [nextLocations, nextContainers] = await Promise.all([listLocations(), listContainers()]);

    locations.value = nextLocations;
    containers.value = nextContainers;

    const firstLocation = nextLocations.at(0);
    if (!containerForm.locationId && firstLocation) {
      containerForm.locationId = firstLocation.id;
    }
  } catch {
    errorMessage.value = t('inventory_error_load');
  } finally {
    loading.value = false;
  }
};

const submitLocation = async (): Promise<void> => {
  const validationErrors = validateLocationInput(locationForm);
  locationErrors.name = validationErrors.name ? t(validationErrors.name as never) : '';
  locationErrors.code = validationErrors.code ? t(validationErrors.code as never) : '';

  if (locationErrors.name || locationErrors.code) {
    errorMessage.value = t('inventory_error_fix_location_form');
    return;
  }

  errorMessage.value = '';
  successMessage.value = '';

  try {
    const iconSelection = parseSelectedIcon(locationForm.icon);

    await createLocation({
      name: locationForm.name.trim(),
      code: locationForm.code.trim().toUpperCase(),
      description: locationForm.description.trim() || undefined,
      iconSet: iconSelection.iconSet,
      iconName: iconSelection.iconName
    });

    locationForm.name = '';
    locationForm.code = '';
    locationForm.description = '';
    locationForm.icon = undefined;
    successMessage.value = t('inventory_success_location_created');
    await refreshData();
  } catch {
    errorMessage.value = t('inventory_error_create_location');
  }
};

const submitContainer = async (): Promise<void> => {
  const validationErrors = validateContainerInput(containerForm);
  containerErrors.locationId = validationErrors.locationId ? t(validationErrors.locationId as never) : '';
  containerErrors.name = validationErrors.name ? t(validationErrors.name as never) : '';
  containerErrors.code = validationErrors.code ? t(validationErrors.code as never) : '';

  if (containerErrors.locationId || containerErrors.name || containerErrors.code) {
    errorMessage.value = t('inventory_error_fix_container_form');
    return;
  }

  errorMessage.value = '';
  successMessage.value = '';

  try {
    const iconSelection = parseSelectedIcon(containerForm.icon);

    await createContainer({
      locationId: containerForm.locationId,
      parentContainerId: containerForm.parentContainerId || undefined,
      type: containerForm.type,
      name: containerForm.name.trim(),
      code: containerForm.code.trim().toUpperCase(),
      description: containerForm.description.trim() || undefined,
      iconSet: iconSelection.iconSet,
      iconName: iconSelection.iconName
    });

    containerForm.parentContainerId = '';
    containerForm.name = '';
    containerForm.code = '';
    containerForm.description = '';
    containerForm.icon = undefined;
    successMessage.value = t('inventory_success_container_created');
    await refreshData();
  } catch {
    errorMessage.value = t('inventory_error_create_container');
  }
};

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
.location-block + .location-block {
  margin-top: 1rem;
}

.location-title {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.container-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.container-row {
  display: grid;
  gap: 0.125rem;
  border-left: 2px solid #d6dae1;
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
  margin-bottom: 0.25rem;
}

.container-row span,
.container-row small {
  color: #576073;
}

.container-title {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
