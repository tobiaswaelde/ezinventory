<template>
  <UDashboardGroup unit="rem" storage="local" storage-key="ezinventory">
    <template #default>
      <LayoutSidebar />

      <slot></slot>

      <!-- <CommonDialogsShortcuts /> -->
    </template>
  </UDashboardGroup>
</template>
