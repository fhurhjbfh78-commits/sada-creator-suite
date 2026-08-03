import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, THEME_ACCENTS, ThemeAccent } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Lock, Bell, MessageCircle, Shield, CloudUpload, ChevronDown, Globe, Palette, Sun, Moon, Sparkles, FlaskConical } from 'lucide-react';
import { PERSONAS, PersonaKey } from '@/lib/personas';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';

const SettingsPage = () => {
  const { themeMode, setThemeMode, themeAccent, setThemeAccent, aiPersona, setAiPersona, customPersona, setCustomPersona } = useAppStore();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [showAppearance, setShowAppearance] = useState(false);
  const [showPersona, setShowPersona] = useState(false);

  // Admin access is granted only by an existing administrator (server-side role),
  // never by entering a shared passcode in the app.
  const handleAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('يرجى تسجيل الدخول'); return; }
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    if (!data) { toast.error('هذا الحساب لا يملك صلاحية المدير'); return; }
    navigate('/admin');
    setShowAdmin(false);
    setAdminCode('');
  };


  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const sections = [
    { icon: User, label: 'اعدادات الحساب', action: () => navigate('/profile') },
    { icon: Lock, label: 'الخصوصية والأمان', action: () => navigate('/privacy') },
    { icon: Bell, label: 'الاشعارات', action: () => navigate('/notifications') },
    { icon: MessageCircle, label: 'اعدادات المحادثة', action: () => navigate('/chat') },
    { icon: FlaskConical, label: 'مختبر صدى الذكي', action: () => navigate('/lab') },
  ];

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title="الاعدادات" />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {sections.map(({ icon: Icon, label, action }) => (
          <button key={label} onClick={action} className="w-full glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
            <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90" />
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm">{label}</span>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></div>
            </div>
          </button>
        ))}

        {/* AI Persona */}
        <button onClick={() => setShowPersona(!showPersona)} className="w-full glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showPersona ? '' : '-rotate-90'}`} />
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">شخصية صدى</span>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><Sparkles className="w-5 h-5 text-primary" /></div>
          </div>
        </button>
        {showPersona && (
          <div className="glass-card p-4 space-y-3 animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PERSONAS) as PersonaKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setAiPersona(key)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                    aiPersona === key ? 'bg-primary/20 text-primary border-primary/50' : 'bg-muted/20 text-muted-foreground border-border/40'
                  }`}
                >
                  {PERSONAS[key].emoji} {PERSONAS[key].label}
                </button>
              ))}
            </div>
            {aiPersona === 'custom' && (
              <textarea
                value={customPersona}
                onChange={(e) => setCustomPersona(e.target.value)}
                placeholder="اكتب شخصية صدى كما تحبها... مثال: مبرمج خبير يتكلم بلهجة بغدادية ويختصر بالجواب"
                rows={3}
                maxLength={600}
                className="w-full bg-muted/30 rounded-xl p-3 text-sm outline-none resize-none border border-border/40 focus:border-primary/50"
              />
            )}
            <p className="text-[11px] text-muted-foreground text-center">تُطبَّق فوراً على الدردشة والمختبر.</p>
          </div>
        )}

        {/* Appearance */}
        <button onClick={() => setShowAppearance(!showAppearance)} className="w-full glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showAppearance ? '' : '-rotate-90'}`} />
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">المظهر والثيمات</span>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><Palette className="w-5 h-5 text-primary" /></div>
          </div>
        </button>

        {showAppearance && (
          <div className="glass-card p-4 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button onClick={() => setThemeMode('light')} className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${themeMode === 'light' ? 'glow-btn' : 'glass-card'}`}>
                  <Sun className="w-4 h-4" /> فاتح
                </button>
                <button onClick={() => setThemeMode('dark')} className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${themeMode === 'dark' ? 'glow-btn' : 'glass-card'}`}>
                  <Moon className="w-4 h-4" /> داكن
                </button>
              </div>
              <span className="text-sm font-bold">الوضع</span>
            </div>
            <div>
              <p className="text-sm font-bold text-right mb-3">الألوان</p>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(THEME_ACCENTS) as ThemeAccent[]).map((accent) => (
                  <button key={accent} onClick={() => setThemeAccent(accent)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all active:scale-90 ${themeAccent === accent ? 'ring-2 ring-primary bg-primary/10' : 'glass-card'}`}>
                    <div className="w-8 h-8 rounded-full border-2 border-background" style={{ backgroundColor: THEME_ACCENTS[accent].preview }} />
                    <span className="text-[9px]">{THEME_ACCENTS[accent].label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button onClick={() => navigate('/language')} className="w-full glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
          <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90" />
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">اللغة</span>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><Globe className="w-5 h-5 text-primary" /></div>
          </div>
        </button>

        <button onClick={() => setShowAdmin(true)} className="w-full glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
          <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90" />
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">غرفة المدير</span>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><Shield className="w-5 h-5 text-primary" /></div>
          </div>
        </button>

        <button className="w-full glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
          <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90" />
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">نسخ احتياطي</span>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><CloudUpload className="w-5 h-5 text-primary" /></div>
          </div>
        </button>

        <button onClick={handleLogout} className="w-full py-3 text-destructive text-sm font-bold">تسجيل الخروج</button>
      </div>

      {showAdmin && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="glass-card p-6 w-full max-w-sm animate-fade-in">
            <h3 className="text-lg font-bold text-center mb-4">أدخل رمز المدير</h3>
            <input type="password" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdminAccess()} className="w-full glass-input px-4 py-3 text-center mb-4 text-foreground" placeholder="الرمز السري" autoFocus />
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
