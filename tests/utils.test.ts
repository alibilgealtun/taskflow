import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatDueDateToIso, isOverdue } from '@/lib/utils';

describe('Utility helpers', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });
  });

  describe('formatDate', () => {
    it('formats YYYY-MM-DD date strings as end of local day', () => {
      expect(formatDate('2026-09-04')).toBe('Sep 4, 2026, 23:59');
    });

    it('formats timestamps with hour and minute', () => {
      const local = new Date(2026, 8, 4, 14, 30, 0);
      expect(formatDate(local.toISOString())).toBe('Sep 4, 2026, 14:30');
    });

    it('returns empty string for empty input', () => {
      expect(formatDate('')).toBe('');
    });
  });

  describe('formatDueDateToIso', () => {
    it('stores a date-only value as local 23:59', () => {
      const iso = formatDueDateToIso('2026-09-04');
      expect(iso).not.toBeNull();
      const local = new Date(iso ?? '');
      expect(local.getFullYear()).toBe(2026);
      expect(local.getMonth()).toBe(8);
      expect(local.getDate()).toBe(4);
      expect(local.getHours()).toBe(23);
      expect(local.getMinutes()).toBe(59);
    });

    it('stores a local hour and minute', () => {
      const iso = formatDueDateToIso('2026-09-04T14:30');
      expect(iso).not.toBeNull();
      const local = new Date(iso ?? '');
      expect(local.getHours()).toBe(14);
      expect(local.getMinutes()).toBe(30);
    });

    it('returns null for an empty value', () => {
      expect(formatDueDateToIso(null)).toBeNull();
      expect(formatDueDateToIso('')).toBeNull();
    });
  });

  describe('isOverdue', () => {
    it('returns false when dueDate is null or undefined', () => {
      expect(isOverdue(null)).toBe(false);
      expect(isOverdue(undefined)).toBe(false);
    });

    it('returns false for a due datetime later today', () => {
      const later = new Date(Date.now() + 60_000).toISOString();
      expect(isOverdue(later)).toBe(false);
    });

    it('returns true when the due datetime has passed', () => {
      const earlier = new Date(Date.now() - 60_000).toISOString();
      expect(isOverdue(earlier)).toBe(true);
    });

    it('returns false for a future date-only value', () => {
      const now = new Date();
      const futureStr = `${now.getFullYear() + 1}-12-31`;
      expect(isOverdue(futureStr)).toBe(false);
    });

    it('returns true for a past date-only value', () => {
      expect(isOverdue('2020-01-01')).toBe(true);
    });
  });
});
