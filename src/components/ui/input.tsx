import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-surface-card px-3.5 text-sm text-foreground placeholder:text-subtle-foreground transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-danger/80 focus:ring-danger'
              : 'border-surface-border hover:border-surface-border-hover',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs font-medium text-danger-fg mt-1">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
