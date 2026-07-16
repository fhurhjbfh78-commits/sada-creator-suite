import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `أنت مطور تطبيقات محترف ومتخصص في بناء التطبيقات الكاملة. عندما يطلب منك المستخدم بناء تطبيق:

1. **حلل الطلب** بدقة وافهم كل التفاصيل
2. **اكتب الكود الكامل** للتطبيق جاهز للتشغيل مباشرة
3. **قدم الكود بصيغة** HTML + CSS + JavaScript في ملف واحد يعمل مباشرة
4. **أضف تعليقات** توضيحية بالعربية
5. **صمم واجهة جميلة** متجاوبة مع الموبايل
6. **تذكر المحادثة السابقة** وابني على ما طلبه المستخدم سابقاً

عند طلب تعديل أو تحسين، عدّل على الكود السابق وقدم النسخة المحدثة الكاملة.

القواعد:
- الكود يجب أن يكون كاملاً وجاهزاً للنسخ والتشغيل
- استخدم تصميم عصري وألوان جذابة
- اجعل التطبيق متجاوب مع جميع الشاشات
- أضف تأثيرات حركية لتجربة مستخدم ممتازة
- استخدم العربية في واجهة المستخدم
- كل كود يكون داخل بلوك كود واحد قابل للنسخ`;

    const callModel = async (model: string, timeoutMs: number) => {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        return await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            max_tokens: 6000,
          }),
          signal: ctrl.signal,
        });
      } finally { clearTimeout(tid); }
    };

    const models = ["google/gemini-3.1-flash-lite", "google/gemini-3.5-flash"];
    let lastStatus = 0;
    let lastText = "";
    for (const model of models) {
      try {
        const response = await callModel(model, 40000);
        if (response.ok) {
          const data = await response.json();
          const result = data.choices?.[0]?.message?.content || "لم يتم الحصول على نتيجة";
          return new Response(JSON.stringify({ success: true, result }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        lastStatus = response.status;
        lastText = await response.text();
        console.error(`build-app ${model}:`, response.status, lastText.slice(0, 300));
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "نفدت الأرصدة" }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات، حاول لاحقاً" }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (e) {
        console.error(`build-app ${model} threw:`, e);
      }
    }

    return new Response(JSON.stringify({ error: "الخدمة مشغولة حالياً، جرّب بعد لحظات." }), {
      status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("build-app error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
