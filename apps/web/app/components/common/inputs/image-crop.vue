<template>
  <UModal v-model:open="open" :title="$t('modules.inputs.image-crop.title')" :ui="{ body: 'space-y-4' }">
    <template #body>
      <Cropper
        ref="cropperRef"
        class="h-[420px] w-full"
        :src="imageUrl"
        :stencil-component="CircleStencil"
        :stencil-props="{ aspectRatio: 1 }"
        :resize-image="{ adjustStencil: false }"
        image-restriction="stencil"
      />
    </template>

    <template #footer>
      <UButton
        icon="i-tabler-cancel"
        color="error"
        variant="outline"
        :label="$t('common.labels.cancel')"
        @click="open = false"
      />
      <UButton
        icon="i-tabler-crop"
        color="primary"
        variant="solid"
        :label="$t('modules.inputs.image-crop.crop')"
        @click="handleCrop"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { CircleStencil, Cropper } from 'vue-advanced-cropper';
import type { CropperResult } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import 'vue-advanced-cropper/dist/theme.bubble.css';

const props = defineProps<{
  image: File;
}>();

const emit = defineEmits<{
  (e: 'cropped', value: File): void;
}>();

const open = defineModel<boolean>('open');
const cropperRef = ref<InstanceType<typeof Cropper>>();

const imageUrl = ref<string>('');

const handleCrop = () => {
  const result = cropperRef.value?.getResult() as CropperResult | undefined;
  const canvas = result?.canvas;
  if (!canvas) return;

  canvas.toBlob(
    (blob) => {
      if (!blob) return;

      const extension = props.image.type.split('/')[1] || 'png';
      const name = props.image.name.replace(/\.[^/.]+$/, '') || 'avatar';
      const croppedFile = new File([blob], `${name}-cropped.${extension}`, {
        type: blob.type || props.image.type,
      });

      emit('cropped', croppedFile);
      open.value = false;
    },
    props.image.type,
    0.92,
  );
};

watch(
  () => props.image,
  (value, previous) => {
    if (previous && imageUrl.value) {
      URL.revokeObjectURL(imageUrl.value);
    }
    imageUrl.value = URL.createObjectURL(value);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
});
</script>
