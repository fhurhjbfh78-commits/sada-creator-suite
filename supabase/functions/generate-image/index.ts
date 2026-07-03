import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY missing");
      return new Response(JSON.stringify({
        success: true, imageUrl: null,
        description: "خدمة إنشاء الصور غير مُهيَّأة. تواصل مع المطور.",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ===== 1) Dedicated images endpoint: openai/gpt-image-2 (non-streaming) =====
    try {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-image-2",
          prompt,
          size: "1024x1024",
          quality: "low",
          n: 1,
        }),
      });
      if (r.ok) {
        const d = await r.json();
        const b64 = d?.data?.[0]?.b64_json;
        if (b64) {
          return new Response(JSON.stringify({
            success: true,
            imageUrl: `data:image/png;base64,${b64}`,
            description: "تم إنشاء الصورة ✨",
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        console.error("gpt-image-2 empty data:", JSON.stringify(d).slice(0, 400));
      } else {
        const t = await r.text();
        console.error("gpt-image-2 status", r.status, t.slice(0, 400));
        if (r.status === 429) {
          return new Response(JSON.stringify({ success: true, imageUrl: null, description: "⏳ الحد الأقصى للطلبات، جرّب بعد شوي." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (r.status === 402) {
          return new Response(JSON.stringify({ success: true, imageUrl: null, description: "💳 نفذ رصيد إنشاء الصور. تواصل مع المطور." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
    } catch (e) { console.error("gpt-image-2 threw:", e); }

    // ===== 2) Fallback: Gemini 2.5 Flash Image via chat completions =====
    try {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
      });
      if (r.ok) {
        const d = await r.json();
        const images = d?.choices?.[0]?.message?.images;
        const txt = d?.choices?.[0]?.message?.content || "تم إنشاء الصورة ✨";
        const url = images?.[0]?.image_url?.url;
        if (url) {
          return new Response(JSON.stringify({ success: true, imageUrl: url, description: txt }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        console.error("gemini image empty:", JSON.stringify(d).slice(0, 400));
      } else {
        console.error("gemini image status", r.status, (await r.text()).slice(0, 400));
      }
    } catch (e) { console.error("gemini image threw:", e); }

    return new Response(JSON.stringify({
      success: true, imageUrl: null,
      description: "تعذّر إنشاء الصورة. جرّب وصفاً أوضح أو حاول لاحقاً.",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
