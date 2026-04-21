<template>
  <div class="min-h-dvh flex flex-1 flex-col items-center justify-center gap-4 p-4 bg-default">
    <div class="mt-8">
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-tabler-packages"
        label="EZ Inventory"
        class="w-full p-2 text-base"
        to="/"
      />
    </div>

    <UCard class="w-full max-w-[460px]">
      <slot />
    </UCard>

    <p class="text-sm text-muted">Open-source inventory management</p>
    <ModulesAuthLanguageSelect />
  </div>
</template>
