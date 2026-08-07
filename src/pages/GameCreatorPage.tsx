import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Copy, Trash2, Send, Bot, Code, Smartphone, Loader2, Users } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import MessageContent from '@/components/MessageContent';
import CodeEditor, { LANG_OPTIONS, detectLang } from '@/components/CodeEditor';
import type { LangId } from '@/components/CodeEditor';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';


type Tab = 'code' | 'builder';

interface BuilderMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const PLACEHOLDER = `<!-- يمكنك كتابة أي لغة هنا: HTML, CSS, JS, Python, C++ أو حتى لعبة كاملة! -->
<!DOCTYPE html>
<html>
<head>
<style>
  body { margin:0; background:#0f172a; color:white; font-family:sans-serif;
    display:flex; justify-content:center; align-items:center; height:100vh; }
  .box { text-align:center; }
  button { padding:12px 24px; background:#00bfff; border:none; color:#0f172a;
    border-radius:12px; font-size:16px; font-weight:bold; cursor:pointer; }
</style>
</head>
<body>
  <div class="box">
    <h1>مرحباً بالعالم 🌍</h1>
    <button onclick="alert('يعمل!')">اضغط هنا</button>
  </div>
  <script>
    console.log("مرحباً!");
  </script>
</body>
</html>`;

const STORAGE_KEY = 'sada_builder_history';

// Auto-detect language and wrap non-HTML code for preview
const buildPreviewHtml = (code: string): string => {
  const trimmed = code.trim();

  // Already full HTML
  if (/<html[\s>]/i.test(trimmed) || /<!DOCTYPE/i.test(trimmed)) {
    return trimmed;
  }

  // Pure CSS (has selectors with braces)
  if (/^[a-zA-Z.*#@:[\]()>,\s\-]+\s*\{/m.test(trimmed) && !/</.test(trimmed) && !/function|const |let |var |=>/.test(trimmed)) {
    return `<html><head><style>${trimmed}</style></head><body style="padding:20px;font-family:sans-serif"><div class="demo"><h1>معاينة CSS</h1><p>نص تجريبي للتصميم</p><button>زر</button><div class="box" style="width:100px;height:100px;margin:10px auto"></div></div></body></html>`;
  }

  // Python detection
  if (/^(import |from |def |class |print\(|if __name__)/m.test(trimmed) && !/[{}<>]/.test(trimmed.replace(/\{.*?\}/gs, ''))) {
    const escaped = trimmed.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return `<html><body style="background:#1e1e2e;color:#cdd6f4;font-family:'Courier New',monospace;padding:20px;direction:ltr">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
        <span style="background:#3776AB;color:white;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:bold">Python</span>
        <span style="color:#a6adc8;font-size:12px">معاينة الكود</span>
      </div>
      <pre style="background:#313244;padding:16px;border-radius:12px;overflow:auto;line-height:1.6">${escaped}</pre>
      <p style="color:#a6adc8;font-size:11px;margin-top:12px">⚠️ Python لا يعمل في المتصفح - هذه معاينة فقط</p>
    </body></html>`;
  }

  // C++ detection
  if (/^#include|^using namespace|int main\s*\(|cout\s*<<|std::/m.test(trimmed)) {
    const escaped = trimmed.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return `<html><body style="background:#1e1e2e;color:#cdd6f4;font-family:'Courier New',monospace;padding:20px;direction:ltr">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
        <span style="background:#00599C;color:white;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:bold">C++</span>
        <span style="color:#a6adc8;font-size:12px">معاينة الكود</span>
      </div>
      <pre style="background:#313244;padding:16px;border-radius:12px;overflow:auto;line-height:1.6">${escaped}</pre>
      <p style="color:#a6adc8;font-size:11px;margin-top:12px">⚠️ C++ لا يعمل في المتصفح - هذه معاينة فقط</p>
    </body></html>`;
  }

  // Pure JS / mixed JS
  if (/function |const |let |var |=>|document\.|console\.|addEventListener|class\s+\w/.test(trimmed)) {
    return `<html><body style="background:#1e1e2e;color:#cdd6f4;font-family:monospace;padding:20px">
      <pre id="out" style="background:#313244;padding:16px;border-radius:12px;white-space:pre-wrap;line-height:1.6"></pre>
      <script>
        const _log=console.log;
        console.log=(...a)=>{document.getElementById('out').textContent+=a.join(' ')+'\\n';};
        try{${trimmed}}catch(e){document.getElementById('out').textContent='Error: '+e.message;}
      </script>
    </body></html>`;
  }

  // HTML fragment (has tags but no full doc)
  if (/<[a-zA-Z]/.test(trimmed)) {
    return `<html><head><style>body{margin:0;font-family:sans-serif}</style></head><body>${trimmed}</body></html>`;
  }

  // Fallback: treat as JS
  return `<html><body style="background:#1e1e2e;color:#cdd6f4;font-family:monospace;padding:20px">
    <pre id="out" style="background:#313244;padding:16px;border-radius:12px;white-space:pre-wrap"></pre>
    <script>
      const _log=console.log;
      console.log=(...a)=>{document.getElementById('out').textContent+=a.join(' ')+'\\n';};
      try{${trimmed}}catch(e){document.getElementById('out').textContent='Error: '+e.message;}
    </script>
  </body></html>`;
};

const GameCreatorPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('code');
  const [codeInput, setCodeInput] = useState('');
  const [editorLang, setEditorLang] = useState<LangId>('auto');
  const [showPreview, setShowPreview] = useState(false);


  // Pick up prefilled code from chat's "Open in IDE" button
  useEffect(() => {
    try {
      const pre = sessionStorage.getItem('sada_ide_prefill');
      if (pre) {
        setCodeInput(pre);
        setActiveTab('code');
        setShowPreview(true);
        sessionStorage.removeItem('sada_ide_prefill');
      }
    } catch {}
  }, []);

  // Builder state
  const [builderMessages, setBuilderMessages] = useState<BuilderMsg[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [builderInput, setBuilderInput] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(builderMessages));
  }, [builderMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [builderMessages]);

  const handlePreview = () => {
    if (!codeInput.trim()) {
      toast.error('أدخل الكود أولاً');
      return;
    }
    setShowPreview(true);
  };

  const handleCopyCode = () => {
    if (!codeInput.trim()) return;
    navigator.clipboard.writeText(codeInput);
    toast.success('تم نسخ الكود');
  };

  const sendBuilderMessage = useCallback(async () => {
    const text = builderInput.trim();
    if (!text || isBuilding) return;

    const userMsg: BuilderMsg = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setBuilderMessages(prev => [...prev, userMsg]);
    setBuilderInput('');
    setIsBuilding(true);

    try {
      const history = [...builderMessages, userMsg].slice(-20).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke('build-app', {
        body: { messages: history },
      });

      if (error) throw error;

      const assistantMsg: BuilderMsg = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data?.result || 'حدث خطأ، حاول مرة أخرى',
        timestamp: Date.now(),
      };

      setBuilderMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Builder error:', err);
      const errorMsg: BuilderMsg = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '❌ حدث خطأ في الاتصال. حاول مرة أخرى.',
        timestamp: Date.now(),
      };
      setBuilderMessages(prev => [...prev, errorMsg]);
      toast.error('فشل الاتصال بالذكاء');
    } finally {
      setIsBuilding(false);
    }
  }, [builderInput, isBuilding, builderMessages]);

  const clearBuilderHistory = () => {
    setBuilderMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('تم مسح المحادثة');
  };

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title="استوديو المطور" showBack={false} />

      {/* Tab switcher */}
      <div className="flex-shrink-0 flex gap-2 px-3 py-2">
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${activeTab === 'builder' ? 'glow-btn' : 'glass-card text-muted-foreground'}`}
        >
          <Smartphone className="w-4 h-4" />
          <span>بناء تطبيقات</span>
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${activeTab === 'code' ? 'glow-btn' : 'glass-card text-muted-foreground'}`}
        >
          <Code className="w-4 h-4" />
          <span>محرر الكود</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {/* CODE EDITOR TAB - unified, auto-detects language */}
        {activeTab === 'code' && (
          <div className="space-y-3 animate-fade-in">
            <div className="glass-card p-3">
              <div className="flex items-center justify-between mb-2 gap-2">
                <select
                  value={editorLang}
                  onChange={(e) => setEditorLang(e.target.value as LangId)}
                  aria-label="لغة البرمجة"
                  className="glass-input text-[11px] px-2 py-1 rounded-lg text-foreground bg-card/60 max-w-[110px]"
                  dir="ltr"
                >
                  {LANG_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <span className="text-xs font-bold text-muted-foreground truncate">
                  {editorLang === 'auto' ? `تلقائي • ${detectLang(codeInput).toUpperCase()}` : 'محرر احترافي'}
                </span>
              </div>
              <CodeEditor
                value={codeInput}
                onChange={setCodeInput}
                lang={editorLang}
                height="300px"
                placeholder={PLACEHOLDER}
              />

              <div className="flex gap-2 mt-3">
                <button onClick={handlePreview} className="flex-1 glow-btn py-2.5 text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                  <Play className="w-4 h-4" /> تشغيل / معاينة
                </button>
                <button onClick={() => navigate('/collab')} className="glass-card px-3 py-2.5 text-sm flex items-center justify-center gap-1 active:scale-95 transition-transform text-primary" title="غرفة تعاون real-time">
                  <Users className="w-4 h-4" />
                </button>
                <button onClick={handleCopyCode} className="glass-card px-4 py-2.5 text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform text-muted-foreground">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="glass-card p-2 animate-fade-in">
                <div className="flex items-center justify-between mb-2 px-2">
                  <button onClick={() => setShowPreview(false)} className="text-xs text-destructive font-bold">إغلاق</button>
                  <span className="text-xs font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    المعاينة
                  </span>
                </div>
                <iframe
                  srcDoc={buildPreviewHtml(codeInput)}
                  className="w-full rounded-xl border border-border/30"
                  style={{ height: '400px' }}
                  sandbox="allow-scripts"
                  title="Code Preview"
                />
              </div>
            )}
          </div>
        )}

        {/* APP BUILDER TAB */}
        {activeTab === 'builder' && (
          <div className="flex flex-col h-full animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <button onClick={clearBuilderHistory} className="text-xs text-destructive flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> مسح
              </button>
              <div className="flex items-center gap-2 text-sm font-bold">
                <span>بناء التطبيقات بالذكاء</span>
                <Bot className="w-5 h-5 text-primary" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 min-h-0 mb-3" style={{ maxHeight: 'calc(100dvh - 300px)' }}>
              {builderMessages.length === 0 && (
                <div className="text-center py-8 space-y-3">
                  <Bot className="w-12 h-12 mx-auto text-primary/50" />
                  <p className="text-muted-foreground text-sm">أخبرني بالتطبيق الذي تريد بناءه</p>
                  <p className="text-muted-foreground text-xs">سأبني لك التطبيق كاملاً مع الكود الجاهز</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {['تطبيق آلة حاسبة', 'تطبيق ملاحظات', 'لعبة 2D بسيطة', 'لعبة 3D'].map(s => (
                      <button key={s} onClick={() => setBuilderInput(s)}
                        className="glass-card px-3 py-1.5 text-xs text-muted-foreground active:scale-95 transition-transform"
                      >{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {builderMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'glass-card rounded-bl-md'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <MessageContent content={msg.content} isMe={false} />
                    ) : (
                      <p className="whitespace-pre-wrap text-right">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {isBuilding && (
                <div className="flex justify-start">
                  <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex-shrink-0 glass-card p-2 flex gap-2 items-end">
              <button
                onClick={sendBuilderMessage}
                disabled={isBuilding || !builderInput.trim()}
                className="glow-btn p-2.5 rounded-xl active:scale-90 transition-transform disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
              <textarea
                value={builderInput}
                onChange={(e) => setBuilderInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendBuilderMessage(); } }}
                placeholder="اكتب وصف التطبيق المطلوب..."
                className="flex-1 glass-input px-3 py-2 text-sm text-right resize-none text-foreground rounded-xl"
                rows={1}
                dir="rtl"
              />
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default GameCreatorPage;
