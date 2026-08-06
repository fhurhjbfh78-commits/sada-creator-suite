import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { readNotifPrefs } from './useNotifPrefs';

export type NotifKind = 'message' | 'comment' | 'system';

export interface AppNotification {
  id: string;
  kind: NotifKind;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  link?: string;
}

const SEEN_KEY = (uid: string) => `notif_seen_${uid}`;

const getSeen = (uid: string): string[] => {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY(uid)) || '[]'); } catch { return []; }
};

export const useNotifications = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return; }
    const seen = getSeen(user.id);
    const list: AppNotification[] = [];

    // 1) Direct messages sent to me
    const { data: chats } = await supabase
      .from('direct_chats')
      .select('id, user1_id, user2_id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (chats && chats.length) {
      const { data: msgs } = await supabase
        .from('direct_messages')
        .select('id, chat_id, sender_id, content, image_url, file_name, created_at')
        .in('chat_id', chats.map((c) => c.id))
        .neq('sender_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      const senderIds = [...new Set((msgs || []).map((m) => m.sender_id))];
      const nameMap = new Map<string, string>();
      if (senderIds.length) {
        const { data: profs } = await supabase.from('profiles').select('id, name').in('id', senderIds);
        (profs || []).forEach((p) => nameMap.set(p.id, p.name || 'مستخدم'));
      }

      (msgs || []).forEach((m) => {
        const lastRead = localStorage.getItem(`dm_last_read_${user.id}_${m.chat_id}`) || '1970-01-01';
        const isUnread = new Date(m.created_at as string) > new Date(lastRead);
        list.push({
          id: `dm_${m.id}`,
          kind: 'message',
          title: `رسالة جديدة من ${nameMap.get(m.sender_id) || 'مستخدم'}`,
          description: m.content?.trim() || (m.image_url ? '📷 صورة' : m.file_name || 'مرفق'),
          createdAt: m.created_at as string,
          read: !isUnread || seen.includes(`dm_${m.id}`),
          link: '/chat?tab=dm',
        });
      });
    }

    // 2) Comments on my posts
    const { data: myPosts } = await supabase.from('posts').select('id').eq('user_id', user.id);
    if (myPosts && myPosts.length) {
      const { data: comments } = await supabase
        .from('post_comments')
        .select('id, author_name, content, created_at, user_id')
        .in('post_id', myPosts.map((p) => p.id))
        .neq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      (comments || []).forEach((c) => {
        list.push({
          id: `cm_${c.id}`,
          kind: 'comment',
          title: `تعليق جديد من ${c.author_name || 'مستخدم'}`,
          description: c.content,
          createdAt: c.created_at as string,
          read: seen.includes(`cm_${c.id}`),
          link: '/feed',
        });
      });
    }

    list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    setItems(list.slice(0, 40));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
    if (!user) return;
    const channel = supabase
      .channel('notifications-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, () => refresh())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_comments' }, () => refresh())
      .subscribe();
    const onSeen = () => refresh();
    window.addEventListener('notif-seen-changed', onSeen);
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('notif-seen-changed', onSeen);
    };
  }, [user, refresh]);

  const markAllRead = useCallback(() => {
    if (!user) return;
    const ids = items.map((i) => i.id);
    localStorage.setItem(SEEN_KEY(user.id), JSON.stringify([...new Set([...getSeen(user.id), ...ids])].slice(-300)));
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    window.dispatchEvent(new CustomEvent('notif-seen-changed'));
  }, [items, user]);

  const markRead = useCallback((id: string) => {
    if (!user) return;
    localStorage.setItem(SEEN_KEY(user.id), JSON.stringify([...new Set([...getSeen(user.id), id])].slice(-300)));
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
  }, [user]);

  return { items, loading, refresh, markAllRead, markRead, unread: items.filter((i) => !i.read).length };
};
