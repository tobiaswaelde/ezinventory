<template>
  <USelectMenu
    v-model="value"
    value-key="value"
    label-key="label"
    class="min-w-56"
    :items="items"
    :placeholder="placeholder ?? t('common.inputs.select-timezone.placeholder')"
    :required="required"
    :disabled="disabled"
    :icon="icon"
    virtualize
  >
    <template #item-trailing="{ item }">
      <span v-if="item.example" class="text-dimmed text-sm italic">{{ item.example }}</span>
    </template>
  </USelectMenu>
</template>

<script setup lang="ts">
import compareBy from 'compare-by';
import { getTimezone } from 'countries-and-timezones';
import { getIconForTimezone } from '~/util/timezone';

const { t } = useI18n();

const props = defineProps<{
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}>();
const value = defineModel<string | undefined>({ default: undefined });

const timezones = Intl.supportedValuesOf('timeZone');

type Item = { value: string | undefined; label: string; icon: string; example?: string };

const items = computed<Item[]>(() =>
  timezones
    .map((tz) => ({
      value: tz,
      label: tz,
      icon: getIconForTimezone(tz),
      timezone: getTimezone(tz),
    }))
    .toSorted(
      compareBy([
        { key: (x) => x.timezone?.utcOffset, dir: 'asc' },
        { key: 'label', dir: 'asc' },
      ]),
    )
    .map((tz) => ({
      ...tz,
      example: tz.timezone?.utcOffsetStr,
    })),
);

const icon = computed(() => {
  const selected = items.value.find((item) => item.value === value.value);
  return selected?.icon ?? 'i-tabler-timezone';
});
</script>
