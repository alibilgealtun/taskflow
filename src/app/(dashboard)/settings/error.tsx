'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/error-state';
import { getErrorMessage } from '@/lib/error-messages';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Settings error:', error);
  }, [error]);

  return (
    <ErrorState
      layout="section"
      icon="warning"
      title="Unable to load settings"
      message={getErrorMessage('share/load-failed')}
      action={{ label: 'Try Again', onClick: reset }}
    />
  );
}
