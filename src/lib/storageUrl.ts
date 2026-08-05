import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/** Buckets that are private and require signed URLs. */
const PRIVATE_BUCKETS = ['chat-files', 'generated-images'];

const cache = new Map<string, { url: string; exp: number }>();
const SIGN_TTL = 60 * 60; // 1 hour

function parse(url: string): { bucket: string; path: string } | null {
  if (!url) return null;
  const m = url.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?|$)/);
  if (!m) return null;
  const bucket = decodeURIComponent(m[1]);
  if (!PRIVATE_BUCKETS.includes(bucket)) return null;
  return { bucket, path: decodeURIComponent(m[2]) };
}

/** Converts a stored storage URL into a short-lived signed URL when the bucket is private. */
export async function resolveStorageUrl(url: string | null | undefined): Promise<string> {
  if (!url) return '';
  const info = parse(url);
  if (!info) return url;
  const key = `${info.bucket}/${info.path}`;
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.url;
  try {
    const { data, error } = await supabase.storage
      .from(info.bucket)
      .createSignedUrl(info.path, SIGN_TTL);
    if (error || !data?.signedUrl) return '';
    cache.set(key, { url: data.signedUrl, exp: Date.now() + (SIGN_TTL - 300) * 1000 });
    return data.signedUrl;
  } catch {
    return '';
  }
}

/** React hook returning a displayable (signed if needed) URL. */
export function useStorageUrl(url: string | null | undefined): string {
  const [resolved, setResolved] = useState<string>(() => (parse(url || '') ? '' : url || ''));
  useEffect(() => {
    let active = true;
    if (!url) { setResolved(''); return; }
    if (!parse(url)) { setResolved(url); return; }
    resolveStorageUrl(url).then((u) => { if (active) setResolved(u); });
    return () => { active = false; };
  }, [url]);
  return resolved;
}
