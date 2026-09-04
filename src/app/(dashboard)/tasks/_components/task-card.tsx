'use client';

import type { DOMAttributes, HTMLAttributes, MouseEvent } from 'react';
import type { Task, TaskPriority } from '@/features/tasks/types';
import { formatDate, isOverdue } from '@/lib/utils';

type TaskCardData = Omit<Task, 'user_id'>;

interface TaskCardProps<T extends TaskCardData> {
  task: T;
  onEdit: (task: T) => void;
  onDelete?: (task: T) => void;
  actionLabel?: 'Edit' | 'View';
  isDragging?: boolean;
  /** Drag props from the parent. They cover the whole card. */
  dragProps?: DOMAttributes<HTMLElement> & HTMLAttributes<HTMLElement>;
}

/** A faint tint keeps the priority readable without a label. */
const PRIORITY_CARD_CLASSES: Record<TaskPriority, string> = {
  none: 'border-surface-border bg-surface-card',
  low: 'border-priority-low/25 bg-priority-low/5',
  medium: 'border-priority-medium/25 bg-priority-medium/5',
  high: 'border-priority-high/25 bg-priority-high/5',
};

export function TaskCard<T extends TaskCardData>({
  task,
  onEdit,
  onDelete,
  actionLabel = 'Edit',
  isDragging = false,
  dragProps,
}: TaskCardProps<T>) {
  const overdue = task.due_date
    ? isOverdue(task.due_date) &&
      task.status !== 'completed' &&
      task.status !== 'cancelled'
    : false;

  const handleDelete = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    onDelete?.(task);
  };

  return (
    <div
      {...dragProps}
      data-priority={task.priority}
      onClick={() => onEdit(task)}
      className={`group relative flex h-full flex-col gap-3 rounded-2xl border p-4 text-left transition-colors duration-150 hover:border-surface-border-hover focus-within:ring-2 focus-within:ring-focus-ring ${
        dragProps
          ? 'cursor-grab touch-manipulation active:cursor-grabbing'
          : 'cursor-pointer'
      } ${isDragging ? 'opacity-45' : ''} ${
        PRIORITY_CARD_CLASSES[task.priority]
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* The title button carries the keyboard path. A card click bubbles to the same handler. */}
        <button
          type="button"
          aria-label={`${actionLabel} ${task.title}`}
          className="cursor-pointer text-left text-sm font-semibold leading-snug tracking-tight text-foreground focus:outline-none"
        >
          {task.title}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            onPointerDown={(event) => event.stopPropagation()}
            // A phone has no hover. The icon stays visible below the md breakpoint.
            className="shrink-0 cursor-pointer rounded-lg p-1 text-subtle-foreground transition-colors hover:bg-surface-elevated hover:text-danger-fg focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring md:opacity-0 md:group-hover:opacity-100"
            title="Delete task"
            aria-label="Delete task"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        )}
      </div>

      {task.due_date && (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            overdue ? 'text-danger-fg' : 'text-muted-foreground'
          }`}
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {formatDate(task.due_date)}
          {overdue && (
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Overdue
            </span>
          )}
        </span>
      )}
    </div>
  );
}
