'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/error-state';
import { getErrorMessage } from '@/lib/error-messages';

export default function ShareError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Share page error:', error);
  }, [error]);

  return (
    <ErrorState
      layout="page"
      icon="warning"
      title="Unable to display shared list"
      message={getErrorMessage('share/load-failed')}
      action={{ label: 'Try Again', onClick: reset }}
    />
  );
}
