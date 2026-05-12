import { z, ZodType } from 'zod/v4';

export const useSchema = <T extends ZodType<any>>(schema: T, initialData?: MaybeRefOrGetter<unknown>) => {
  const data = ref<z.output<T>>(schema.parse(toValue(initialData) || {}));

  // Sync data when initialData changes (e.g., after API fetch)
  watch(
    () => toValue(initialData),
    (newData) => {
      if (newData) {
        data.value = schema.parse(newData);
      }
    },
    { immediate: true },
  );

  const validation = computed(() => schema.safeParse(data.value));

  const isValid = computed<boolean>(() => validation.value.success);

  return {
    data,
    validation,
    isValid,
  };
};
