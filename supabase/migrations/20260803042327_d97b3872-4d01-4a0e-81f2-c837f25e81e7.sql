
-- 1) Remove passcode admin backdoor
DROP FUNCTION IF EXISTS public.claim_admin(text);

-- 2) Fix mutable search_path
CREATE OR REPLACE FUNCTION public.touch_admin_settings()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); NEW.updated_by = auth.uid(); RETURN NEW; END; $$;

-- 3) Lock down SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.touch_admin_settings() FROM anon, authenticated, public;

-- 4) admin_settings: only admins read everything; pricing key readable by signed-in users
DROP POLICY IF EXISTS "Anyone reads admin settings" ON public.admin_settings;
CREATE POLICY "Admins read settings" ON public.admin_settings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Users read pricing" ON public.admin_settings
  FOR SELECT TO authenticated USING (key = 'prices');
REVOKE SELECT ON public.admin_settings FROM anon;

-- 5) Stop bucket listing (files remain reachable through public bucket URLs)
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view posts files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view chat files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view generated images" ON storage.objects;
CREATE POLICY "Owners can list own files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id IN ('avatars','posts','chat-files','generated-images')
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

-- 6) Server-verified subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'pro',
  status text NOT NULL DEFAULT 'pending',
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users request own subscription" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins manage subscriptions" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins delete subscriptions" ON public.subscriptions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
