'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message }]);

      const duration = type === 'error' ? 5000 : 3500;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-center justify-between gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-5',
              {
                'border-status-completed/40 bg-surface-card/95 text-status-completed':
                  toast.type === 'success',
                'border-danger/40 bg-surface-card/95 text-danger-fg':
                  toast.type === 'error',
                'border-brand-primary/40 bg-surface-card/95 text-foreground':
                  toast.type === 'info',
              }
            )}
          >
            <div className="flex items-center gap-2.5 text-xs font-medium">
              {toast.type === 'success' && (
                <svg
                  className="h-4 w-4 text-status-completed shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg
                  className="h-4 w-4 text-danger-fg shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg
                  className="h-4 w-4 text-brand-primary shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors cursor-pointer"
              aria-label="Dismiss toast"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return {
    toast: context.showToast,
    success: (msg: string) => context.showToast(msg, 'success'),
    error: (msg: string) => context.showToast(msg, 'error'),
    info: (msg: string) => context.showToast(msg, 'info'),
  };
}
