import { notFound } from 'next/navigation';
import { getSharedTasks } from '@/features/share/queries';
import { taskFilterSchema } from '@/features/tasks/queries';
import { PriorityFilter } from '@/app/(dashboard)/tasks/_components/priority-filter';
import { SharedTaskBoard } from './_components/shared-task-board';
import { SharedRealtimeWrapper } from './_components/shared-realtime-wrapper';
import Link from 'next/link';

interface SharePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SharePage({
  params,
  searchParams,
}: SharePageProps) {
  const { id } = await params;
  const filters = taskFilterSchema.parse(await searchParams);
  const tasks = await getSharedTasks(id);

  if (!tasks) {
    notFound();
  }

  const visibleTasks = tasks.filter(
    (task) =>
      task.status !== 'backlog' &&
      (filters.priority.length === 0 ||
        filters.priority.includes(task.priority))
  );

  return (
    <div className="min-h-screen bg-surface-bg text-foreground">
      <header className="border-b border-surface-border bg-surface-bg/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary font-bold text-brand-on-primary">
              T
            </div>
            <div>
              <span className="font-bold text-base text-foreground tracking-tight">TaskFlow</span>
              <span className="ml-2 rounded-md bg-brand-subtle border border-brand-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-primary">
                Shared View
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in to TaskFlow &rarr;
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Shared Tasks
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Read-only board. Closest due date first.
            </p>
          </div>

          <PriorityFilter selected={filters.priority} />
        </div>

        <SharedRealtimeWrapper shareId={id}>
          <SharedTaskBoard tasks={visibleTasks} />
        </SharedRealtimeWrapper>
      </main>
    </div>
  );
}
