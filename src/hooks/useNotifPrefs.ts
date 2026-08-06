import { useCallback, useEffect, useState } from 'react';

export interface NotifPrefs {
  messages: boolean;
  comments: boolean;
  system: boolean;
  sound: boolean;
  badge: boolean;
}

export const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  messages: true,
  comments: true,
  system: true,
  sound: true,
  badge: true,
};

const KEY = 'notif_prefs';

export const readNotifPrefs = (): NotifPrefs => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_NOTIF_PREFS;
    return { ...DEFAULT_NOTIF_PREFS, ...(JSON.parse(raw) as Partial<NotifPrefs>) };
  } catch {
    return DEFAULT_NOTIF_PREFS;
  }
};

export const useNotifPrefs = () => {
  const [prefs, setPrefs] = useState<NotifPrefs>(readNotifPrefs);

  useEffect(() => {
    const onChange = () => setPrefs(readNotifPrefs());
    window.addEventListener('notif-prefs-changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('notif-prefs-changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const toggle = useCallback((key: keyof NotifPrefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* quota */ }
      window.dispatchEvent(new CustomEvent('notif-prefs-changed'));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setPrefs(DEFAULT_NOTIF_PREFS);
    try { localStorage.setItem(KEY, JSON.stringify(DEFAULT_NOTIF_PREFS)); } catch { /* quota */ }
    window.dispatchEvent(new CustomEvent('notif-prefs-changed'));
  }, []);

  return { prefs, toggle, reset };
};
