import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { useNotifications } from '@/hooks/useNotifications';
import { Sparkles, DollarSign, MessageCircle, MessageSquare, CheckCheck, BellOff, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { t, isRTL } from '@/i18n/translations';
import type { LangCode } from '@/i18n/translations';

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'الآن';
  if (m < 60) return `قبل ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  return `قبل ${Math.floor(h / 24)} يوم`;
};

const NotificationsPage = () => {
  const { language, subscriptionPrices } = useAppStore();
  const lang = language as LangCode;
  const navigate = useNavigate();
  const { items, loading, unread, markAllRead, markRead, refresh } = useNotifications();

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg" dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <PageHeader title={t(lang, 'updatesNotifications')} />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="glass-card px-3 py-2 flex items-center gap-1.5 text-xs active:scale-95 transition-transform">
            <RefreshCw className="w-3.5 h-3.5" /> تحديث
          </button>
          <button
            onClick={markAllRead}
            disabled={unread === 0}
            className="flex-1 glow-btn py-2 flex items-center justify-center gap-1.5 text-xs active:scale-95 transition-transform disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" /> تعليم الكل كمقروء {unread > 0 && `(${unread})`}
          </button>
        </div>

        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => { markRead(n.id); if (n.link) navigate(n.link); }}
            className={`w-full glass-card p-4 flex items-start gap-3 text-right animate-fade-in active:scale-[0.98] transition-transform ${
              n.read ? 'opacity-70' : 'ring-1 ring-primary/40'
            }`}
          >
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              {n.kind === 'message' ? <MessageCircle className="w-5 h-5 text-primary" /> : <MessageSquare className="w-5 h-5 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-muted-foreground flex-shrink-0">{timeAgo(n.createdAt)}</span>
                <h3 className="font-bold text-xs sm:text-sm truncate">{n.title}</h3>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 break-words line-clamp-2">{n.description}</p>
            </div>
            {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-1" />}
          </button>
        ))}

        {/* Static app info cards */}
        <div className="glass-card p-4 flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <h3 className="font-bold text-xs sm:text-sm">{t(lang, 'appUpdates')}</h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 break-words">
              صدى 2.0 - تحسينات في الأداء والسرعة ودعم 32 لغة
            </p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <h3 className="font-bold text-xs sm:text-sm">{t(lang, 'subscriptionPrices')}</h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 break-words">
              {t(lang, 'beginner')}: {subscriptionPrices.beginner || '---'} | {t(lang, 'intermediate')}: {subscriptionPrices.intermediate || '---'} | {t(lang, 'pro')}: {subscriptionPrices.pro || '---'}
            </p>
          </div>
        </div>

        {loading && <div className="text-center py-6"><div className="animate-spin w-6 h-6 border-2 border-muted-foreground border-t-primary rounded-full mx-auto" /></div>}
        {!loading && items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BellOff className="w-8 h-8 mx-auto mb-2 opacity-60" />
            <p className="text-sm">لا توجد إشعارات جديدة</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default NotificationsPage;
