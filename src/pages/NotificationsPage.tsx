import { useAppStore } from '@/store/useAppStore';
import { Bell, Sparkles, DollarSign } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { t, isRTL } from '@/i18n/translations';
import type { LangCode } from '@/i18n/translations';

const NotificationsPage = () => {
  const { language, subscriptionPrices } = useAppStore();
  const lang = language as LangCode;

  const notifications = [
    {
      id: '1',
      title: t(lang, 'appUpdates'),
      description: 'صدى 2.0 - تحديث جديد يتضمن تحسينات في الأداء والسرعة ودعم 32 لغة',
      icon: <Sparkles className="w-6 h-6 text-primary" />,
    },
    {
      id: '2',
      title: t(lang, 'subscriptionPrices'),
      description: `${t(lang, 'beginner')}: ${subscriptionPrices.beginner || '---'} | ${t(lang, 'intermediate')}: ${subscriptionPrices.intermediate || '---'} | ${t(lang, 'pro')}: ${subscriptionPrices.pro || '---'}`,
      icon: <DollarSign className="w-6 h-6 text-primary" />,
    },
  ];

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg" dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <PageHeader title={t(lang, 'updatesNotifications')} />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="glass-card p-4 flex items-center gap-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              {n.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">{n.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{n.description}</p>
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
};

export default NotificationsPage;
