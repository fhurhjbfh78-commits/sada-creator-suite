import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, history, image, fileContent } = await req.json();

    const groqKey = Deno.env.get("GROQ_API_KEY");
    if (!groqKey) {
      return new Response(JSON.stringify({ error: "GROQ_API_KEY not configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build messages array with conversation history (up to 1000 messages)
    const messages: any[] = [
      {
        role: "system",
        content: `أنت مساعد ذكي اسمه 'صدى'. تتحدث بالعربية بأسلوب ذكي وتفاعلي وودود. ساعد المستخدم بأفضل طريقة ممكنة.
عند الرد، اقتبس جزءاً مختصراً من رسالة المستخدم في بداية ردك كسياق (مثل: "بخصوص سؤالك عن..." أو "ردّاً على...").
إذا أرسل المستخدم صورة، حلّل محتواها ووصفها بالتفصيل.
إذا أرسل المستخدم ملف، حلّل محتواه وأجب عن أسئلته بشأنه.
تذكّر سياق المحادثة كاملاً وأجب بناءً عليه.`
      },
    ];

    // Add conversation history (last 1000 messages)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-1000);
      for (const msg of recentHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // Build current user message with image/file context
    let userContent = message || "";
    if (image) {
      userContent += "\n[المستخدم أرسل صورة - قم بتحليلها ووصفها]";
    }
    if (fileContent) {
      userContent += `\n[المستخدم أرسل ملف - محتواه: ${fileContent}]`;
    }

    messages.push({ role: "user", content: userContent });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", response.status, errText);
      return new Response(JSON.stringify({ error: `Groq API error: ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "لم أتمكن من الحصول على رد.";

    return new Response(JSON.stringify({ success: true, response: aiResponse }), {
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
