import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AdminSettingsMap = Record<string, any>;

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<AdminSettingsMap>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from('admin_settings').select('key,value');
    const map: AdminSettingsMap = {};
    (data || []).forEach((r: any) => { map[r.key] = r.value; });
    setSettings(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel('admin_settings_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_settings' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const save = useCallback(async (key: string, value: any) => {
    const { error } = await supabase
      .from('admin_settings')
      .upsert({ key, value }, { onConflict: 'key' });
    return { error };
  }, []);

  return { settings, loading, save, reload: load };
};

/** Server-verified admin check (reads the user_roles table under RLS). */
export const useAdminGuard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    let active = true;
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (active) { setIsAdmin(false); setChecking(false); } return; }
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
      if (active) { setIsAdmin(!!data); setChecking(false); }
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => { setChecking(true); check(); });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);
  return { isAdmin, checking };
};

export const useIsAdmin = () => useAdminGuard().isAdmin;
