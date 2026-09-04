'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/error-state';
import { getErrorMessage } from '@/lib/error-messages';

export default function TasksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Tasks page error:', error);
  }, [error]);

  return (
    <ErrorState
      layout="section"
      icon="warning"
      title="Something went wrong"
      message={getErrorMessage('task/load-failed')}
      action={{ label: 'Try Again', onClick: reset }}
    />
  );
}
