-- Realtime needs SELECT permission before it can apply the authenticated user RLS policy.
GRANT SELECT ON public.tasks TO authenticated;

-- Add the task table only when an older project does not publish it yet.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  END IF;
END;
$$;

ALTER TABLE public.tasks REPLICA IDENTITY FULL;

-- Keep backlog data outside the public RPC, not only outside the user interface.
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
    SELECT 1
    FROM public.shared_lists AS shared_list
    WHERE shared_list.id = p_share_id
      AND shared_list.is_active = true
  ) THEN
    RAISE EXCEPTION 'share_not_found';
  END IF;

  RETURN QUERY
  SELECT
    task.id,
    task.title,
    task.description,
    task.status,
    task.priority,
    task.due_date,
    task.created_at,
    task.updated_at
  FROM public.tasks AS task
  JOIN public.shared_lists AS shared_list
    ON shared_list.user_id = task.user_id
  WHERE shared_list.id = p_share_id
    AND shared_list.is_active = true
    AND task.status <> 'backlog'
  ORDER BY task.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_shared_tasks(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_tasks(uuid) TO anon, authenticated;

-- Send only an invalidation signal. The client gets task data through the secured RPC.
CREATE OR REPLACE FUNCTION public.broadcast_shared_task_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  changed_user_id uuid;
  active_share_id uuid;
BEGIN
  changed_user_id := COALESCE(NEW.user_id, OLD.user_id);

  SELECT shared_lists.id
  INTO active_share_id
  FROM public.shared_lists
  WHERE shared_lists.user_id = changed_user_id
    AND shared_lists.is_active = true;

  IF active_share_id IS NOT NULL THEN
    PERFORM realtime.send(
      '{}'::jsonb,
      'tasks_changed',
      'share:' || active_share_id::text,
      false
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE ALL ON FUNCTION public.broadcast_shared_task_change() FROM PUBLIC;

DROP TRIGGER IF EXISTS broadcast_shared_task_changes ON public.tasks;
CREATE TRIGGER broadcast_shared_task_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.broadcast_shared_task_change();

-- Close an open public board when its owner turns sharing off.
CREATE OR REPLACE FUNCTION public.broadcast_shared_list_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM realtime.send(
    '{}'::jsonb,
    'tasks_changed',
    'share:' || COALESCE(NEW.id, OLD.id)::text,
    false
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE ALL ON FUNCTION public.broadcast_shared_list_change() FROM PUBLIC;

DROP TRIGGER IF EXISTS broadcast_shared_list_changes ON public.shared_lists;
CREATE TRIGGER broadcast_shared_list_changes
  AFTER UPDATE OF is_active OR DELETE ON public.shared_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.broadcast_shared_list_change();
