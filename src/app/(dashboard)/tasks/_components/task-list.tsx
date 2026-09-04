'use client';

import { useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import type { Task, TaskStatus } from '@/features/tasks/types';
import { updateTaskStatusAction } from '@/features/tasks/actions';
import { sortTasks } from '@/features/tasks/sort';
import { TaskCard } from './task-card';
import { TaskForm } from './task-form';
import { DeleteDialog } from './delete-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface TaskListProps {
  tasks: Task[];
  view?: 'kanban' | 'backlog';
}

interface KanbanColumn {
  status: Exclude<TaskStatus, 'backlog'>;
  label: string;
}

const KANBAN_COLUMNS: readonly KanbanColumn[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'completed', label: 'Completed' },
  { status: 'cancelled', label: 'Cancelled' },
];

function isKanbanStatus(value: string): value is KanbanColumn['status'] {
  return KANBAN_COLUMNS.some((column) => column.status === value);
}

function DraggableTask({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const { attributes, isDragging, listeners, setNodeRef } = useDraggable({
    id: task.id,
  });

  return (
    <div ref={setNodeRef}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDragging}
        dragProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function KanbanColumnView({
  column,
  tasks,
  onEdit,
  onDelete,
}: {
  column: KanbanColumn;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: column.status });

  return (
    <section
      ref={setNodeRef}
      role="region"
      aria-label={column.label}
      className={`min-h-28 rounded-2xl border p-3 transition-colors lg:min-h-80 ${
        isOver
          ? 'border-focus-ring/60 bg-focus-ring/5'
          : 'border-surface-border bg-surface-elevated/45'
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-foreground">{column.label}</h2>
        <span className="rounded-full bg-surface-card px-2 py-0.5 text-[11px] text-muted-foreground">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <DraggableTask
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {tasks.length === 0 && (
          <p className="rounded-xl border border-dashed border-surface-border px-3 py-5 text-center text-xs text-subtle-foreground lg:py-8">
            Drop tasks here
          </p>
        )}
      </div>
    </section>
  );
}

export function TaskList({ tasks, view = 'kanban' }: TaskListProps) {
  const [visibleTasks, setVisibleTasks] = useState(tasks);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  /** A pointer drag ends with a click. This timestamp keeps that click from opening the form. */
  const dragEndedAtRef = useRef(0);
  const toast = useToast();
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    // A touch drag starts after a short hold. A quick swipe scrolls the page.
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  const handleCreateNew = () => {
    setSelectedTask(null);
    setIsFormOpen(true);
  };

  const handleEdit = (task: Task) => {
    if (Date.now() - dragEndedAtRef.current < 250) {
      return;
    }
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleDelete = (task: Task) => {
    setDeletingTask(task);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTask(null);
  };

  const handleCloseDelete = () => {
    setDeletingTask(null);
  };

  const handleDragStart = ({ active }: DragStartEvent): void => {
    const activeId = String(active.id);
    setDraggedTask(visibleTasks.find((task) => task.id === activeId) ?? null);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent): Promise<void> => {
    dragEndedAtRef.current = Date.now();
    setDraggedTask(null);

    if (!over) {
      return;
    }

    const nextStatus = String(over.id);
    if (!isKanbanStatus(nextStatus)) {
      return;
    }

    const taskId = String(active.id);
    const movedTask = visibleTasks.find((task) => task.id === taskId);
    if (!movedTask || movedTask.status === nextStatus) {
      return;
    }

    const previousStatus = movedTask.status;
    setVisibleTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, status: nextStatus } : task
      )
    );

    const formData = new FormData();
    formData.append('id', taskId);
    formData.append('status', nextStatus);
    const result = await updateTaskStatusAction(null, formData);

    if (!result.success) {
      // Restore only this card. A parallel drop must keep its own result.
      setVisibleTasks((current) =>
        current.map((task) =>
          task.id === taskId ? { ...task, status: previousStatus } : task
        )
      );
      toast.error(result.error);
      return;
    }

    toast.success(`Moved to ${nextStatus.replace('_', ' ')}`);
  };

  // Sorting here keeps a dropped card in due date order right away.
  const filteredTasks = sortTasks(
    view === 'backlog'
      ? visibleTasks.filter((task) => task.status === 'backlog')
      : visibleTasks.filter((task) => task.status !== 'backlog')
  );

  const taskGrid =
    filteredTasks.length === 0 ? (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface-elevated/35 p-12 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-surface-border bg-surface-card text-muted-foreground">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-foreground">No tasks found</h3>
        <p className="mb-5 mt-1 max-w-sm text-xs text-muted-foreground">
          Create a task to add it to this view.
        </p>
        <Button onClick={handleCreateNew} variant="primary" size="sm">
          Create Your First Task
        </Button>
      </div>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {filteredTasks.length}{' '}
            {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        <Button
          onClick={handleCreateNew}
          variant="primary"
          size="sm"
          className="gap-1.5"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Task
        </Button>
      </div>

      {view === 'backlog' ? (
        taskGrid
      ) : (
        <DndContext
          // A fixed id. The dnd-kit counter differs between server and browser.
          id="task-board"
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* One column per row on a phone. No sideways scroll. */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {KANBAN_COLUMNS.map((column) => (
              <KanbanColumnView
                key={column.status}
                column={column}
                tasks={filteredTasks.filter(
                  (task) => task.status === column.status
                )}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* The overlay floats above the scroll container, so the card never clips. */}
          <DragOverlay>
            {draggedTask && (
              <TaskCard
                task={draggedTask}
                onEdit={() => undefined}
                onDelete={() => undefined}
              />
            )}
          </DragOverlay>
        </DndContext>
      )}

      {isFormOpen && (
        <TaskForm
          key={selectedTask?.id ?? 'new-task'}
          open
          onClose={handleCloseForm}
          task={selectedTask}
          defaultStatus={view === 'backlog' ? 'backlog' : 'pending'}
        />
      )}

      <DeleteDialog
        open={Boolean(deletingTask)}
        onClose={handleCloseDelete}
        taskId={deletingTask?.id ?? null}
        taskTitle={deletingTask?.title ?? ''}
      />
    </div>
  );
}
