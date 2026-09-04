import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createServerClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

interface TestUser {
  id: string;
}

function setAuthenticatedUser(
  user: TestUser | null,
  refreshCookie = false
): void {
  const client = {
    auth: {
      getUser: vi.fn().mockImplementation(async () => ({
        data: { user },
      })),
    },
  };
  vi.mocked(createServerClient).mockImplementation((_url, _key, options) => {
    const setAll = options.cookies.setAll as
      | ((cookiesToSet: Array<{
          name: string;
          value: string;
          options: { path: string; httpOnly: boolean };
        }>) => void)
      | undefined;
    if (refreshCookie && setAll) {
      client.auth.getUser.mockImplementation(async () => {
        setAll([
          {
            name: 'sb-refreshed',
            value: 'new-token',
            options: { path: '/', httpOnly: true },
          },
        ]);
        return { data: { user } };
      });
    }
    return client as never;
  });
}

function request(pathname: string): NextRequest {
  return new NextRequest(`https://taskflow.test${pathname}`);
}

describe('updateSession', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('redirects a signed-out user from a protected route', async () => {
    setAuthenticatedUser(null);

    const response = await updateSession(request('/tasks'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://taskflow.test/login');
  });

  it('keeps refreshed session cookies on an auth redirect', async () => {
    setAuthenticatedUser(null, true);

    const response = await updateSession(request('/tasks'));

    expect(response.cookies.get('sb-refreshed')).toMatchObject({
      name: 'sb-refreshed',
      value: 'new-token',
      httpOnly: true,
      path: '/',
    });
  });

  it.each(['/login', '/register', '/share/list-id', '/auth/callback'])(
    'allows a signed-out user to open %s',
    async (pathname) => {
      setAuthenticatedUser(null);

      const response = await updateSession(request(pathname));

      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    }
  );

  it.each(['/login', '/register'])(
    'redirects a signed-in user away from %s',
    async (pathname) => {
      setAuthenticatedUser({ id: 'user-id' });

      const response = await updateSession(request(pathname));

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('https://taskflow.test/tasks');
    }
  );

  it('allows a signed-in user to open a protected route', async () => {
    setAuthenticatedUser({ id: 'user-id' });

    const response = await updateSession(request('/settings'));

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });
});
