import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Send, Image, FileText, User, Search, ArrowRight, X, Loader2, Mic, MicOff, Play, Pause, Reply, Smile, CornerUpLeft } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';
import { playSendSound, playReceiveSound } from '@/lib/sounds';
import MessageContent from '@/components/MessageContent';
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';
import { markChatRead } from '@/hooks/useUnreadDM';

interface DirectChat {
  id: string;
  user1_id: string;
  user2_id: string;
  other_name?: string;
  other_avatar?: string;
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
  reply_to_id?: string | null;
}

interface MReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
}

// Waveform voice message component (Instagram-style)
const VoiceMessage = ({ src, isMe }: { src: string; isMe: boolean }) => {
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Generate random waveform bars
  const bars = useRef(Array.from({ length: 28 }, () => Math.random() * 0.7 + 0.3)).current;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onLoaded = () => setDuration(audio.duration || 0);
    const onTime = () => setCurrentTime(audio.currentTime);
    const onEnd = () => { setPlaying(false); setCurrentTime(0); };
    const onPlay = () => {
      // Notify all other voice players to stop
      window.dispatchEvent(new CustomEvent('voice-play', { detail: audio }));
    };
    const onOtherPlay = (e: Event) => {
      const otherAudio = (e as CustomEvent).detail as HTMLAudioElement;
      if (otherAudio !== audio && !audio.paused) {
        audio.pause();
        setPlaying(false);
      }
    };
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('play', onPlay);
    window.addEventListener('voice-play', onOtherPlay);
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('play', onPlay);
      window.removeEventListener('voice-play', onOtherPlay);
    };
  }, []);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); }
    else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  const progress = duration > 0 ? currentTime / duration : 0;
  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 min-w-[200px] max-w-[260px] ${isMe ? 'bg-primary rounded-tr-md' : 'bg-[hsl(var(--primary)/0.8)] rounded-tl-md'}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <span className="text-[10px] text-white/80 min-w-[28px]">
        {formatTime(playing ? currentTime : duration)}
      </span>
      <div className="flex-1 flex items-end gap-[2px] h-7">
        {bars.map((h, i) => {
          const active = i / bars.length <= progress;
          return (
            <div
              key={i}
              className="flex-1 rounded-full transition-all duration-100"
              style={{
                height: `${h * 100}%`,
                backgroundColor: active ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.4)',
                minWidth: '2px',
              }}
            />
          );
        })}
      </div>
      <button onClick={toggle} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        {playing ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white ml-0.5" />}
      </button>
    </div>
  );
};

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
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null);
  const [showMicDialog, setShowMicDialog] = useState(false);
  const [replyTo, setReplyTo] = useState<DMessage | null>(null);
  const [reactions, setReactions] = useState<MReaction[]>([]);
  const [emojiFor, setEmojiFor] = useState<string | null>(null);
  const [actionMsgId, setActionMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLongPress = (msgId: string) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setActionMsgId(msgId);
      if (navigator.vibrate) navigator.vibrate(20);
    }, 450);
  };
  const cancelLongPress = () => {
    if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }
  };

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
        (payload) => {
          const newMsg = payload.new as DMessage;
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (newMsg.sender_id !== user?.id) {
            playReceiveSound();
            if (user) markChatRead(user.id, activeChat.id);
          }
        })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message_reactions' },
        (payload) => {
          const r = payload.new as MReaction;
          setReactions(prev => prev.some(x => x.id === r.id) ? prev : [...prev, r]);
        })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'message_reactions' },
        (payload) => {
          const r = payload.old as MReaction;
          setReactions(prev => prev.filter(x => x.id !== r.id));
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeChat?.id, user?.id]);

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then(result => {
        setMicPermission(result.state as any);
        result.onchange = () => setMicPermission(result.state as any);
      }).catch(() => {});
    }
  }, []);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => { if (recordingTimerRef.current) clearInterval(recordingTimerRef.current); };
  }, [isRecording]);

  const fetchChats = async () => {
    if (!user) return;
    const { data } = await supabase.from('direct_chats').select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
    if (!data) return;

    const enriched: DirectChat[] = [];
    for (const chat of data) {
      const otherId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;
      const { data: p } = await supabase.from('profiles').select('name, avatar_url').eq('id', otherId).single();
      enriched.push({ ...chat, other_name: (p as any)?.name || 'مستخدم', other_avatar: (p as any)?.avatar_url || '' });
    }
    setChats(enriched);
  };

  const openChat = async (chat: DirectChat) => {
    setActiveChat(chat);
    const { data } = await supabase.from('direct_messages').select('*').eq('chat_id', chat.id).order('created_at', { ascending: true });
    const msgs = (data || []) as DMessage[];
    setMessages(msgs);
    if (msgs.length > 0) {
      const ids = msgs.map(m => m.id);
      const { data: rx } = await supabase.from('message_reactions').select('*').in('message_id', ids);
      setReactions((rx || []) as MReaction[]);
    } else {
      setReactions([]);
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    const existing = reactions.find(r => r.message_id === messageId && r.user_id === user.id && r.emoji === emoji);
    if (existing) {
      await supabase.from('message_reactions').delete().eq('id', existing.id);
      setReactions(prev => prev.filter(r => r.id !== existing.id));
    } else {
      const { data } = await supabase.from('message_reactions').insert({ message_id: messageId, user_id: user.id, emoji }).select().single();
      if (data) setReactions(prev => [...prev, data as MReaction]);
    }
    setEmojiFor(null);
    setActionMsgId(null);
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
    const { data: existing } = await supabase.from('direct_chats').select('*')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${searchResult.id}),and(user1_id.eq.${searchResult.id},user2_id.eq.${user.id})`);
    if (existing && existing.length > 0) {
      openChat({ ...existing[0], other_name: searchResult.name });
    } else {
      const { data: newChat, error } = await supabase.from('direct_chats').insert({ user1_id: user.id, user2_id: searchResult.id }).select().single();
      if (error) { toast.error('فشل إنشاء المحادثة'); return; }
      openChat({ ...(newChat as any), other_name: searchResult.name });
    }
    setShowSearch(false);
    setSearchId('');
    setSearchResult(null);
    fetchChats();
  };

  const uploadFile = async (file: File, folder: string) => {
    if (!user) return null;
    const ext = file.name.split('.').pop() || 'bin';
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('chat-files').upload(path, file);
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage.from('chat-files').getPublicUrl(path);
    return publicUrl;
  };

  const sendMessage = async () => {
    if ((!input.trim() && !pendingImage && !pendingFile && !audioBlob) || !activeChat || !user) return;
    playSendSound();

    let imageUrl: string | null = null;
    let fileUrl: string | null = null;
    let fileName: string | null = null;

    if (pendingImage) imageUrl = await uploadFile(pendingImage, 'images');
    if (pendingFile) { fileUrl = await uploadFile(pendingFile, 'files'); fileName = pendingFile.name; }
    if (audioBlob) {
      const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
      fileUrl = await uploadFile(audioFile, 'voice');
      fileName = '🎤 رسالة صوتية';
    }

    let content = input || '';
    if (!content && imageUrl) content = '📷 صورة';
    if (!content && fileName) content = fileName;

    await supabase.from('direct_messages').insert({ chat_id: activeChat.id, sender_id: user.id, content, image_url: imageUrl, file_url: fileUrl, file_name: fileName, reply_to_id: replyTo?.id ?? null });
    setInput(''); setPendingImage(null); setPendingImagePreview(null); setPendingFile(null); setAudioBlob(null); setReplyTo(null);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
  };

  const requestMicPermission = async () => {
    setShowMicDialog(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMicPermission('granted');
      toast.success('تم السماح بالوصول للميكروفون');
      startRecording();
    } catch {
      setMicPermission('denied');
      toast.error('تم رفض الوصول للميكروفون');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      toast.error('لا يمكن الوصول إلى الميكروفون');
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      if (micPermission !== 'granted') setShowMicDialog(true);
      else startRecording();
    }
  };

  const formatRecTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

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
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {chat.other_avatar ? <img src={chat.other_avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
                </div>
              </div>
            </button>
          ))}
          {chats.length === 0 && !showSearch && (
            <div className="text-center py-8"><p className="text-muted-foreground text-sm">لا توجد محادثات بعد</p></div>
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
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold">{activeChat.other_name}</h1>
          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            {activeChat.other_avatar ? <img src={activeChat.other_avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-3.5 h-3.5" />}
          </div>
        </div>
        <button onClick={() => { setActiveChat(null); setMessages([]); }}><ArrowRight className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          const isVoice = msg.file_url && msg.file_name?.includes('صوتية');
          const repliedTo = msg.reply_to_id ? messages.find(m => m.id === msg.reply_to_id) : null;
          const msgReactions = reactions.filter(r => r.message_id === msg.id);
          const grouped = msgReactions.reduce<Record<string, MReaction[]>>((acc, r) => {
            (acc[r.emoji] ||= []).push(r); return acc;
          }, {});
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className="flex flex-col max-w-[80%]">
                {repliedTo && (
                  <div className="mb-1 px-2 py-1 rounded-lg border-r-2 border-primary bg-primary/10 text-[10px] text-right">
                    <div className="text-primary font-bold">↩ رد على</div>
                    <div className="text-muted-foreground truncate">
                      {repliedTo.content?.slice(0, 60) || (repliedTo.image_url ? '📷 صورة' : repliedTo.file_name || '...')}
                    </div>
                  </div>
                )}
                <div onDoubleClick={() => setActionMsgId(actionMsgId === msg.id ? null : msg.id)}>
                  {msg.image_url && <img src={msg.image_url} alt="" className="rounded-xl w-full max-h-48 object-cover mb-1" loading="lazy" />}
                  {isVoice && msg.file_url && (
                    <VoiceMessage src={msg.file_url} isMe={isMe} />
                  )}
                  {msg.file_url && msg.file_name && !isVoice && (
                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 glass-card px-3 py-2 rounded-xl mb-1">
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-xs truncate">{msg.file_name}</span>
                    </a>
                  )}
                  {msg.content && !isVoice && (
                    <MessageContent content={msg.content} isMe={isMe} />
                  )}
                </div>
                {Object.keys(grouped).length > 0 && (
                  <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {Object.entries(grouped).map(([emoji, list]) => {
                      const mine = list.some(r => r.user_id === user?.id);
                      return (
                        <button
                          key={emoji}
                          onClick={() => toggleReaction(msg.id, emoji)}
                          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] border ${mine ? 'bg-primary/20 border-primary' : 'bg-background/60 border-border/40'} active:scale-95`}
                        >
                          <span>{emoji}</span>
                          {list.length > 1 && <span className="text-[9px] text-muted-foreground">{list.length}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
                {actionMsgId === msg.id && (
                  <div className={`flex gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <button
                      onClick={() => { setReplyTo(msg); setActionMsgId(null); }}
                      className="flex items-center gap-1 px-2 py-1 rounded-full glass-card text-[10px] active:scale-95"
                    >
                      <Reply className="w-3 h-3" /> رد
                    </button>
                    <button
                      onClick={() => { setEmojiFor(msg.id); setActionMsgId(null); }}
                      className="flex items-center gap-1 px-2 py-1 rounded-full glass-card text-[10px] active:scale-95"
                    >
                      <Smile className="w-3 h-3" /> تفاعل
                    </button>
                  </div>
                )}
                <span className="text-[8px] text-muted-foreground mt-0.5">
                  {new Date(msg.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                  {actionMsgId !== msg.id && <button onClick={() => setActionMsgId(msg.id)} className="ml-2 text-primary">⋯</button>}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji picker modal */}
      {emojiFor && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={() => setEmojiFor(null)}>
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <EmojiPicker
              onEmojiClick={(e) => toggleReaction(emojiFor, e.emoji)}
              theme={Theme.DARK}
              emojiStyle={EmojiStyle.NATIVE}
              width="100%"
              height={380}
              searchPlaceholder="بحث..."
              previewConfig={{ showPreview: false }}
            />
          </div>
        </div>
      )}

      {/* Mic permission dialog */}
      {showMicDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="glass-card p-6 w-full max-w-sm animate-fade-in text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">السماح بالوصول للميكروفون</h3>
            <p className="text-sm text-muted-foreground mb-4">يحتاج التطبيق للوصول إلى الميكروفون لتسجيل الرسائل الصوتية</p>
            <div className="flex gap-2">
              <button onClick={() => setShowMicDialog(false)} className="flex-1 glass-card py-2.5 text-sm active:scale-95 transition-transform">رفض</button>
              <button onClick={requestMicPermission} className="flex-1 glow-btn py-2.5 text-sm active:scale-95 transition-transform">السماح</button>
            </div>
          </div>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex-shrink-0 mx-3 mb-1 glass-card p-3 flex items-center justify-between animate-fade-in">
          <button onClick={toggleRecording} className="px-3 py-1 bg-destructive text-destructive-foreground rounded-lg text-xs active:scale-95">إيقاف</button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono">{formatRecTime(recordingTime)}</span>
            <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
            <span className="text-xs text-muted-foreground">جاري التسجيل...</span>
          </div>
        </div>
      )}

      {/* Reply preview */}
      {replyTo && (
        <div className="flex-shrink-0 mx-3 mb-1 glass-card p-2 flex items-center gap-2 animate-fade-in border-r-2 border-primary">
          <CornerUpLeft className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-primary font-bold">رد على</div>
            <div className="text-[11px] text-muted-foreground truncate">
              {replyTo.content?.slice(0, 80) || (replyTo.image_url ? '📷 صورة' : replyTo.file_name || '...')}
            </div>
          </div>
          <button onClick={() => setReplyTo(null)} className="flex-shrink-0"><X className="w-4 h-4 text-destructive" /></button>
        </div>
      )}

      {/* Pending attachments */}
      {(pendingImagePreview || pendingFile || audioBlob) && !isRecording && (
        <div className="flex-shrink-0 mx-3 mb-1 glass-card p-2 flex items-center gap-2 animate-fade-in">
          {pendingImagePreview && <img src={pendingImagePreview} alt="" className="w-14 h-14 rounded-lg object-cover" />}
          {pendingFile && <div className="flex items-center gap-1"><FileText className="w-4 h-4 text-primary" /><span className="text-[10px] truncate max-w-[120px]">{pendingFile.name}</span></div>}
          {audioBlob && <div className="flex items-center gap-1"><Mic className="w-4 h-4 text-primary" /><span className="text-[10px]">🎤 رسالة صوتية جاهزة</span></div>}
          <button onClick={() => { setPendingImage(null); setPendingImagePreview(null); setPendingFile(null); setAudioBlob(null); }} className="ml-auto"><X className="w-4 h-4 text-destructive" /></button>
          <p className="text-[9px] text-muted-foreground">أضف وصف ثم أرسل</p>
        </div>
      )}

      <div className="flex-shrink-0 flex items-center gap-1 px-2 py-2 border-t border-border/30">
        <div className="flex-1 flex items-center glass-input px-3 py-2 rounded-xl min-w-0">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 bg-transparent text-foreground outline-none text-right text-sm min-w-0" placeholder="اكتب رسالة..." />
        </div>
        <button onClick={toggleRecording} className={`w-8 h-8 rounded-xl flex items-center justify-center active:scale-90 flex-shrink-0 ${isRecording ? 'bg-destructive animate-pulse' : 'glass-card'}`}>
          {isRecording ? <MicOff className="w-4 h-4 text-destructive-foreground" /> : <Mic className="w-4 h-4 text-primary" />}
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="w-8 h-8 rounded-xl glass-card flex items-center justify-center active:scale-90 flex-shrink-0">
          <FileText className="w-4 h-4 text-primary" />
        </button>
        <button onClick={() => imageInputRef.current?.click()} className="w-8 h-8 rounded-xl glass-card flex items-center justify-center active:scale-90 flex-shrink-0">
          <Image className="w-4 h-4 text-primary" />
        </button>
        <button onClick={sendMessage} className="w-8 h-8 rounded-xl glow-btn flex items-center justify-center active:scale-90 flex-shrink-0">
          <Send className="w-4 h-4" />
        </button>
        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
      </div>
      <BottomNav />
    </div>
  );
};

export default DirectChatPage;
