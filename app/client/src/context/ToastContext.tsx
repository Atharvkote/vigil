import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: Toast = { id, type, title, message, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div 
        aria-live="polite" 
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 size={18} className="text-success shrink-0" />,
            error: <AlertCircle size={18} className="text-danger shrink-0" />,
            warning: <AlertTriangle size={18} className="text-warning shrink-0" />,
            info: <Info size={18} className="text-info shrink-0" />,
          };

          const borders = {
            success: 'border-success/30 bg-surface',
            error: 'border-danger/30 bg-surface',
            warning: 'border-warning/30 bg-surface',
            info: 'border-info/30 bg-surface',
          };

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg transition-all transform translate-y-0 ${borders[toast.type]}`}
            >
              {icons[toast.type]}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground tracking-wide">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs text-muted mt-0.5 line-clamp-2">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-muted hover:text-foreground p-0.5 rounded transition-colors"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
