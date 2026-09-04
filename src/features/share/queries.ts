import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { mapSupabaseError } from '@/lib/error-messages';
import type { Task } from '@/features/tasks/types';

export interface SharedListInfo {
  id: string;
  user_id: string;
  is_active: boolean;
  created_at: string;
}

export const publicTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(['backlog', 'pending', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['none', 'low', 'medium', 'high']),
  due_date: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const publicTaskListSchema = z.array(publicTaskSchema);

export type PublicTask = Omit<Task, 'user_id'>;

export async function getShareSettings(): Promise<SharedListInfo | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('shared_lists')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(mapSupabaseError(error.message, 'share'));
  }

  return data;
}

export async function getSharedTasks(shareId: string): Promise<PublicTask[] | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc('get_shared_tasks', {
    p_share_id: shareId,
  });

  if (error || !data) {
    return null;
  }

  const parsed = publicTaskListSchema.safeParse(data);
  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

