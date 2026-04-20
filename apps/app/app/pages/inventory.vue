<script setup lang="ts">
import type { ContainerResponse, ContainerType, LocationResponse } from '@ezinventory/contracts';

const { isAuthenticated } = useAuth();
const { createContainer, createLocation, listContainers, listLocations } = useApiClient();

const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const locations = ref<LocationResponse[]>([]);
const containers = ref<ContainerResponse[]>([]);

const locationForm = reactive({
  name: '',
  code: '',
  description: ''
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
  description: ''
});
const containerErrors = reactive({
  locationId: '',
  name: '',
  code: ''
});

const codePattern = /^[A-Z0-9-]{2,40}$/;

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

    if (!containerForm.locationId && nextLocations.length > 0) {
      containerForm.locationId = nextLocations[0].id;
    }
  } catch {
    errorMessage.value = 'Could not load inventory structure.';
  } finally {
    loading.value = false;
  }
};

const submitLocation = async (): Promise<void> => {
  locationErrors.name = locationForm.name.trim() ? '' : 'Name is required.';
  locationErrors.code = codePattern.test(locationForm.code.trim().toUpperCase())
    ? ''
    : 'Code must be 2-40 chars, uppercase letters/numbers/hyphen only.';

  if (locationErrors.name || locationErrors.code) {
    errorMessage.value = 'Please fix the location form errors.';
    return;
  }

  errorMessage.value = '';
  successMessage.value = '';

  try {
    await createLocation({
      name: locationForm.name.trim(),
      code: locationForm.code.trim().toUpperCase(),
      description: locationForm.description.trim() || undefined
    });

    locationForm.name = '';
    locationForm.code = '';
    locationForm.description = '';
    successMessage.value = 'Location created.';
    await refreshData();
  } catch {
    errorMessage.value = 'Could not create location.';
  }
};

const submitContainer = async (): Promise<void> => {
  containerErrors.locationId = containerForm.locationId ? '' : 'Location is required.';
  containerErrors.name = containerForm.name.trim() ? '' : 'Name is required.';
  containerErrors.code = codePattern.test(containerForm.code.trim().toUpperCase())
    ? ''
    : 'Code must be 2-40 chars, uppercase letters/numbers/hyphen only.';

  if (containerErrors.locationId || containerErrors.name || containerErrors.code) {
    errorMessage.value = 'Please fix the container form errors.';
    return;
  }

  errorMessage.value = '';
  successMessage.value = '';

  try {
    await createContainer({
      locationId: containerForm.locationId,
      parentContainerId: containerForm.parentContainerId || undefined,
      type: containerForm.type,
      name: containerForm.name.trim(),
      code: containerForm.code.trim().toUpperCase(),
      description: containerForm.description.trim() || undefined
    });

    containerForm.parentContainerId = '';
    containerForm.name = '';
    containerForm.code = '';
    containerForm.description = '';
    successMessage.value = 'Container created.';
    await refreshData();
  } catch {
    errorMessage.value = 'Could not create container.';
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
        :options="locationOptions"
        option-attribute="label"
        value-attribute="value"
        placeholder="Select location"
      />
      <p v-if="containerErrors.locationId" class="error">{{ containerErrors.locationId }}</p>
    </div>

    <div class="field">
      <label for="container-parent">Parent container (optional)</label>
      <USelect
        id="container-parent"
        v-model="containerForm.parentContainerId"
        :options="parentContainerOptions"
        option-attribute="label"
        value-attribute="value"
      />
    </div>

    <div class="field">
      <label for="container-type">Type</label>
      <USelect
        id="container-type"
        v-model="containerForm.type"
        :options="containerTypeOptions"
        option-attribute="label"
        value-attribute="value"
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

    <div class="form-actions">
      <UButton color="primary" variant="solid" @click="submitContainer">Save Container</UButton>
    </div>
  </section>

  <section class="card">
    <h2>Current Tree</h2>

    <div v-for="location in sortedLocations" :key="location.id" class="location-block">
      <h3>{{ location.name }} ({{ location.code }})</h3>

      <ul class="container-list">
        <li
          v-for="row in buildTree(containersByLocation.get(location.id) ?? [])"
          :key="row.node.id"
          class="container-row"
          :style="{ paddingLeft: `${row.depth * 16}px` }"
        >
          <strong>{{ row.node.name }}</strong>
          <span>{{ row.node.type }}</span>
          <small>{{ row.node.code }}</small>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.location-block + .location-block {
  margin-top: 1rem;
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

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
