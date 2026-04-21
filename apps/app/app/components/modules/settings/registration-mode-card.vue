<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <h2 class="text-base font-semibold">Registration Mode</h2>
        <p class="text-sm text-muted">Control whether public registration is open or admin-only.</p>
      </div>
    </template>

    <p><strong>Setup initialized:</strong> {{ setupInitialized ? 'yes' : 'no' }}</p>

    <div class="grid gap-1 mt-3">
      <label for="registrationMode">Mode</label>
      <USelect
        id="registrationMode"
        :model-value="registrationMode"
        :items="registrationModeOptions"
        label-key="label"
        value-key="value"
        @update:model-value="onUpdateRegistrationMode"
      />
    </div>

    <div class="mt-3">
      <UButton color="primary" variant="solid" :disabled="modeSaving || !setupInitialized" @click="onSave">
        {{ modeSaving ? 'Saving...' : 'Save Mode' }}
      </UButton>
    </div>

    <p v-if="modeMessage" class="mt-2">{{ modeMessage }}</p>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  setupInitialized: boolean;
  registrationMode: string;
  registrationModeOptions: Array<{ label: string; value: string }>;
  modeSaving: boolean;
  modeMessage: string;
  onSave: () => void | Promise<void>;
  onUpdateRegistrationMode: (value: string | undefined) => void;
}>();
</script>
