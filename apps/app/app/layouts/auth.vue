<template>
  <div class="auth-shell">
    <div class="auth-brand">
      <UIcon name="i-tabler-packages" class="text-xl text-primary" />
      <span>EZ Inventory</span>
    </div>

    <UCard class="auth-card">
      <slot />
    </UCard>

    <p class="auth-footnote">Open-source inventory management</p>
  </div>
</template>

<style scoped>
.auth-shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background:
    radial-gradient(circle at 20% 10%, color-mix(in oklab, var(--ui-primary) 10%, transparent), transparent 30%),
    radial-gradient(circle at 80% 90%, color-mix(in oklab, var(--ui-primary) 8%, transparent), transparent 32%);
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.auth-card {
  width: 100%;
  max-width: 430px;
}

.auth-footnote {
  color: rgb(113 113 122);
  font-size: 0.85rem;
}
</style>
