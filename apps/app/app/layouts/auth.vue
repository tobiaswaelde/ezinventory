<template>
  <div class="min-h-dvh flex flex-col items-center justify-center gap-4 p-4 bg-default">
    <div class="flex items-center gap-2 text-lg font-semibold tracking-tight text-highlighted">
      <UIcon name="i-tabler-packages" class="text-xl text-primary" />
      <span>EZ Inventory</span>
    </div>

    <UCard class="w-full max-w-[430px]">
      <slot />
    </UCard>

    <p class="text-sm text-muted">Open-source inventory management</p>
  </div>
</template>
