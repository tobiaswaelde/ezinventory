<template>
  <nav class="navbar">
    <button class="nav-btn" @click="$router.push('/')">Home</button>
    <button class="nav-btn" @click="$router.push('/inventory')">Inventory</button>
    <button class="nav-btn" @click="$router.push('/labels')">Labels</button>
    <button class="scan-btn" @click="$router.push('/scan')">Scan QR</button>
    <button class="nav-btn" @click="$router.push('/settings')">Settings</button>
  </nav>
</template>
