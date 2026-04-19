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

    // 1) Lovable AI Gateway (الأساسي - يعمل بدون مفاتيح إضافية)
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const images = data.choices?.[0]?.message?.images;
          const textContent = data.choices?.[0]?.message?.content || "";
          if (images && images.length > 0) {
            return new Response(JSON.stringify({
              success: true,
              imageUrl: images[0].image_url.url,
              description: textContent,
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        } else {
          if (response.status === 429) {
            return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
              status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (response.status === 402) {
            return new Response(JSON.stringify({ error: "Credits exhausted" }), {
              status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          const t = await response.text();
          console.error("Lovable gateway error:", response.status, t);
        }
      } catch (e) {
        console.error("Lovable gateway failed:", e);
      }
    }

    // 2) Fallback: Gemini مباشرة
    const geminiKeys = [
      Deno.env.get("GEMINI_API_KEY_1"),
      Deno.env.get("GEMINI_API_KEY_2"),
    ].filter(Boolean) as string[];

    for (const key of geminiKeys) {
      try {
        const gRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
            }),
          }
        );
        if (!gRes.ok) { console.error("Gemini status:", gRes.status); continue; }
        const gData = await gRes.json();
        const parts = gData.candidates?.[0]?.content?.parts || [];
        const imgPart = parts.find((p: any) => p.inlineData?.data);
        const txtPart = parts.find((p: any) => p.text)?.text || "";
        if (imgPart) {
          const mime = imgPart.inlineData.mimeType || "image/png";
          return new Response(JSON.stringify({
            success: true,
            imageUrl: `data:${mime};base64,${imgPart.inlineData.data}`,
            description: txtPart,
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      } catch (e) {
        console.error("Gemini key failed:", e);
      }
    }

    return new Response(JSON.stringify({ error: "No image generated" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
