'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Icon variants
// ---------------------------------------------------------------------------

function WarningIcon() {
  return (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger-fg">
      <svg
        className="h-6 w-6"
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
    </div>
  );
}

function LockIcon() {
  return (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-surface-border bg-surface-elevated text-foreground">
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    </div>
  );
}

function NotFoundIcon() {
  return (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-surface-border bg-surface-elevated text-foreground">
      <span className="font-bold text-base">404</span>
    </div>
  );
}

const ICON_MAP = {
  warning: WarningIcon,
  lock: LockIcon,
  notFound: NotFoundIcon,
} as const;

// ---------------------------------------------------------------------------
// ErrorState component
// ---------------------------------------------------------------------------

interface ErrorAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

interface ErrorStateProps {
  title: string;
  message: string;
  icon?: keyof typeof ICON_MAP;
  action?: ErrorAction;
  layout?: 'page' | 'section';
  className?: string;
}

/**
 * Centered error card for error boundaries and full-page error states.
 *
 * - `layout="page"` — full-screen centered with background. Used by root and
 *   standalone error boundaries.
 * - `layout="section"` — inline card inside the dashboard layout.
 */
export function ErrorState({
  title,
  message,
  icon = 'warning',
  action,
  layout = 'section',
  className,
}: ErrorStateProps) {
  const IconComponent = ICON_MAP[icon];
  const isPage = layout === 'page';

  const card = (
    <div
      className={cn(
        'w-full max-w-md space-y-4 rounded-2xl border p-8 text-center',
        icon === 'warning'
          ? 'border-danger/30 bg-surface-card'
          : 'border-surface-border bg-surface-card',
        !isPage && 'mx-auto my-12',
        className
      )}
    >
      <IconComponent />

      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {message}
      </p>

      {action && (
        <div className="pt-2">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-brand-primary px-4 text-xs font-medium text-brand-on-primary transition-colors duration-150 hover:bg-brand-hover active:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              {action.label}
            </Link>
          ) : (
            <Button
              onClick={action.onClick}
              variant="primary"
              size="sm"
            >
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (isPage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface-bg text-foreground">
        {card}
      </div>
    );
  }

  return card;
}
