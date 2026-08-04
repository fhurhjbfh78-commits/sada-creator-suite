import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Play, Copy, LogOut, Loader2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const genRoomCode = () =>
  Math.random().toString(36).toUpperCase().slice(2, 8);

const CollabPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [joined, setJoined] = useState(false);
  const [code, setCode] = useState('// اكتب الكود هنا... التعديلات تتزامن فوراً مع كل المشاركين\n');
  const [peers, setPeers] = useState<{ id: string; name: string }[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const channelRef = useRef<any>(null);
  const applyingRemote = useRef(false);
  const myId = useRef<string>(crypto.randomUUID());

  const joinRoom = (rc: string) => {
    if (!rc.trim()) return;
    if (!user) { toast.error('سجّل الدخول للانضمام لغرفة تعاون'); navigate('/login'); return; }
    const room = rc.trim().toUpperCase();
    setRoomCode(room);
    setJoined(true);

    const ch = supabase.channel(`collab:${room}`, {
      config: { presence: { key: myId.current } },
    });

    ch.on('broadcast', { event: 'code' }, ({ payload }: any) => {
      if (payload?.from === myId.current) return;
      applyingRemote.current = true;
      setCode(payload.code || '');
      setTimeout(() => { applyingRemote.current = false; }, 50);
    });

    ch.on('broadcast', { event: 'sync-request' }, () => {
      ch.send({ type: 'broadcast', event: 'code', payload: { code, from: myId.current } });
    });

    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState();
      const list: { id: string; name: string }[] = [];
      Object.entries(state).forEach(([key, arr]: any) => {
        const first = Array.isArray(arr) ? arr[0] : arr;
        list.push({ id: key, name: first?.name || 'مستخدم' });
      });
      setPeers(list);
    });

    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await ch.track({ name: user?.email?.split('@')[0] || 'مستخدم', joined_at: Date.now() });
        // Ask peers for current state
        ch.send({ type: 'broadcast', event: 'sync-request', payload: { from: myId.current } });
        toast.success(`دخلت الغرفة ${room}`);
      }
    });

    channelRef.current = ch;
  };

  const leaveRoom = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setJoined(false);
    setPeers([]);
    setRoomCode('');
  };

  useEffect(() => {
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, []);

  // Broadcast on local edits (debounced)
  useEffect(() => {
    if (!joined || applyingRemote.current || !channelRef.current) return;
    const t = setTimeout(() => {
      channelRef.current.send({
        type: 'broadcast',
        event: 'code',
        payload: { code, from: myId.current },
      });
    }, 200);
    return () => clearTimeout(t);
  }, [code, joined]);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success('نسخ رمز الغرفة');
  };

  if (!joined) {
    return (
      <div className="flex flex-col h-[100dvh] gradient-bg">
        <PageHeader title="غرفة تعاون" showBack />
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div className="glass-card p-4 text-center space-y-2">
            <Users className="w-10 h-10 mx-auto text-primary" />
            <h2 className="font-bold">اشتغل على كود واحد مع فريقك — لحظياً</h2>
            <p className="text-xs text-muted-foreground">أنشئ غرفة أو ادخل برمز موجود، وأي تعديل يظهر عند الكل فوراً.</p>
          </div>

          <button
            onClick={() => joinRoom(genRoomCode())}
            className="w-full glow-btn py-3 rounded-xl active:scale-95"
          >
            إنشاء غرفة جديدة
          </button>

          <div className="glass-card p-3 space-y-2">
            <p className="text-xs text-muted-foreground text-right">أدخل رمز غرفة موجودة</p>
            <div className="flex gap-2">
              <input
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="flex-1 glass-input px-3 py-2 rounded-xl text-center font-mono tracking-widest"
                dir="ltr"
              />
              <button
                onClick={() => joinRoom(joinInput)}
                disabled={joinInput.length < 4}
                className="glow-btn px-4 py-2 rounded-xl active:scale-95 disabled:opacity-50"
              >
                دخول
              </button>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title={`غرفة ${roomCode}`} showBack />

      <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-border/30 text-xs">
        <button onClick={leaveRoom} className="flex items-center gap-1 text-destructive active:scale-95">
          <LogOut className="w-3.5 h-3.5" /> خروج
        </button>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{peers.length} مشارك</span>
          <div className="flex -space-x-1">
            {peers.slice(0, 4).map((p, i) => (
              <div key={p.id} className="w-5 h-5 rounded-full bg-primary/70 border border-background flex items-center justify-center text-[9px] text-primary-foreground font-bold">
                {p.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
        <button onClick={copyCode} className="flex items-center gap-1 text-primary active:scale-95">
          <Copy className="w-3.5 h-3.5" /> {roomCode}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full glass-input p-3 text-xs text-left font-mono resize-none rounded-xl"
          style={{ minHeight: showPreview ? '30vh' : '55vh' }}
          dir="ltr"
          spellCheck={false}
        />

        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex-1 glow-btn py-2 rounded-xl active:scale-95 flex items-center justify-center gap-2 text-sm"
          >
            <Play className="w-4 h-4" /> {showPreview ? 'إخفاء' : 'تشغيل'} المعاينة
          </button>
        </div>

        {showPreview && (
          <iframe
            srcDoc={code}
            className="w-full rounded-xl border border-border/30 bg-white"
            style={{ height: '30vh' }}
            sandbox="allow-scripts"
            title="Collab Preview"
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default CollabPage;
