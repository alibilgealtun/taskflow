import { type HTMLAttributes, type JSX } from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'outline'
  | 'backlog'
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'none'
  | 'low'
  | 'medium'
  | 'high';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  withDot?: boolean;
}

const NEUTRAL_BADGE =
  'bg-surface-elevated text-muted-foreground border-surface-border';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: NEUTRAL_BADGE,
  outline: 'bg-transparent text-muted-foreground border-surface-border',
  backlog: NEUTRAL_BADGE,
  pending: NEUTRAL_BADGE,
  in_progress: NEUTRAL_BADGE,
  completed: NEUTRAL_BADGE,
  cancelled: NEUTRAL_BADGE,
  none: NEUTRAL_BADGE,
  low: NEUTRAL_BADGE,
  medium: NEUTRAL_BADGE,
  high: NEUTRAL_BADGE,
};

const DOT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-muted-foreground',
  outline: 'bg-muted-foreground',
  backlog: 'bg-status-backlog',
  pending: 'bg-status-pending',
  in_progress: 'bg-status-progress',
  completed: 'bg-status-completed',
  cancelled: 'bg-muted-foreground',
  none: 'bg-priority-none',
  low: 'bg-priority-low',
  medium: 'bg-priority-medium',
  high: 'bg-priority-high',
};

export function Badge({
  className,
  variant = 'default',
  withDot = false,
  children,
  ...props
}: BadgeProps): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium select-none transition-colors',
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    >
      {withDot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', DOT_CLASSES[variant])} />
      )}
      {children}
    </span>
  );
}
