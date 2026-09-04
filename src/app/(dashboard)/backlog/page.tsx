import { createServerClient } from '@/lib/supabase/server';
import { getTasks, taskFilterSchema } from '@/features/tasks/queries';
import { TaskList } from '../tasks/_components/task-list';
import { PriorityFilter } from '../tasks/_components/priority-filter';
import { RealtimeTasksWrapper } from '../tasks/_components/realtime-tasks-wrapper';

interface BacklogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BacklogPage({ searchParams }: BacklogPageProps) {
  const params = await searchParams;
  const priority = taskFilterSchema.parse(params).priority;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tasks = await getTasks({ status: 'backlog', priority });
  const taskVersion = tasks
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
            Backlog
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Keep future work here until it is ready for the board.
          </p>
        </div>

        <PriorityFilter selected={priority} />
      </div>

      <RealtimeTasksWrapper userId={user?.id ?? ''}>
        <TaskList key={taskVersion} tasks={tasks} view="backlog" />
      </RealtimeTasksWrapper>
    </div>
  );
}
