// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PriorityFilter } from '@/app/(dashboard)/tasks/_components/priority-filter';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
  usePathname: () => '/tasks',
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('PriorityFilter', () => {
  it('marks All as active when no priority is selected', () => {
    render(<PriorityFilter selected={[]} />);

    expect(
      screen.getByRole('button', { name: 'All' }).getAttribute('aria-pressed')
    ).toBe('true');
  });

  it('adds a priority to the URL', async () => {
    const user = userEvent.setup();
    render(<PriorityFilter selected={[]} />);

    await user.click(screen.getByRole('button', { name: 'High' }));

    expect(push).toHaveBeenCalledWith('/tasks?priority=high');
  });

  it('adds a second priority to the list', async () => {
    const user = userEvent.setup();
    render(<PriorityFilter selected={['high']} />);

    await user.click(screen.getByRole('button', { name: 'Low' }));

    expect(push).toHaveBeenCalledWith('/tasks?priority=high%2Clow');
  });

  it('removes a selected priority', async () => {
    const user = userEvent.setup();
    render(<PriorityFilter selected={['high', 'low']} />);

    await user.click(screen.getByRole('button', { name: 'High' }));

    expect(push).toHaveBeenCalledWith('/tasks?priority=low');
  });

  it('clears every priority with All', async () => {
    const user = userEvent.setup();
    render(<PriorityFilter selected={['high']} />);

    await user.click(screen.getByRole('button', { name: 'All' }));

    expect(push).toHaveBeenCalledWith('/tasks');
  });
});
