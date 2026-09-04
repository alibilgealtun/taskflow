export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-bg p-4 text-foreground">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary text-xs font-bold text-brand-on-primary">
              T
            </span>
            <span>TaskFlow</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Personal Task Management
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Keep your projects organized, prioritized, and on schedule.
          </p>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface-card p-7 shadow-sm shadow-elevation/5">
          {children}
        </div>
      </div>
    </div>
  );
}
