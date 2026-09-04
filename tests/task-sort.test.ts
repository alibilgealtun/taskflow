import { describe, expect, it } from 'vitest';
import { sortTasks } from '@/features/tasks/sort';
import type { Task, TaskPriority } from '@/features/tasks/types';

function task(
  id: string,
  dueDate: string | null,
  priority: TaskPriority = 'none',
  createdAt = '2026-09-01T00:00:00.000Z'
): Task {
  return {
    id,
    user_id: 'user-id',
    title: id,
    description: null,
    status: 'pending',
    priority,
    due_date: dueDate,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

function ids(tasks: Task[]): string[] {
  return tasks.map((item) => item.id);
}

describe('sortTasks', () => {
  it('puts the closest due date on top', () => {
    const sorted = sortTasks([
      task('later', '2026-09-20T12:00:00.000Z'),
      task('sooner', '2026-09-05T12:00:00.000Z'),
      task('middle', '2026-09-10T12:00:00.000Z'),
    ]);

    expect(ids(sorted)).toEqual(['sooner', 'middle', 'later']);
  });

  it('puts tasks without a due date at the bottom', () => {
    const sorted = sortTasks([
      task('no-date', null),
      task('dated', '2026-12-31T12:00:00.000Z'),
    ]);

    expect(ids(sorted)).toEqual(['dated', 'no-date']);
  });

  it('breaks a due date tie with the higher priority', () => {
    const due = '2026-09-05T12:00:00.000Z';
    const sorted = sortTasks([
      task('low', due, 'low'),
      task('high', due, 'high'),
      task('medium', due, 'medium'),
    ]);

    expect(ids(sorted)).toEqual(['high', 'medium', 'low']);
  });

  it('breaks a full tie with the newest task first', () => {
    const sorted = sortTasks([
      task('old', null, 'none', '2026-08-01T00:00:00.000Z'),
      task('new', null, 'none', '2026-09-01T00:00:00.000Z'),
    ]);

    expect(ids(sorted)).toEqual(['new', 'old']);
  });

  it('does not change the input array', () => {
    const input = [
      task('later', '2026-09-20T12:00:00.000Z'),
      task('sooner', '2026-09-05T12:00:00.000Z'),
    ];

    sortTasks(input);

    expect(ids(input)).toEqual(['later', 'sooner']);
  });
});
