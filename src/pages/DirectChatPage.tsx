import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Send, Image, FileText, User, Search, ArrowRight, X, Loader2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';

interface DirectChat {
  id: string;
  user1_id: string;
  user2_id: string;
  other_name?: string;
}

interface DMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
}

const DirectChatPage = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<DirectChat[]>([]);
  const [activeChat, setActiveChat] = useState<DirectChat | null>(null);
  const [messages, setMessages] = useState<DMessage[]>([]);
  const [input, setInput] = useState('');
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<{ id: string; name: string } | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) fetchChats();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (!activeChat) return;
    const channel = supabase.channel(`dm-${activeChat.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `chat_id=eq.${activeChat.id}` },
        (payload) => { setMessages(prev => [...prev, payload.new as DMessage]); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeChat?.id]);

  const fetchChats = async () => {
    if (!user) return;
    const { data } = await supabase.from('direct_chats').select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
    if (!data) return;

    const enriched: DirectChat[] = [];
    for (const chat of data) {
      const otherId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;
      const { data: p } = await supabase.from('profiles').select('name').eq('id', otherId).single();
      enriched.push({ ...chat, other_name: (p as any)?.name || 'مستخدم' });
    }
    setChats(enriched);
  };

  const openChat = async (chat: DirectChat) => {
    setActiveChat(chat);
    const { data } = await supabase.from('direct_messages').select('*').eq('chat_id', chat.id).order('created_at', { ascending: true });
    setMessages((data || []) as DMessage[]);
  };

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setLoading(true);
    const { data } = await supabase.from('profiles').select('id, name, user_id_short').eq('user_id_short', searchId.trim().toUpperCase()).single();
    if (data) setSearchResult({ id: (data as any).id, name: (data as any).name || 'مستخدم' });
    else { toast.error('لم يتم العثور على المستخدم'); setSearchResult(null); }
    setLoading(false);
  };

  const startChat = async () => {
    if (!searchResult || !user) return;
    if (searchResult.id === user.id) { toast.error('لا يمكنك محادثة نفسك'); return; }

    // Check existing chat
    const { data: existing } = await supabase.from('direct_chats').select('*')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${searchResult.id}),and(user1_id.eq.${searchResult.id},user2_id.eq.${user.id})`);

    if (existing && existing.length > 0) {
      const chat = { ...existing[0], other_name: searchResult.name };
      openChat(chat);
    } else {
      const { data: newChat, error } = await supabase.from('direct_chats').insert({
        user1_id: user.id,
        user2_id: searchResult.id,
      }).select().single();
      if (error) { toast.error('فشل إنشاء المحادثة'); return; }
      const chat = { ...(newChat as any), other_name: searchResult.name };
      openChat(chat);
    }
    setShowSearch(false);
    setSearchId('');
    setSearchResult(null);
    fetchChats();
  };

  const sendMessage = async () => {
    if ((!input.trim() && !pendingImage) || !activeChat || !user) return;

    let imageUrl: string | null = null;
    if (pendingImage) {
      const ext = pendingImage.name.split('.').pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('chat-files').upload(path, pendingImage);
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('chat-files').getPublicUrl(path);
        imageUrl = publicUrl;
      }
    }

    await supabase.from('direct_messages').insert({
      chat_id: activeChat.id,
      sender_id: user.id,
      content: input || (imageUrl ? '📷 صورة' : ''),
      image_url: imageUrl,
    });

    setInput('');
    setPendingImage(null);
    setPendingImagePreview(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPendingImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Chat list view
  if (!activeChat) {
    return (
      <div className="flex flex-col h-[100dvh] gradient-bg">
        <PageHeader title="الرسائل الخاصة" showBack={true} />
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          <button onClick={() => setShowSearch(!showSearch)} className="w-full glow-btn py-2.5 flex items-center justify-center gap-2 active:scale-95 text-sm">
            <Search className="w-4 h-4" /><span>بحث بمعرف المستخدم</span>
          </button>

          {showSearch && (
            <div className="glass-card p-3 space-y-2 animate-fade-in">
              <input value={searchId} onChange={(e) => setSearchId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full glass-input px-3 py-2 text-sm text-right text-foreground" placeholder="أدخل معرف المستخدم (ID)..." autoFocus dir="ltr" />
              <button onClick={handleSearch} disabled={loading} className="w-full glow-btn py-2 text-xs active:scale-95">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'بحث'}
              </button>
              {searchResult && (
                <div className="flex items-center justify-between p-2 glass-card animate-fade-in">
                  <button onClick={startChat} className="glow-btn px-3 py-1.5 text-xs">بدء محادثة</button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{searchResult.name}</span>
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><User className="w-4 h-4" /></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {chats.map((chat) => (
            <button key={chat.id} onClick={() => openChat(chat)}
              className="w-full glass-card p-3 flex items-center justify-between active:scale-[0.98] transition-transform">
              <ArrowRight className="w-4 h-4 text-muted-foreground -rotate-180" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{chat.other_name}</span>
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"><User className="w-4 h-4" /></div>
              </div>
            </button>
          ))}

          {chats.length === 0 && !showSearch && (
            <div className="text-center py-8"><p className="text-muted-foreground text-sm">لا توجد محادثات بعد</p><p className="text-muted-foreground text-xs mt-1">ابحث عن مستخدم بالمعرف لبدء محادثة</p></div>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  // Chat messages view
  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-2.5 border-b border-border/30">
        <div className="w-5" />
        <h1 className="text-sm font-bold">{activeChat.other_name}</h1>
        <button onClick={() => { setActiveChat(null); setMessages([]); }}><ArrowRight className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className="flex flex-col max-w-[80%]">
                {msg.image_url && <img src={msg.image_url} alt="" className="rounded-xl w-full max-h-48 object-cover mb-1" />}
                {msg.content && (
                  <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-md' : 'glass-card text-foreground rounded-tl-md'}`}>
                    {msg.content}
                  </div>
                )}
                <span className="text-[8px] text-muted-foreground mt-0.5">{new Date(msg.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Pending image */}
      {pendingImagePreview && (
        <div className="flex-shrink-0 mx-3 mb-1 glass-card p-2 flex items-center gap-2">
          <img src={pendingImagePreview} alt="" className="w-14 h-14 rounded-lg object-cover" />
          <button onClick={() => { setPendingImage(null); setPendingImagePreview(null); }}><X className="w-4 h-4 text-destructive" /></button>
          <p className="text-[10px] text-muted-foreground">أضف وصف ثم أرسل</p>
        </div>
      )}

      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 border-t border-border/30">
        <div className="flex-1 flex items-center glass-input px-3 py-2 rounded-xl">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 bg-transparent text-foreground outline-none text-right text-sm" placeholder="اكتب رسالة..." />
        </div>
        <button onClick={() => imageInputRef.current?.click()} className="w-8 h-8 rounded-xl glass-card flex items-center justify-center active:scale-90 flex-shrink-0">
          <Image className="w-4 h-4 text-primary" />
        </button>
        <button onClick={sendMessage} className="w-8 h-8 rounded-xl glow-btn flex items-center justify-center active:scale-90 flex-shrink-0">
          <Send className="w-4 h-4" />
        </button>
        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
      </div>
      <BottomNav />
    </div>
  );
};

export default DirectChatPage;
