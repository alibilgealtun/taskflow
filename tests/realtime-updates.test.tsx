// @vitest-environment jsdom

import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '@/app/(dashboard)/tasks/_components/task-form';
import { DeleteDialog } from '@/app/(dashboard)/tasks/_components/delete-dialog';
import { ToastProvider } from '@/components/ui/toast';
import { RealtimeTasksWrapper } from '@/app/(dashboard)/tasks/_components/realtime-tasks-wrapper';
import { SharedRealtimeWrapper } from '@/app/share/[id]/_components/shared-realtime-wrapper';
import type { Task } from '@/features/tasks/types';

const mocks = vi.hoisted(() => {
  const refresh = vi.fn();
  const removeChannel = vi.fn();
  const subscribe = vi.fn();
  const on = vi.fn();
  const channel = vi.fn();
  const createTaskAction = vi.fn().mockResolvedValue({
    success: true,
    data: null,
  });
  const updateTaskAction = vi.fn().mockResolvedValue({
    success: true,
    data: null,
  });
  const deleteTaskAction = vi.fn().mockResolvedValue({
    success: true,
    data: null,
  });

  return {
    refresh,
    removeChannel,
    subscribe,
    on,
    channel,
    createTaskAction,
    updateTaskAction,
    deleteTaskAction,
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

vi.mock('@/features/tasks/actions', () => ({
  createTaskAction: mocks.createTaskAction,
  deleteTaskAction: mocks.deleteTaskAction,
  updateTaskAction: mocks.updateTaskAction,
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    channel: mocks.channel,
    removeChannel: mocks.removeChannel,
  }),
}));

function prepareChannel(): {
  eventCallback: () => void;
  statusCallback: (status: string) => void;
} {
  let eventCallback = (): void => undefined;
  let statusCallback: (status: string) => void = () => undefined;
  const channel = {
    on: mocks.on,
    subscribe: mocks.subscribe,
  };

  mocks.channel.mockReturnValue(channel);
  mocks.on.mockImplementation(
    (
      _type: string,
      _filter: Record<string, unknown>,
      callback: () => void
    ) => {
      eventCallback = callback;
      return channel;
    }
  );
  mocks.subscribe.mockImplementation((callback: (status: string) => void) => {
    statusCallback = callback;
    return channel;
  });

  return {
    eventCallback: () => eventCallback(),
    statusCallback: (status: string) => statusCallback(status),
  };
}

function withToast(child: ReactNode): ReactNode {
  return <ToastProvider>{child}</ToastProvider>;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('local task updates', () => {
  it('refreshes the board after a successful create', async () => {
    const user = userEvent.setup();
    render(
      withToast(
        <TaskForm open onClose={vi.fn()} defaultStatus="pending" />
      )
    );

    await user.type(screen.getByLabelText('Title *'), 'New task');
    await user.click(screen.getByRole('button', { name: 'Create Task' }));

    await waitFor(() => {
      expect(mocks.refresh).toHaveBeenCalledTimes(1);
    });
  });

  it('refreshes the board after a successful delete', async () => {
    const user = userEvent.setup();
    render(
      withToast(
        <DeleteDialog
          open
          onClose={vi.fn()}
          taskId="task-id"
          taskTitle="Old task"
        />
      )
    );

    await user.click(screen.getByRole('button', { name: 'Delete Task' }));

    await waitFor(() => {
      expect(mocks.refresh).toHaveBeenCalledTimes(1);
    });
  });

  it('refreshes the board after a successful edit', async () => {
    const user = userEvent.setup();
    const existingTask: Task = {
      id: 'task-id',
      user_id: 'user-id',
      title: 'Existing task',
      description: null,
      status: 'pending',
      priority: 'none',
      due_date: null,
      created_at: '2026-09-01T00:00:00.000Z',
      updated_at: '2026-09-01T00:00:00.000Z',
    };
    render(
      withToast(
        <TaskForm open onClose={vi.fn()} task={existingTask} />
      )
    );

    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(mocks.refresh).toHaveBeenCalledTimes(1);
    });
  });
});

describe('private task realtime', () => {
  it('refreshes when a task event arrives', () => {
    const callbacks = prepareChannel();
    render(<RealtimeTasksWrapper userId="user-id">Board</RealtimeTasksWrapper>);

    callbacks.eventCallback();

    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });

  it('refreshes after a reconnect to recover missed events', () => {
    const callbacks = prepareChannel();
    render(<RealtimeTasksWrapper userId="user-id">Board</RealtimeTasksWrapper>);

    callbacks.statusCallback('SUBSCRIBED');

    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });

  it('shows a connection error and clears it after reconnect', async () => {
    const callbacks = prepareChannel();
    render(<RealtimeTasksWrapper userId="user-id">Board</RealtimeTasksWrapper>);

    act(() => callbacks.statusCallback('CHANNEL_ERROR'));

    expect(
      await screen.findByRole('alert')
    ).toBeTruthy();

    act(() => callbacks.statusCallback('SUBSCRIBED'));

    await waitFor(() => {
      expect(screen.queryByText(/live updates lost connection/i)).toBeNull();
    });
  });

  it('refreshes when the page becomes visible', () => {
    prepareChannel();
    render(<RealtimeTasksWrapper userId="user-id">Board</RealtimeTasksWrapper>);
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });

    fireEvent(document, new Event('visibilitychange'));

    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });
});

describe('shared task realtime', () => {
  it('uses the share topic and refreshes after its invalidation signal', () => {
    const callbacks = prepareChannel();
    render(
      <SharedRealtimeWrapper shareId="share-id">Shared board</SharedRealtimeWrapper>
    );

    callbacks.eventCallback();

    expect(mocks.channel).toHaveBeenCalledWith('share:share-id', {
      config: { private: false },
    });
    expect(mocks.on).toHaveBeenCalledWith(
      'broadcast',
      { event: 'tasks_changed' },
      expect.any(Function)
    );
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });

  it('refreshes after a shared channel reconnect', () => {
    const callbacks = prepareChannel();
    render(
      <SharedRealtimeWrapper shareId="share-id">Shared board</SharedRealtimeWrapper>
    );

    callbacks.statusCallback('SUBSCRIBED');

    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });

  it('shows a shared connection error', async () => {
    const callbacks = prepareChannel();
    render(
      <SharedRealtimeWrapper shareId="share-id">Shared board</SharedRealtimeWrapper>
    );

    act(() => callbacks.statusCallback('TIMED_OUT'));

    expect(await screen.findByRole('alert')).toBeTruthy();
  });
});
