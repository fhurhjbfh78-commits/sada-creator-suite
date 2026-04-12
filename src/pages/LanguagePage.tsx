import { useAppStore } from '@/store/useAppStore';
import { Check } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { LANGUAGE_LIST, t, isRTL } from '@/i18n/translations';
import type { LangCode } from '@/i18n/translations';

const LanguagePage = () => {
  const { language, setLanguage } = useAppStore();

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg" dir={isRTL(language as LangCode) ? 'rtl' : 'ltr'}>
      <PageHeader title={t(language as LangCode, 'languages')} />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {LANGUAGE_LIST.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] ${isActive ? 'glow-btn' : 'glass-card'}`}
            >
              {isActive && <Check className="w-5 h-5" />}
              {!isActive && <div className="w-5" />}
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm">{lang.label}</span>
                <span className="text-xl">{lang.flag}</span>
              </div>
            </button>
          );
        })}
      </div>
      <BottomNav />
    </div>
  );
};

export default LanguagePage;
