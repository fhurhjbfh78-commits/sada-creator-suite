DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'admin_settings'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.admin_settings';
  END IF;
END $$;

-- Subscriptions: users may only create a pending request for themselves; no self-update path.
DROP POLICY IF EXISTS "Users request own subscription" ON public.subscriptions;
CREATE POLICY "Users request own subscription"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND current_period_end IS NULL
);

REVOKE UPDATE ON public.subscriptions FROM authenticated;
GRANT UPDATE (plan) ON public.subscriptions TO authenticated;
