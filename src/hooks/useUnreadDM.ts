import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const lastReadKey = (userId: string, chatId: string) => `dm_last_read_${userId}_${chatId}`;

export const markChatRead = (userId: string, chatId: string) => {
  localStorage.setItem(lastReadKey(userId, chatId), new Date().toISOString());
  window.dispatchEvent(new CustomEvent('dm-read-changed'));
};

export const useUnreadDM = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) { setCount(0); return; }
    const { data: chats } = await supabase
      .from('direct_chats')
      .select('id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
    if (!chats || chats.length === 0) { setCount(0); return; }

    let total = 0;
    for (const c of chats) {
      const last = localStorage.getItem(lastReadKey(user.id, c.id)) || '1970-01-01';
      const { count: n } = await supabase
        .from('direct_messages')
        .select('*', { count: 'exact', head: true })
        .eq('chat_id', c.id)
        .neq('sender_id', user.id)
        .gt('created_at', last);
      total += n || 0;
    }
    setCount(total);
  }, [user]);

  useEffect(() => {
    refresh();
    if (!user) return;
    const channel = supabase
      .channel('dm-unread-global')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, () => refresh())
      .subscribe();
    const onRead = () => refresh();
    window.addEventListener('dm-read-changed', onRead);
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('dm-read-changed', onRead);
    };
  }, [user, refresh]);

  return count;
};
