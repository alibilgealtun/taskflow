// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeSwitch } from '@/components/ui/theme-switch';

afterEach(() => {
  cleanup();
  document.documentElement.className = '';
  document.cookie = 'theme=;path=/;max-age=0';
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('ThemeSwitch', () => {
  it('shows the current theme and describes the next action', () => {
    document.documentElement.classList.add('dark');

    render(<ThemeSwitch initialTheme="dark" />);

    expect(screen.getByRole('button', { name: 'Switch to light theme' }).textContent)
      .toBe('Theme: Dark');
  });

  it('updates the document, cookie, and label when clicked', async () => {
    document.documentElement.classList.add('dark');
    const user = userEvent.setup();

    render(<ThemeSwitch initialTheme="dark" />);
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.cookie).toContain('theme=light');
    expect(screen.getByRole('button', { name: 'Switch to dark theme' }).textContent)
      .toBe('Theme: Light');
  });

  it('still switches when cross-tab storage is unavailable', async () => {
    document.documentElement.classList.add('dark');
    vi.spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('Storage unavailable');
      });
    const user = userEvent.setup();

    render(<ThemeSwitch initialTheme="dark" />);
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(screen.getByRole('button', { name: 'Switch to dark theme' }).textContent)
      .toBe('Theme: Light');
  });

  it('updates when another tab changes the theme', () => {
    document.documentElement.classList.add('dark');
    render(<ThemeSwitch initialTheme="dark" />);

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'theme',
          newValue: 'light',
        })
      );
    });

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(screen.getByRole('button', { name: 'Switch to dark theme' }).textContent)
      .toBe('Theme: Light');
  });
});
