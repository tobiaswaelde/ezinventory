<script setup lang="ts">
const { theme, loadTheme, setTheme } = useTheme();

onMounted(() => {
  loadTheme();
});
</script>

<template>
  <section class="card">
    <h1>EZ Inventory</h1>
    <p>Mobile-first inventory management bootstrap is running.</p>
    <p><strong>Theme:</strong> {{ theme }}</p>
    <button class="nav-btn" @click="setTheme(theme === 'light' ? 'dark' : 'light')">
      Toggle Theme
    </button>
  </section>

  <section class="card">
    <h2>Quick Navigation</h2>
    <p>Use the center scan button in the mobile navbar for QR-first workflows.</p>
  </section>
</template>
