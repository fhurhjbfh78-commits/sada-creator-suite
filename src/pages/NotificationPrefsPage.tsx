import { useNotifPrefs, NotifPrefs } from '@/hooks/useNotifPrefs';
import { MessageCircle, MessageSquare, Sparkles, Volume2, BellDot, RotateCcw } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

const ROWS: { key: keyof NotifPrefs; label: string; hint: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'messages', label: 'الرسائل الخاصة', hint: 'تنبيه عند وصول رسالة جديدة', Icon: MessageCircle },
  { key: 'comments', label: 'التعليقات', hint: 'تنبيه عند التعليق على منشوراتك', Icon: MessageSquare },
  { key: 'system', label: 'تحديثات التطبيق', hint: 'أخبار الإصدارات والأسعار', Icon: Sparkles },
  { key: 'sound', label: 'صوت التنبيه', hint: 'تشغيل صوت عند وصول إشعار', Icon: Volume2 },
  { key: 'badge', label: 'شارة العدد', hint: 'إظهار رقم غير المقروء على الأيقونة', Icon: BellDot },
];

const NotificationPrefsPage = () => {
  const { prefs, toggle, reset } = useNotifPrefs();

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title="تفضيلات الإشعارات" />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <p className="text-[11px] text-muted-foreground text-right break-words">
          اختر أنواع التنبيهات التي تريد استلامها. تُحفظ التفضيلات فوراً وتُطبَّق على كل التطبيق.
        </p>

        {ROWS.map(({ key, label, hint, Icon }) => (
          <div key={key} className="glass-card p-4 flex items-center justify-between gap-3">
            <button
              role="switch"
              aria-checked={prefs[key]}
              aria-label={label}
              onClick={() => { toggle(key); toast.success(`${label}: ${prefs[key] ? 'إيقاف' : 'تشغيل'}`); }}
              className={`relative w-12 h-7 rounded-full flex-shrink-0 transition-colors ${prefs[key] ? 'bg-primary' : 'bg-muted'}`}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-background transition-all ${prefs[key] ? 'left-1' : 'left-6'}`}
              />
            </button>
            <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
              <div className="text-right min-w-0">
                <p className="font-bold text-xs sm:text-sm truncate">{label}</p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground break-words">{hint}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => { reset(); toast.success('تمت الاستعادة للإعدادات الافتراضية'); }}
          className="w-full glass-card py-2.5 text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <RotateCcw className="w-4 h-4" /> استعادة الافتراضي
        </button>
      </div>
      <BottomNav />
    </div>
  );
};

export default NotificationPrefsPage;
