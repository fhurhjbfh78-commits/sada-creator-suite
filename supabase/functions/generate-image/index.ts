import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, baseImage } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({
        success: true, imageUrl: null,
        description: "خدمة إنشاء الصور غير مُهيَّأة.",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ===== IMAGE EDITING (when baseImage supplied) → Gemini image model =====
    if (baseImage) {
      try {
        const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: baseImage } },
              ],
            }],
            modalities: ["image", "text"],
          }),
        });
        if (r.ok) {
          const d = await r.json();
          const images = d?.choices?.[0]?.message?.images;
          const txt = d?.choices?.[0]?.message?.content || "تم تعديل الصورة ✨";
          const url = images?.[0]?.image_url?.url;
          if (url) return new Response(JSON.stringify({ success: true, imageUrl: url, description: txt }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else {
          console.error("gemini edit:", r.status, (await r.text()).slice(0, 300));
        }
      } catch (e) { console.error("gemini edit threw:", e); }
    }

    // ===== 1) NEW GENERATION: openai/gpt-image-2 =====
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
        if (b64) return new Response(JSON.stringify({
          success: true,
          imageUrl: `data:image/png;base64,${b64}`,
          description: "تم إنشاء الصورة ✨",
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } else {
        const t = await r.text();
        console.error("gpt-image-2:", r.status, t.slice(0, 300));
        if (r.status === 429) return new Response(JSON.stringify({ success: true, imageUrl: null, description: "⏳ الحد الأقصى، جرّب بعد شوي." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (r.status === 402) return new Response(JSON.stringify({ success: true, imageUrl: null, description: "💳 نفذ رصيد إنشاء الصور." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    } catch (e) { console.error("gpt-image-2 threw:", e); }

    // ===== 2) Fallback: Gemini image =====
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
        const url = images?.[0]?.image_url?.url;
        if (url) return new Response(JSON.stringify({ success: true, imageUrl: url, description: d?.choices?.[0]?.message?.content || "تم إنشاء الصورة ✨" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch (e) { console.error("gemini gen threw:", e); }

    return new Response(JSON.stringify({
      success: true, imageUrl: null,
      description: "تعذّر إنشاء الصورة. جرّب وصفاً أوضح.",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(JSON.stringify({ success: true, imageUrl: null, description: "خطأ داخلي." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
