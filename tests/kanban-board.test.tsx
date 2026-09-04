// @vitest-environment jsdom

import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/components/ui/toast';
import { TaskList } from '@/app/(dashboard)/tasks/_components/task-list';
import type { Task, TaskStatus } from '@/features/tasks/types';

const { updateTaskStatusAction } = vi.hoisted(() => ({
  updateTaskStatusAction: vi.fn().mockResolvedValue({
    success: true,
    data: null,
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock('@/features/tasks/actions', () => ({
  createTaskAction: vi.fn(),
  deleteTaskAction: vi.fn(),
  updateTaskAction: vi.fn(),
  updateTaskStatusAction,
}));

vi.mock('@dnd-kit/core', () => ({
  closestCorners: vi.fn(),
  pointerWithin: vi.fn(),
  DragOverlay: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DndContext: ({
    children,
    onDragEnd,
  }: {
    children: ReactNode;
    onDragEnd: (event: {
      active: { id: string };
      over: { id: TaskStatus };
    }) => void;
  }) => (
    <div>
      {children}
      <button
        type="button"
        onClick={() =>
          onDragEnd({
            active: { id: 'pending-task' },
            over: { id: 'completed' },
          })
        }
      >
        Simulate drag
      </button>
    </div>
  ),
  KeyboardSensor: class {},
  MouseSensor: class {},
  TouchSensor: class {},
  useDraggable: () => ({
    attributes: {},
    isDragging: false,
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
  }),
  useDroppable: () => ({
    isOver: false,
    setNodeRef: vi.fn(),
  }),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

function task(
  id: string,
  status: TaskStatus,
  priority: Task['priority'] = 'none',
  description: string | null = null
): Task {
  return {
    id,
    user_id: 'user-id',
    title: `${status} task`,
    description,
    status,
    priority,
    due_date: null,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  };
}

/** A task whose title is its id, so due date order is easy to read. */
function datedTask(id: string, status: TaskStatus, dueDate: string): Task {
  return { ...task(id, status), title: id, due_date: dueDate };
}

function columnTitles(name: string): string[] {
  const column = screen.getByRole('region', { name });
  return within(column)
    .getAllByRole('button')
    .filter((item) => item.getAttribute('aria-label')?.startsWith('Edit '))
    .map((item) => item.textContent ?? '');
}

function renderList(
  tasks: Task[],
  view: 'kanban' | 'backlog' = 'kanban'
): void {
  render(
    <ToastProvider>
      <TaskList tasks={tasks} view={view} />
    </ToastProvider>
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('TaskList Kanban view', () => {
  it('shows four status columns and excludes backlog tasks', () => {
    renderList([
      task('backlog-task', 'backlog'),
      task('pending-task', 'pending'),
      task('progress-task', 'in_progress'),
      task('completed-task', 'completed'),
      task('cancelled-task', 'cancelled'),
    ]);

    expect(screen.getByRole('region', { name: 'Pending' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'In Progress' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Completed' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Cancelled' })).toBeTruthy();
    expect(screen.queryByText('backlog task')).toBeNull();
  });

  it('opens the edit form when the card body is clicked', async () => {
    const user = userEvent.setup();
    renderList([task('pending-task', 'pending')]);

    await user.click(screen.getByText('pending task'));

    expect(screen.getByRole('dialog', { name: 'Edit Task' })).toBeTruthy();
  });

  it('does not show a status selector until the edit form opens', () => {
    renderList([task('pending-task', 'pending')]);

    expect(screen.queryByRole('combobox', { name: 'Change status' })).toBeNull();
  });

  it('moves a dropped card into its new column immediately', async () => {
    const user = userEvent.setup();
    renderList([task('pending-task', 'pending')]);

    await user.click(screen.getByRole('button', { name: 'Simulate drag' }));

    await waitFor(() => {
      const completed = screen.getByRole('region', { name: 'Completed' });
      expect(within(completed).getByText('pending task')).toBeTruthy();
    });
  });

  it('hides the description until the edit form opens', async () => {
    const user = userEvent.setup();
    renderList([task('pending-task', 'pending', 'none', 'Hidden details')]);

    expect(screen.queryByText('Hidden details')).toBeNull();

    await user.click(screen.getByText('pending task'));

    expect(screen.getByLabelText('Description')).toHaveProperty(
      'value',
      'Hidden details'
    );
  });

  it('shows no priority label on the card', () => {
    renderList([task('high-task', 'pending', 'high')]);

    expect(screen.queryByText('high')).toBeNull();
  });

  it('keeps delete on the card and drops the edit and drag buttons', () => {
    renderList([task('pending-task', 'pending')]);

    expect(screen.getByRole('button', { name: 'Delete task' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Edit task' })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Move / })).toBeNull();
  });

  it('returns the card to its column when the save fails', async () => {
    const user = userEvent.setup();
    updateTaskStatusAction.mockResolvedValueOnce({
      success: false,
      error: 'Save failed',
    });
    renderList([task('pending-task', 'pending')]);

    await user.click(screen.getByRole('button', { name: 'Simulate drag' }));

    await waitFor(() => {
      const pending = screen.getByRole('region', { name: 'Pending' });
      expect(within(pending).getByText('pending task')).toBeTruthy();
    });
  });

  it('keeps the delete button outside the clickable title button', () => {
    renderList([task('pending-task', 'pending')]);

    const openButton = screen.getByRole('button', { name: 'Edit pending task' });
    const deleteButton = screen.getByRole('button', { name: 'Delete task' });

    expect(openButton.tagName).toBe('BUTTON');
    expect(openButton.contains(deleteButton)).toBe(false);
  });

  it('lists the closest due date first in a column', () => {
    renderList([
      datedTask('later', 'pending', '2026-09-20T12:00:00.000Z'),
      datedTask('sooner', 'pending', '2026-09-05T12:00:00.000Z'),
    ]);

    expect(columnTitles('Pending')).toEqual(['sooner', 'later']);
  });

  it('sorts a dropped card into its new column by due date', async () => {
    const user = userEvent.setup();
    renderList([
      { ...datedTask('pending-task', 'pending', '2026-09-05T12:00:00.000Z') },
      datedTask('done-early', 'completed', '2026-09-01T12:00:00.000Z'),
      datedTask('done-late', 'completed', '2026-09-30T12:00:00.000Z'),
    ]);

    await user.click(screen.getByRole('button', { name: 'Simulate drag' }));

    await waitFor(() => {
      expect(columnTitles('Completed')).toEqual([
        'done-early',
        'pending-task',
        'done-late',
      ]);
    });
  });

  it('uses different subtle treatments for different priorities', () => {
    renderList([
      task('low-task', 'pending', 'low'),
      task('high-task', 'pending', 'high'),
    ]);

    const taskTitles = screen.getAllByText('pending task');
    const lowCard = taskTitles[0]?.closest('[data-priority]');
    const highCard = taskTitles[1]?.closest('[data-priority]');

    expect(lowCard?.className).not.toBe(highCard?.className);
  });
});

describe('TaskList Backlog view', () => {
  it('shows only backlog tasks', () => {
    renderList(
      [task('backlog-task', 'backlog'), task('pending-task', 'pending')],
      'backlog'
    );

    expect(screen.getByText('backlog task')).toBeTruthy();
    expect(screen.queryByText('pending task')).toBeNull();
  });

  it('defaults new tasks to backlog', async () => {
    const user = userEvent.setup();
    renderList([], 'backlog');

    await user.click(screen.getByRole('button', { name: 'New Task' }));

    expect(screen.getByLabelText('Status')).toHaveProperty('value', 'backlog');
  });
});
