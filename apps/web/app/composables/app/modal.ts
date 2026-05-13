export const useModal = () => {
  const open = ref<boolean>(false);
  const canClose = ref<boolean>(true);

  return { open, canClose };
};
