'use client';

import { useTaskSubscription } from '@/features/tasks/hooks';
import { ErrorBanner } from '@/components/ui/error-banner';
import { getErrorMessage } from '@/lib/error-messages';
import type { ReactNode } from 'react';

export function RealtimeTasksWrapper({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const hasError = useTaskSubscription(userId);

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
