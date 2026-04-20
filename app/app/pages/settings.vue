<script setup lang="ts">
const form = reactive({
  categoryId: '',
  sku: '',
  name: '',
  servings: ''
});

const errors = reactive<Record<string, string>>({});
const { createItem } = useApiClient();

const validate = (): boolean => {
  errors.categoryId = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(form.categoryId)
    ? ''
    : 'categoryId must be a UUID v4';

  errors.sku = form.sku.trim().length > 0 ? '' : 'SKU is required';
  errors.name = form.name.trim().length > 0 ? '' : 'Name is required';

  if (form.servings.trim().length > 0) {
    const servings = Number(form.servings);
    errors.servings = Number.isInteger(servings) && servings >= 1 ? '' : 'Servings must be an integer >= 1';
  } else {
    errors.servings = '';
  }

  return !errors.categoryId && !errors.sku && !errors.name && !errors.servings;
};

const submit = async () => {
  if (!validate()) return;

  await createItem({
    categoryId: form.categoryId,
    sku: form.sku,
    name: form.name,
    servings: form.servings ? Number(form.servings) : undefined
  });

  alert('Valid payload sent to API.');
};
</script>

<template>
  <section class="card">
    <h1>Validation Demo</h1>
    <p>This form validates client-side before sending to DTO-validated API endpoints.</p>

    <div class="field">
      <label for="categoryId">Category UUID v4</label>
      <input id="categoryId" v-model="form.categoryId" placeholder="550e8400-e29b-41d4-a716-446655440001" />
      <p v-if="errors.categoryId" class="error">{{ errors.categoryId }}</p>
    </div>

    <div class="field">
      <label for="sku">SKU</label>
      <input id="sku" v-model="form.sku" placeholder="SPAGHETTI-SAUCE-001" />
      <p v-if="errors.sku" class="error">{{ errors.sku }}</p>
    </div>

    <div class="field">
      <label for="name">Name</label>
      <input id="name" v-model="form.name" placeholder="Spaghetti Sauce" />
      <p v-if="errors.name" class="error">{{ errors.name }}</p>
    </div>

    <div class="field">
      <label for="servings">Servings (optional)</label>
      <input id="servings" v-model="form.servings" placeholder="3" />
      <p v-if="errors.servings" class="error">{{ errors.servings }}</p>
    </div>

    <button class="scan-btn" @click="submit">Submit</button>
  </section>
</template>
