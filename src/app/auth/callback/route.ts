import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

function getSafeRedirectPath(nextParam: string | null): string {
  if (
    !nextParam ||
    !nextParam.startsWith('/') ||
    nextParam.startsWith('//') ||
    nextParam.includes('@') ||
    nextParam.includes('://')
  ) {
    return '/tasks';
  }
  return nextParam;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const safeNext = getSafeRedirectPath(searchParams.get('next'));

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
