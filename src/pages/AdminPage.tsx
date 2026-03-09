import { useAppStore } from '@/store/useAppStore';
import { Cpu, Key, Lock } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';

const AdminPage = () => {
  const {
    openaiKey, setOpenaiKey,
    imageGenKey, setImageGenKey,
    masterCardNumber, setMasterCardNumber,
    profile
  } = useAppStore();
  const [aiPrompt, setAiPrompt] = useState('');

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title="غرفة المدير" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Section 1: OpenAI Key */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold">صَدي</span>
            <h3 className="font-bold">ربط OpenAI</h3>
          </div>
          <div className="glass-input flex items-center gap-2 px-3 py-2.5 mb-3">
            <Cpu className="w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              className="flex-1 bg-transparent text-foreground outline-none text-right text-sm"
              placeholder="API Key"
            />
          </div>
          <div className="flex items-center justify-between">
            <button className="glow-btn px-6 py-2 text-sm active:scale-95 transition-transform">ربط</button>
            <span className="text-xs text-muted-foreground">{profile.name}</span>
          </div>
        </div>

        {/* Section 2: Image Gen Key */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <Key className="w-5 h-5 text-primary" />
            <h3 className="font-bold">مفتاح إنشاء الصور</h3>
          </div>
          <div className="glass-input flex items-center gap-2 px-3 py-2.5">
            <input
              type="password"
              value={imageGenKey}
              onChange={(e) => setImageGenKey(e.target.value)}
              className="flex-1 bg-transparent text-foreground outline-none text-right text-sm"
              placeholder="Image API Key"
            />
          </div>
        </div>

        {/* Section 3: AI Updater */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold">صَدي</span>
            <h3 className="font-bold">تحديثات التطبيق</h3>
          </div>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="w-full glass-input p-3 text-sm text-right resize-none h-28 border-primary/30 text-foreground"
            placeholder="اكتب ميزة جديدة..."
          />
          <div className="flex items-center justify-between mt-3">
            <button className="glow-btn px-6 py-2 text-sm active:scale-95 transition-transform">حفظ</button>
            <span className="text-xs text-muted-foreground">{profile.name}</span>
          </div>
        </div>

        {/* Section 4: MasterCard */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <Lock className="w-5 h-5 text-primary" />
            <div className="text-right">
              <h3 className="font-bold">مفتاح الماستر</h3>
              <p className="text-xs text-muted-foreground">مفتاح الماستر على الاشتراكات</p>
            </div>
          </div>
          <div className="glass-input flex items-center gap-2 px-3 py-2.5">
            <input
              type="password"
              value={masterCardNumber}
              onChange={(e) => setMasterCardNumber(e.target.value)}
              className="flex-1 bg-transparent text-foreground outline-none text-right text-sm"
              placeholder="رقم الماستر كارد"
            />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminPage;
