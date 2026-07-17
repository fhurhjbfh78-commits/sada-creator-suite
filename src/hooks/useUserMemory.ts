import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type MemoryMap = Record<string, string>;

export const useUserMemory = () => {
  const { user } = useAuth();
  const [memory, setMemory] = useState<MemoryMap>({});
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!user) { setMemory({}); setLoaded(true); return; }
    const { data } = await supabase
      .from('user_memory')
      .select('key,value')
      .eq('user_id', user.id);
    const map: MemoryMap = {};
    (data || []).forEach((r: any) => { map[r.key] = r.value; });
    setMemory(map);
    setLoaded(true);
  }, [user?.id]);

  useEffect(() => { reload(); }, [reload]);

  const remember = useCallback(async (key: string, value: string) => {
    if (!user) return;
    const k = key.trim().slice(0, 60);
    const v = value.trim().slice(0, 500);
    if (!k || !v) return;
    setMemory((m) => ({ ...m, [k]: v }));
    await supabase.from('user_memory').upsert(
      { user_id: user.id, key: k, value: v, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    );
  }, [user?.id]);

  const forget = useCallback(async (key: string) => {
    if (!user) return;
    const k = key.trim();
    setMemory((m) => { const c = { ...m }; delete c[k]; return c; });
    await supabase.from('user_memory').delete().eq('user_id', user.id).eq('key', k);
  }, [user?.id]);

  return { memory, loaded, remember, forget, reload };
};
