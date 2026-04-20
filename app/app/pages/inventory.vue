<script setup lang="ts">
import type { ContainerResponse, ContainerType, LocationResponse } from '~/types/api/inventory';

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

const containerForm = reactive({
  locationId: '',
  parentContainerId: '',
  type: 'BOX' as ContainerType,
  name: '',
  code: '',
  description: ''
});

const sortedLocations = computed(() => {
  return [...locations.value].sort((a, b) => a.name.localeCompare(b.name));
});

const availableParents = computed(() => {
  if (!containerForm.locationId) {
    return [] as ContainerResponse[];
  }

  return containers.value.filter((container) => container.locationId === containerForm.locationId);
});

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
  if (!locationForm.name.trim() || !locationForm.code.trim()) {
    errorMessage.value = 'Location name and code are required.';
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
  if (!containerForm.locationId || !containerForm.name.trim() || !containerForm.code.trim()) {
    errorMessage.value = 'Container location, name and code are required.';
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
    <p v-if="loading">Loading inventory structure...</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage">{{ successMessage }}</p>
  </section>

  <section class="card">
    <h2>Create Location</h2>

    <div class="field">
      <label for="location-name">Name</label>
      <input id="location-name" v-model="locationForm.name" type="text" placeholder="Garage" />
    </div>

    <div class="field">
      <label for="location-code">Code</label>
      <input id="location-code" v-model="locationForm.code" type="text" placeholder="GARAGE" />
    </div>

    <div class="field">
      <label for="location-description">Description</label>
      <textarea id="location-description" v-model="locationForm.description" rows="2" placeholder="Optional" />
    </div>

    <button class="nav-btn" @click="submitLocation">Save Location</button>
  </section>

  <section class="card">
    <h2>Create Container</h2>

    <div class="field">
      <label for="container-location">Location</label>
      <select id="container-location" v-model="containerForm.locationId">
        <option value="" disabled>Select location</option>
        <option v-for="location in sortedLocations" :key="location.id" :value="location.id">
          {{ location.name }} ({{ location.code }})
        </option>
      </select>
    </div>

    <div class="field">
      <label for="container-parent">Parent container (optional)</label>
      <select id="container-parent" v-model="containerForm.parentContainerId">
        <option value="">No parent (root)</option>
        <option v-for="container in availableParents" :key="container.id" :value="container.id">
          {{ container.name }} ({{ container.code }})
        </option>
      </select>
    </div>

    <div class="field">
      <label for="container-type">Type</label>
      <select id="container-type" v-model="containerForm.type">
        <option value="SHELF">Shelf</option>
        <option value="BOX">Box</option>
        <option value="FRIDGE">Fridge</option>
        <option value="BIN">Bin</option>
        <option value="CUSTOM">Custom</option>
      </select>
    </div>

    <div class="field">
      <label for="container-name">Name</label>
      <input id="container-name" v-model="containerForm.name" type="text" placeholder="Freezer Drawer 1" />
    </div>

    <div class="field">
      <label for="container-code">Code</label>
      <input id="container-code" v-model="containerForm.code" type="text" placeholder="FREEZER-DRAWER-1" />
    </div>

    <div class="field">
      <label for="container-description">Description</label>
      <textarea id="container-description" v-model="containerForm.description" rows="2" placeholder="Optional" />
    </div>

    <button class="scan-btn" @click="submitContainer">Save Container</button>
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

textarea {
  width: 100%;
  border-radius: 0.6rem;
  border: 1px solid #d3d8e0;
  font: inherit;
  padding: 0.65rem 0.75rem;
}
</style>
