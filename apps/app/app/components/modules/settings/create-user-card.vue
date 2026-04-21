<template>
  <UCard>
    <template #header>
      <h2 class="text-base font-semibold">Create User (Admin)</h2>
    </template>

    <div class="grid gap-4">
      <div class="grid gap-1">
        <label for="displayName">Display Name</label>
        <UInput id="displayName" v-model="newUserForm.displayName" placeholder="Team Member" />
        <p v-if="newUserErrors.displayName" class="error">{{ newUserErrors.displayName }}</p>
      </div>

      <div class="grid gap-1">
        <label for="email">Email</label>
        <UInput id="email" v-model="newUserForm.email" type="email" placeholder="team.member@example.com" />
        <p v-if="newUserErrors.email" class="error">{{ newUserErrors.email }}</p>
      </div>

      <div class="grid gap-1">
        <label for="password">Password</label>
        <UInput id="password" v-model="newUserForm.password" type="password" placeholder="************" />
        <p v-if="newUserErrors.password" class="error">{{ newUserErrors.password }}</p>
      </div>

      <div class="grid gap-1">
        <label for="role">Role</label>
        <USelect id="role" v-model="newUserForm.role" :items="roleSelectOptions" label-key="label" value-key="value" />
      </div>

      <div class="grid gap-1">
        <label for="preferredLanguage">Preferred Language</label>
        <USelect
          id="preferredLanguage"
          v-model="newUserForm.preferredLanguage"
          :items="languageOptions"
          label-key="label"
          value-key="value"
        />
      </div>

      <div>
        <UButton color="primary" variant="solid" :disabled="userSaving" @click="onCreate">
          {{ userSaving ? 'Creating...' : 'Create User' }}
        </UButton>
      </div>

      <p v-if="userMessage">{{ userMessage }}</p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  newUserForm: {
    email: string;
    password: string;
    displayName: string;
    role: string;
    preferredLanguage: 'de' | 'en';
  };
  newUserErrors: {
    email: string;
    password: string;
    displayName: string;
  };
  roleSelectOptions: Array<{ label: string; value: string }>;
  languageOptions: Array<{ label: string; value: 'de' | 'en' }>;
  userSaving: boolean;
  userMessage: string;
  onCreate: () => void | Promise<void>;
}>();
</script>
