import type { InjectionKey } from 'vue';

export const injectStrict = <T>(key: InjectionKey<T>) => {
  const injected = inject(key);

  if (!injected) {
    throw `No injection for key ${String(key)} found`;
  }

  return injected;
};
