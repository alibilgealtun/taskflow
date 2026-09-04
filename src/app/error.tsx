'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/error-state';
import { getErrorMessage } from '@/lib/error-messages';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <ErrorState
      layout="page"
      icon="warning"
      title="Application Error"
      message={getErrorMessage('general/unexpected')}
      action={{ label: 'Try Again', onClick: reset }}
    />
  );
}
