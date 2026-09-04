// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ToastProvider } from '@/components/ui/toast';
import { TaskList } from '@/app/(dashboard)/tasks/_components/task-list';
import type { Task } from '@/features/tasks/types';

// The real @dnd-kit stays in place here. Its id generator is the code under test.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock('@/features/tasks/actions', () => ({
  createTaskAction: vi.fn(),
  deleteTaskAction: vi.fn(),
  updateTaskAction: vi.fn(),
  updateTaskStatusAction: vi.fn(),
}));

const task: Task = {
  id: 'task-id',
  user_id: 'user-id',
  title: 'Board task',
  description: null,
  status: 'pending',
  priority: 'none',
  due_date: null,
  created_at: '2026-09-01T00:00:00.000Z',
  updated_at: '2026-09-01T00:00:00.000Z',
};

function renderBoard(): void {
  render(
    <ToastProvider>
      <TaskList tasks={[task]} view="kanban" />
    </ToastProvider>
  );
}

function cardDescribedBy(): string | null {
  return screen
    .getByRole('button', { name: 'Edit Board task' })
    .closest('[data-priority]')!
    .getAttribute('aria-describedby');
}

afterEach(cleanup);

describe('Kanban drag ids', () => {
  it('keeps the same describedby id across separate renders', () => {
    renderBoard();
    const firstId = cardDescribedBy();
    cleanup();

    renderBoard();

    expect(cardDescribedBy()).toBe(firstId);
  });

  it('points the card at a description element that exists', () => {
    renderBoard();

    const describedBy = cardDescribedBy();
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toBeTruthy();
  });
});
