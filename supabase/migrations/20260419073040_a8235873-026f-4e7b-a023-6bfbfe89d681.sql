-- Add reply support to direct messages
ALTER TABLE public.direct_messages 
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.direct_messages(id) ON DELETE SET NULL;

-- Create reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.direct_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view reactions on their chats"
ON public.message_reactions FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.direct_messages dm
  JOIN public.direct_chats dc ON dc.id = dm.chat_id
  WHERE dm.id = message_reactions.message_id
    AND (dc.user1_id = auth.uid() OR dc.user2_id = auth.uid())
));

CREATE POLICY "Users add own reactions"
ON public.message_reactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users remove own reactions"
ON public.message_reactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;