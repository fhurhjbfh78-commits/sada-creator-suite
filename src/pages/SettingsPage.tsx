import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, THEME_ACCENTS, ThemeAccent } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  User, Lock, Bell, BellRing, MessageCircle, Shield, CloudUpload, ChevronDown, Globe, Palette, Sun, Moon,
  Sparkles, FlaskConical, Zap, GraduationCap, Laugh, Ruler, Palmtree, Wand2, CloudDownload,
  Download, Upload, Loader2,
} from 'lucide-react';
import { PERSONAS, PersonaKey } from '@/lib/personas';
import { cloudBackup, cloudRestore, getCloudBackupInfo, downloadBackup, restoreFromFile, ALL_PARTS, type BackupParts } from '@/lib/backup';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';

const PERSONA_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, GraduationCap, Laugh, Ruler, Palmtree, Wand2,
};

const SettingsPage = () => {
  const { themeMode, setThemeMode, themeAccent, setThemeAccent, aiPersona, setAiPersona, customPersona, setCustomPersona } = useAppStore();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [showAppearance, setShowAppearance] = useState(false);
  const [showPersona, setShowPersona] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [backupBusy, setBackupBusy] = useState<'save' | 'restore' | null>(null);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [parts, setParts] = useState<BackupParts>({ ...ALL_PARTS });
  const [confirmRestore, setConfirmRestore] = useState<{ source: 'cloud' | 'file'; file?: File } | null>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || !showBackup) return;
    getCloudBackupInfo(user.id).then(setLastBackup).catch(() => setLastBackup(null));
  }, [user, showBackup]);

  const handleCloudBackup = async () => {
    if (!user) { toast.error('يرجى تسجيل الدخول'); return; }
    setBackupBusy('save');
    try {
      const at = await cloudBackup(user.id);
      setLastBackup(at);
      toast.success('تم حفظ النسخة الاحتياطية في السحابة');
    } catch {
      toast.error('فشل حفظ النسخة الاحتياطية');
    } finally { setBackupBusy(null); }
  };

  const runRestore = async () => {
    if (!confirmRestore) return;
    if (!parts.profile && !parts.settings && !parts.notifications) {
      toast.error('اختر عنصراً واحداً على الأقل للاستعادة');
      return;
    }
    const target = confirmRestore;
    setConfirmRestore(null);
    setBackupBusy('restore');
    try {
      if (target.source === 'cloud') {
        if (!user) { toast.error('يرجى تسجيل الدخول'); return; }
        await cloudRestore(user.id, parts);
      } else if (target.file) {
        await restoreFromFile(target.file, user?.id, parts);
      }
      toast.success('تمت الاستعادة، سيتم تحديث التطبيق');
      setTimeout(() => window.location.reload(), 900);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'فشلت الاستعادة');
    } finally { setBackupBusy(null); }
  };

  const handleDownload = async () => {
    try { await downloadBackup(user?.id); toast.success('تم تنزيل ملف النسخة الاحتياطية'); }
    catch { toast.error('فشل التنزيل'); }
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setConfirmRestore({ source: 'file', file });
  };


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
    { icon: BellRing, label: 'تفضيلات الإشعارات', action: () => navigate('/notification-settings') },
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
              {(Object.keys(PERSONAS) as PersonaKey[]).map((key) => {
                const Icon = PERSONA_ICONS[PERSONAS[key].icon] || Sparkles;
                return (
                  <button
                    key={key}
                    onClick={() => setAiPersona(key)}
                    className={`py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-bold border transition-all active:scale-95 flex items-center justify-center gap-1.5 min-w-0 ${
                      aiPersona === key ? 'bg-primary/20 text-primary border-primary/50' : 'bg-muted/20 text-muted-foreground border-border/40'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{PERSONAS[key].label}</span>
                  </button>
                );
              })}
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

        <button onClick={() => setShowBackup(!showBackup)} className="w-full glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showBackup ? '' : '-rotate-90'}`} />
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">نسخ احتياطي</span>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><CloudUpload className="w-5 h-5 text-primary" /></div>
          </div>
        </button>

        {showBackup && (
          <div className="glass-card p-4 space-y-3 animate-fade-in">
            <p className="text-[11px] text-muted-foreground text-right break-words">
              آخر نسخة سحابية: {lastBackup ? new Date(lastBackup).toLocaleString('ar') : 'لا توجد'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleCloudBackup} disabled={backupBusy !== null}
                className="glow-btn py-2.5 text-[11px] sm:text-xs flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-60">
                {backupBusy === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                <span className="truncate">حفظ سحابي</span>
              </button>
              <button onClick={() => setConfirmRestore({ source: 'cloud' })} disabled={backupBusy !== null}
                className="glass-card py-2.5 text-[11px] sm:text-xs flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-60">
                {backupBusy === 'restore' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudDownload className="w-4 h-4" />}
                <span className="truncate">استعادة سحابية</span>
              </button>
              <button onClick={handleDownload}
                className="glass-card py-2.5 text-[11px] sm:text-xs flex items-center justify-center gap-1.5 active:scale-95">
                <Download className="w-4 h-4" /><span className="truncate">تنزيل ملف</span>
              </button>
              <button onClick={() => restoreInputRef.current?.click()} disabled={backupBusy !== null}
                className="glass-card py-2.5 text-[11px] sm:text-xs flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-60">
                <Upload className="w-4 h-4" /><span className="truncate">استيراد ملف</span>
              </button>
            </div>
            <input ref={restoreInputRef} type="file" accept="application/json,.json" onChange={handleFileRestore} className="hidden" />
            <p className="text-[10px] text-muted-foreground text-center">تشمل النسخة: الملف الشخصي، الإعدادات، المحادثات المحفوظة محلياً. الاستعادة تدعم اختيار الأجزاء فقط.</p>
          </div>
        )}


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
