<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <h2 class="text-base font-semibold">User Permissions</h2>
        <p class="text-sm text-muted">Assign role and user-specific policy IDs.</p>
      </div>
    </template>

    <p v-if="usersLoading">Loading users...</p>
    <p v-if="usersMessage">{{ usersMessage }}</p>

    <div class="grid gap-3">
      <article v-for="managedUser in managedUsers" :key="managedUser.id" class="rounded-lg border border-default p-3 grid gap-3">
        <header class="grid">
          <strong>{{ managedUser.displayName }}</strong>
          <small>{{ managedUser.email }}</small>
        </header>

        <div class="grid gap-1">
          <label :for="`role-${managedUser.id}`">Role</label>
          <USelect
            :id="`role-${managedUser.id}`"
            v-model="roleDraftByUser[managedUser.id]"
            :items="roleSelectOptions"
            label-key="label"
            value-key="value"
          />
        </div>

        <UButton color="neutral" variant="soft" :disabled="roleSavingByUser[managedUser.id]" @click="onSaveUserRole(managedUser.id)">
          {{ roleSavingByUser[managedUser.id] ? 'Saving role...' : 'Save Role' }}
        </UButton>

        <div class="grid gap-2 max-h-48 overflow-auto rounded-lg border border-default p-2">
          <label v-for="policy in permissionPolicies" :key="policy.id" class="flex gap-2 items-center">
            <UCheckbox
              :model-value="(policyDraftByUser[managedUser.id] ?? []).includes(policy.id)"
              @update:model-value="onTogglePolicyForUser(managedUser.id, policy.id)"
            />
            <span>{{ policy.inverted ? 'cannot' : 'can' }} {{ policy.action }} {{ policy.subject }}</span>
          </label>
        </div>

        <UButton color="primary" variant="solid" :disabled="policySavingByUser[managedUser.id]" @click="onSaveUserPolicies(managedUser.id)">
          {{ policySavingByUser[managedUser.id] ? 'Saving policies...' : 'Save Policies' }}
        </UButton>
      </article>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  usersLoading: boolean;
  usersMessage: string;
  managedUsers: Array<{ id: string; displayName: string; email: string }>;
  permissionPolicies: Array<{ id: string; action: string; subject: string; inverted: boolean }>;
  roleDraftByUser: Record<string, string>;
  policyDraftByUser: Record<string, string[]>;
  roleSavingByUser: Record<string, boolean>;
  policySavingByUser: Record<string, boolean>;
  roleSelectOptions: Array<{ label: string; value: string }>;
  onTogglePolicyForUser: (userId: string, policyId: string) => void;
  onSaveUserRole: (userId: string) => void | Promise<void>;
  onSaveUserPolicies: (userId: string) => void | Promise<void>;
}>();
</script>
