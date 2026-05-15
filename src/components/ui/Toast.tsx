import { X } from 'lucide-react';
import { useToast as useToastContext } from '../../context/ToastContext';
import { cn } from '../../lib/utils';

export function Toast() {
  const { toasts, removeToast } = useToastContext();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "p-4 rounded-lg shadow-lg flex items-start gap-3 min-w-[300px] animate-in slide-in-from-right",
            toast.variant === 'success' && "bg-green-50 border-green-200 text-green-800",
            toast.variant === 'error' && "bg-red-50 border-red-200 text-red-800",
            toast.variant === 'warning' && "bg-amber-50 border-amber-200 text-amber-800",
            toast.variant === 'info' && "bg-blue-50 border-blue-200 text-blue-800"
          )}
        >
          <div className="flex-1">
            <p className="font-medium">{toast.title}</p>
            {toast.description && (
              <p className="text-sm mt-1 opacity-90">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
