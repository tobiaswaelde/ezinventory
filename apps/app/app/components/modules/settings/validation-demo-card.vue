<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <h2 class="text-base font-semibold">Validation Demo</h2>
        <p class="text-sm text-muted">This form validates client-side before DTO-validated API endpoints.</p>
      </div>
    </template>

    <div class="grid gap-4">
      <div class="grid gap-1">
        <label for="categoryId">Category UUID v4</label>
        <UInput id="categoryId" v-model="itemForm.categoryId" placeholder="550e8400-e29b-41d4-a716-446655440001" />
        <p v-if="itemErrors.categoryId" class="error">{{ itemErrors.categoryId }}</p>
      </div>

      <div class="grid gap-1">
        <label for="sku">SKU</label>
        <UInput id="sku" v-model="itemForm.sku" placeholder="SPAGHETTI-SAUCE-001" />
        <p v-if="itemErrors.sku" class="error">{{ itemErrors.sku }}</p>
      </div>

      <div class="grid gap-1">
        <label for="name">Name</label>
        <UInput id="name" v-model="itemForm.name" placeholder="Spaghetti Sauce" />
        <p v-if="itemErrors.name" class="error">{{ itemErrors.name }}</p>
      </div>

      <div class="grid gap-1">
        <label for="servings">Servings (optional)</label>
        <UInput id="servings" v-model="itemForm.servings" placeholder="3" />
        <p v-if="itemErrors.servings" class="error">{{ itemErrors.servings }}</p>
      </div>

      <div>
        <UButton color="primary" variant="solid" @click="onSubmit">Submit</UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  itemForm: {
    categoryId: string;
    sku: string;
    name: string;
    servings: string;
  };
  itemErrors: Record<string, string>;
  onSubmit: () => void | Promise<void>;
}>();
</script>
