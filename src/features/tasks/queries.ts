import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { mapSupabaseError, getErrorMessage } from '@/lib/error-messages';
import { sortTasks } from './sort';
import type { Task } from './types';

const PRIORITY_VALUES = ['none', 'low', 'medium', 'high'] as const;

type PriorityValue = (typeof PRIORITY_VALUES)[number];

/** A repeated URL key arrives as an array. Keep the first value. */
function firstValue(input: unknown): unknown {
  return Array.isArray(input) ? input[0] : input;
}

function isPriority(value: string): value is PriorityValue {
  return PRIORITY_VALUES.some((priority) => priority === value);
}

/**
 * The priority filter accepts a repeated key and a comma separated list.
 * Bad entries drop out, so one typo does not clear the whole filter.
 */
function priorityList(input: unknown): PriorityValue[] {
  const raw = Array.isArray(input) ? input : [input];
  const values = raw
    .filter((item): item is string => typeof item === 'string')
    .flatMap((item) => item.split(','))
    .map((item) => item.trim())
    .filter(isPriority);

  return [...new Set(values)];
}

/**
 * Parses filters from the URL. One bad value drops only that filter,
 * so the rest of the view keeps working.
 */
export const taskFilterSchema = z.object({
  status: z.preprocess(
    firstValue,
    z
      .enum(['backlog', 'pending', 'in_progress', 'completed', 'cancelled'])
      .optional()
      .catch(undefined)
  ),
  priority: z.preprocess(
    priorityList,
    z.array(z.enum(PRIORITY_VALUES)).catch([])
  ),
});

export type TaskFilters = z.infer<typeof taskFilterSchema>;

export async function getTasks(filters?: unknown): Promise<Task[]> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(getErrorMessage('general/not-authenticated'));
  }

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const parsed = taskFilterSchema.safeParse(filters);
  if (parsed.success) {
    if (parsed.data.status) {
      query = query.eq('status', parsed.data.status);
    }
    if (parsed.data.priority.length > 0) {
      query = query.in('priority', parsed.data.priority);
    }
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(mapSupabaseError(error.message, 'task'));
  }

  return sortTasks(data ?? []);
}
