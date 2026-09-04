import type { Database } from '@/types/database';

export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export type TaskStatus = Database['public']['Tables']['tasks']['Row']['status'];
export type TaskPriority = Database['public']['Tables']['tasks']['Row']['priority'];

export const TASK_STATUSES: readonly { readonly value: TaskStatus; readonly label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export const TASK_PRIORITIES: readonly { readonly value: TaskPriority; readonly label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

export function isTaskStatus(val: string): val is TaskStatus {
  return TASK_STATUSES.some((s) => s.value === val);
}

export function isTaskPriority(val: string): val is TaskPriority {
  return TASK_PRIORITIES.some((p) => p.value === val);
}
