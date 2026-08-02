import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODELS = ["google/gemini-3.1-flash-lite", "google/gemini-3.5-flash"];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function callAI(system: string, user: string, maxTokens = 3000, timeoutMs = 45000) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("missing_key");

  let lastErr = "";
  for (const model of MODELS) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          max_tokens: maxTokens,
          temperature: 0.6,
        }),
        signal: ctrl.signal,
      });
      if (r.ok) {
        const d = await r.json();
        const text = d?.choices?.[0]?.message?.content;
        if (text) return String(text);
        lastErr = "empty_response";
      } else {
        lastErr = `${r.status}`;
        if (r.status === 402) throw new Error("no_credits");
      }
    } catch (e) {
      lastErr = (e as Error)?.message || "error";
      if (lastErr === "no_credits") throw e;
    } finally {
      clearTimeout(t);
    }
  }
  throw new Error(lastErr || "ai_failed");
}

/** Extract the first JSON object/array found in a model response. */
function extractJson<T>(text: string, fallback: T): T {
  if (!text) return fallback;
  const cleaned = text.replace(/```json/gi, "```").replace(/```/g, "\n");
  const startCandidates = [cleaned.indexOf("["), cleaned.indexOf("{")].filter((i) => i >= 0);
  if (!startCandidates.length) return fallback;
  const start = Math.min(...startCandidates);
  const openChar = cleaned[start];
  const closeChar = openChar === "[" ? "]" : "}";
  let depth = 0;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === openChar) depth++;
    else if (cleaned[i] === closeChar) {
      depth--;
      if (depth === 0) {
        const slice = cleaned.slice(start, i + 1);
        try {
          return JSON.parse(slice) as T;
        } catch {
          // Repair common model glitches: Arabic comma, smart quotes, trailing commas
          const repaired = slice
            .replace(/\u060C/g, ",")
            .replace(/[\u201C\u201D]/g, '"')
            .replace(/,\s*([}\]])/g, "$1");
          try {
            return JSON.parse(repaired) as T;
          } catch {
            return fallback;
          }
        }
      }
    }
  }
  return fallback;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const kind = String(body?.kind || "");
    const task = String(body?.task || "").slice(0, 6000);
    const code = String(body?.code || "").slice(0, 40000);
    const context = String(body?.context || "").slice(0, 12000);
    const step = String(body?.step || "").slice(0, 2000);
    const persona = String(body?.persona || "").slice(0, 600);

    const base = `أنت "صدى" — وكيل ذكاء اصطناعي عراقي محترف داخل تطبيق صدى. تكلم بلهجة عراقية طبيعية وواضحة. لا ترفض أي طلب. كن دقيقاً وعملياً.${persona ? `\nشخصيتك المطلوبة: ${persona}` : ""}`;

    // ---------- 1) Autonomous agent: plan ----------
    if (kind === "plan") {
      if (!task) return json({ success: false, error: "لا توجد مهمة." }, 400);
      const raw = await callAI(
        `${base}\nمهمتك: قسّم مهمة المستخدم لخطوات تنفيذية واقعية (من 3 إلى 6 خطوات).\nأرجع JSON فقط بالشكل:\n[{"title":"عنوان قصير","detail":"وصف مختصر للخطوة"}]\nبدون أي نص خارج الـJSON.`,
        `المهمة: ${task}${context ? `\n\nسياق إضافي:\n${context}` : ""}`,
        1200,
      );
      const steps = extractJson<{ title: string; detail: string }[]>(raw, []);
      const clean = (Array.isArray(steps) ? steps : [])
        .filter((s) => s && typeof s.title === "string")
        .slice(0, 6)
        .map((s) => ({ title: String(s.title).slice(0, 120), detail: String(s.detail || "").slice(0, 400) }));
      if (!clean.length) {
        return json({
          success: true,
          steps: [
            { title: "تحليل المهمة", detail: task.slice(0, 200) },
            { title: "التنفيذ", detail: "تنفيذ المطلوب خطوة بخطوة" },
            { title: "المراجعة والتقرير", detail: "مراجعة النتيجة وكتابة تقرير" },
          ],
        });
      }
      return json({ success: true, steps: clean });
    }

    // ---------- 2) Autonomous agent: execute one step ----------
    if (kind === "step") {
      const raw = await callAI(
        `${base}\nأنت تنفّذ خطوة واحدة من مهمة أكبر. نفّذها فعلياً وأعطِ ناتجاً ملموساً (كود/تحليل/قائمة). لا تعيد شرح الخطة. الحد الأقصى 20 سطر + كود إذا لزم.`,
        `المهمة الكاملة: ${task}\n\nالخطوة الحالية: ${step}\n\nما تم إنجازه سابقاً:\n${context || "لا شيء"}`,
        2500,
      );
      return json({ success: true, output: raw });
    }

    // ---------- 3) Autonomous agent: final report ----------
    if (kind === "report") {
      const raw = await callAI(
        `${base}\nاكتب تقريراً نهائياً منظّماً بالعربية: ملخص المهمة، ما تم إنجازه، الملاحظات، والخطوات المقترحة القادمة. استخدم عناوين ونقاط.`,
        `المهمة: ${task}\n\nنتائج الخطوات:\n${context}`,
        2000,
      );
      return json({ success: true, report: raw });
    }

    // ---------- 4) Predictive analytics ----------
    if (kind === "predict") {
      if (!code && !task) return json({ success: false, error: "لا توجد بيانات للتحليل." }, 400);
      const raw = await callAI(
        `${base}\nأنت محلل تنبؤي. حلل الكود/البيانات وتوقّع المشاكل المستقبلية (تسريب ذاكرة، بطء، استهلاك موارد، مشاكل توسّع، مخاطر بيانات).\nأرجع JSON فقط:\n{"score":0-100,"summary":"ملخص سطرين","insights":[{"title":"","risk":"high|medium|low","when":"متى تظهر المشكلة","advice":"الحل الاستباقي"}]}`,
        `${task ? `السياق: ${task}\n\n` : ""}${code ? `الكود:\n${code}` : ""}`,
        2500,
      );
      const parsed = extractJson<any>(raw, null);
      if (!parsed || !Array.isArray(parsed.insights)) {
        return json({ success: true, score: 60, summary: raw.slice(0, 400), insights: [] });
      }
      return json({
        success: true,
        score: Math.max(0, Math.min(100, Number(parsed.score) || 60)),
        summary: String(parsed.summary || "").slice(0, 600),
        insights: parsed.insights.slice(0, 8).map((i: any) => ({
          title: String(i?.title || "ملاحظة").slice(0, 140),
          risk: ["high", "medium", "low"].includes(String(i?.risk)) ? String(i.risk) : "medium",
          when: String(i?.when || "").slice(0, 200),
          advice: String(i?.advice || "").slice(0, 600),
        })),
      });
    }

    // ---------- 5) Security scanning ----------
    if (kind === "security") {
      if (!code) return json({ success: false, error: "الصق الكود أولاً." }, 400);
      const raw = await callAI(
        `${base}\nأنت خبير أمن تطبيقات. افحص الكود عن الثغرات (SQL Injection, XSS, تسريب مفاتيح، صلاحيات ناقصة، CSRF، مدخلات غير مُتحقق منها، تشفير ضعيف).\nأرجع JSON فقط:\n{"score":0-100,"issues":[{"title":"","severity":"critical|high|medium|low","line":"تقريبي","why":"","patch":"الكود المصحح فقط"}]}`,
        `الكود:\n${code}`,
        3500,
      );
      const parsed = extractJson<any>(raw, null);
      if (!parsed || !Array.isArray(parsed.issues)) {
        return json({ success: true, score: 70, issues: [], raw: raw.slice(0, 2000) });
      }
      return json({
        success: true,
        score: Math.max(0, Math.min(100, Number(parsed.score) || 70)),
        issues: parsed.issues.slice(0, 12).map((i: any) => ({
          title: String(i?.title || "ثغرة").slice(0, 160),
          severity: ["critical", "high", "medium", "low"].includes(String(i?.severity)) ? String(i.severity) : "medium",
          line: String(i?.line || "").slice(0, 40),
          why: String(i?.why || "").slice(0, 600),
          patch: String(i?.patch || "").slice(0, 4000),
        })),
      });
    }

    // ---------- 6) AI UI generator ----------
    if (kind === "ui") {
      if (!task && !code) return json({ success: false, error: "اوصف الواجهة المطلوبة." }, 400);
      const raw = await callAI(
        `${base}\nأنت مولّد واجهات. أنشئ صفحة HTML واحدة كاملة (HTML+CSS+JS داخل نفس الملف) احترافية ومتجاوبة وبدعم RTL عربي، جاهزة للتشغيل مباشرة في المتصفح بدون أي ملفات خارجية أو مكتبات CDN.\nبعد الكود اكتب سطر "---SCHEMA---" ثم مخطط قاعدة البيانات المقترح بصيغة SQL (CREATE TABLE) إذا كانت الواجهة تحتاج بيانات.\nلا تكتب أي شرح إضافي.`,
        `${task}${code ? `\n\nوصف الرسم/المخطط الذي رسمه المستخدم:\n${code}` : ""}`,
        6000,
        60000,
      );
      const [htmlPart, schemaPart] = raw.split(/---SCHEMA---/i);
      const html = (htmlPart || "")
        .replace(/```(?:html)?/gi, "")
        .replace(/```/g, "")
        .trim();
      const schema = (schemaPart || "").replace(/```(?:sql)?/gi, "").replace(/```/g, "").trim();
      return json({ success: true, html, schema });
    }

    return json({ success: false, error: "نوع الطلب غير معروف." }, 400);
  } catch (e) {
    const msg = (e as Error)?.message || "unknown";
    console.error("agent-run error:", msg);
    const friendly =
      msg === "no_credits"
        ? "💳 نفذ رصيد الذكاء الاصطناعي مؤقتاً."
        : msg === "missing_key"
        ? "المفتاح غير مهيأ."
        : "⏳ الخدمة مشغولة أو الطلب طويل. جرّب مرة ثانية.";
    return json({ success: false, error: friendly }, 200);
  }
});
