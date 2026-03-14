import { useAppStore } from '@/store/useAppStore';
import { Check } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';

const languages: { code: 'ar' | 'en' | 'fr' | 'de'; label: string; flag: string }[] = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
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
              className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] ${isActive ? 'glow-btn' : 'glass-card'}`}
            >
              {isActive && <Check className="w-5 h-5" />}
              {!isActive && <div className="w-5" />}
              <div className="flex items-center gap-3">
                <span className="font-bold">{lang.label}</span>
                <span className="text-2xl">{lang.flag}</span>
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
