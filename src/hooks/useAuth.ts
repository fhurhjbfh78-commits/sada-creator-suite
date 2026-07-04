import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

let cachedSession: Session | null = null;
let cachedUser: User | null = null;
let loading = true;
let initStarted = false;
const listeners = new Set<() => void>();
let snapshot = { user: cachedUser, session: cachedSession, loading };

const notify = () => listeners.forEach((l) => l());
const updateSnapshot = () => {
  snapshot = { user: cachedUser, session: cachedSession, loading };
};

const init = () => {
  if (initStarted) return;
  initStarted = true;

  supabase.auth.getSession()
    .then(({ data: { session }, error }) => {
      if (error) {
        supabase.auth.signOut({ scope: 'local' }).catch(() => {});
        cachedSession = null;
        cachedUser = null;
      } else {
        cachedSession = session;
        cachedUser = session?.user ?? null;
      }
    })
    .catch(() => {
      supabase.auth.signOut({ scope: 'local' }).catch(() => {});
      cachedSession = null;
      cachedUser = null;
    })
    .finally(() => {
      loading = false;
      updateSnapshot();
      notify();
    });

  supabase.auth.onAuthStateChange((_event, session) => {
    cachedSession = session;
    cachedUser = session?.user ?? null;
    loading = false;
    updateSnapshot();
    notify();
  });

  setTimeout(() => {
    if (loading) {
      loading = false;
      updateSnapshot();
      notify();
    }
  }, 4000);
};
init();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

const getSnapshot = () => snapshot;

export const useAuth = () => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    init();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { ...snapshot, signUp, signIn, signOut };
};
