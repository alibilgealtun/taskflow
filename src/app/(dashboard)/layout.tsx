import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { parseThemeCookie, THEME_COOKIE } from '@/lib/theme';
import { createServerClient } from '@/lib/supabase/server';
import { logoutAction } from '@/features/auth/actions';
import { ToastProvider } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { ThemeSwitch } from '@/components/ui/theme-switch';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const cookieStore = await cookies();
  const theme = parseThemeCookie(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-surface-bg text-foreground flex flex-col selection:bg-brand-subtle selection:text-brand-primary">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-40 border-b border-surface-border bg-surface-bg/85 backdrop-blur-md transition-all">
          <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-3 sm:px-6 lg:px-10">
            <div className="flex items-center gap-4 sm:gap-8">
              <Link
                href="/tasks"
                className="flex items-center gap-2 font-bold text-sm sm:text-base text-foreground tracking-tight shrink-0"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary font-bold text-brand-on-primary sm:h-8 sm:w-8">
                  T
                </div>
                <span className="hidden sm:inline">TaskFlow</span>
              </Link>

              <nav className="flex items-center gap-1 text-xs sm:text-sm font-medium">
                <Link
                  href="/tasks"
                  className="rounded-lg px-2.5 py-1.5 text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition-colors"
                >
                  Tasks
                </Link>
                <Link
                  href="/backlog"
                  className="rounded-lg px-2.5 py-1.5 text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition-colors"
                >
                  Backlog
                </Link>
                <Link
                  href="/settings"
                  className="rounded-lg px-2.5 py-1.5 text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition-colors"
                >
                  <span className="sm:hidden">Share</span>
                  <span className="hidden sm:inline">Public Share</span>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* The key resets the switch when the server sees a new cookie. */}
              <ThemeSwitch key={theme} initialTheme={theme} />
              <span className="hidden md:inline-block text-xs text-muted-foreground truncate max-w-[180px]">
                {user.email}
              </span>
              <form action={logoutAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-xs hover:text-status-cancelled px-2.5"
                >
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 py-6 sm:px-6 sm:py-8 lg:px-10">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
