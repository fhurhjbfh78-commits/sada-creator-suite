import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function estimateTokens(text: string): number { return Math.ceil(text.length / 3); }

function trimHistory(history: { role: string; content: string }[], maxTokens: number) {
  const trimmed: { role: string; content: string }[] = [];
  let total = 0;
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
    const { message, history, image, fileContent, fileName, mode } = await req.json();

    // Mode-specific length instruction
    let lengthRule = "";
    if (mode === "pro") {
      lengthRule = "أعطِ رداً طويلاً ومفصلاً جداً (إجباري لا يقل عن 25 سطر) مع شرح كامل وأمثلة وتفصيل عميق.";
    } else if (mode === "thinker") {
      lengthRule = "أعطِ رداً متوسط الطول (إجباري بين 10 و 18 سطر) متوازن وواضح.";
    } else {
      lengthRule = "أعطِ رداً قصيراً ومباشراً (6 أسطر أو أقل، إجباري).";
    }

    const systemPrompt = `أنت مساعد ذكي اسمه 'صدى'. تتحدث بالعربية بأسلوب ذكي وتفاعلي وودود.
مطورك ومن صنعك ويملكك هو: عبدالله لازم. إذا سُئلت عن صانعك أجب دائماً "عبدالله لازم".
${lengthRule}
عند الرد، اقتبس جزءاً مختصراً من رسالة المستخدم في البداية كسياق.
إذا أرسل المستخدم صورة، حلّل محتواها بدقة (الأشخاص، النص، الألوان، السياق).
إذا أرسل ملفاً، حلّل محتواه وأجب عن أسئلته بشأنه.
تذكّر سياق المحادثة كاملاً.`;

    // ===== IMAGE PRESENT → Use Groq Vision =====
    if (image) {
      const visionKey = Deno.env.get("GROQ_VISION_KEY") || Deno.env.get("GROQ_API_KEY_PRO") || Deno.env.get("GROQ_API_KEY");
      if (!visionKey) {
        return new Response(JSON.stringify({ error: "No vision key" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const visionResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${visionKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.2-90b-vision-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: message || "حلل هذه الصورة بالتفصيل" },
                { type: "image_url", image_url: { url: image } },
              ],
            },
          ],
          temperature: 0.7,
          max_tokens: mode === "pro" ? 2048 : mode === "thinker" ? 1024 : 400,
        }),
      });
      if (!visionResp.ok) {
        const errText = await visionResp.text();
        console.error("Vision error:", errText);
        // Fallback to text
      } else {
        const vd = await visionResp.json();
        const vAns = vd.choices?.[0]?.message?.content || "لم أتمكن من تحليل الصورة.";
        return new Response(JSON.stringify({ success: true, response: vAns }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ===== FILE PRESENT → use file analysis key if available =====
    const fileKey = fileContent ? (Deno.env.get("FILE_ANALYSIS_KEY") || Deno.env.get("GROQ_API_KEY")) : null;

    const groqKeys = [
      fileKey,
      Deno.env.get("GROQ_API_KEY_PRO"),
      Deno.env.get("GROQ_API_KEY"),
      Deno.env.get("AI_KEY_BACKUP_1"),
      Deno.env.get("AI_KEY_BACKUP_2"),
      Deno.env.get("AI_KEY_BACKUP_3"),
      Deno.env.get("AI_KEY_BACKUP_4"),
    ].filter(Boolean) as string[];

    if (groqKeys.length === 0) {
      return new Response(JSON.stringify({ error: "No AI keys configured" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const messages: { role: string; content: string }[] = [{ role: "system", content: systemPrompt }];

    if (history && Array.isArray(history)) {
      const cleanHistory = history.filter((m: { content: string }) =>
        m.content && m.content.length < 3000 &&
        !m.content.startsWith('<!DOCTYPE') &&
        !m.content.startsWith('bad_key') &&
        !m.content.includes('هذه محادثة تجريبية')
      );
      messages.push(...trimHistory(cleanHistory, 6000));
    }

    let userContent = message || "";
    if (fileContent) {
      userContent += `\n\n[الملف المرفق: ${fileName || 'ملف'}]\n[محتوى الملف]:\n${String(fileContent).slice(0, 6000)}\n[نهاية الملف]\nقم بتحليل هذا الملف والإجابة على سؤال المستخدم بدقة.`;
    }
    messages.push({ role: "user", content: userContent });

    const maxTokens = mode === "pro" ? 2048 : mode === "thinker" ? 1024 : 400;

    let response: Response | null = null;
    let lastError = "";
    for (const key of groqKeys) {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages, temperature: 0.7, max_tokens: maxTokens }),
      });
      if (response.ok) break;
      lastError = `${response.status}`;
      if (response.status !== 429 && response.status !== 401 && response.status !== 403) break;
    }

    if (!response || !response.ok) {
      const errText = response ? await response.text() : "no response";
      console.error("All Groq keys failed:", lastError, errText);
      if (response?.status === 429) {
        return new Response(JSON.stringify({ success: true, response: "⏳ جميع المفاتيح مشغولة حالياً. حاول بعد لحظات." }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `AI error: ${lastError}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "لم أتمكن من الحصول على رد.";

    return new Response(JSON.stringify({ success: true, response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
