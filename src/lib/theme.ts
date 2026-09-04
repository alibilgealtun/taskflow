export type Theme = 'light' | 'dark';

export const THEME_COOKIE = 'theme';
export const DEFAULT_THEME: Theme = 'dark';

export function parseThemeCookie(value: string | undefined): Theme {
  if (value === 'light' || value === 'dark') {
    return value;
  }
  return DEFAULT_THEME;
}

export function themeClassName(theme: Theme): string {
  return theme === 'dark' ? 'dark' : '';
}

export function getOppositeTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark';
}

/**
 * Inline script for the document head. It reads the theme cookie and sets the
 * class on <html> while the browser parses the page, so there is no flash.
 * The root layout stays static because it does not read the cookie itself.
 */
export function themeInitScript(): string {
  const defaultIsDark = DEFAULT_THEME === 'dark';
  return `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);var t=m?decodeURIComponent(m[1]):'';document.documentElement.classList.toggle('dark',t==='dark'||(t!=='light'&&${defaultIsDark}))}catch(e){}})()`;
}
