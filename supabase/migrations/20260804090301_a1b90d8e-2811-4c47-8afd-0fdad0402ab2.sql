
DROP POLICY IF EXISTS "Users read pricing" ON public.admin_settings;

CREATE OR REPLACE FUNCTION public.get_public_prices()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT value FROM public.admin_settings WHERE key = 'prices'), '{}'::jsonb)
$$;

REVOKE ALL ON FUNCTION public.get_public_prices() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_prices() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_public_prices() TO authenticated;

DROP POLICY IF EXISTS "Admins insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins delete roles" ON public.user_roles;

CREATE POLICY "Admins insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated;

DROP POLICY IF EXISTS "Auth users can upload chat files" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload posts" ON storage.objects;
DROP POLICY IF EXISTS "chat_files_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "chat_files_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "chat_files_owner_delete" ON storage.objects;
DROP POLICY IF EXISTS "posts_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "posts_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "posts_owner_delete" ON storage.objects;

CREATE POLICY "chat_files_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "chat_files_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'chat-files' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'chat-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "chat_files_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'chat-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "posts_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "posts_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "posts_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);
