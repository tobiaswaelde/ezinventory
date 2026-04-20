<template>
  <div class="grid gap-4 md:gap-5">
    <UCard>
      <template #header>
        <div class="space-y-1">
          <h1 class="text-lg font-semibold">Welcome back{{ user?.displayName ? `, ${user.displayName}` : '' }}</h1>
          <p class="text-sm text-muted">EZ Inventory is ready. Use the sidebar to navigate, or jump in with a quick action.</p>
        </div>
      </template>

      <div class="flex flex-wrap gap-2">
        <UButton to="/scan" icon="i-tabler-scan" color="primary">Start Scan</UButton>
        <UButton to="/inventory" icon="i-tabler-box-multiple" color="neutral" variant="soft">Inventory</UButton>
        <UButton to="/settings" icon="i-tabler-settings" color="neutral" variant="ghost">Settings</UButton>
      </div>
    </UCard>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <UCard v-for="action in quickActions" :key="action.title">
        <template #header>
          <div class="flex items-center gap-2 text-sm font-medium">
            <UIcon :name="action.icon" class="text-lg text-primary" />
            <span>{{ action.title }}</span>
          </div>
        </template>

        <p class="text-sm text-muted">{{ action.description }}</p>

        <template #footer>
          <UButton :to="action.to" color="neutral" variant="soft" block>Open</UButton>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth();

const quickActions = [
  {
    title: 'Scan QR code',
    description: 'Open scanner and process stock-out immediately.',
    icon: 'i-tabler-scan',
    to: '/scan'
  },
  {
    title: 'Manage inventory',
    description: 'Create locations and nested containers.',
    icon: 'i-tabler-box-multiple',
    to: '/inventory'
  },
  {
    title: 'Print labels',
    description: 'Generate A4 QR/barcode sheets for containers and items.',
    icon: 'i-tabler-printer',
    to: '/labels'
  }
] as const;
</script>
