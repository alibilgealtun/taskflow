// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/components/ui/toast';
import { TaskList } from '@/app/(dashboard)/tasks/_components/task-list';
import type { Task } from '@/features/tasks/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const DUE_INSTANT = '2026-09-10T00:00:00.000Z';
const dueInstant = new Date(DUE_INSTANT);
const expectedDueDate = `${dueInstant.getFullYear()}-${String(dueInstant.getMonth() + 1).padStart(2, '0')}-${String(dueInstant.getDate()).padStart(2, '0')}`;
const expectedDueTime = `${String(dueInstant.getHours()).padStart(2, '0')}:${String(dueInstant.getMinutes()).padStart(2, '0')}`;

const task: Task = {
  id: 'task-id',
  user_id: 'user-id',
  title: 'Existing task',
  description: 'Existing details',
  status: 'pending',
  priority: 'high',
  due_date: DUE_INSTANT,
  created_at: '2026-09-01T00:00:00.000Z',
  updated_at: '2026-09-01T00:00:00.000Z',
};

function renderTaskList(): void {
  render(
    <ToastProvider>
      <TaskList tasks={[task]} />
    </ToastProvider>
  );
}

afterEach(cleanup);

describe('TaskForm lifecycle', () => {
  it('starts edit mode with the selected task values', async () => {
    const user = userEvent.setup();
    renderTaskList();

    await user.click(screen.getByRole('button', { name: 'Edit Existing task' }));

    expect(screen.getByLabelText('Title *')).toHaveProperty('value', 'Existing task');
    expect(screen.getByLabelText('Description')).toHaveProperty(
      'value',
      'Existing details'
    );
    expect(screen.getByLabelText('Priority')).toHaveProperty('value', 'high');
    expect(screen.getByLabelText('Due Date')).toHaveProperty('value', expectedDueDate);
    expect(screen.getByLabelText('Due Time')).toHaveProperty('value', expectedDueTime);
  });

  it('opens create mode with fresh values after edit mode closes', async () => {
    const user = userEvent.setup();
    renderTaskList();

    await user.click(screen.getByRole('button', { name: 'Edit Existing task' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'New Task' }));

    expect(screen.getByLabelText('Title *')).toHaveProperty('value', '');
    expect(screen.getByLabelText('Description')).toHaveProperty('value', '');
    expect(screen.getByLabelText('Priority')).toHaveProperty('value', 'none');
    expect(screen.getByLabelText('Due Date')).toHaveProperty('value', '');
    expect(screen.getByLabelText('Due Time')).toHaveProperty('value', '');
  });

  it('discards an unsaved create draft after the form closes', async () => {
    const user = userEvent.setup();
    renderTaskList();

    await user.click(screen.getByRole('button', { name: 'New Task' }));
    await user.type(screen.getByLabelText('Title *'), 'Unsaved draft');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'New Task' }));

    expect(screen.getByLabelText('Title *')).toHaveProperty('value', '');
  });

  it('restores focus to the control that opened the form', async () => {
    const user = userEvent.setup();
    renderTaskList();
    const newTaskButton = screen.getByRole('button', { name: 'New Task' });

    await user.click(newTaskButton);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(document.activeElement).toBe(newTaskButton);
  });

  it('shows an inline English error and prevents submission when title is cleared in edit mode', async () => {
    const user = userEvent.setup();
    renderTaskList();

    await user.click(screen.getByRole('button', { name: 'Edit Existing task' }));
    const titleInput = screen.getByLabelText('Title *');
    const form = titleInput.closest('form');

    expect(form?.noValidate).toBe(true);

    await user.clear(titleInput);
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(screen.queryByText('Title is required')).not.toBeNull();
    expect(titleInput.getAttribute('aria-invalid')).toBe('true');

    await user.type(titleInput, 'A');
    expect(screen.queryByText('Title is required')).toBeNull();
  });
});

