import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { ChevronRight, Menu, Key, Lock, Cpu, CreditCard } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const AdminPage = () => {
  const {
    openaiKey, setOpenaiKey,
    imageGenKey, setImageGenKey,
    masterCardNumber, setMasterCardNumber,
    profile
  } = useAppStore();
  const [aiPrompt, setAiPrompt] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const tabs = [
    { icon: Cpu, label: 'ربط OpenAI' },
    { icon: Key, label: 'مفتاح الصور' },
    { icon: Cpu, label: 'تحديثات' },
    { icon: Lock, label: 'الماستر' },
  ];

  return (
    <div className="flex flex-col min-h-screen gradient-bg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <button><Menu className="w-5 h-5 text-foreground" /></button>
        <h1 className="text-xl font-bold">غرفة المدير</h1>
        <button onClick={() => navigate(-1)}><ChevronRight className="w-5 h-5 text-foreground" /></button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {/* Section 1: OpenAI Key */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-foreground">صَدي</span>
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
            <button className="glow-btn px-6 py-2 text-sm">ربط</button>
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
            <span className="text-sm font-bold text-foreground">صَدي</span>
            <h3 className="font-bold">تحديثات التطبيق</h3>
          </div>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="w-full glass-input p-3 text-sm text-right resize-none h-28 border-primary/30"
            placeholder="اكتب ميزة جديدة..."
          />
          <div className="flex items-center justify-between mt-3">
            <button className="glow-btn px-6 py-2 text-sm">حفظ</button>
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
