import { type NextRequest, type NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export function proxy(request: NextRequest): Promise<NextResponse> {
  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
