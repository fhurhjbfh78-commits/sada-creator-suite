import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Server-backed subscription state. Paid access is decided by the database
 * (a subscription row with status = 'active'), never by client state.
 */
export const useSubscription = () => {
  const [isPaid, setIsPaid] = useState(false);
  const [status, setStatus] = useState<'none' | 'pending' | 'active'>('none');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsPaid(false); setStatus('none'); setLoading(false); return; }
    const { data } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const row = data as { status?: string; current_period_end?: string | null } | null;
    const active =
      row?.status === 'active' &&
      (!row.current_period_end || new Date(row.current_period_end) > new Date());
    setIsPaid(!!active);
    setStatus(active ? 'active' : row?.status === 'pending' ? 'pending' : 'none');
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, [load]);

  return { isPaid, status, loading, reload: load };
};
