'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorBanner } from '@/components/ui/error-banner';

interface LoginFormProps {
  initialError?: string | undefined;
}

interface LoginFormErrors {
  email?: string | undefined;
  password?: string | undefined;
}

export function LoginForm({ initialError }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>({});

  const displayError = state && !state.success ? state.error : initialError;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setFieldErrors({});
    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string)?.trim() || '';
    const password = (formData.get('password') as string) || '';

    const errors: { email?: string; password?: string } = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(errors).length > 0) {
      e.preventDefault();
      setFieldErrors(errors);
      return;
    }
  };

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

      {displayError && <ErrorBanner message={displayError} />}

      <form
        action={formAction}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        <Input
          id="email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="name@example.com"
          autoComplete="email"
          error={fieldErrors.email}
          onChange={() => {
            if (fieldErrors.email) {
              setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={fieldErrors.password}
          onChange={() => {
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
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
