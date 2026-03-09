import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { User, Lock, Bell, MessageCircle, Key, Shield, CloudUpload, ChevronDown, Globe } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';

const SettingsPage = () => {
  const { profile, logout } = useAppStore();
  const navigate = useNavigate();
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');

  const handleAdminAccess = () => {
    if (adminCode === 'Abod/0774') {
      navigate('/admin');
      setShowAdmin(false);
      setAdminCode('');
    }
  };

  const sections = [
    { icon: User, label: 'اعدادات الحساب', color: 'text-primary' },
    { icon: Lock, label: 'الخصوصية والأمان', color: 'text-primary' },
    { icon: Bell, label: 'الاشعارات', action: () => navigate('/notifications') },
    { icon: MessageCircle, label: 'اعدادات المحادثة', color: 'text-primary' },
  ];

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title="الاعدادات المتقدمة" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* User card */}
        <div className="glass-card p-4 flex items-center justify-between">
          <span className="text-sm font-bold">صَدي</span>
          <div className="text-right">
            <p className="font-bold">{profile.name}</p>
            <p className="text-xs text-muted-foreground">{profile.name}</p>
          </div>
        </div>

        {sections.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="w-full glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm">{label}</span>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </button>
        ))}

        {/* Change password */}
        <button className="w-full glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
          <span className="text-sm font-bold">صَدي</span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">تغيير كلمة المرور</span>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </button>

        {/* Admin room */}
        <button
          onClick={() => setShowAdmin(true)}
          className="w-full glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
        >
          <span className="text-sm font-bold">صَدي</span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">غرفة المدير</span>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
          </div>
        </button>

        {/* Backup */}
        <button className="w-full glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
          <span className="text-sm font-bold">صَدي</span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">نسخ احتياطي</span>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <CloudUpload className="w-5 h-5 text-primary" />
            </div>
          </div>
        </button>

        {/* Language */}
        <button
          onClick={() => navigate('/language')}
          className="w-full glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
        >
          <span className="text-sm font-bold">صَدي</span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">اللغة</span>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
          </div>
        </button>

        {/* Analytics */}
        <button
          onClick={() => navigate('/analytics')}
          className="w-full glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
        >
          <span className="text-sm font-bold">صَدي</span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">تحليل البيانات</span>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-primary" />
            </div>
          </div>
        </button>

        {/* Database */}
        <button
          onClick={() => navigate('/database')}
          className="w-full glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
        >
          <span className="text-sm font-bold">صَدي</span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">قاعدة البيانات</span>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <CloudUpload className="w-5 h-5 text-primary" />
            </div>
          </div>
        </button>

        <button onClick={() => { logout(); navigate('/login'); }} className="w-full py-3 text-destructive text-sm font-bold">
          تسجيل الخروج
        </button>
      </div>

      {/* Admin modal */}
      {showAdmin && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="glass-card p-6 w-full max-w-sm animate-fade-in">
            <h3 className="text-lg font-bold text-center mb-4">أدخل رمز المدير</h3>
            <input
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminAccess()}
              className="w-full glass-input px-4 py-3 text-center mb-4 text-foreground"
              placeholder="الرمز السري"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={() => { setShowAdmin(false); setAdminCode(''); }} className="flex-1 glass-card py-2.5 text-sm active:scale-95 transition-transform">إلغاء</button>
              <button onClick={handleAdminAccess} className="flex-1 glow-btn py-2.5 text-sm active:scale-95 transition-transform">دخول</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default SettingsPage;
