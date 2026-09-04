import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-surface-elevated/80 border border-surface-border/50',
        className
      )}
      {...props}
    />
  );
}
