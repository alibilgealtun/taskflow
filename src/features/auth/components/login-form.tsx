'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginFormProps {
  initialError?: string | undefined;
}

export function LoginForm({ initialError }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  const displayError = state && !state.success ? state.error : initialError;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          Welcome back
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Enter your credentials to access your task dashboard.
        </p>
      </div>

      {displayError && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-danger-fg font-medium">
          {displayError}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <Input
          id="email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="name@example.com"
          required
          autoComplete="email"
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />

        <Button
          type="submit"
          className="w-full mt-2"
          size="md"
          isLoading={isPending}
        >
          {isPending ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-surface-border">
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-brand-primary hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
