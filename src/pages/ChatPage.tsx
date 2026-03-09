import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Send, Plus, Camera, Image, FileText, Bot, User } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const AI_LIMITS = { fast: 100, thinker: 70, pro: 50 };
const AI_LABELS = { fast: 'سريع', thinker: 'مفكر', pro: 'Pro' };

const ChatPage = () => {
  const {
    chatRooms, activeChatId, createChat, addMessage, setActiveChat,
    aiMode, setAiMode, messageCount, incrementMessageCount, isPaid,
    profile
  } = useAppStore();
  const [input, setInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'أهلاً! كيف يمكنني مساعدتك اليوم؟',
        'هذا سؤال رائع، دعني أفكر...',
        'بالتأكيد، يمكنني مساعدتك في ذلك!',
        'شكراً لسؤالك، إليك الإجابة...',
      ];
      addMessage(activeChatId, {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)] + '\n\n' + 'بالنسبة لسؤالك عن "' + userMsg.slice(0, 30) + '..." - هذه محادثة تجريبية. قم بربط مفتاح OpenAI من غرفة المدير لتفعيل الذكاء الاصطناعي.',
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen gradient-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <button onClick={() => setShowModeSelector(!showModeSelector)} className="text-xs px-3 py-1 glass-card text-primary">
          {AI_LABELS[aiMode]}
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">دردشة الذكاء الاصطناعي</h1>
          <span className="text-2xl font-black">صَدي</span>
        </div>
      </div>

      {/* Mode selector */}
      {showModeSelector && (
        <div className="flex gap-2 px-4 py-2 justify-center animate-fade-in">
          {(['fast', 'thinker', 'pro'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => { setAiMode(mode); setShowModeSelector(false); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
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
          <div key={msg.id} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              {msg.role === 'user' ? <User className="w-5 h-5 text-muted-foreground" /> : <Bot className="w-5 h-5 text-primary" />}
            </div>
            <div className="flex flex-col gap-1 max-w-[75%]">
              <span className="text-xs text-muted-foreground">
                {msg.role === 'user' ? profile.name : 'Sada'}
              </span>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
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
        <div className="mx-4 mb-2 p-3 glass-card text-center animate-fade-in">
          <p className="text-sm text-destructive font-bold">انتهت الرسائل المجانية لوضع {AI_LABELS[aiMode]}</p>
          <button onClick={() => window.location.href = '/payment'} className="mt-2 glow-btn px-6 py-2 text-sm">
            اشترك الآن
          </button>
        </div>
      )}

      {/* Attachment menu */}
      {showMenu && (
        <div className="mx-4 mb-2 glass-card p-3 flex flex-col gap-2 animate-fade-in">
          {[
            { icon: Image, label: 'صورة' },
            { icon: FileText, label: 'ملف' },
            { icon: Camera, label: 'فيديو' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/50 rounded-lg transition-colors justify-end">
              <span className="text-sm">{label}</span>
              <Icon className="w-5 h-5 text-primary" />
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border/30">
        <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Camera className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1 glass-input flex items-center px-3 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent text-foreground outline-none text-right text-sm"
            placeholder="اكتب رسالتك..."
            disabled={isLimitReached}
          />
        </div>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"
        >
          <Plus className="w-5 h-5 text-primary-foreground" />
        </button>
        {input.trim() && (
          <button onClick={handleSend} className="w-10 h-10 rounded-xl glow-btn flex items-center justify-center">
            <Send className="w-5 h-5" />
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ChatPage;
