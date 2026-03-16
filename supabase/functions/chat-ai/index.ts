import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, apiKey, apiUrl } = await req.json();

    // Use provided API key or fallback to stored secret
    const key = apiKey || Deno.env.get("DARKAI_API_KEY");
    const url = apiUrl || "https://sii3.top/api/deepseek/api.php";

    if (!key) {
      return new Response(JSON.stringify({ error: "No API key configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call DarkAI/DeepSeek API
    const formData = new URLSearchParams();
    formData.append("key", key);
    formData.append("v3", message);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const responseText = await response.text();

    // Try to parse as JSON, otherwise return raw text
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { response: responseText };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      response: result.response || result.result || result.message || result.text || responseText 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
