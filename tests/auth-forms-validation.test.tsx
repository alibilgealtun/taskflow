// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/features/auth/components/login-form';
import { RegisterForm } from '@/features/auth/components/register-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock('@/features/auth/actions', () => ({
  loginAction: vi.fn(),
  registerAction: vi.fn(),
}));

afterEach(cleanup);

describe('LoginForm client validation', () => {
  it('has noValidate and shows English field errors when submitted empty', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText('Email Address');
    const form = emailInput.closest('form');

    expect(form?.noValidate).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(screen.queryByText('Email is required')).not.toBeNull();
    expect(screen.queryByText('Password is required')).not.toBeNull();
    expect(emailInput.getAttribute('aria-invalid')).toBe('true');

    await user.type(emailInput, 'test@example.com');
    expect(screen.queryByText('Email is required')).toBeNull();
  });
});

describe('RegisterForm client validation', () => {
  it('has noValidate and shows English field errors when submitted empty', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText('Email Address');
    const form = emailInput.closest('form');

    expect(form?.noValidate).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(screen.queryByText('Email is required')).not.toBeNull();
    expect(screen.queryByText('Password is required')).not.toBeNull();
    expect(screen.queryByText('Confirm your password')).not.toBeNull();
    expect(emailInput.getAttribute('aria-invalid')).toBe('true');
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText('Email Address'), 'user@test.com');
    await user.type(screen.getByLabelText('Password (min. 6 characters)'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'different123');

    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(screen.queryByText('Passwords do not match')).not.toBeNull();
  });
});
