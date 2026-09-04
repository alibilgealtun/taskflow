'use client';

import { cn } from '@/lib/utils';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Inline error banner for forms and content areas.
 *
 * Matches the TaskFlow design system: `danger` border, tinted background,
 * warning icon, and an optional dismiss button.
 */
export function ErrorBanner({ message, onDismiss, className }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-danger-fg font-medium',
        className
      )}
    >
      <svg
        className="h-4 w-4 shrink-0 mt-px"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>

      <span className="flex-1">{message}</span>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 text-danger-fg/60 hover:text-danger-fg transition-colors cursor-pointer"
          aria-label="Dismiss error"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
