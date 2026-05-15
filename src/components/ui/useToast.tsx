import { useToast as useToastContext } from '../../context/ToastContext';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
}

export function useToast() {
  const { addToast } = useToastContext();

  return {
    toast: (options: ToastOptions) => {
      addToast(options);
    },
    success: (title: string, description?: string) => {
      addToast({ title, description, variant: 'success' });
    },
    error: (title: string, description?: string) => {
      addToast({ title, description, variant: 'error' });
    },
    warning: (title: string, description?: string) => {
      addToast({ title, description, variant: 'warning' });
    },
    info: (title: string, description?: string) => {
      addToast({ title, description, variant: 'info' });
    }
  };
}
