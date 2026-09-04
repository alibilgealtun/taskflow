'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import { formatDueDateToIso } from '@/lib/utils';
import { mapSupabaseError, getErrorMessage } from '@/lib/error-messages';
import type { ActionResult } from '@/features/auth/actions';
import {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  deleteTaskSchema,
} from './schemas';

function extractFormData(
  first: ActionResult<null> | null | FormData,
  second?: FormData
): FormData {
  if (second instanceof FormData) return second;
  if (first instanceof FormData) return first;
  throw new Error('Expected valid FormData submission');
}

async function revalidateTaskViews(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string
): Promise<void> {
  revalidatePath('/tasks');
  revalidatePath('/backlog');
  const { data: share } = await supabase
    .from('shared_lists')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (share?.id) {
    revalidatePath(`/share/${share.id}`);
  }
}

export async function createTaskAction(
  prevStateOrFormData: ActionResult<null> | null | FormData,
  formDataOrUndefined?: FormData
): Promise<ActionResult<null>> {
  const formData = extractFormData(prevStateOrFormData, formDataOrUndefined);

  const raw = {
    title: formData.get('title'),
    description: formData.get('description') || null,
    status: formData.get('status') || 'pending',
    priority: formData.get('priority') || 'none',
    due_date: formData.get('due_date') || null,
  };

  const parsed = createTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input',
    };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: getErrorMessage('general/not-authenticated') };
  }

  const { error } = await supabase.from('tasks').insert({
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    status: parsed.data.status,
    priority: parsed.data.priority,
    due_date: formatDueDateToIso(parsed.data.due_date),
  });

  if (error) {
    return { success: false, error: mapSupabaseError(error.message, 'task') };
  }

  await revalidateTaskViews(supabase, user.id);
  return { success: true, data: null };
}

export async function updateTaskAction(
  prevStateOrFormData: ActionResult<null> | null | FormData,
  formDataOrUndefined?: FormData
): Promise<ActionResult<null>> {
  const formData = extractFormData(prevStateOrFormData, formDataOrUndefined);

  const raw = {
    id: formData.get('id'),
    title: formData.get('title'),
    description: formData.get('description') || null,
    status: formData.get('status'),
    priority: formData.get('priority'),
    due_date: formData.get('due_date') || null,
  };

  const parsed = updateTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input',
    };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: getErrorMessage('general/not-authenticated') };
  }

  const { data, error } = await supabase
    .from('tasks')
    .update({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      due_date: formatDueDateToIso(parsed.data.due_date),
    })
    .eq('id', parsed.data.id)
    .eq('user_id', user.id)
    .select('id');

  if (error) {
    return { success: false, error: mapSupabaseError(error.message, 'task') };
  }

  if (!data || data.length === 0) {
    return { success: false, error: getErrorMessage('task/not-found') };
  }

  await revalidateTaskViews(supabase, user.id);
  return { success: true, data: null };
}

export async function updateTaskStatusAction(
  prevStateOrFormData: ActionResult<null> | null | FormData,
  formDataOrUndefined?: FormData
): Promise<ActionResult<null>> {
  const formData = extractFormData(prevStateOrFormData, formDataOrUndefined);

  const raw = {
    id: formData.get('id'),
    status: formData.get('status'),
  };

  const parsed = updateStatusSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input',
    };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: getErrorMessage('general/not-authenticated') };
  }

  const { data, error } = await supabase
    .from('tasks')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id)
    .eq('user_id', user.id)
    .select('id');

  if (error) {
    return { success: false, error: mapSupabaseError(error.message, 'task') };
  }

  if (!data || data.length === 0) {
    return { success: false, error: getErrorMessage('task/not-found') };
  }

  await revalidateTaskViews(supabase, user.id);
  return { success: true, data: null };
}

export async function deleteTaskAction(
  prevStateOrFormData: ActionResult<null> | null | FormData,
  formDataOrUndefined?: FormData
): Promise<ActionResult<null>> {
  const formData = extractFormData(prevStateOrFormData, formDataOrUndefined);

  const raw = {
    id: formData.get('id'),
  };

  const parsed = deleteTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input',
    };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: getErrorMessage('general/not-authenticated') };
  }

  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', parsed.data.id)
    .eq('user_id', user.id)
    .select('id');

  if (error) {
    return { success: false, error: mapSupabaseError(error.message, 'task') };
  }

  if (!data || data.length === 0) {
    return { success: false, error: getErrorMessage('task/not-found') };
  }

  await revalidateTaskViews(supabase, user.id);
  return { success: true, data: null };
}
