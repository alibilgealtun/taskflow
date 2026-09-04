'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { TaskPriority } from '@/features/tasks/types';

interface PriorityFilterProps {
  selected: TaskPriority[];
}

const PRIORITY_CHIPS: readonly { value: TaskPriority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'none', label: 'None' },
];

const CHIP_BASE =
  'cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring sm:py-1';
const CHIP_ON = 'border-transparent bg-brand-primary text-brand-on-primary';
const CHIP_OFF =
  'border-surface-border bg-surface-card text-muted-foreground hover:border-surface-border-hover hover:text-foreground';

export function PriorityFilter({ selected }: PriorityFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const pushSelection = (next: TaskPriority[]): void => {
    const params = new URLSearchParams();
    if (next.length > 0) {
      params.set('priority', next.join(','));
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const toggle = (value: TaskPriority): void => {
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    // Keep the chip order stable in the URL.
    pushSelection(
      PRIORITY_CHIPS.map((chip) => chip.value).filter((item) =>
        next.includes(item)
      )
    );
  };

  return (
    <div
      role="group"
      aria-label="Filter tasks by priority"
      className="flex flex-wrap items-center gap-2"
    >
      <button
        type="button"
        aria-pressed={selected.length === 0}
        onClick={() => pushSelection([])}
        className={`${CHIP_BASE} ${selected.length === 0 ? CHIP_ON : CHIP_OFF}`}
      >
        All
      </button>
      {PRIORITY_CHIPS.map((chip) => {
        const active = selected.includes(chip.value);
        return (
          <button
            key={chip.value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(chip.value)}
            className={`${CHIP_BASE} ${active ? CHIP_ON : CHIP_OFF}`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
