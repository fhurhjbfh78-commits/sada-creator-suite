import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { useAppStore } from '@/store/useAppStore';
import { t } from '@/i18n/translations';
import type { LangCode } from '@/i18n/translations';
import { Shield } from 'lucide-react';

const PrivacyPage = () => {
  const { language } = useAppStore();
  const lang = language as LangCode;

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title={t(lang, 'privacyPolicy')} />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <p className="text-sm leading-7 text-foreground whitespace-pre-line text-right" dir="rtl">
            {t(lang, 'privacyContent')}
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default PrivacyPage;
