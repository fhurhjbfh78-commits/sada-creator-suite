import { supabase } from '@/integrations/supabase/client';

const BACKUP_KEY = 'app_backup';
const BACKUP_VERSION = 1;

// Keys of localStorage we consider part of the user's app data.
const LOCAL_KEYS_PREFIXES = ['sada-', 'dm_last_read_', 'notif_'];

export interface BackupPayload {
  version: number;
  createdAt: string;
  profile: Record<string, unknown> | null;
  local: Record<string, string>;
}

const collectLocal = (): Record<string, string> => {
  const out: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (!LOCAL_KEYS_PREFIXES.some((p) => k.startsWith(p))) continue;
    const v = localStorage.getItem(k);
    if (v != null && v.length < 500_000) out[k] = v;
  }
  return out;
};

export const buildBackup = async (userId?: string): Promise<BackupPayload> => {
  let profile: Record<string, unknown> | null = null;
  if (userId) {
    const { data } = await supabase
      .from('profiles')
      .select('name, bio, avatar_url, user_id_short')
      .eq('id', userId)
      .maybeSingle();
    profile = (data as Record<string, unknown>) ?? null;
  }
  return {
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    profile,
    local: collectLocal(),
  };
};

export const applyBackup = async (payload: BackupPayload, userId?: string) => {
  if (!payload || typeof payload !== 'object' || !payload.local) {
    throw new Error('ملف النسخة الاحتياطية غير صالح');
  }
  Object.entries(payload.local).forEach(([k, v]) => {
    try { localStorage.setItem(k, v); } catch { /* quota */ }
  });
  if (userId && payload.profile) {
    const p = payload.profile as { name?: string; bio?: string; avatar_url?: string };
    await supabase
      .from('profiles')
      .update({ name: p.name ?? '', bio: p.bio ?? '', avatar_url: p.avatar_url ?? '' })
      .eq('id', userId);
  }
};

/** Save the backup to the user's private cloud row. */
export const cloudBackup = async (userId: string) => {
  const payload = await buildBackup(userId);
  const { error } = await supabase
    .from('user_memory')
    .upsert(
      { user_id: userId, key: BACKUP_KEY, value: JSON.stringify(payload), updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    );
  if (error) throw error;
  return payload.createdAt;
};

export const cloudRestore = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_memory')
    .select('value, updated_at')
    .eq('user_id', userId)
    .eq('key', BACKUP_KEY)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('لا توجد نسخة احتياطية محفوظة');
  await applyBackup(JSON.parse(data.value) as BackupPayload, userId);
  return data.updated_at as string;
};

export const getCloudBackupInfo = async (userId: string) => {
  const { data } = await supabase
    .from('user_memory')
    .select('updated_at')
    .eq('user_id', userId)
    .eq('key', BACKUP_KEY)
    .maybeSingle();
  return (data?.updated_at as string) || null;
};

export const downloadBackup = async (userId?: string) => {
  const payload = await buildBackup(userId);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sada-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const restoreFromFile = async (file: File, userId?: string) => {
  const text = await file.text();
  const payload = JSON.parse(text) as BackupPayload;
  await applyBackup(payload, userId);
};
