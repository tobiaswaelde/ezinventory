export const usePreventLeave = (dirty: Ref<boolean | undefined>) => {
  const { t } = useI18n();

  const beforeUnload = (event: BeforeUnloadEvent) => {
    if (!dirty.value) {
      return;
    }

    event.preventDefault();

    // required for older browsers
    event.returnValue = '';
  };

  onMounted(() => {
    window.addEventListener('beforeunload', beforeUnload);
  });

  onUnmounted(() => {
    window.removeEventListener('beforeunload', beforeUnload);
  });

  onBeforeRouteLeave(() => {
    if (!dirty.value) {
      return true;
    }

    return window.confirm(t('common.alerts.unsaved-changes'));
  });
};
