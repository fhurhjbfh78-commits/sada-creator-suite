import { useAppStore } from '@/store/useAppStore';
import { Check } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';

const languages = [
  { code: 'ar' as const, label: 'العربية', flag: '🇸🇦', brand: 'صَدي' },
  { code: 'en' as const, label: 'الإنجليزية', flag: '🇬🇧' },
  { code: 'fr' as const, label: 'الفرنسية', flag: '🇫🇷' },
  { code: 'de' as const, label: 'الألمانية', flag: '🇩🇪' },
];

const LanguagePage = () => {
  const { language, setLanguage } = useAppStore();

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title="قائمة اللغات" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {languages.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] ${
                isActive
                  ? 'glow-btn animate-pulse-glow'
                  : 'glass-card'
              }`}
            >
              {isActive && <Check className="w-5 h-5" />}
              {!isActive && <div className="w-5" />}
              <div className="flex items-center gap-3">
                {lang.brand && <span className="text-sm font-black">{lang.brand}</span>}
                <span className="font-bold">{lang.label}</span>
                <span className="text-2xl">{lang.flag}</span>
              </div>
            </button>
          );
        })}

        <p className="text-center text-muted-foreground text-xs mt-8">عبدالله لازم</p>
      </div>

      <BottomNav />
    </div>
  );
};

export default LanguagePage;
