'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import { mapSupabaseError, getErrorMessage } from '@/lib/error-messages';
import type { ActionResult } from '@/features/auth/actions';

export async function toggleShareAction(): Promise<
  ActionResult<{ shareId: string; isActive: boolean }>
> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: getErrorMessage('general/not-authenticated') };
  }

  const { data: existing, error: fetchError } = await supabase
    .from('shared_lists')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: mapSupabaseError(fetchError.message, 'share') };
  }

  if (!existing) {
    // Create new shared list
    const { data: created, error: insertError } = await supabase
      .from('shared_lists')
      .insert({
        user_id: user.id,
        is_active: true,
      })
      .select()
      .single();

    if (insertError || !created) {
      return { success: false, error: insertError ? mapSupabaseError(insertError.message, 'share') : getErrorMessage('share/create-failed') };
    }

    revalidatePath('/settings');
    revalidatePath(`/share/${created.id}`);
    return {
      success: true,
      data: { shareId: created.id, isActive: created.is_active },
    };
  }

  // Toggle existing
  const newActiveState = !existing.is_active;
  const { data: updated, error: updateError } = await supabase
    .from('shared_lists')
    .update({ is_active: newActiveState })
    .eq('id', existing.id)
    .select()
    .single();

  if (updateError || !updated) {
    return { success: false, error: updateError ? mapSupabaseError(updateError.message, 'share') : getErrorMessage('share/update-failed') };
  }

  revalidatePath('/settings');
  revalidatePath(`/share/${updated.id}`);
  return {
    success: true,
    data: { shareId: updated.id, isActive: updated.is_active },
  };
}
