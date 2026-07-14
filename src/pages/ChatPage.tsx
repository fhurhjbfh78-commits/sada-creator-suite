import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Send, Image, FileText, User, Trash2, PlusCircle, Menu, ChevronDown, X, Loader2, Copy, Download, Check, Wrench } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';
import MessageContent from '@/components/MessageContent';
import ToolsMenu from '@/components/ToolsMenu';
import { playSendSound, playReceiveSound } from '@/lib/sounds';
import aiAvatar from '@/assets/ai-avatar.jpg';

const AI_LIMITS = { fast: Infinity, thinker: 7, pro: 3 };
const AI_LABELS = { fast: 'سريع', thinker: 'مفكر', pro: 'Pro' };
const CATEGORY_LABELS: Record<string, string> = { beginner: 'مبتدئ', intermediate: 'متوسط', pro: 'محترف' };

const IMAGE_KEYWORDS = [
  'انشئ صور', 'أنشئ صور', 'انشا صور', 'أنشا صور', 'انشأ صور', 'أنشأ صور',
  'انشئ لي', 'أنشئ لي', 'انشا لي', 'أنشا لي', 'انشأ لي',
  'سويلي صور', 'سوي لي صور', 'سوي صور', 'سويلي', 'سوي لي',
  'ارسم', 'ارسملي', 'ارسم لي',
  'صمم صور', 'صمم لي', 'صمملي',
  'اصنع صور', 'اصنع لي', 'اصنعلي',
  'ولد صور', 'ولد لي',
  'اعمل صور', 'اعمل لي', 'اعمللي',
  'صورة عن', 'صورة ل', 'صوره عن', 'صوره ل',
  'generate image', 'create image', 'draw', 'make image',
  'رسم صورة', 'رسم صوره',
  'اي صور', 'اي صوره',
  'خلي صور', 'عطني صور', 'عطيني صور', 'ابي صور', 'ابغى صور',
  'حط صور', 'حطلي صور',
];

const DEV_CODE = 'Abod/0774';

const ChatPage = () => {
  const {
    chatRooms, activeChatId, createChat, deleteChat, addMessage, setActiveChat,
    aiMode, setAiMode, messageCount, incrementMessageCount, isPaid,
    profile, chatCategory, setChatCategory,
  } = useAppStore();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showRoomsList, setShowRoomsList] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{ name: string; url: string; content?: string } | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ name: string; avatar_url: string; user_id_short: string }>({ name: '', avatar_url: '', user_id_short: '' });
  const [devMode, setDevMode] = useState<boolean>(() => sessionStorage.getItem('sada_dev_mode') === '1');
  const DEV_ID_SHORT = '9F11EFD2';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const activeChat = chatRooms.find((c) => c.id === activeChatId);

  useEffect(() => {
    if (!activeChatId && chatRooms.length === 0) createChat();
    else if (!activeChatId && chatRooms.length > 0) setActiveChat(chatRooms[0].id);
  }, [activeChatId, chatRooms.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages.length]);

  // Fetch user profile (name + avatar) and keep it in sync via realtime
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name, avatar_url, user_id_short')
        .eq('id', user.id)
        .single();
      if (data) {
        const p = data as any;
        setUserProfile({ name: p.name || '', avatar_url: p.avatar_url || '', user_id_short: p.user_id_short || '' });
        if ((p.user_id_short || '').toUpperCase() === DEV_ID_SHORT) {
          sessionStorage.setItem('sada_dev_mode', '1');
          setDevMode(true);
        }
      }
    };
    load();
    const channel = supabase
      .channel(`profile-${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          const p = payload.new as any;
          setUserProfile({ name: p.name || '', avatar_url: p.avatar_url || '', user_id_short: p.user_id_short || '' });
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const isLimitReached = !isPaid && !devMode && messageCount[aiMode] >= AI_LIMITS[aiMode];

  const isImageRequest = (text: string) => {
    // Normalize: remove diacritics, normalize ة→ه, strip extra spaces
    const normalize = (s: string) => s
      .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/أ|إ|آ/g, 'ا')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .toLowerCase()
      .trim();
    const normalizedText = normalize(text);
    return IMAGE_KEYWORDS.some(kw => normalizedText.includes(normalize(kw)));
  };

  // Build conversation history for context (up to 1000 messages)
  const getConversationHistory = () => {
    if (!activeChat) return [];
    return activeChat.messages.slice(-1000).map(m => ({
      role: m.role,
      content: m.content,
    }));
  };

  const callAI = async (userMsg: string, image?: string, fileContent?: string, fileName?: string) => {
    setIsAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: userMsg,
          history: getConversationHistory(),
          image: image || undefined,
          fileContent: fileContent || undefined,
          fileName: fileName || undefined,
          mode: aiMode,
          developerMode: devMode,
          userIdShort: userProfile.user_id_short || undefined,
          userName: userProfile.name || undefined,
        },
      });
      if (error) throw error;
      return data?.response || 'لم أتمكن من الحصول على رد.';
    } catch (err: any) {
      console.error('AI error:', err);
      return 'حدث خطأ في الاتصال بالذكاء الاصطناعي.';
    } finally {
      setIsAiLoading(false);
    }
  };

  const generateImage = async (prompt: string) => {
    setIsImageGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt },
      });
      if (error) throw error;
      if (data?.imageUrl) {
        // Stamp "صدى" watermark
        const { addSadaWatermark } = await import('@/lib/watermark');
        const watermarkedDataUrl = await addSadaWatermark(data.imageUrl);

        // Upload to Supabase Storage so the image persists across navigation/refresh
        try {
          const blob = await (await fetch(watermarkedDataUrl)).blob();
          const path = `${user!.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.png`;
          const { error: upErr } = await supabase.storage
            .from('generated-images')
            .upload(path, blob, { contentType: 'image/png', upsert: false });
          if (upErr) throw upErr;
          const { data: pub } = supabase.storage.from('generated-images').getPublicUrl(path);
          return { imageUrl: pub.publicUrl, description: data.description || 'تم إنشاء الصورة بنجاح ✨' };
        } catch (upErr) {
          console.error('Upload failed, falling back to data URL:', upErr);
          return { imageUrl: watermarkedDataUrl, description: data.description || 'تم إنشاء الصورة بنجاح ✨' };
        }
      }
      throw new Error('No image');
    } catch (err) {
      console.error('Image gen error:', err);
      return { imageUrl: null, description: 'فشل في إنشاء الصورة. حاول مرة أخرى.' };
    } finally {
      setIsImageGenerating(false);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !pendingImage && !pendingFile) || !activeChatId || isLimitReached) return;

    // Developer Mode: detect Abod/0774 sent alone
    if (input.trim() === DEV_CODE && !pendingImage && !pendingFile) {
      sessionStorage.setItem('sada_dev_mode', '1');
      setDevMode(true);
      addMessage(activeChatId, { role: 'user', content: '🔒 ••••••••••' });
      addMessage(activeChatId, {
        role: 'assistant',
        content: '✅ تم تفعيل وضع المطور.\n\nأهلاً بك يا عبدالله 🔥\n- بدون اشتراك، بدون قيود، بدون فلاتر.\n- اطلب أي سكربت (حتى 10,000 سطر) وسأرسله كملف قابل للتنزيل.\n- فقط حدد الصيغة: py / js / html / json / txt / sql / sh ...',
      });
      setInput('');
      setIsTyping(false);
      playReceiveSound();
      return;
    }

    playSendSound();

    let content = input.trim();
    if (pendingFile) content = (content ? content + '\n' : '') + `📎 ${pendingFile.name}`;

    addMessage(activeChatId, { role: 'user', content: content || '📷 صورة', image: pendingImage || undefined });
    incrementMessageCount();

    const userMsg = input;
    const sentImage = pendingImage;
    const sentFileContent = pendingFile?.content;
    const sentFileName = pendingFile?.name;
    setInput('');
    setIsTyping(false);
    setPendingImage(null);
    setPendingFile(null);

    // Determine: image generation or chat
    if (userMsg.trim() && isImageRequest(userMsg)) {
      const result = await generateImage(userMsg);
      addMessage(activeChatId, {
        role: 'assistant',
        content: result.description,
        image: result.imageUrl || undefined,
      });
      playReceiveSound();
    } else {
      const aiResponse = await callAI(userMsg || '📷 المستخدم أرسل صورة', sentImage || undefined, sentFileContent || undefined, sentFileName);
      addMessage(activeChatId, { role: 'assistant', content: aiResponse });
      playReceiveSound();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPendingImage(reader.result as string);
      reader.readAsDataURL(file);
    }
    setShowMediaMenu(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX = 50 * 1024 * 1024; // 50 MB
      if (file.size > MAX) {
        toast.error(`الملف كبير جداً (${(file.size / 1024 / 1024).toFixed(1)}MB). الحد الأقصى 50MB.`);
        if (e.target) e.target.value = '';
        setShowMediaMenu(false);
        return;
      }
      const isText = file.type.startsWith('text/') ||
        /\.(txt|md|json|csv|xml|html|htm|css|js|ts|tsx|jsx|py|java|c|cpp|h|hpp|go|rs|rb|php|sql|yaml|yml|log|ini|conf|env|sh|bash|kt|swift|dart|lua|r|scala|pl|vue|svelte)$/i.test(file.name);

      const reader = new FileReader();
      reader.onerror = () => {
        toast.error('فشل قراءة الملف');
        setPendingFile({ name: file.name, url: URL.createObjectURL(file), content: `[تعذّر قراءة ${file.name}]` });
      };
      reader.onloadend = () => {
        const result = reader.result;
        let text = typeof result === 'string' ? result : '';
        // Strip null bytes & control chars (heuristic for non-text)
        if (text && /[\x00\x01\x02\x03]/.test(text.slice(0, 200))) {
          text = `[ملف ثنائي غير قابل للقراءة: ${file.name} - ${(file.size / 1024).toFixed(1)}KB - ${file.type || 'نوع غير معروف'}]\nلتحليل PDF/DOCX/XLSX: حوّله إلى نص أولاً.`;
        }
        if (!text) text = `[ملف فارغ أو غير مدعوم: ${file.name}]`;
        setPendingFile({
          name: file.name,
          url: URL.createObjectURL(file),
          content: text.slice(0, 60000),
        });
        toast.success(`تم رفع: ${file.name}`);
      };
      if (isText) reader.readAsText(file, 'utf-8');
      else reader.readAsText(file, 'utf-8');
    }
    if (e.target) e.target.value = '';
    setShowMediaMenu(false);
  };

  const handleCopy = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMsgId(msgId);
      toast.success('تم النسخ');
      setTimeout(() => setCopiedMsgId(null), 2000);
    });
  };

  const handleDownloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `sada-image-${Date.now()}.png`;
    link.click();
    toast.success('جارٍ التحميل...');
  };

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-2.5 border-b border-border/30">
        <div className="relative flex-shrink-0">
          <button onClick={() => setShowCategoryMenu(!showCategoryMenu)} className="flex items-center gap-1 text-[10px] px-2 py-1 glass-card text-primary active:scale-95 transition-transform whitespace-nowrap">
            <ChevronDown className="w-3 h-3 flex-shrink-0" />
            <span className="text-[9px]">{CATEGORY_LABELS[chatCategory]}</span>
          </button>
          {showCategoryMenu && (
            <div className="absolute right-0 top-9 glass-card p-1 z-20 min-w-[110px] max-w-[calc(100vw-1.5rem)] animate-fade-in">
              {(['beginner', 'intermediate', 'pro'] as const).map((cat) => (
                <button key={cat} onClick={() => { setChatCategory(cat); setShowCategoryMenu(false); }}
                  className={`w-full text-right px-3 py-1.5 text-[11px] rounded-lg transition-colors whitespace-nowrap ${chatCategory === cat ? 'bg-primary/20 text-primary' : 'hover:bg-secondary/50'}`}>
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {devMode && (
            <button
              onClick={() => {
                sessionStorage.removeItem('sada_dev_mode');
                setDevMode(false);
                toast.success('تم إيقاف وضع المطور');
              }}
              className="text-[9px] px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold animate-pulse"
              title="اضغط للإيقاف"
            >
              DEV
            </button>
          )}
          <button onClick={() => setShowModeSelector(!showModeSelector)} className="text-[9px] px-1.5 py-0.5 glass-card text-muted-foreground whitespace-nowrap">
            {AI_LABELS[aiMode]}
          </button>
          <h1 className="text-base font-bold">صدى</h1>
        </div>

        <button onClick={() => setShowRoomsList(!showRoomsList)} className="p-1.5 active:scale-95 transition-transform flex-shrink-0">
          {showRoomsList ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Rooms sidebar */}
      {showRoomsList && (
        <div className="flex-shrink-0 px-3 py-2 border-b border-border/20 space-y-1 max-h-40 overflow-y-auto animate-fade-in">
          <button onClick={() => { createChat(); setShowRoomsList(false); }} className="w-full flex items-center justify-center gap-1 py-1.5 text-primary text-xs">
            <PlusCircle className="w-4 h-4" /> محادثة جديدة
          </button>
          {chatRooms.map((room) => (
            <div key={room.id} className="flex items-center justify-between">
              <button onClick={() => deleteChat(room.id)} className="p-1"><Trash2 className="w-3 h-3 text-destructive" /></button>
              <button onClick={() => { setActiveChat(room.id); setShowRoomsList(false); }}
                className={`flex-1 text-right text-xs py-1 px-2 rounded-lg truncate ${room.id === activeChatId ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}>
                {room.title} ({room.messages.length})
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mode selector */}
      {showModeSelector && (
        <div className="flex-shrink-0 flex gap-1.5 px-3 py-2 justify-center animate-fade-in flex-wrap">
          {(['fast', 'thinker', 'pro'] as const).map((mode) => (
            <button key={mode} onClick={() => { setAiMode(mode); setShowModeSelector(false); }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${aiMode === mode ? 'glow-btn' : 'glass-card text-foreground'}`}>
              {AI_LABELS[mode]} ({messageCount[mode]}/{AI_LIMITS[mode] === Infinity ? '∞' : AI_LIMITS[mode]})
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {activeChat?.messages.map((msg, idx) => {
          // Find the user message this assistant is replying to
          const replyTo = msg.role === 'assistant' && idx > 0 ? activeChat.messages[idx - 1] : null;

          return (
            <div key={msg.id} className={`flex gap-2 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                {msg.role === 'user' ? (
                  userProfile.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="أنت" className="w-full h-full object-cover" width={28} height={28} />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  )
                ) : (
                  <img src={aiAvatar} alt="صدى" className="w-full h-full object-cover" width={28} height={28} />
                )}
              </div>
              <div className="flex flex-col gap-0.5 max-w-[80%]">
                <span className="text-[9px] text-muted-foreground">{msg.role === 'user' ? (userProfile.name?.trim() || 'أنت') : 'صدى'}</span>

                {/* Reply reference for AI messages */}
                {replyTo && msg.role === 'assistant' && (
                  <div className="text-[9px] text-muted-foreground/70 bg-secondary/30 rounded-lg px-2 py-1 border-r-2 border-primary/40 truncate max-w-full">
                    ↩ {replyTo.content.slice(0, 60)}{replyTo.content.length > 60 ? '...' : ''}
                  </div>
                )}

                {msg.image && (
                  <div className="relative group">
                    <img src={msg.image} alt="مرفق" className="rounded-xl w-full max-h-48 object-cover mb-1" loading="lazy" />
                    {/* Download button on image */}
                    <button
                      onClick={() => handleDownloadImage(msg.image!)}
                      className="absolute top-2 left-2 w-7 h-7 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                    >
                      <Download className="w-3.5 h-3.5 text-foreground" />
                    </button>
                  </div>
                )}
                <MessageContent content={msg.content} isMe={msg.role === 'user'} />
              </div>
            </div>
          );
        })}

        {/* AI text loading */}
        {isAiLoading && (
          <div className="flex gap-2 animate-fade-in">
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
              <img src={aiAvatar} alt="صدى" className="w-full h-full object-cover" width={28} height={28} />
            </div>
            <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-md">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}

        {/* Image generation rainbow loader */}
        {isImageGenerating && (
          <div className="flex gap-2 animate-fade-in">
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
              <img src={aiAvatar} alt="صدى" className="w-full h-full object-cover" width={28} height={28} />
            </div>
            <div className="w-48 h-48 rounded-2xl rounded-tl-md rainbow-border border-4 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-[10px] text-muted-foreground">جارٍ إنشاء الصورة...</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Professional Subscription Modal */}
      {isLimitReached && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-fade-in p-4">
          <div className="glass-card rainbow-border border-2 p-6 max-w-sm w-full text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.6)]">
              <span className="text-3xl">✨</span>
            </div>
            <h2 className="text-xl font-bold">انتهت رسائل وضع {AI_LABELS[aiMode]}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {aiMode === 'pro'
                ? 'استخدمت 3 رسائل البرو المجانية. اشترك للاستمرار بردود مفصلة وطويلة.'
                : aiMode === 'thinker'
                ? 'استخدمت 7 رسائل الوضع المتوسط. اشترك للحصول على المزيد بردود متوازنة.'
                : 'انتهت رسائلك المجانية.'}
            </p>
            <div className="space-y-2">
              <a href="/payment" className="block glow-btn py-3 text-sm font-bold active:scale-95 transition-transform">
                🚀 اشترك الآن
              </a>
              <button
                onClick={() => setAiMode('fast')}
                className="block w-full glass-card py-2.5 text-xs text-foreground active:scale-95 transition-transform"
              >
                التحويل للوضع العادي (رسائل دائمية)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending attachment preview */}
      {(pendingImage || pendingFile) && (
        <div className="flex-shrink-0 mx-3 mb-1 glass-card p-2 flex items-center gap-2 animate-fade-in">
          {pendingImage && <img src={pendingImage} alt="preview" className="w-16 h-16 rounded-lg object-cover" />}
          {pendingFile && <div className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /><span className="text-xs truncate max-w-[180px]">{pendingFile.name}</span></div>}
          <button onClick={() => { setPendingImage(null); setPendingFile(null); }} className="ml-auto p-1"><X className="w-4 h-4 text-destructive" /></button>
          <p className="text-[10px] text-muted-foreground">أضف نص وصفي ثم اضغط إرسال</p>
        </div>
      )}

      {/* Media menu */}
      {showMediaMenu && (
        <div className="flex-shrink-0 mx-3 mb-1 glass-card p-2 flex flex-col gap-1 animate-fade-in">
          <button onClick={() => imageInputRef.current?.click()} className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/50 rounded-lg justify-end active:scale-95">
            <span className="text-sm">رفع صورة</span><Image className="w-5 h-5 text-primary" />
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/50 rounded-lg justify-end active:scale-95">
            <span className="text-sm">رفع ملف</span><FileText className="w-5 h-5 text-primary" />
          </button>
        </div>
      )}

      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" />

      {/* Input */}
      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 border-t border-border/30">
        <div className={`flex-1 flex items-center px-3 py-2 rounded-xl border-2 transition-all duration-500 min-w-0 ${!isTyping && !input ? 'rainbow-border' : 'border-border/40 bg-secondary/50 backdrop-blur-sm'}`}>
          <input value={input} onChange={(e) => { setInput(e.target.value); setIsTyping(e.target.value.length > 0); }}
            onFocus={() => setIsTyping(true)} onBlur={() => { if (!input) setIsTyping(false); }}
            onKeyDown={(e) => e.key === 'Enter' && !isAiLoading && !isImageGenerating && handleSend()}
            className="flex-1 bg-transparent text-foreground outline-none text-right text-sm min-w-0" placeholder="اكتب رسالتك..." disabled={isLimitReached || isAiLoading || isImageGenerating} />
        </div>
        <button onClick={() => setShowMediaMenu(!showMediaMenu)} className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center active:scale-90 transition-transform flex-shrink-0">
          <span className="text-primary-foreground text-base font-bold">+</span>
        </button>
        {(input.trim() || pendingImage || pendingFile) && (
          <button onClick={handleSend} disabled={isAiLoading || isImageGenerating} className="w-8 h-8 rounded-xl glow-btn flex items-center justify-center active:scale-90 transition-transform flex-shrink-0">
            {(isAiLoading || isImageGenerating) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ChatPage;
