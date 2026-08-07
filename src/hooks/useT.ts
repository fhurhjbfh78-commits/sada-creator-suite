import { useCallback, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { t as translate, isRTL } from '@/i18n/translations';
import type { LangCode } from '@/i18n/translations';

/**
 * Central translation hook — every screen uses this so switching the language
 * in Settings instantly re-renders the whole app in the chosen language.
 */
export const useT = () => {
  const language = useAppStore((s) => s.language) as LangCode;
  const t = useCallback(
    (key: Parameters<typeof translate>[1]) => translate(language, key),
    [language]
  );
  const rtl = useMemo(() => isRTL(language), [language]);
  return { t, lang: language, rtl, dir: (rtl ? 'rtl' : 'ltr') as 'rtl' | 'ltr' };
};

export default useT;
