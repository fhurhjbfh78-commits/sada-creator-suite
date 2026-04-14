import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { featureRequest } = await req.json();
    if (!featureRequest) {
      return new Response(JSON.stringify({ error: "Feature request is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `أنت مطور تطبيقات React/TypeScript محترف. عندما يطلب منك المستخدم ميزة جديدة، قم بـ:
1. تحليل الميزة المطلوبة بالتفصيل
2. كتابة الكود الكامل والجاهز للتطبيق (React + TypeScript + Tailwind CSS)
3. شرح كيفية دمج الكود في التطبيق
4. تقديم أي تعديلات مطلوبة على الملفات الموجودة

اكتب الكود بالكامل وجاهز للنسخ والتطبيق مباشرة. استخدم العربية في الشرح والتعليقات.
التطبيق يستخدم: React 18, TypeScript, Tailwind CSS, Zustand, Supabase, React Router.
الألوان تستخدم CSS variables (--primary, --background, --foreground, etc).`
          },
          {
            role: "user",
            content: `أريد إضافة الميزة التالية للتطبيق:\n\n${featureRequest}`
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Feature AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "لم يتم الحصول على نتيجة";

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("apply-feature error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
