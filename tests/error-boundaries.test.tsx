// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import RootError from '@/app/error';
import ShareError from '@/app/share/[id]/error';
import TasksError from '@/app/(dashboard)/tasks/error';
import SettingsError from '@/app/(dashboard)/settings/error';
import { getErrorMessage } from '@/lib/error-messages';

interface ErrorCase {
  name: string;
  Component: typeof RootError;
  publicMessage: string;
}

const cases: ErrorCase[] = [
  {
    name: 'root',
    Component: RootError,
    publicMessage: getErrorMessage('general/unexpected'),
  },
  {
    name: 'share',
    Component: ShareError,
    publicMessage: getErrorMessage('share/load-failed'),
  },
  {
    name: 'tasks',
    Component: TasksError,
    publicMessage: getErrorMessage('task/load-failed'),
  },
  {
    name: 'settings',
    Component: SettingsError,
    publicMessage: getErrorMessage('share/load-failed'),
  },
];

describe('error boundaries', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it.each(cases)(
    'does not expose a raw server message in the $name boundary',
    ({ Component, publicMessage }) => {
      render(
        <Component
          error={new Error('private database connection details')}
          reset={vi.fn()}
        />
      );

      expect(screen.getByText(publicMessage)).toBeTruthy();
      expect(screen.queryByText('private database connection details')).toBeNull();
    }
  );
});
