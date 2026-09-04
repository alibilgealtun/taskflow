'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          Create an account
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Start organizing your tasks with TaskFlow today.
        </p>
      </div>

      {state && !state.success && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-danger-fg font-medium">
          {state.error}
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
          label="Password (min. 6 characters)"
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />

        <Button
          type="submit"
          className="w-full mt-2"
          size="md"
          isLoading={isPending}
        >
          {isPending ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-surface-border">
        <p className="text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-brand-primary hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
