import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Send, Image, FileText, Bot, User, Trash2, PlusCircle, Menu, ChevronDown, X } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const AI_LIMITS = { fast: 100, thinker: 70, pro: 50 };
const AI_LABELS = { fast: 'سريع', thinker: 'مفكر', pro: 'Pro' };
const CATEGORY_LABELS = { beginner: 'مبتدئ', intermediate: 'متوسط', pro: 'محترف' };

const ChatPage = () => {
  const {
    chatRooms, activeChatId, createChat, deleteChat, addMessage, setActiveChat,
    aiMode, setAiMode, messageCount, incrementMessageCount, isPaid,
    profile, chatCategory, setChatCategory
  } = useAppStore();
  const [input, setInput] = useState('');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showRoomsList, setShowRoomsList] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const activeChat = chatRooms.find((c) => c.id === activeChatId);

  useEffect(() => {
    if (!activeChatId && chatRooms.length === 0) {
      createChat();
    } else if (!activeChatId && chatRooms.length > 0) {
      setActiveChat(chatRooms[0].id);
    }
  }, [activeChatId, chatRooms.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages.length]);

  const isLimitReached = !isPaid && messageCount[aiMode] >= AI_LIMITS[aiMode];

  const handleSend = () => {
    if (!input.trim() || !activeChatId || isLimitReached) return;
    addMessage(activeChatId, { role: 'user', content: input });
    incrementMessageCount();
    const userMsg = input;
    setInput('');
    setIsTyping(false);

    setTimeout(() => {
      const responses = [
        'أهلاً! كيف يمكنني مساعدتك اليوم؟',
        'هذا سؤال رائع، دعني أفكر...',
        'بالتأكيد، يمكنني مساعدتك في ذلك!',
        'شكراً لسؤالك، إليك الإجابة...',
      ];
      addMessage(activeChatId, {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)] + '\n\n' + 'بالنسبة لسؤالك عن "' + userMsg.slice(0, 30) + '..." - قم بربط مفتاح API من غرفة المدير لتفعيل الذكاء الاصطناعي.',
      });
    }, 1000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeChatId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addMessage(activeChatId, { role: 'user', content: '📷 صورة مرفقة', image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
    setShowMediaMenu(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeChatId) {
      addMessage(activeChatId, { role: 'user', content: `📎 ملف: ${file.name}` });
    }
    setShowMediaMenu(false);
  };

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border/30">
        {/* Category dropdown - left */}
        <div className="relative">
          <button onClick={() => setShowCategoryMenu(!showCategoryMenu)} className="flex items-center gap-1 text-xs px-3 py-1.5 glass-card text-primary active:scale-95 transition-transform">
            <ChevronDown className="w-3 h-3" />
            {CATEGORY_LABELS[chatCategory]}
          </button>
          {showCategoryMenu && (
            <div className="absolute left-0 top-10 glass-card p-1 z-20 min-w-[120px] animate-fade-in">
              {(['beginner', 'intermediate', 'pro'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setChatCategory(cat); setShowCategoryMenu(false); }}
                  className={`w-full text-right px-3 py-2 text-xs rounded-lg transition-colors ${chatCategory === cat ? 'bg-primary/20 text-primary' : 'hover:bg-secondary/50'}`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowModeSelector(!showModeSelector)} className="text-[10px] px-2 py-1 glass-card text-muted-foreground">
            {AI_LABELS[aiMode]}
          </button>
          <h1 className="text-lg font-bold">صدى</h1>
        </div>

        {/* Hamburger menu - right */}
        <button onClick={() => setShowRoomsList(!showRoomsList)} className="p-2 active:scale-95 transition-transform">
          {showRoomsList ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Rooms sidebar */}
      {showRoomsList && (
        <div className="flex-shrink-0 px-4 py-2 border-b border-border/20 space-y-1 max-h-48 overflow-y-auto animate-fade-in">
          <button onClick={() => { createChat(); setShowRoomsList(false); }} className="w-full flex items-center justify-center gap-1 py-2 text-primary text-xs">
            <PlusCircle className="w-4 h-4" /> محادثة جديدة
          </button>
          {chatRooms.map((room) => (
            <div key={room.id} className="flex items-center justify-between">
              <button onClick={() => deleteChat(room.id)} className="p-1">
                <Trash2 className="w-3 h-3 text-destructive" />
              </button>
              <button
                onClick={() => { setActiveChat(room.id); setShowRoomsList(false); }}
                className={`flex-1 text-right text-xs py-1.5 px-2 rounded-lg transition-colors ${
                  room.id === activeChatId ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                }`}
              >
                {room.title} ({room.messages.length})
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mode selector */}
      {showModeSelector && (
        <div className="flex-shrink-0 flex gap-2 px-4 py-2 justify-center animate-fade-in">
          {(['fast', 'thinker', 'pro'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => { setAiMode(mode); setShowModeSelector(false); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                aiMode === mode ? 'glow-btn' : 'glass-card text-foreground'
              }`}
            >
              {AI_LABELS[mode]} ({messageCount[mode]}/{AI_LIMITS[mode]})
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {activeChat?.messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              {msg.role === 'user' ? <User className="w-4 h-4 text-muted-foreground" /> : <Bot className="w-4 h-4 text-primary" />}
            </div>
            <div className="flex flex-col gap-0.5 max-w-[78%]">
              <span className="text-[10px] text-muted-foreground">
                {msg.role === 'user' ? (profile.name || 'أنت') : 'صدى'}
              </span>
              {msg.image && (
                <img src={msg.image} alt="مرفق" className="rounded-xl max-w-full max-h-48 object-cover mb-1" />
              )}
              <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-md'
                  : 'glass-card text-foreground rounded-tl-md'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Limit reached */}
      {isLimitReached && (
        <div className="flex-shrink-0 mx-4 mb-2 p-3 glass-card text-center animate-fade-in">
          <p className="text-xs text-destructive font-bold">انتهت الرسائل المجانية لوضع {AI_LABELS[aiMode]}</p>
          <a href="/payment" className="inline-block mt-2 glow-btn px-6 py-2 text-xs active:scale-95 transition-transform">اشترك الآن</a>
        </div>
      )}

      {/* Media menu */}
      {showMediaMenu && (
        <div className="flex-shrink-0 mx-4 mb-2 glass-card p-2 flex flex-col gap-1 animate-fade-in">
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/50 rounded-lg transition-colors justify-end active:scale-95"
          >
            <span className="text-sm">رفع صورة</span>
            <Image className="w-5 h-5 text-primary" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/50 rounded-lg transition-colors justify-end active:scale-95"
          >
            <span className="text-sm">رفع ملف</span>
            <FileText className="w-5 h-5 text-primary" />
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" />

      {/* Input */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-t border-border/30">
        <div className={`flex-1 flex items-center px-3 py-2 rounded-xl border-2 transition-all duration-500 ${
          !isTyping && !input ? 'rainbow-border' : 'border-border/40 bg-secondary/50 backdrop-blur-sm'
        }`}>
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); setIsTyping(e.target.value.length > 0); }}
            onFocus={() => setIsTyping(true)}
            onBlur={() => { if (!input) setIsTyping(false); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent text-foreground outline-none text-right text-sm"
            placeholder="اكتب رسالتك..."
            disabled={isLimitReached}
          />
        </div>
        <button
          onClick={() => setShowMediaMenu(!showMediaMenu)}
          className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center active:scale-90 transition-transform"
        >
          <span className="text-primary-foreground text-lg font-bold">+</span>
        </button>
        {input.trim() && (
          <button onClick={handleSend} className="w-9 h-9 rounded-xl glow-btn flex items-center justify-center active:scale-90 transition-transform">
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ChatPage;
