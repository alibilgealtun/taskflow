'use client';

import { useEffect, useCallback, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (!firstElement || !lastElement) return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;

    const previousElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';

    // Auto-focus first input or button
    const focusTimer = window.setTimeout(() => {
      if (dialogRef.current) {
        const firstInput = dialogRef.current.querySelector<HTMLElement>(
          'input, textarea, select, button:not([aria-label="Close dialog"])'
        ) ?? dialogRef.current.querySelector<HTMLElement>(
          'button[aria-label="Close dialog"]'
        );
        if (firstInput) {
          firstInput.focus();
        }
      }
    }, 50);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = 'unset';
      if (previousElement?.isConnected) {
        previousElement.focus();
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-overlay/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal dialog panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        aria-describedby={description ? 'dialog-description' : undefined}
        className={cn(
          // A tall form must scroll inside the panel on a short screen.
          'relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-2xl border border-surface-border bg-surface-card p-5 text-foreground shadow-xl shadow-elevation/10 animate-in fade-in zoom-in-95 duration-150 sm:p-6',
          {
            'max-w-sm': maxWidth === 'sm',
            'max-w-lg': maxWidth === 'md',
            'max-w-2xl': maxWidth === 'lg',
          }
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              {title && (
                <h3 id="dialog-title" className="text-lg font-semibold text-foreground">
                  {title}
                </h3>
              )}
              {description && (
                <p id="dialog-description" className="text-xs text-muted-foreground mt-0.5">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg p-1 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              aria-label="Close dialog"
            >
              <svg
                className="h-5 w-5"
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
        )}

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
