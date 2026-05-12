import type { AvatarProps, DropdownMenuItem, SelectMenuItem } from '#ui/types';
import flagDe from '~/assets/images/flags/de.svg';
import flagUs from '~/assets/images/flags/us.svg';
import { useApi } from '~/composables/api/api';
import type { UpdateUserPreferencesDTO } from '~/types/api/modules/user-preferences';

const localesFlags: Map<string, string> = new Map();
localesFlags.set('de-DE', flagDe);
localesFlags.set('en-US', flagUs);

/**
 * Composable to get the available locales with their flags.
 * @returns The available locales with their flags.
 */
export const useLocales = () => {
  const { locales, locale, loadLocaleMessages, setLocale } = useI18n();

  const availableLocales = computed(() => {
    return locales.value.map((locale) => ({
      ...locale,
      flag: localesFlags.get(locale.code),
    }));
  });

  const dropdownMenuItems = computed<DropdownMenuItem[]>(() => {
    return availableLocales.value.map(
      ({ code, name, flag }) =>
        ({
          type: 'checkbox',
          label: name,
          avatar: flag ? { src: flag, alt: `${name} flag` } : undefined,
          checked: locale.value === code,
          onSelect: (e) => {
            e.preventDefault();
            handleSelectLocale(code);
          },
        }) as DropdownMenuItem,
    );
  });

  const selectMenuItems = computed<(SelectMenuItem & { value: string; avatar?: AvatarProps })[]>(() => {
    return availableLocales.value.map(
      ({ code, name, flag }) =>
        ({
          type: 'item',
          value: code,
          label: name,
          avatar: flag ? { src: flag, alt: `${name} flag` } : undefined,
        }) as SelectMenuItem & { value: string },
    );
  });

  const handleSelectLocale = async (code: any) => {
    // skip if locale has not changed
    if (locale.value === code) {
      return;
    }

    await loadLocaleMessages(code); // load the locale messages for the selected locale
    await setLocale(code); // set the locale to the selected locale
    locale.value = code; // set current locale

    useHead({ htmlAttrs: { lang: code } }); // update the HTML lang attribute

    // Save new locale value inside backend
    const data: Partial<UpdateUserPreferencesDTO> = {
      language: code,
    };
    await useApi().patch<UpdateUserPreferencesDTO>('/users/me/preferences', data);
  };

  return {
    availableLocales,
    dropdownMenuItems,
    selectMenuItems,
    locale,
    handleSelectLocale,
  };
};
