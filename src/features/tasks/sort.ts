import { formatDueDateToIso } from '@/lib/utils';
import type { Task, TaskPriority } from './types';

type SortableTask = Pick<Task, 'due_date' | 'priority' | 'created_at'>;

/** A higher number moves the task up when two due dates match. */
const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
  none: 0,
};

function dueTime(task: SortableTask): number | null {
  const iso = formatDueDateToIso(task.due_date);
  return iso ? new Date(iso).getTime() : null;
}

/** A task without a due date sits below every dated task. */
function compareDueDates(left: SortableTask, right: SortableTask): number {
  const leftTime = dueTime(left);
  const rightTime = dueTime(right);

  if (leftTime === null && rightTime === null) {
    return 0;
  }
  if (leftTime === null) {
    return 1;
  }
  if (rightTime === null) {
    return -1;
  }

  return leftTime - rightTime;
}

/**
 * Orders tasks for the board and the backlog:
 * closest due date first, then the higher priority, then the newest task.
 */
export function sortTasks<T extends SortableTask>(tasks: readonly T[]): T[] {
  return [...tasks].sort((left, right) => {
    const byDueDate = compareDueDates(left, right);
    if (byDueDate !== 0) {
      return byDueDate;
    }

    const byPriority =
      PRIORITY_WEIGHT[right.priority] - PRIORITY_WEIGHT[left.priority];
    if (byPriority !== 0) {
      return byPriority;
    }

    return (
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    );
  });
}
