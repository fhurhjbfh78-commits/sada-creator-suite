/**
 * Offline mini-assistant (local SLM-style engine).
 * Works with zero network: template generation + cached answers from previous online chats.
 */

const CACHE_KEY = 'sada_offline_cache_v1';
const MAX_CACHE = 200;

type CacheItem = { q: string; a: string; t: number };

const readCache = (): CacheItem[] => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

export const cacheAnswer = (q: string, a: string) => {
  try {
    if (!q?.trim() || !a?.trim() || a.length > 8000) return;
    const items = readCache().filter((i) => i.q !== q.trim());
    items.unshift({ q: q.trim(), a: a.trim(), t: Date.now() });
    localStorage.setItem(CACHE_KEY, JSON.stringify(items.slice(0, MAX_CACHE)));
  } catch {
    /* quota — ignore */
  }
};

const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0640]/g, '')
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const similarity = (a: string, b: string) => {
  const wa = new Set(normalize(a).split(' ').filter((w) => w.length > 2));
  const wb = new Set(normalize(b).split(' ').filter((w) => w.length > 2));
  if (!wa.size || !wb.size) return 0;
  let hits = 0;
  wa.forEach((w) => { if (wb.has(w)) hits++; });
  return hits / Math.max(wa.size, wb.size);
};

const findCached = (q: string): string | null => {
  let best: { a: string; score: number } | null = null;
  for (const item of readCache()) {
    const score = similarity(q, item.q);
    if (!best || score > best.score) best = { a: item.a, score };
  }
  return best && best.score >= 0.55 ? best.a : null;
};

// ---------- Local code templates ----------
type Template = { keys: string[]; title: string; body: string };

const TEMPLATES: Template[] = [
  {
    keys: ['react', 'مكون', 'كومبوننت', 'component'],
    title: 'مكون React جاهز',
    body: '```tsx\nimport { useState } from "react";\n\nexport default function MyComponent() {\n  const [count, setCount] = useState(0);\n  return (\n    <div className="p-4 rounded-xl border">\n      <p>العدد: {count}</p>\n      <button onClick={() => setCount(c => c + 1)}>زيادة</button>\n    </div>\n  );\n}\n```',
  },
  {
    keys: ['html', 'صفحه', 'صفحة', 'موقع', 'page'],
    title: 'صفحة HTML متجاوبة (RTL)',
    body: '```html\n<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>صفحتي</title>\n<style>\n body{font-family:system-ui;margin:0;display:grid;place-items:center;min-height:100vh;background:#0f172a;color:#fff}\n .card{background:#1e293b;padding:24px;border-radius:16px;max-width:420px;width:90%}\n</style>\n</head>\n<body>\n <div class="card"><h1>مرحباً</h1><p>هذا قالب جاهز.</p></div>\n</body>\n</html>\n```',
  },
  {
    keys: ['python', 'بايثون', 'py'],
    title: 'سكربت بايثون أساسي',
    body: '```python\nimport sys\n\ndef main(argv: list[str]) -> int:\n    try:\n        print("مرحباً من بايثون")\n        return 0\n    except Exception as e:\n        print(f"خطأ: {e}", file=sys.stderr)\n        return 1\n\nif __name__ == "__main__":\n    raise SystemExit(main(sys.argv[1:]))\n```',
  },
  {
    keys: ['fetch', 'api', 'طلب', 'request', 'axios'],
    title: 'طلب API آمن',
    body: '```js\nasync function getData(url) {\n  const ctrl = new AbortController();\n  const t = setTimeout(() => ctrl.abort(), 15000);\n  try {\n    const res = await fetch(url, { signal: ctrl.signal });\n    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n    return await res.json();\n  } finally {\n    clearTimeout(t);\n  }\n}\n```',
  },
  {
    keys: ['sql', 'جدول', 'قاعده', 'قاعدة', 'database'],
    title: 'مخطط جدول SQL',
    body: '```sql\nCREATE TABLE items (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id uuid NOT NULL,\n  title text NOT NULL,\n  created_at timestamptz NOT NULL DEFAULT now()\n);\nCREATE INDEX items_user_idx ON items(user_id);\n```',
  },
  {
    keys: ['loop', 'حلقه', 'حلقة', 'تكرار', 'for'],
    title: 'حلقات تكرار',
    body: '```js\nfor (const item of items) {\n  console.log(item);\n}\n\n// بايثون\n// for item in items:\n//     print(item)\n```',
  },
  {
    keys: ['cpp', 'c++', 'سي'],
    title: 'قالب C++',
    body: '```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "مرحباً" << endl;\n    return 0;\n}\n```',
  },
  {
    keys: ['css', 'تنسيق', 'ستايل'],
    title: 'تنسيق CSS متجاوب',
    body: '```css\n.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}\n@media (max-width:600px){.grid{gap:8px}}\n```',
  },
];

const HELP = `📴 **وضع بدون إنترنت**
أشتغل محلياً داخل جهازك بقدرات مبسطة:
• اطلب قالب كود: React / HTML / Python / C++ / SQL / CSS / API
• أعيد لك إجابات محادثاتك السابقة إذا سألت سؤالاً مشابهاً
• الحسابات الرياضية البسيطة

ارجع للإنترنت حتى تشتغل كل الميزات (صور، تحليل، وكلاء).`;

const tryMath = (q: string): string | null => {
  const m = q.match(/^[\s\d+\-*/().%]+$/);
  if (!m) return null;
  try {
    // eslint-disable-next-line no-new-func
    const val = Function(`"use strict";return (${q})`)();
    return typeof val === 'number' && isFinite(val) ? `النتيجة: **${val}**` : null;
  } catch {
    return null;
  }
};

/** Generate an offline answer. Never throws. */
export const offlineAnswer = (question: string): string => {
  try {
    const q = (question || '').trim();
    if (!q) return HELP;

    const math = tryMath(q);
    if (math) return `${math}\n\n_(وضع محلي بدون إنترنت)_`;

    const cached = findCached(q);
    if (cached) return `${cached}\n\n_📴 من الذاكرة المحلية (بدون إنترنت)_`;

    const n = normalize(q);
    const hit = TEMPLATES.find((t) => t.keys.some((k) => n.includes(normalize(k))));
    if (hit) return `**${hit.title}** (محلي بدون إنترنت)\n\n${hit.body}`;

    return HELP;
  } catch {
    return HELP;
  }
};

export const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;
