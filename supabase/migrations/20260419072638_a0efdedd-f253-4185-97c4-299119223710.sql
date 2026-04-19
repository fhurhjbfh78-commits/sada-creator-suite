CREATE TABLE public.feature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_text TEXT NOT NULL,
  generated_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own feature requests"
ON public.feature_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users create own feature requests"
ON public.feature_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own feature requests"
ON public.feature_requests FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own feature requests"
ON public.feature_requests FOR DELETE
TO authenticated
USING (auth.uid() = user_id);