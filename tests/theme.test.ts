import { describe, expect, it } from 'vitest';
import {
  DEFAULT_THEME,
  getOppositeTheme,
  parseThemeCookie,
  themeClassName,
  themeInitScript,
} from '@/lib/theme';

/** Runs the inline head script against a fake document and reports the class state. */
function runInitScript(cookie: string): boolean {
  let hasDarkClass = false;
  const fakeDocument = {
    cookie,
    documentElement: {
      classList: {
        toggle(_name: string, force: boolean): void {
          hasDarkClass = force;
        },
      },
    },
  };

  new Function('document', themeInitScript())(fakeDocument);
  return hasDarkClass;
}

describe('theme helpers', () => {
  describe('parseThemeCookie', () => {
    it('returns light for light', () => {
      expect(parseThemeCookie('light')).toBe('light');
    });

    it('returns dark for dark', () => {
      expect(parseThemeCookie('dark')).toBe('dark');
    });

    it('returns default for undefined', () => {
      expect(parseThemeCookie(undefined)).toBe(DEFAULT_THEME);
    });

    it('returns default for invalid values', () => {
      expect(parseThemeCookie('system')).toBe(DEFAULT_THEME);
      expect(parseThemeCookie('')).toBe(DEFAULT_THEME);
    });
  });

  describe('themeClassName', () => {
    it('returns dark class for dark theme', () => {
      expect(themeClassName('dark')).toBe('dark');
    });

    it('returns empty string for light theme', () => {
      expect(themeClassName('light')).toBe('');
    });
  });

  describe('getOppositeTheme', () => {
    it('flips light and dark', () => {
      expect(getOppositeTheme('light')).toBe('dark');
      expect(getOppositeTheme('dark')).toBe('light');
    });
  });

  describe('themeInitScript', () => {
    it('keeps the dark class when the cookie says dark', () => {
      expect(runInitScript('theme=dark')).toBe(true);
    });

    it('removes the dark class when the cookie says light', () => {
      expect(runInitScript('theme=light')).toBe(false);
    });

    it('reads the theme cookie among other cookies', () => {
      expect(runInitScript('sb-access-token=abc; theme=light; other=1')).toBe(false);
    });

    it('falls back to the default theme without a cookie', () => {
      expect(runInitScript('')).toBe(DEFAULT_THEME === 'dark');
    });

    it('falls back to the default theme for an unknown value', () => {
      expect(runInitScript('theme=system')).toBe(DEFAULT_THEME === 'dark');
    });

    it('does not throw when cookies are unavailable', () => {
      expect(() => new Function('document', themeInitScript())(undefined)).not.toThrow();
    });
  });
});
