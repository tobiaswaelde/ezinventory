<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <h2 class="text-base font-semibold">Permission Policies</h2>
        <p class="text-sm text-muted">Create reusable policy entries and assign them to users.</p>
      </div>
    </template>

    <div class="grid gap-4">
      <div class="grid gap-1">
        <label for="policy-action">Action</label>
        <USelect id="policy-action" v-model="newPolicyForm.action" :items="actionSelectOptions" label-key="label" value-key="value" />
      </div>

      <div class="grid gap-1">
        <label for="policy-subject">Subject</label>
        <USelect id="policy-subject" v-model="newPolicyForm.subject" :items="subjectSelectOptions" label-key="label" value-key="value" />
      </div>

      <div class="grid gap-1">
        <label for="policy-reason">Reason (optional)</label>
        <UInput id="policy-reason" v-model="newPolicyForm.reason" placeholder="Temporary stock-taking access" />
      </div>

      <div class="grid gap-1">
        <label for="policy-conditions">Conditions JSON (optional)</label>
        <UTextarea id="policy-conditions" v-model="newPolicyForm.conditionsJson" :rows="3" placeholder='{"id":{"$eq":"..."}}' />
        <p v-if="newPolicyErrors.conditionsJson" class="error">{{ newPolicyErrors.conditionsJson }}</p>
      </div>

      <label class="flex items-center gap-2">
        <UCheckbox v-model="newPolicyForm.inverted" />
        <span>Inverted (`cannot` rule)</span>
      </label>

      <div>
        <UButton color="neutral" variant="soft" :disabled="policyCreating" @click="onCreatePolicy">
          {{ policyCreating ? 'Creating...' : 'Create Policy' }}
        </UButton>
      </div>

      <p v-if="policyMessage">{{ policyMessage }}</p>

      <div class="grid gap-2">
        <article v-for="policy in permissionPolicies" :key="policy.id" class="rounded-lg border border-default p-3 grid gap-1">
          <strong>{{ policy.inverted ? 'cannot' : 'can' }} {{ policy.action }} {{ policy.subject }}</strong>
          <small>{{ policy.reason ?? 'No reason provided' }}</small>
          <small>ID: {{ policy.id }}</small>
        </article>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  newPolicyForm: {
    action: string;
    subject: string;
    inverted: boolean;
    reason: string;
    conditionsJson: string;
  };
  newPolicyErrors: {
    conditionsJson: string;
  };
  actionSelectOptions: Array<{ label: string; value: string }>;
  subjectSelectOptions: Array<{ label: string; value: string }>;
  policyCreating: boolean;
  policyMessage: string;
  permissionPolicies: Array<{
    id: string;
    action: string;
    subject: string;
    inverted: boolean;
    reason?: string | null;
  }>;
  onCreatePolicy: () => void | Promise<void>;
}>();
</script>
