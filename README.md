# TaskFlow

A personal task management application I built with Next.js 16, Supabase, Tailwind CSS v4, and TypeScript.

- **Live Demo**:
- **Repository**: [github.com/alibilgealtun/taskflow](https://github.com/alibilgealtun/taskflow)

## Features

- **Authentication**: Email and password sign-in with session protection via `proxy.ts`.

- **Kanban Board**: Drag tasks across Pending, In Progress, Completed, and Cancelled columns.

- **Backlog View**: Dedicated list for unstarted tasks.

- **Task Details**: Priority chips, due dates with optional time, and overdue indicators.

- **Public Sharing**: Share read-only task boards with real-time updates via broadcast channels.

- **Error Handling**: Accessible inline field errors, auto-clearing alerts, and themed error boundaries.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions)
- **Language**: TypeScript (strict mode)
- **Database & Auth**: Supabase (PostgreSQL, Row-Level Security, Realtime)
- **Styling**: Tailwind CSS v4 with dark and light themes
- **Testing**: Vitest and React Testing Library (124 tests)
- **CI/CD**: GitHub Actions

## Local Setup

### 1. Prerequisites

- Node.js 20+
- A Supabase project

### 2. Installation

```bash
git clone https://github.com/alibilgealtun/taskflow.git
cd taskflow
npm install
```

### 3. Environment Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
```

### 4. Database Migrations

Run these files in order in your Supabase SQL editor:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_realtime_sync.sql`

### 5. Start the Application

```bash
make dev
# or: npm run dev
```

Open `http://localhost:3000`.

## Commands

Use the Makefile for local verification:

| Command          | Description                       |
| ---------------- | --------------------------------- |
| `make dev`       | Start development server          |
| `make test`      | Run Vitest test suite (124 tests) |
| `make lint`      | Run ESLint checks                 |
| `make typecheck` | Run TypeScript compiler checks    |
| `make build`     | Run Next.js production build      |
| `make check`     | Run all quality gates in sequence |

## Technical Decisions

### Server Actions vs Route Handlers

I chose Server Actions for task mutations and kept Route Handlers strictly for the auth callback (`/auth/callback`). Server Actions keep data mutations close to UI components with end-to-end type safety. They remove REST boilerplate and let me trigger immediate cache revalidation with `revalidatePath()`.

### Row Level Security (RLS) Approach

I enforced data isolation directly at the database layer rather than relying on application code alone. Every table policy on `tasks` checks `auth.uid() = user_id` for SELECT, INSERT, UPDATE, and DELETE. Even if client-side filtering fails or the anon key leaks, the database blocks cross-user access.

### Public Share Page Security

I blocked direct anonymous access to the `tasks` and `shared_lists` tables. Instead, the `/share/[id]` page calls a `SECURITY DEFINER` function (`get_shared_tasks`). This function verifies that the share link is active, returns only public task fields without `user_id`, and excludes backlog tasks so private drafts stay hidden.

## Out of Scope & Future Work

### Left Out of Scope

- Task assignment between users and team workspaces (per project specification).

### Future work

- 2 options: canban or normal table view for tasks. (like in backlog)
- Activity log & audit trail
- Task search with keyword filtering.
- Subtasks and checklist items within cards.
- More about UI & UX. I would add more interactive features and animations, etc.
- Offline sync with IndexedDB
- End-to-end browser test suite using Playwright.
