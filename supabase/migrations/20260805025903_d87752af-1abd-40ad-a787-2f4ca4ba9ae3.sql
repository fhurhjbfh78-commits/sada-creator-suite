-- 1) Remove SECURITY DEFINER price function; expose prices via a narrow RLS policy instead
DROP FUNCTION IF EXISTS public.get_public_prices();

DROP POLICY IF EXISTS "Anyone can read prices setting" ON public.admin_settings;
CREATE POLICY "Anyone can read prices setting"
  ON public.admin_settings FOR SELECT
  TO authenticated
  USING (key = 'prices');

-- 2) Private-bucket read policies (buckets flipped to private separately)
DROP POLICY IF EXISTS "Anyone can view chat files" ON storage.objects;
DROP POLICY IF EXISTS "Chat participants can read chat files" ON storage.objects;
CREATE POLICY "Chat participants can read chat files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'chat-files'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.direct_chats dc
        WHERE (dc.user1_id = auth.uid() AND dc.user2_id::text = (storage.foldername(name))[1])
           OR (dc.user2_id = auth.uid() AND dc.user1_id::text = (storage.foldername(name))[1])
      )
    )
  );

DROP POLICY IF EXISTS "Anyone can view generated images" ON storage.objects;
DROP POLICY IF EXISTS "Owners can read generated images" ON storage.objects;
CREATE POLICY "Owners can read generated images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'generated-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );