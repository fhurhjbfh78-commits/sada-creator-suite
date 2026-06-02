import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

// Shared singleton state — prevents black-screen flash on every navigation
let cachedSession: Session | null = null;
let cachedUser: User | null = null;
let initialized = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((l) => l());

// Initialize once at module load
const init = () => {
  if (initialized) return;
  initialized = true;
  supabase.auth.getSession().then(({ data: { session } }) => {
    cachedSession = session;
    cachedUser = session?.user ?? null;
    notify();
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    cachedSession = session;
    cachedUser = session?.user ?? null;
    notify();
  });
};
init();

export const useAuth = () => {
  const [, force] = useState(0);
  const [loading, setLoading] = useState(!initialized || (cachedUser === null && cachedSession === null && !initialized));

  useEffect(() => {
    const l = () => { setLoading(false); force((x) => x + 1); };
    listeners.add(l);
    // If already initialized with a result, stop loading immediately
    if (initialized) setLoading(false);
    // Safety: if still loading after 600ms, stop spinner (avoid black screen)
    const t = setTimeout(() => setLoading(false), 600);
    return () => { listeners.delete(l); clearTimeout(t); };
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user: cachedUser, session: cachedSession, loading, signUp, signIn, signOut };
};
