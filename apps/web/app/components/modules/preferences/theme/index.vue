<template>
  <UPageCard variant="subtle" :ui="{ header: 'mb-0' }">
    <template #header>
      <LayoutPageCardHeader
        icon="i-tabler-palette"
        :title="$t('modules.preferences.theme.title')"
        :description="$t('modules.preferences.theme.description')"
      />
    </template>

    <URadioGroup
      indicator="hidden"
      :orientation="isGreater('sm') ? 'horizontal' : 'vertical'"
      :ui="{ fieldset: 'gap-x-6' }"
      :items="themes"
      :value-key="'value'"
      :model-value="preferredTheme"
    >
      <template #label="{ item }">
        <button
          class="flex cursor-pointer flex-col items-start gap-2"
          @click="setTheme(item.value, $event.clientX, $event.clientY)"
        >
          <div
            class="h-auto w-32"
            :class="[
              'overflow-hidden rounded-lg',
              'border-2 transition-all duration-300',
              {
                'border-primary': item['value'] === colorMode.preference,
                'border-transparent': item['value'] !== colorMode.preference,
              },
            ]"
          >
            <ModulesPreferencesThemeIconSystem v-if="item.value === 'system'" />
            <ModulesPreferencesThemeIconLight v-else-if="item.value === 'light'" />
            <ModulesPreferencesThemeIconDark v-else-if="item.value === 'dark'" />
          </div>

          <span
            class="text-left text-[15px] font-medium transition-all duration-300"
            :class="{ 'text-muted': item.value !== colorMode.preference }"
          >
            {{ item.label }}
          </span>
        </button>
      </template>
    </URadioGroup>
  </UPageCard>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import { useThemes, type Theme } from '~/composables/app/themes';

const { colorMode, setTheme, themes } = useThemes();
const { isGreater } = useBreakpoints(breakpointsTailwind);

const preferredTheme = computed<Theme>(() => colorMode.preference as Theme);
</script>
