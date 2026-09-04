'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { registerAction } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorBanner } from '@/components/ui/error-banner';

interface RegisterFormErrors {
  email?: string | undefined;
  password?: string | undefined;
  confirmPassword?: string | undefined;
}

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const [fieldErrors, setFieldErrors] = useState<RegisterFormErrors>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setFieldErrors({});
    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string)?.trim() || '';
    const password = (formData.get('password') as string) || '';
    const confirmPassword = (formData.get('confirmPassword') as string) || '';

    const errors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

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

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm your password';
    } else if (password && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
          Create an account
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Start organizing your tasks with TaskFlow today.
        </p>
      </div>

      {state && !state.success && <ErrorBanner message={state.error} />}

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
          label="Password (min. 6 characters)"
          placeholder="••••••••"
          autoComplete="new-password"
          error={fieldErrors.password}
          onChange={() => {
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
          onChange={() => {
            if (fieldErrors.confirmPassword) {
              setFieldErrors((prev) => ({
                ...prev,
                confirmPassword: undefined,
              }));
            }
          }}
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
