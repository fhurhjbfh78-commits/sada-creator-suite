import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rough token estimate: 1 token ≈ 4 chars for Arabic
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3);
}

function trimHistory(history: { role: string; content: string }[], maxTokens: number) {
  const trimmed: { role: string; content: string }[] = [];
  let total = 0;
  // Walk backwards to keep recent messages
  for (let i = history.length - 1; i >= 0; i--) {
    const tokens = estimateTokens(history[i].content);
    if (total + tokens > maxTokens) break;
    total += tokens;
    trimmed.unshift(history[i]);
  }
  return trimmed;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, history, image, fileContent } = await req.json();

    // ترتيب المفاتيح: المحترف أولاً ثم البدائل
    const groqKeys = [
      Deno.env.get("GROQ_API_KEY_PRO"), // المفتاح السابع - المحترف
      Deno.env.get("GROQ_API_KEY"),
      Deno.env.get("AI_KEY_BACKUP_1"),
      Deno.env.get("AI_KEY_BACKUP_2"),
      Deno.env.get("AI_KEY_BACKUP_3"),
      Deno.env.get("AI_KEY_BACKUP_4"),
    ].filter(Boolean) as string[];

    if (groqKeys.length === 0) {
      return new Response(JSON.stringify({ error: "No AI keys configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `أنت مساعد ذكي اسمه 'صدى'. تتحدث بالعربية بأسلوب ذكي وتفاعلي وودود. ساعد المستخدم بأفضل طريقة ممكنة.
عند الرد، اقتبس جزءاً مختصراً من رسالة المستخدم في بداية ردك كسياق.
إذا أرسل المستخدم صورة، حلّل محتواها ووصفها بالتفصيل.
إذا أرسل المستخدم ملف، حلّل محتواه وأجب عن أسئلته بشأنه.
تذكّر سياق المحادثة كاملاً وأجب بناءً عليه.`;

    const messages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    // Trim history to fit within ~8000 tokens (leaving room for system + new message)
    if (history && Array.isArray(history)) {
      // Filter out garbage responses (HTML pages, error messages, etc.)
      const cleanHistory = history.filter((m: { content: string }) => 
        m.content && 
        m.content.length < 3000 && 
        !m.content.startsWith('<!DOCTYPE') && 
        !m.content.startsWith('bad_key') &&
        !m.content.includes('هذه محادثة تجريبية')
      );
      const trimmed = trimHistory(cleanHistory, 6000);
      messages.push(...trimmed);
    }

    // Build current user message
    let userContent = message || "";
    if (image) userContent += "\n[المستخدم أرسل صورة - قم بتحليلها ووصفها]";
    if (fileContent) userContent += `\n[محتوى الملف: ${fileContent.slice(0, 2000)}]`;
    messages.push({ role: "user", content: userContent });

    // محاولة كل مفتاح بالترتيب (المحترف أولاً)
    let response: Response | null = null;
    let lastError = "";
    for (const key of groqKeys) {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });
      if (response.ok) break;
      lastError = `${response.status}`;
      // إذا 429 أو 401 جرّب التالي
      if (response.status !== 429 && response.status !== 401 && response.status !== 403) break;
    }

    if (!response || !response.ok) {
      const errText = response ? await response.text() : "no response";
      console.error("All Groq keys failed:", lastError, errText);

      if (response?.status === 429) {
        return new Response(JSON.stringify({ 
          success: true, 
          response: "⏳ جميع المفاتيح مشغولة حالياً. حاول بعد لحظات." 
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: `AI error: ${lastError}` }), {
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
