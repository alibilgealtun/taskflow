-- Tasks table
CREATE TABLE public.tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL CHECK (char_length(title) <= 200),
  description text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('backlog', 'pending', 'in_progress', 'completed', 'cancelled')),
  priority text NOT NULL DEFAULT 'none'
    CHECK (priority IN ('none', 'low', 'medium', 'high')),
  due_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX idx_tasks_user_priority ON public.tasks(user_id, priority);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Enable RLS on tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Tasks RLS policies
CREATE POLICY tasks_select_own ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY tasks_insert_own ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY tasks_update_own ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY tasks_delete_own ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Shared lists table
CREATE TABLE public.shared_lists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on shared_lists
ALTER TABLE public.shared_lists ENABLE ROW LEVEL SECURITY;

-- Shared lists RLS policies (authenticated only - no direct anon access to list ids)
CREATE POLICY shared_lists_select_own ON public.shared_lists
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY shared_lists_insert_own ON public.shared_lists
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY shared_lists_update_own ON public.shared_lists
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY shared_lists_delete_own ON public.shared_lists
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Hardened SECURITY DEFINER function for public share page
-- Explicit search_path, verifies active share, and returns public columns without user_id
CREATE OR REPLACE FUNCTION public.get_shared_tasks(p_share_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  status text,
  priority text,
  due_date timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    -- RETURNS TABLE makes id an output variable. The table alias prevents an ambiguous reference.
    SELECT 1 FROM public.shared_lists sl WHERE sl.id = p_share_id AND sl.is_active = true
  ) THEN
    RAISE EXCEPTION 'share_not_found';
  END IF;

  RETURN QUERY
  SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date, t.created_at, t.updated_at
  FROM public.tasks t
  JOIN public.shared_lists sl ON sl.user_id = t.user_id
  WHERE sl.id = p_share_id
    AND sl.is_active = true
  ORDER BY t.created_at DESC;
END;
$$;

-- Secure function permissions
REVOKE ALL ON FUNCTION public.get_shared_tasks(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_tasks(uuid) TO anon, authenticated;

-- Enable Realtime on tasks
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
