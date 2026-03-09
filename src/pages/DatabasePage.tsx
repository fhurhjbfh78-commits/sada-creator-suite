import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { User, MessageCircle, Settings, Image, ChevronDown, Search } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';

const DatabasePage = () => {
  const { profile, chatRooms, drawings, feedPosts } = useAppStore();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggle = (s: string) => setOpenSection(openSection === s ? null : s);

  const totalSize = (JSON.stringify({ chatRooms, drawings, feedPosts }).length / 1024).toFixed(1);

  const sections = [
    { id: 'profiles', icon: User, label: 'الملفات الشخصية', count: 1 },
    { id: 'messages', icon: MessageCircle, label: 'الرسائل والمحادثات', count: chatRooms.reduce((a, c) => a + c.messages.length, 0) },
    { id: 'settings', icon: Settings, label: 'إعدادات التطبيق', count: 0 },
    { id: 'media', icon: Image, label: 'الوسائط المحفوظة', count: drawings.length },
  ];

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title="قاعدة البيانات الدائمة" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Search */}
        <div className="glass-card p-3 flex items-center gap-2">
          <span className="text-sm font-black">صَدي</span>
          <div className="flex-1" />
          <span className="text-sm">Sada</span>
          <Search className="w-4 h-4 text-muted-foreground" />
        </div>

        {sections.map(({ id, icon: Icon, label, count }) => (
          <div key={id}>
            <button
              onClick={() => toggle(id)}
              className="w-full glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
            >
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openSection === id ? 'rotate-180' : ''}`} />
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm">{label}</span>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </button>
            {openSection === id && (
              <div className="mt-1 glass-card p-3 animate-fade-in">
                <p className="text-xs text-muted-foreground text-right">عدد العناصر: {count}</p>
                {id === 'profiles' && (
                  <div className="mt-2 glass-input p-2 text-xs text-right">
                    <p>الاسم: {profile.name}</p>
                    <p>السيرة: {profile.bio || 'لم تحدد'}</p>
                  </div>
                )}
                {id === 'messages' && chatRooms.map((room) => (
                  <div key={room.id} className="mt-1 glass-input p-2 text-xs text-right">
                    {room.title} - {room.messages.length} رسالة
                  </div>
                ))}
                {id === 'media' && drawings.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center mt-2">لا توجد وسائط</p>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="glass-card p-3 text-right text-sm text-muted-foreground">
          تحديث: {profile.name}
        </div>
        <div className="glass-card p-3 text-right text-sm text-muted-foreground">
          الحجم: {totalSize} كيلوبايت
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default DatabasePage;
