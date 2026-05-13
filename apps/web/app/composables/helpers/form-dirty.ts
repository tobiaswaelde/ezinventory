type DirtyFormRef = {
  dirty?: boolean;
};

/**
 * Watches the dirty state of a form and updates the provided dirty ref accordingly.
 * @param {Ref<DirtyFormRef | null>} formRef A ref to the form component that has a dirty property.
 * @param {Ref<boolean | undefined>} dirty A ref that will be updated with the dirty state of the form.
 */
export const useFormDirty = (formRef: Ref<DirtyFormRef | null>, dirty: Ref<boolean | undefined>) => {
  watch(
    () => formRef.value?.dirty,
    (value) => {
      dirty.value = value ?? false;
    },
  );
};
