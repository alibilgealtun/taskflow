import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guards the single source of truth for colors: only globals.css defines them.
 * Components must use theme tokens, never raw palette classes or hex values.
 */

const SOURCE_DIR = 'src';

const PALETTE_CLASS =
  /\b(?:bg|text|border|ring|shadow|fill|stroke|from|to|via|divide|outline|decoration|accent|caret|placeholder:text)-(?:zinc|slate|gray|neutral|stone|rose|red|orange|purple|violet|fuchsia|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|pink|black|white)(?:-\d{2,3})?\b/;

/** Catches a broken token name, such as the text-foreground0 left by a bad rename. */
const MALFORMED_TOKEN = /\b(?:bg|text|border|ring|shadow)-(?:foreground|muted-foreground|subtle-foreground|surface-\w+|brand-\w+|danger\w*|status-\w+|priority-\w+|elevation|overlay)\d+\b/;

const HEX_COLOR = /#[0-9a-fA-F]{3,8}\b/;
const HEAVY_SHADOW = /\bshadow-(?:2xl|elevation\/(?:[4-9]\d|100))\b/;

function collectTsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      return collectTsxFiles(full);
    }
    return full.endsWith('.tsx') ? [full] : [];
  });
}

function findMatches(pattern: RegExp): string[] {
  return collectTsxFiles(SOURCE_DIR).flatMap((file) => {
    const lines = readFileSync(file, 'utf8').split('\n');
    return lines
      .map((line, index) => ({ line, number: index + 1 }))
      .filter(({ line }) => pattern.test(line))
      .map(({ line, number }) => `${file}:${number} ${line.trim()}`);
  });
}

/** Reads the light palette values from the :root block. */
function readLightTokens(css: string): Record<string, string> {
  const body = css.match(/:root\s*\{([^}]*)\}/)?.[1] ?? '';
  return Object.fromEntries(
    [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((entry) => [
      entry[1] as string,
      (entry[2] as string).trim(),
    ])
  );
}

/** Relative luminance of a #rrggbb color. White is 1 and black is 0. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];

  return (
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  );
}

describe('design tokens', () => {
  it('has no raw Tailwind palette colors in components', () => {
    expect(findMatches(PALETTE_CLASS)).toEqual([]);
  });

  it('has no malformed token class names', () => {
    expect(findMatches(MALFORMED_TOKEN)).toEqual([]);
  });

  it('has no hex colors in components', () => {
    expect(findMatches(HEX_COLOR)).toEqual([]);
  });

  it('defines the same variables in the light and dark palettes', () => {
    const css = readFileSync(join(SOURCE_DIR, 'app', 'globals.css'), 'utf8');
    const block = (selector: string): Set<string> => {
      const match = css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`));
      const body = match?.[1] ?? '';
      return new Set(
        [...body.matchAll(/(--[\w-]+):/g)].flatMap((entry) =>
          entry[1] === undefined ? [] : [entry[1]]
        )
      );
    };

    const light = block(':root');
    const dark = block('\\.dark');

    expect(light.size).toBeGreaterThan(0);
    expect([...light].filter((name) => !dark.has(name))).toEqual([]);
    expect([...dark].filter((name) => !light.has(name))).toEqual([]);
  });

  it('uses the approved monochrome palette and system font stack', () => {
    const css = readFileSync(join(SOURCE_DIR, 'app', 'globals.css'), 'utf8');

    expect(css).toContain(
      '--font-sans: -apple-system, BlinkMacSystemFont, var(--font-inter)'
    );
    expect(css).toContain('--foreground: #1d1d1f;');
    expect(css).toContain('--brand-primary: #1d1d1f;');
    expect(css).toContain('--surface-bg: #000000;');
    expect(css).toContain('--surface-card: #1c1c1e;');
    expect(css).toContain('--surface-border: #38383a;');
    expect(css).toContain('--brand-primary: #f5f5f7;');
  });

  it('keeps the light page gray, not near white', () => {
    const css = readFileSync(join(SOURCE_DIR, 'app', 'globals.css'), 'utf8');
    const light = readLightTokens(css);

    const page = luminance(light['--surface-bg']!);
    const card = luminance(light['--surface-card']!);
    const tray = luminance(light['--surface-elevated']!);

    // Pure white is 1. A page above 0.85 reads as glare on a bright screen.
    expect(page).toBeLessThan(0.85);
    // A card must still stand out above the page, and the tray below it.
    expect(card).toBeGreaterThan(page);
    expect(tray).toBeLessThan(page);
  });

  it('keeps badges neutral and removes decorative glow effects', () => {
    const badge = readFileSync(
      join(SOURCE_DIR, 'components', 'ui', 'badge.tsx'),
      'utf8'
    );
    const authLayout = readFileSync(
      join(SOURCE_DIR, 'app', '(auth)', 'layout.tsx'),
      'utf8'
    );

    expect(badge).not.toMatch(/bg-(?:status|priority)-[\w-]+\//);
    expect(authLayout).not.toMatch(/accent-glow|blur-\[/);
  });

  it('has no heavy decorative shadows', () => {
    expect(findMatches(HEAVY_SHADOW)).toEqual([]);
  });
});
