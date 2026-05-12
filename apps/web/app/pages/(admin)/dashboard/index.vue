<template>
  <UDashboardPanel id="dashboard">
    <template #header>
      <LayoutNavbar :title="$t('core.navigation.dashboard')" />
    </template>

    <template #body>
      <CommonAlertsComingSoon />
    </template>
  </UDashboardPanel>
</template>
