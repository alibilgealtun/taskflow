'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { TaskCard } from '@/app/(dashboard)/tasks/_components/task-card';
import { sortTasks } from '@/features/tasks/sort';
import type { PublicTask } from '@/features/share/queries';
import type { TaskStatus } from '@/features/tasks/types';
import { formatDate } from '@/lib/utils';

interface SharedTaskBoardProps {
  tasks: PublicTask[];
}

interface SharedColumn {
  status: Exclude<TaskStatus, 'backlog'>;
  label: string;
}

const SHARED_COLUMNS: readonly SharedColumn[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'completed', label: 'Completed' },
  { status: 'cancelled', label: 'Cancelled' },
];

function titleCase(value: string): string {
  return value
    .split('_')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

export function SharedTaskBoard({ tasks }: SharedTaskBoardProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const visibleTasks = sortTasks(
    tasks.filter((task) => task.status !== 'backlog')
  );
  const selectedTask =
    visibleTasks.find((task) => task.id === selectedTaskId) ?? null;

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {SHARED_COLUMNS.map((column) => {
          const columnTasks = visibleTasks.filter(
            (task) => task.status === column.status
          );

          return (
            <section
              key={column.status}
              role="region"
              aria-label={column.label}
                    className="min-h-28 rounded-2xl border border-surface-border bg-surface-elevated/45 p-3 lg:min-h-80"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-foreground">
                  {column.label}
                </h2>
                <span className="rounded-full bg-surface-card px-2 py-0.5 text-[11px] text-muted-foreground">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    actionLabel="View"
                    onEdit={() => setSelectedTaskId(task.id)}
                  />
                ))}
                {columnTasks.length === 0 && (
                        <p className="rounded-xl border border-dashed border-surface-border px-3 py-5 text-center text-xs text-subtle-foreground lg:py-8">
                    No tasks
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {selectedTask && (
        <Dialog
          open
          onClose={() => setSelectedTaskId(null)}
          title={selectedTask.title}
          description="Shared task details. Read only."
          maxWidth="md"
        >
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-foreground">
                {selectedTask.description || 'No description'}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </dt>
                <dd className="mt-1 text-foreground">
                  {titleCase(selectedTask.status)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Priority
                </dt>
                <dd className="mt-1 text-foreground">
                  {titleCase(selectedTask.priority)}
                </dd>
              </div>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Due date
              </dt>
              <dd className="mt-1 text-foreground">
                {selectedTask.due_date
                  ? formatDate(selectedTask.due_date)
                  : 'No due date'}
              </dd>
            </div>
          </dl>
        </Dialog>
      )}
    </>
  );
}
