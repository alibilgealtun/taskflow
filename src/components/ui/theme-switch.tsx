'use client';

import { useLayoutEffect, useState, type JSX } from 'react';
import { Button } from '@/components/ui/button';
import { getOppositeTheme, THEME_COOKIE, type Theme } from '@/lib/theme';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export interface ThemeSwitchProps {
  /** Theme the server rendered, read from the cookie. Keeps the first paint in sync. */
  initialTheme: Theme;
}

function readThemeFromDom(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function applyTheme(theme: Theme, broadcast = true): void {
  const secure = window.location.protocol === 'https:' ? ';Secure' : '';
  document.cookie = `${THEME_COOKIE}=${theme};path=/;max-age=${ONE_YEAR_IN_SECONDS};SameSite=Lax${secure}`;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  if (broadcast) {
    try {
      localStorage.setItem(THEME_COOKIE, theme);
    } catch {
      // Cross-tab sync stays off if storage is not available.
    }
  }
}

export function ThemeSwitch({ initialTheme }: ThemeSwitchProps): JSX.Element {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  // React drops the class from <html> on the dev remount. Put it back before paint.
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');

    const handleStorage = (event: StorageEvent): void => {
      if (
        event.key === THEME_COOKIE &&
        (event.newValue === 'light' || event.newValue === 'dark')
      ) {
        applyTheme(event.newValue, false);
        setTheme(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [initialTheme]);

  const handleToggle = (): void => {
    // The <html> class is the source of truth. Another tab may have changed it.
    const next = getOppositeTheme(readThemeFromDom());
    applyTheme(next);
    setTheme(next);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="px-2.5 text-xs"
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {/* The prefix costs too much width on a phone. */}
      <span className="hidden sm:inline">Theme: </span>
      {theme === 'dark' ? 'Dark' : 'Light'}
    </Button>
  );
}
