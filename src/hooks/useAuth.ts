import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

let cachedSession: Session | null = null;
let cachedUser: User | null = null;
let loading = true;
let initStarted = false;
let authSubscription: { unsubscribe: () => void } | null = null;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((l) => l());

const init = () => {
  if (initStarted) return;
  initStarted = true;

  supabase.auth.getSession()
    .then(({ data: { session } }) => {
      cachedSession = session;
      cachedUser = session?.user ?? null;
    })
    .finally(() => {
      loading = false;
      notify();
    });

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cachedSession = session;
    cachedUser = session?.user ?? null;
    loading = false;
    notify();
  });
  authSubscription = data.subscription;
};
init();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => ({ user: cachedUser, session: cachedSession, loading });

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
