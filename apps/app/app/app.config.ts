export default defineAppConfig({
  ui: {
    icons: {
      chevronDown: 'i-tabler-chevron-down',
      chevronLeft: 'i-tabler-chevron-left',
      chevronRight: 'i-tabler-chevron-right',
      close: 'i-tabler-x',
      dark: 'i-tabler-moon',
      external: 'i-tabler-external-link',
      light: 'i-tabler-sun',
      loading: 'i-tabler-loader-2',
      menu: 'i-tabler-menu',
      search: 'i-tabler-search'
    },
    colors: {
      primary: 'cyan',
      neutral: 'zinc',
      success: 'green',
      warning: 'amber',
      error: 'red',
      cyan: 'cyan',
      zinc: 'zinc'
    },
    button: {
      slots: {
        base: 'cursor-pointer'
      }
    },
    dropdownMenu: {
      slots: {
        item: 'cursor-pointer'
      }
    },
    input: {
      slots: {
        root: 'w-full'
      }
    },
    select: {
      slots: {
        base: 'cursor-pointer',
        item: 'cursor-pointer'
      }
    },
    textarea: {
      slots: {
        root: 'w-full'
      }
    }
  }
});
