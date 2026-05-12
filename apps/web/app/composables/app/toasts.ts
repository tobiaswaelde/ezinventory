import type { ToastProps, ToastEmits, EmitsToProps, StringOrVNode } from '#ui/types';

interface Toast extends Omit<ToastProps, 'defaultOpen'>, EmitsToProps<ToastEmits> {
  id: string | number;
  onClick?: (toast: Toast) => void;
}

export const useToasts = () => {
  const { t } = useI18n();
  const toast = useToast();

  const error = (message: StringOrVNode, options?: Partial<Toast>) => {
    toast.add({
      title: options?.title ?? t('common.toasts.error'),
      color: 'error',
      description: message,
      icon: 'i-tabler-exclamation-circle',
      ...options,
    });
  };

  const success = (message: StringOrVNode, options: Partial<Toast> = { title: t('common.toasts.success') }) => {
    toast.add({
      color: 'success',
      description: message,
      icon: 'i-tabler-check',
      ...options,
    });
  };

  const warning = (message: StringOrVNode, options: Partial<Toast> = { title: t('common.toasts.warning') }) => {
    toast.add({
      color: 'warning',
      description: message,
      icon: 'i-tabler-alert-triangle',
      ...options,
    });
  };

  const info = (message: StringOrVNode, options: Partial<Toast> = { title: t('common.toasts.info') }) => {
    toast.add({
      color: 'info',
      description: message,
      icon: 'i-tabler-info-circle',
      ...options,
    });
  };

  const push = (message: StringOrVNode, options: Partial<Toast> = {}) => {
    toast.add({
      color: 'neutral',
      description: message,
      icon: 'i-tabler-check',
      ...options,
    });
  };

  return {
    error,
    success,
    warning,
    info,
    push,
  };
};
