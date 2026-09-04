'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deleteTaskAction } from '@/features/tasks/actions';
import { useToast } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/error-messages';

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  taskId: string | null;
  taskTitle: string;
}

export function DeleteDialog({
  open,
  onClose,
  taskId,
  taskTitle,
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    if (!taskId) return;
    setIsDeleting(true);

    try {
      const formData = new FormData();
      formData.append('id', taskId);

      const result = await deleteTaskAction(null, formData);
      if (result.success) {
        toast.success('Task deleted successfully');
        onClose();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error(getErrorMessage('task/delete-failed'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Delete Task"
      description="Are you sure you want to permanently remove this task?"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          You are about to delete <span className="font-semibold text-foreground">&quot;{taskTitle}&quot;</span>. This action cannot be reversed.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Task'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
