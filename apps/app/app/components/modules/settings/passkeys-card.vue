<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <h2 class="text-base font-semibold">Profile Security</h2>
        <p class="text-sm text-muted">Register a passkey for passwordless sign-in.</p>
      </div>
    </template>

    <UAlert
      v-if="!passkeySupported"
      color="warning"
      variant="soft"
      title="Passkeys unavailable"
      :description="passkeyNotSupportedText"
      class="mb-4"
    />

    <div class="grid gap-4">
      <div class="grid gap-1">
        <label for="profile-passkey-email">Email</label>
        <UInput id="profile-passkey-email" :model-value="passkeyEmail" type="email" readonly />
      </div>

      <div class="grid gap-1">
        <label for="profile-passkey-password">Current Password</label>
        <UInput
          id="profile-passkey-password"
          v-model="passkeyForm.password"
          type="password"
          placeholder="************"
          autocomplete="current-password"
        />
      </div>

      <div class="grid gap-1">
        <label for="profile-passkey-device-name">Passkey device name (optional)</label>
        <UInput
          id="profile-passkey-device-name"
          v-model="passkeyForm.deviceName"
          type="text"
          placeholder="MacBook Touch ID"
        />
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          color="neutral"
          variant="soft"
          :disabled="passkeySubmitting || !passkeySupported || !passkeyEmail"
          @click="onRegister"
        >
          {{ passkeySubmitting ? 'Registering...' : 'Register passkey' }}
        </UButton>
      </div>

      <p v-if="passkeyError" class="error">{{ passkeyError }}</p>
      <p v-if="passkeyMessage">{{ passkeyMessage }}</p>

      <div class="grid gap-2">
        <article v-for="passkey in passkeys" :key="passkey.id" class="rounded-lg border border-default p-3 grid gap-1">
          <strong>{{ passkey.deviceName || 'Unnamed passkey' }}</strong>
          <small>Created: {{ formatDate(passkey.createdAt) }}</small>
          <small>Last used: {{ passkey.lastUsedAt ? formatDate(passkey.lastUsedAt) : 'Never' }}</small>
          <div>
            <UButton
              color="error"
              variant="soft"
              :disabled="passkeyDeletingById[passkey.id]"
              @click="onDelete(passkey.id)"
            >
              {{ passkeyDeletingById[passkey.id] ? 'Deleting...' : 'Delete passkey' }}
            </UButton>
          </div>
        </article>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  passkeySupported: boolean;
  passkeyNotSupportedText: string;
  passkeyEmail: string;
  passkeyForm: { password: string; deviceName: string };
  passkeySubmitting: boolean;
  passkeyError: string;
  passkeyMessage: string;
  passkeys: Array<{ id: string; deviceName: string | null; createdAt: string; lastUsedAt: string | null }>;
  passkeyDeletingById: Record<string, boolean>;
  onRegister: () => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  formatDate: (value: string) => string;
}>();
</script>
