import { useEffect } from 'react';
import { useAppStore, THEME_ACCENTS } from '@/store/useAppStore';

export const useTheme = () => {
  const { themeMode, themeAccent } = useAppStore();

  useEffect(() => {
    const root = document.documentElement;
    const accent = THEME_ACCENTS[themeAccent];

    // Set primary color
    root.style.setProperty('--primary', accent.primary);
    root.style.setProperty('--accent', accent.primary);
    root.style.setProperty('--ring', accent.primary);
    root.style.setProperty('--glow', accent.primary.replace(/\)$/, ' / 0.3)'));
    root.style.setProperty('--sidebar-primary', accent.primary);
    root.style.setProperty('--sidebar-ring', accent.primary);

    if (themeMode === 'light') {
      root.style.setProperty('--background', '0 0% 98%');
      root.style.setProperty('--foreground', '210 30% 10%');
      root.style.setProperty('--card', '0 0% 100%');
      root.style.setProperty('--card-foreground', '210 30% 10%');
      root.style.setProperty('--popover', '0 0% 100%');
      root.style.setProperty('--popover-foreground', '210 30% 10%');
      root.style.setProperty('--primary-foreground', '0 0% 100%');
      root.style.setProperty('--secondary', '210 20% 92%');
      root.style.setProperty('--secondary-foreground', '210 30% 20%');
      root.style.setProperty('--muted', '210 15% 93%');
      root.style.setProperty('--muted-foreground', '210 10% 45%');
      root.style.setProperty('--border', '210 15% 85%');
      root.style.setProperty('--input', '210 15% 85%');
      root.style.setProperty('--glass', '0 0% 100% / 0.7');
      root.style.setProperty('--glass-border', '210 15% 85% / 0.5');
    } else {
      root.style.setProperty('--background', '210 50% 8%');
      root.style.setProperty('--foreground', '210 20% 95%');
      root.style.setProperty('--card', '210 45% 12%');
      root.style.setProperty('--card-foreground', '210 20% 95%');
      root.style.setProperty('--popover', '210 45% 12%');
      root.style.setProperty('--popover-foreground', '210 20% 95%');
      root.style.setProperty('--primary-foreground', '210 50% 8%');
      root.style.setProperty('--secondary', '210 40% 18%');
      root.style.setProperty('--secondary-foreground', '210 20% 90%');
      root.style.setProperty('--muted', '210 35% 16%');
      root.style.setProperty('--muted-foreground', '210 15% 55%');
      root.style.setProperty('--border', '210 30% 20%');
      root.style.setProperty('--input', '210 30% 20%');
      root.style.setProperty('--glass', '210 45% 12% / 0.6');
      root.style.setProperty('--glass-border', '210 30% 30% / 0.3');
    }
  }, [themeMode, themeAccent]);
};
