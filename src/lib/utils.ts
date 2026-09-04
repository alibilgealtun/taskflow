import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

function parseDueDate(dateString: string): Date | null {
  if (DATE_ONLY.test(dateString)) {
    const parsed = new Date(`${dateString}T23:59:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(dateString);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDueDateToIso(dateStr: string | null | undefined): string | null {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }

  if (DATE_TIME.test(dateStr)) {
    const parsed = new Date(dateStr);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  if (DATE_ONLY.test(dateStr)) {
    const parsed = new Date(`${dateStr}T23:59:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  const parsed = new Date(dateStr);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function formatDate(dateString: string): string {
  const date = parseDueDate(dateString);
  if (!date) {
    return '';
  }

  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${datePart}, ${hours}:${minutes}`;
}

export function isOverdue(dueDate: string | null | undefined): boolean {
  const iso = formatDueDateToIso(dueDate);
  if (!iso) {
    return false;
  }

  return new Date(iso).getTime() < Date.now();
}

export function toDateInputValue(dueDate: string | null | undefined): string {
  if (!dueDate) {
    return '';
  }

  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toTimeInputValue(dueDate: string | null | undefined): string {
  if (!dueDate) {
    return '';
  }

  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
