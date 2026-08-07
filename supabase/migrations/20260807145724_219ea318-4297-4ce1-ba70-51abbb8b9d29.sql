ALTER TABLE public.direct_messages ADD COLUMN IF NOT EXISTS edited_at timestamptz;

ALTER TABLE public.direct_messages DROP CONSTRAINT IF EXISTS direct_messages_chat_id_fkey;
ALTER TABLE public.direct_messages ADD CONSTRAINT direct_messages_chat_id_fkey
  FOREIGN KEY (chat_id) REFERENCES public.direct_chats(id) ON DELETE CASCADE;

ALTER TABLE public.message_reactions DROP CONSTRAINT IF EXISTS message_reactions_message_id_fkey;
ALTER TABLE public.message_reactions ADD CONSTRAINT message_reactions_message_id_fkey
  FOREIGN KEY (message_id) REFERENCES public.direct_messages(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Users can edit own recent messages" ON public.direct_messages;
CREATE POLICY "Users can edit own recent messages"
ON public.direct_messages FOR UPDATE TO authenticated
USING (auth.uid() = sender_id AND created_at > now() - interval '5 minutes')
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can delete own messages" ON public.direct_messages;
CREATE POLICY "Users can delete own messages"
ON public.direct_messages FOR DELETE TO authenticated
USING (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Participants can delete chat" ON public.direct_chats;
CREATE POLICY "Participants can delete chat"
ON public.direct_chats FOR DELETE TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id);