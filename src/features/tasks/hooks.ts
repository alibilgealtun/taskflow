'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

const FAILED_STATUSES = new Set(['CHANNEL_ERROR', 'TIMED_OUT']);

function useRefreshOnVisibility(refresh: () => void): void {
  useEffect(() => {
    const handleVisibility = (): void => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refresh]);
}

export function useTaskSubscription(userId: string): boolean {
  const router = useRouter();
  const [hasError, setHasError] = useState(false);

  useRefreshOnVisibility(router.refresh);

  useEffect(() => {
    if (!userId) return undefined;

    const supabase = createBrowserClient();

    const channel = supabase
      .channel(`tasks-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          router.refresh();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setHasError(false);
          // A reconnect can miss changes that happened while the socket was down.
          router.refresh();
        } else if (FAILED_STATUSES.has(status)) {
          setHasError(true);
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, router]);

  return hasError;
}

export function useSharedTaskSubscription(shareId: string): boolean {
  const router = useRouter();
  const [hasError, setHasError] = useState(false);

  useRefreshOnVisibility(router.refresh);

  useEffect(() => {
    if (!shareId) return undefined;

    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`share:${shareId}`, {
        config: { private: false },
      })
      .on('broadcast', { event: 'tasks_changed' }, () => {
        router.refresh();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setHasError(false);
          router.refresh();
        } else if (FAILED_STATUSES.has(status)) {
          setHasError(true);
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [shareId, router]);

  return hasError;
}
