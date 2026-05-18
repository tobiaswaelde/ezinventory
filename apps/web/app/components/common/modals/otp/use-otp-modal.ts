import { CommonModalsOtp } from '#components';
import { render } from 'vue';

export type OtpModalOptions = {
  title?: string;
  description?: string;
  length?: number;
  autoSubmit?: boolean;
};

export const useOtpModal = (options: OtpModalOptions = {}) => {
  const nuxtApp = useNuxtApp();

  return new Promise<string | undefined>((resolve, reject) => {
    const container = document.createElement('div');

    const handleCleanup = () => {
      setTimeout(() => {
        render(null, container);
        document.body.removeChild(container);
      }, 100);
    };

    const vNode = h(CommonModalsOtp, {
      ...options,
      onCancel: () => {
        reject();
        handleCleanup();
      },
      onSubmit: (otp: string) => {
        resolve(otp);
        handleCleanup();
      },
    });

    vNode.appContext = nuxtApp.vueApp._context;

    render(vNode, container);
    document.body.appendChild(container);
  });
};
