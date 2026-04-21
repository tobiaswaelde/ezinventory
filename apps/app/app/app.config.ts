export default defineAppConfig({
  ui: {
    icons: {
      arrowDown: 'i-tabler-arrow-down',
      arrowLeft: 'i-tabler-arrow-left',
      arrowRight: 'i-tabler-arrow-right',
      arrowUp: 'i-tabler-arrow-up',
      caution: 'i-tabler-alert-square-rounded',
      check: 'i-tabler-check',
      chevronDoubleLeft: 'i-tabler-chevrons-left',
      chevronDoubleRight: 'i-tabler-chevrons-right',
      chevronDown: 'i-tabler-chevron-down',
      chevronLeft: 'i-tabler-chevron-left',
      chevronRight: 'i-tabler-chevron-right',
      chevronUp: 'i-tabler-chevron-up',
      close: 'i-tabler-x',
      copy: 'i-tabler-copy',
      copyCheck: 'i-tabler-copy-check',
      dark: 'i-tabler-moon',
      drag: 'i-tabler-grip-vertical',
      ellipsis: 'i-tabler-dots',
      error: 'i-tabler-square-rounded-x',
      external: 'i-tabler-external-link',
      eye: 'i-tabler-eye',
      eyeOff: 'i-tabler-eye-off',
      file: 'i-tabler-file',
      folder: 'i-tabler-folder',
      folderOpen: 'i-tabler-folder-open',
      hash: 'i-tabler-hash',
      info: 'i-tabler-info-square-rounded',
      light: 'i-tabler-sun',
      loading: 'i-tabler-loader-2',
      menu: 'i-tabler-menu',
      minus: 'i-tabler-minus',
      panelClose: 'i-tabler-layout-sidebar-left-collapse',
      panelOpen: 'i-tabler-layout-sidebar-left-expand',
      plus: 'i-tabler-plus',
      reload: 'i-tabler-reload',
      search: 'i-tabler-search',
      stop: 'i-tabler-player-stop',
      success: 'i-tabler-square-rounded-check',
      system: 'i-tabler-device-desktop',
      tip: 'i-tabler-bulb',
      upload: 'i-tabler-upload',
      warning: 'i-tabler-alert-triangle'
    },
    colors: {
      primary: 'sky',
      secondary: 'rose',
      neutral: 'zinc',
      success: 'green',
      warning: 'amber',
      amber: 'amber',
      blue: 'blue',
      cyan: 'cyan',
      emerald: 'emerald',
      fuchsia: 'fuchsia',
      gray: 'gray',
      green: 'green',
      indigo: 'indigo',
      lime: 'lime',
      orange: 'orange',
      pink: 'pink',
      purple: 'purple',
      red: 'red',
      rose: 'rose',
      sky: 'sky',
      slate: 'slate',
      teal: 'teal',
      violet: 'violet',
      yellow: 'yellow',
      zinc: 'zinc'
    },
    breadcrumb: {
      slots: {
        linkLabel: 'text-xs',
        linkLeadingIcon: 'size-4',
        separatorIcon: 'size-3.5'
      }
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
    formField: {
      slots: {
        root: 'w-full'
      }
    },
    input: {
      slots: {
        root: 'w-full'
      }
    },
    inputNumber: {
      slots: {
        root: 'w-full'
      }
    },
    modal: {
      slots: {
        footer: 'flex justify-end gap-2'
      }
    },
    select: {
      slots: {
        base: 'cursor-pointer',
        item: 'cursor-pointer',
        trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
      }
    },
    selectMenu: {
      slots: {
        base: 'cursor-pointer',
        item: 'cursor-pointer',
        trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
      }
    },
    textarea: {
      slots: {
        root: 'w-full'
      }
    },
    table: {
      slots: {
        th: 'p-2 truncate',
        td: 'p-2 border-b border-default'
      }
    },
    pageCard: {
      variants: {
        highlight: {
          true: {
            root: 'ring-1'
          }
        }
      }
    }
  }
});
