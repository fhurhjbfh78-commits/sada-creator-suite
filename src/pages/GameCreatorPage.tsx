import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Copy, Trash2, Send, Bot, Code, Smartphone, Loader2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import MessageContent from '@/components/MessageContent';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type Lang = 'html' | 'css' | 'js' | 'python' | 'cpp';
type Tab = 'code' | 'builder';

interface BuilderMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const LANG_CONFIG: Record<Lang, { label: string; placeholder: string; color: string }> = {
  html: { label: 'HTML', placeholder: '<!DOCTYPE html>\n<html>\n<head>\n  <title>مرحباً</title>\n</head>\n<body>\n  <h1>مرحباً بالعالم</h1>\n</body>\n</html>', color: '#E34F26' },
  css: { label: 'CSS', placeholder: 'body {\n  background: #0f172a;\n  color: white;\n  font-family: sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n}', color: '#1572B6' },
  js: { label: 'JavaScript', placeholder: 'function greet(name) {\n  console.log(`مرحباً ${name}!`);\n  return `أهلاً ${name}`;\n}\n\ngreet("عالم");', color: '#F7DF1E' },
  python: { label: 'Python', placeholder: 'def greet(name):\n    print(f"مرحباً {name}!")\n    return f"أهلاً {name}"\n\ngreet("عالم")', color: '#3776AB' },
  cpp: { label: 'C++', placeholder: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "مرحباً بالعالم!" << endl;\n    return 0;\n}', color: '#00599C' },
};

const STORAGE_KEY = 'sada_builder_history';

const GameCreatorPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('code');
  const [activeLang, setActiveLang] = useState<Lang>('html');
  const [codeInputs, setCodeInputs] = useState<Record<Lang, string>>({
    html: '', css: '', js: '', python: '', cpp: '',
  });
  const [showPreview, setShowPreview] = useState(false);

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

  const handleCodeChange = (lang: Lang, value: string) => {
    setCodeInputs(prev => ({ ...prev, [lang]: value }));
  };

  const getPreviewHtml = () => {
    const lang = activeLang;
    const code = codeInputs[lang] || LANG_CONFIG[lang].placeholder;
    
    if (lang === 'html') return code;
    if (lang === 'css') return `<html><head><style>${code}</style></head><body><div class="demo"><h1>معاينة CSS</h1><p>نص تجريبي</p><button>زر</button></div></body></html>`;
    if (lang === 'js') return `<html><body><pre id="out"></pre><script>const _log=console.log;console.log=(...a)=>{document.getElementById('out').textContent+=a.join(' ')+'\\n';};try{${code}}catch(e){document.getElementById('out').textContent='Error: '+e.message;}</script></body></html>`;
    if (lang === 'python') return `<html><body style="background:#1e1e2e;color:#cdd6f4;font-family:monospace;padding:20px;direction:ltr"><h3 style="color:#89b4fa">Python - معاينة الكود فقط</h3><pre style="background:#313244;padding:16px;border-radius:8px;overflow:auto">${code.replace(/</g,'&lt;')}</pre><p style="color:#a6adc8;font-size:12px">⚠️ لا يمكن تشغيل Python في المتصفح - هذه معاينة للكود فقط</p></body></html>`;
    if (lang === 'cpp') return `<html><body style="background:#1e1e2e;color:#cdd6f4;font-family:monospace;padding:20px;direction:ltr"><h3 style="color:#89b4fa">C++ - معاينة الكود فقط</h3><pre style="background:#313244;padding:16px;border-radius:8px;overflow:auto">${code.replace(/</g,'&lt;')}</pre><p style="color:#a6adc8;font-size:12px">⚠️ لا يمكن تشغيل C++ في المتصفح - هذه معاينة للكود فقط</p></body></html>`;
    return '';
  };

  const handlePreview = () => {
    const code = codeInputs[activeLang];
    if (!code.trim()) {
      toast.error('أدخل الكود أولاً');
      return;
    }
    setShowPreview(true);
  };

  const handleCopyCode = () => {
    const code = codeInputs[activeLang];
    if (!code.trim()) return;
    navigator.clipboard.writeText(code);
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
      // Build conversation history for context/memory
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
        {/* CODE EDITOR TAB */}
        {activeTab === 'code' && (
          <div className="space-y-3 animate-fade-in">
            {/* Language selector */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {(Object.keys(LANG_CONFIG) as Lang[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => { setActiveLang(lang); setShowPreview(false); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${activeLang === lang ? 'text-white' : 'glass-card text-muted-foreground'}`}
                  style={activeLang === lang ? { backgroundColor: LANG_CONFIG[lang].color } : {}}
                >
                  {LANG_CONFIG[lang].label}
                </button>
              ))}
            </div>

            {/* Code input */}
            <div className="glass-card p-3">
              <textarea
                value={codeInputs[activeLang]}
                onChange={(e) => handleCodeChange(activeLang, e.target.value)}
                className="w-full glass-input p-3 text-xs text-left resize-none h-44 text-foreground font-mono rounded-xl"
                placeholder={LANG_CONFIG[activeLang].placeholder}
                dir="ltr"
                spellCheck={false}
              />
              <div className="flex gap-2 mt-3">
                <button onClick={handlePreview} className="flex-1 glow-btn py-2 text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                  <Play className="w-4 h-4" /> معاينة
                </button>
                <button onClick={handleCopyCode} className="glass-card px-4 py-2 text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform text-muted-foreground">
                  <Copy className="w-4 h-4" /> نسخ
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
                    معاينة {LANG_CONFIG[activeLang].label}
                  </span>
                </div>
                <iframe
                  srcDoc={getPreviewHtml()}
                  className="w-full rounded-xl border border-border/30"
                  style={{ height: '350px' }}
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
            {/* Header with clear */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={clearBuilderHistory} className="text-xs text-destructive flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> مسح
              </button>
              <div className="flex items-center gap-2 text-sm font-bold">
                <span>بناء التطبيقات بالذكاء</span>
                <Bot className="w-5 h-5 text-primary" />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 min-h-0 mb-3" style={{ maxHeight: 'calc(100dvh - 300px)' }}>
              {builderMessages.length === 0 && (
                <div className="text-center py-8 space-y-3">
                  <Bot className="w-12 h-12 mx-auto text-primary/50" />
                  <p className="text-muted-foreground text-sm">أخبرني بالتطبيق الذي تريد بناءه</p>
                  <p className="text-muted-foreground text-xs">سأبني لك التطبيق كاملاً مع الكود الجاهز</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {['تطبيق آلة حاسبة', 'تطبيق ملاحظات', 'لعبة بسيطة', 'تطبيق طقس'].map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => { setBuilderInput(suggestion); }}
                        className="glass-card px-3 py-1.5 text-xs text-muted-foreground active:scale-95 transition-transform"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {builderMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'glass-card rounded-bl-md'
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

            {/* Input */}
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
