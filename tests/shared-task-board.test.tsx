// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SharedTaskBoard } from '@/app/share/[id]/_components/shared-task-board';
import type { PublicTask } from '@/features/share/queries';

function task(
  id: string,
  status: PublicTask['status'],
  description: string | null = null
): PublicTask {
  return {
    id,
    title: `${status} task`,
    description,
    status,
    priority: 'high',
    due_date: null,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  };
}

afterEach(cleanup);

describe('SharedTaskBoard', () => {
  it('shows the four normal status columns without backlog', () => {
    render(
      <SharedTaskBoard
        tasks={[
          task('backlog', 'backlog'),
          task('pending', 'pending'),
          task('progress', 'in_progress'),
          task('complete', 'completed'),
          task('cancelled', 'cancelled'),
        ]}
      />
    );

    expect(screen.getByRole('region', { name: 'Pending' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'In Progress' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Completed' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Cancelled' })).toBeTruthy();
    expect(screen.queryByRole('region', { name: 'Backlog' })).toBeNull();
    expect(screen.queryByText('backlog task')).toBeNull();
  });

  it('shows title-only cards and opens read-only details', async () => {
    const user = userEvent.setup();
    render(
      <SharedTaskBoard
        tasks={[task('pending', 'pending', 'Private details are shared')]}
      />
    );

    expect(screen.queryByText('Private details are shared')).toBeNull();

    await user.click(
      screen.getByRole('button', { name: 'View pending task' })
    );

    const dialog = screen.getByRole('dialog', { name: 'pending task' });
    expect(within(dialog).getByText('Private details are shared')).toBeTruthy();
    expect(within(dialog).getByText('Pending')).toBeTruthy();
    expect(within(dialog).getByText('High')).toBeTruthy();
  });

  it('updates open details when fresh task data arrives', async () => {
    const user = userEvent.setup();
    const initialTask = task('pending', 'pending', 'Old details');
    const view = render(<SharedTaskBoard tasks={[initialTask]} />);

    await user.click(
      screen.getByRole('button', { name: 'View pending task' })
    );

    view.rerender(
      <SharedTaskBoard
        tasks={[{ ...initialTask, description: 'Fresh details' }]}
      />
    );

    expect(screen.queryByText('Old details')).toBeNull();
    expect(screen.getByText('Fresh details')).toBeTruthy();
  });

  it('moves focus to the close button in the read-only dialog', async () => {
    const user = userEvent.setup();
    render(<SharedTaskBoard tasks={[task('pending', 'pending')]} />);

    await user.click(
      screen.getByRole('button', { name: 'View pending task' })
    );

    const closeButton = screen.getByRole('button', { name: 'Close dialog' });
    await waitFor(() => {
      expect(document.activeElement).toBe(closeButton);
    });
  });

  it('lists shared cards by due date', () => {
    const later = {
      ...task('later', 'pending'),
      title: 'Later',
      due_date: '2026-09-20T12:00:00.000Z',
    };
    const sooner = {
      ...task('sooner', 'pending'),
      title: 'Sooner',
      due_date: '2026-09-05T12:00:00.000Z',
    };

    render(<SharedTaskBoard tasks={[later, sooner]} />);

    const column = screen.getByRole('region', { name: 'Pending' });
    const cards = within(column).getAllByRole('button', { name: /^View / });
    expect(cards.map((card) => card.textContent)).toEqual(['Sooner', 'Later']);
  });

  it('shows the due date and the priority tint', () => {
    const dated = {
      ...task('dated', 'pending'),
      due_date: '2026-09-05T12:00:00.000Z',
    };

    render(<SharedTaskBoard tasks={[dated]} />);

    const card = screen
      .getByRole('button', { name: 'View pending task' })
      .closest('[data-priority]');
    expect(card?.getAttribute('data-priority')).toBe('high');
    expect(screen.getByText(/Sep 5, 2026/)).toBeTruthy();
  });

  it('does not expose edit, delete, create, or drag controls', () => {
    render(<SharedTaskBoard tasks={[task('pending', 'pending')]} />);

    expect(screen.queryByRole('button', { name: /delete/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /new task/i })).toBeNull();
    expect(screen.queryByLabelText(/draggable/i)).toBeNull();
    expect(screen.queryByText('Drop tasks here')).toBeNull();
  });
});
