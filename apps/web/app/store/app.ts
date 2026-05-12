import { useLocalStorage } from '@vueuse/core';
import pjson from '~/../package.json';

export const useAppStore = defineStore('app', () => {
  const version = computed(() => pjson.version);

  return {
    version,
  };
});
