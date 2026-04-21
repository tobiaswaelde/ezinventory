<template>
  <section class="card">
    <h1>Scan QR</h1>
    <p>Use camera scanner to identify an item and trigger quick actions.</p>

    <div class="scanner-wrap">
      <video ref="videoRef" class="scanner-video" muted playsinline></video>
    </div>

    <div class="scanner-actions">
      <UButton color="primary" variant="solid" :disabled="isScanning" @click="startScanner">
        {{ isScanning ? 'Scanner Running' : 'Start Scanner' }}
      </UButton>
      <UButton color="neutral" variant="soft" :disabled="!isScanning" @click="stopScanner">Stop Scanner</UButton>
    </div>

    <UAlert
      v-if="scanMessage"
      :color="scannedItem ? 'green' : 'neutral'"
      variant="soft"
      title="Scanner Status"
      :description="scanMessage"
    />

    <div class="field">
      <label for="code">Scanned code</label>
      <UInput id="code" v-model="scannedValue" placeholder="Paste scanned QR value" />
    </div>

    <UButton color="neutral" variant="soft" @click="lookupScannedCode(scannedValue)">Lookup Code</UButton>
  </section>

  <section v-if="scannedItem" class="card">
    <h2>Scanned Item</h2>
    <p><strong>Name:</strong> {{ scannedItem.name }}</p>
    <p><strong>SKU:</strong> {{ scannedItem.sku }}</p>
    <p><strong>QR Value:</strong> {{ scannedItem.qrCodeValue }}</p>
    <p><strong>Unit:</strong> {{ scannedItem.unit }}</p>
    <p><strong>Size:</strong> {{ formatSize(scannedItem) }}</p>
    <p><strong>Servings:</strong> {{ scannedItem.servings ?? 'n/a' }}</p>

    <div class="field">
      <label for="action">Quick action</label>
      <USelect
        id="action"
        v-model="selectedAction"
        :items="quickActionOptions"
        label-key="label"
        value-key="value"
      />
    </div>

    <div class="field" v-if="selectedAction === 'stock-out'">
      <label for="qty">Quantity</label>
      <UInput id="qty" v-model.number="stockOutQuantity" type="number" min="1" step="1" />
    </div>

    <UButton color="primary" variant="solid" @click="applyQuickAction">Apply Action</UButton>
    <UAlert
      v-if="actionMessage"
      :color="selectedAction === 'stock-out' ? 'green' : 'neutral'"
      variant="soft"
      title="Quick Action"
      :description="actionMessage"
    />
  </section>
</template>


<script setup lang="ts">
import type { ItemResponse } from '@ezinventory/contracts';
import type { BrowserMultiFormatReader } from '@zxing/browser';
import {
  validateScannedCodeInput,
  validateStockOutQuantityInput,
  SCAN_VALIDATION_MESSAGE_KEYS
} from '~/utils/scan-validation';

const { lookupItemByCode } = useApiClient();
const { t } = useI18n();

const videoRef = ref<HTMLVideoElement | null>(null);
const scannedValue = ref('');
const selectedAction = ref<'stock-out' | 'stock-in' | 'transfer'>('stock-out');
const scannedItem = ref<ItemResponse | null>(null);
const scanMessage = ref('');
const actionMessage = ref('');
const stockOutQuantity = ref(1);
const isScanning = ref(false);
  const quickActionOptions = [
  { label: 'Stock Out', value: 'stock-out' },
  { label: 'Stock In', value: 'stock-in' },
  { label: 'Transfer', value: 'transfer' }
] as const;

let reader: BrowserMultiFormatReader | null = null;
let controls: { stop: () => void } | null = null;

const lookupScannedCode = async (code: string): Promise<void> => {
  scannedItem.value = null;
  actionMessage.value = '';

  const codeValidationError = validateScannedCodeInput(code);
  if (codeValidationError) {
    scanMessage.value = t(codeValidationError as never);
    return;
  }

  try {
    const item = await lookupItemByCode(code.trim());
    scannedItem.value = item;
    scanMessage.value = `${t('scan_message_matched_item_prefix')} ${item.name}`;
  } catch {
    scanMessage.value = t('scan_error_item_not_found');
  }
};

const onDetected = async (code: string): Promise<void> => {
  scannedValue.value = code;
  await stopScanner();
  await lookupScannedCode(code);
};

const startScanner = async (): Promise<void> => {
  scanMessage.value = '';

  if (isScanning.value || !videoRef.value) {
    return;
  }

  if (!window.isSecureContext) {
    scanMessage.value = t('scan_error_secure_context_required');
    return;
  }

  try {
    const { BrowserMultiFormatReader } = await import('@zxing/browser');
    const { NotFoundException } = await import('@zxing/library');
    const readerInstance = new BrowserMultiFormatReader();
    reader = readerInstance;
    const devices = await BrowserMultiFormatReader.listVideoInputDevices();

    const preferredDevice = devices.find((device) => /back|rear|environment/i.test(device.label));
    const deviceId = preferredDevice?.deviceId;

    isScanning.value = true;
    controls = await readerInstance.decodeFromVideoDevice(deviceId, videoRef.value, (result: { getText: () => string } | undefined, error: unknown) => {
      if (result) {
        void onDetected(result.getText());
        return;
      }

      if (error && !(error instanceof NotFoundException)) {
        scanMessage.value = t('scan_error_scanning');
      }
    });

    scanMessage.value = t('scan_message_scanner_active');
  } catch {
    isScanning.value = false;
    scanMessage.value = t('scan_error_scanner_start');
  }
};

const stopScanner = async (): Promise<void> => {
  if (controls) {
    controls.stop();
    controls = null;
  }

  if (reader) {
    reader = null;
  }

  isScanning.value = false;
};

const formatSize = (item: ItemResponse): string => {
  if (!item.sizeLabel && item.sizeValue === null && !item.sizeUnit) {
    return 'n/a';
  }

  return `${item.sizeLabel ?? ''} ${item.sizeValue ?? ''} ${item.sizeUnit ?? ''}`.trim();
};

const applyQuickAction = async (): Promise<void> => {
  if (!scannedItem.value) {
    actionMessage.value = t(SCAN_VALIDATION_MESSAGE_KEYS.noScannedItem as never);
    return;
  }

  if (selectedAction.value !== 'stock-out') {
    actionMessage.value = t('scan_message_quick_action_planned');
    return;
  }

  const quantityValidationError = validateStockOutQuantityInput(stockOutQuantity.value);
  if (quantityValidationError) {
    actionMessage.value = t(quantityValidationError as never);
    return;
  }

  actionMessage.value = `${t('scan_message_prepared_stock_out_prefix')} ${scannedItem.value.name} (qty: ${stockOutQuantity.value}).`;
};

onBeforeUnmount(() => {
  void stopScanner();
});
</script>


<style scoped>
.scanner-wrap {
  background: #0f172a;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.scanner-video {
  width: 100%;
  height: 240px;
  display: block;
  object-fit: cover;
}

.scanner-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
</style>
