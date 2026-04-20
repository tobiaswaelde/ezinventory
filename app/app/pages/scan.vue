<script setup lang="ts">
const scannedValue = ref('');
const selectedAction = ref<'stock-out' | 'stock-in' | 'transfer'>('stock-out');
</script>

<template>
  <section class="card">
    <h1>Scan QR</h1>
    <p>Camera integration comes next. For now this screen mirrors the flow target.</p>
    <div class="field">
      <label for="code">Scanned code</label>
      <input id="code" v-model="scannedValue" placeholder="Paste scanned QR value" />
    </div>
    <div class="field">
      <label for="action">Primary action</label>
      <select id="action" v-model="selectedAction">
        <option value="stock-out">Stock Out</option>
        <option value="stock-in">Stock In</option>
        <option value="transfer">Transfer</option>
      </select>
    </div>
  </section>
</template>
