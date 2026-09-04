'use client';

import type { ReactNode } from 'react';
import { useSharedTaskSubscription } from '@/features/tasks/hooks';
import { ErrorBanner } from '@/components/ui/error-banner';
import { getErrorMessage } from '@/lib/error-messages';

interface SharedRealtimeWrapperProps {
  shareId: string;
  children: ReactNode;
}

export function SharedRealtimeWrapper({
  shareId,
  children,
}: SharedRealtimeWrapperProps) {
  const hasError = useSharedTaskSubscription(shareId);

  return (
    <>
      {hasError && (
        <ErrorBanner
          message={getErrorMessage('realtime/disconnected')}
          className="mb-4"
        />
      )}
      {children}
    </>
  );
}
