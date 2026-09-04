import { createServerClient } from '@/lib/supabase/server';
import { getTasks, taskFilterSchema } from '@/features/tasks/queries';
import { TaskList } from './_components/task-list';
import { PriorityFilter } from './_components/priority-filter';
import { RealtimeTasksWrapper } from './_components/realtime-tasks-wrapper';

interface TasksPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;
  const priority = taskFilterSchema.parse(params).priority;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tasks = await getTasks({ priority });
  const boardTasks = tasks.filter((task) => task.status !== 'backlog');
  const taskVersion = boardTasks
    .map(
      (task) =>
        `${task.id}:${task.status}:${task.priority}:${task.due_date}:${task.updated_at}`
    )
    .join('|');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Tasks
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Closest due date first. Drag a card to change its status.
          </p>
        </div>

        <PriorityFilter selected={priority} />
      </div>

      <RealtimeTasksWrapper userId={user?.id ?? ''}>
        <TaskList key={taskVersion} tasks={boardTasks} view="kanban" />
      </RealtimeTasksWrapper>
    </div>
  );
}
