'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { createTaskAction, updateTaskAction } from '@/features/tasks/actions';
import { ErrorBanner } from '@/components/ui/error-banner';
import { getErrorMessage } from '@/lib/error-messages';
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  isTaskStatus,
  isTaskPriority,
  type Task,
  type TaskStatus,
  type TaskPriority,
} from '@/features/tasks/types';
import { useToast } from '@/components/ui/toast';
import { toDateInputValue, toTimeInputValue } from '@/lib/utils';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultStatus?: TaskStatus;
}

export function TaskForm({
  open,
  onClose,
  task,
  defaultStatus = 'pending',
}: TaskFormProps) {
  const isEditing = Boolean(task);
  const toast = useToast();
  const router = useRouter();

  // The parent mounts this form per task, so props seed the state once.
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(
    task?.status ?? defaultStatus
  );
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'none');
  const [dueDate, setDueDate] = useState(toDateInputValue(task?.due_date));
  const [dueTime, setDueTime] = useState(toTimeInputValue(task?.due_date));
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setTitleError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError('Title is required');
      return;
    }

    if (trimmedTitle.length > 200) {
      setTitleError('Title must be 200 characters or fewer');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (task) {
        formData.append('id', task.id);
      }
      formData.append('title', trimmedTitle);
      formData.append('description', description.trim());
      formData.append('status', status);
      formData.append('priority', priority);
      if (dueDate) {
        formData.append('due_date', dueTime ? `${dueDate}T${dueTime}` : dueDate);
      }

      const action = isEditing ? updateTaskAction : createTaskAction;
      const result = await action(null, formData);

      if (result.success) {
        toast.success(
          isEditing ? 'Task updated successfully' : 'Task created successfully'
        );
        onClose();
        router.refresh();
      } else {
        if (result.error.toLowerCase().includes('title')) {
          setTitleError(result.error);
        } else {
          setError(result.error);
        }
        toast.error(result.error);
      }
    } catch {
      const fallbackMsg = getErrorMessage('task/save-failed');
      setError(fallbackMsg);
      toast.error(fallbackMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = TASK_STATUSES.map((s) => ({
    value: s.value,
    label: s.label,
  }));

  const priorityOptions = TASK_PRIORITIES.map((p) => ({
    value: p.value,
    label: p.label,
  }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      description={
        isEditing
          ? 'Update the details and properties for this task.'
          : 'Add a new task to your personal workspace.'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && (
          <ErrorBanner
            message={error}
            onDismiss={() => setError(null)}
          />
        )}

        <Input
          id="task-title"
          label="Title *"
          placeholder="e.g. Implement Supabase authentication"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError(null);
          }}
          error={titleError ?? undefined}
          maxLength={200}
        />

        <div className="space-y-1.5">
          <label
            htmlFor="task-description"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Description
          </label>
          <textarea
            id="task-description"
            rows={3}
            placeholder="Add detailed task notes or acceptance criteria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex w-full resize-none rounded-lg border border-surface-border bg-surface-card px-3.5 py-2 text-sm text-foreground placeholder:text-subtle-foreground transition-colors hover:border-surface-border-hover focus:outline-none focus:ring-2 focus:ring-focus-ring"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            id="task-status"
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => {
              if (isTaskStatus(e.target.value)) {
                setStatus(e.target.value);
              }
            }}
          />

          <Select
            id="task-priority"
            label="Priority"
            options={priorityOptions}
            value={priority}
            onChange={(e) => {
              if (isTaskPriority(e.target.value)) {
                setPriority(e.target.value);
              }
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="task-due-date"
            type="date"
            label="Due Date"
            value={dueDate}
            onChange={(e) => {
              const nextDate = e.target.value;
              setDueDate(nextDate);
              if (!nextDate) {
                setDueTime('');
              }
            }}
          />
          <Input
            id="task-due-time"
            type="time"
            step={60}
            label="Due Time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value.slice(0, 5))}
            disabled={!dueDate}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            {isSubmitting
              ? isEditing
                ? 'Saving...'
                : 'Creating...'
              : isEditing
              ? 'Save Changes'
              : 'Create Task'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
