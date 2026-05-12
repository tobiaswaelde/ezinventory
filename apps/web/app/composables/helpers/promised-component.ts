import { render, type AllowedComponentProps, type VNodeProps } from 'vue';

//#region types
type ComponentPropsAndEmits<C extends Component> = C extends new (...args: any) => any
  ? Omit<InstanceType<C>['$props'], keyof VNodeProps | keyof AllowedComponentProps>
  : never;

type ComponentProps<C extends Component> = Omit<ComponentPropsAndEmits<C>, `on${string}`>;

type ComponentEmits<C extends Component> = {
  [K in keyof ComponentPropsAndEmits<C> as K extends `on${infer E}` ? `on${E}` : never]: ComponentPropsAndEmits<C>[K];
};

/**
 * Helper type to make all properties required and remove '| undefined' from event handler types.
 * Example: { onClose?: (() => any) | undefined } -> { onClose: () => any }
 */
type StrictRequired<T> = {
  [K in keyof T]-?: Exclude<T[K], undefined>;
};

type RelevantEmit = 'onSubmit' | 'onClose';
type hasRelevantEmits<T extends Component> = RelevantEmit extends keyof ComponentEmits<T> ? true : false;
//#endregion

export const usePromisedComponent = <
  TComponent extends hasRelevantEmits<TComponent> extends true
    ? Component
    : { __error__: `Missing relevant emits: ${RelevantEmit}` },
>(
  component: TComponent,
) => {
  type TComponentEmits = StrictRequired<ComponentEmits<TComponent>>;
  type OnSubmitData = TComponentEmits extends { onSubmit: (data: any) => void }
    ? Parameters<TComponentEmits['onSubmit']>[0]
    : never;

  const nuxtApp = useNuxtApp();

  const show = async (options: ComponentProps<TComponent>) => {
    return new Promise<boolean | OnSubmitData>((resolve) => {
      const container = document.createElement('div');

      const handleCleanup = () => {
        render(null, container);
        document.body.removeChild(container);
      };

      const vNode = h(component, {
        ...options,
        onClose: () => {
          resolve(false);
          handleCleanup();
        },
        onSubmit: (data: OnSubmitData) => {
          resolve(data ?? true);
          handleCleanup();
        },
      });

      vNode.appContext = nuxtApp.vueApp._context;

      render(vNode, container);
      document.body.appendChild(container);
    });
  };

  return { show };
};
