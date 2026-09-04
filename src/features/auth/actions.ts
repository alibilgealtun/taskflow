'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema } from './schemas';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function extractFormData(
  first: ActionResult<null> | null | FormData,
  second?: FormData
): FormData {
  if (second instanceof FormData) return second;
  if (first instanceof FormData) return first;
  throw new Error('Expected valid FormData submission');
}

export async function loginAction(
  prevStateOrFormData: ActionResult<null> | null | FormData,
  formDataOrUndefined?: FormData
): Promise<ActionResult<null>> {
  const formData = extractFormData(prevStateOrFormData, formDataOrUndefined);

  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input',
    };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/tasks');
}

export async function registerAction(
  prevStateOrFormData: ActionResult<null> | null | FormData,
  formDataOrUndefined?: FormData
): Promise<ActionResult<null>> {
  const formData = extractFormData(prevStateOrFormData, formDataOrUndefined);

  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input',
    };
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.session) {
    return {
      success: false,
      error: 'Account created! Please verify your email before signing in.',
    };
  }

  revalidatePath('/', 'layout');
  redirect('/tasks');
}

export async function logoutAction(): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath('/', 'layout');
  redirect('/login');
}
