'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { toggleShareAction } from '@/features/share/actions';
import { getErrorMessage } from '@/lib/error-messages';
import type { SharedListInfo } from '@/features/share/queries';

interface ShareSettingsProps {
  initialSettings: SharedListInfo | null;
}

export function ShareSettings({ initialSettings }: ShareSettingsProps) {
  const [isActive, setIsActive] = useState(initialSettings?.is_active ?? false);
  const [shareId, setShareId] = useState<string | null>(initialSettings?.id ?? null);
  const [isToggling, setIsToggling] = useState(false);
  const toast = useToast();

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const result = await toggleShareAction();
      if (result.success) {
        setIsActive(result.data.isActive);
        setShareId(result.data.shareId);
        toast.success(
          result.data.isActive
            ? 'Public share enabled'
            : 'Public share disabled'
        );
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error(getErrorMessage('share/update-failed'));
    } finally {
      setIsToggling(false);
    }
  };

  const shareUrl =
    typeof window !== 'undefined' && shareId
      ? `${window.location.origin}/share/${shareId}`
      : shareId
      ? `/share/${shareId}`
      : '';

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard');
    } catch {
      toast.error(getErrorMessage('clipboard/copy-failed'));
    }
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            Public Task List Link
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-lg">
            When enabled, anyone with this unique link can view your active tasks in read-only mode without logging in.
          </p>
        </div>

        <Button
          onClick={handleToggle}
          variant={isActive ? 'destructive' : 'primary'}
          size="md"
          isLoading={isToggling}
          className="shrink-0"
        >
          {isActive ? 'Disable Sharing' : 'Enable Sharing'}
        </Button>
      </div>

      {isActive && shareId ? (
        <div className="space-y-3 animate-in fade-in duration-200">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Shareable URL
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 rounded-lg border border-surface-border bg-surface-bg px-3.5 py-2 text-xs font-mono text-brand-primary select-all truncate">
              {shareUrl}
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={copyToClipboard}
              className="shrink-0 gap-1.5"
            >
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy Link
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            💡 Anyone who visits this URL will see your latest tasks in real-time. Changes you make reflect immediately.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-surface-border/60 bg-surface-bg/40 p-4 text-xs text-muted-foreground">
          Sharing is currently deactivated. Your tasks remain strictly private and accessible only when signed in.
        </div>
      )}
    </div>
  );
}
