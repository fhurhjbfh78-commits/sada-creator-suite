import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, User, Rss, Gamepad2, Settings, Mail } from 'lucide-react';
import { playNavSound } from '@/lib/sounds';
import { useUnreadDM } from '@/hooks/useUnreadDM';
import { useIsAdmin } from '@/hooks/useAdminSettings';

const navItems = [
  { path: '/settings', icon: Settings, label: 'إعدادات' },
  { path: '/game', icon: Gamepad2, label: 'منشئ' },
  { path: '/direct-chat', icon: Mail, label: 'رسائل' },
  { path: '/feed', icon: Rss, label: 'منشورات' },
  { path: '/profile', icon: User, label: 'الملف' },
  { path: '/chat', icon: MessageCircle, label: 'دردشة' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const unread = useUnreadDM();
  const isAdmin = useIsAdmin();

  return (
    <div className="flex-shrink-0 flex items-center justify-around px-2 py-2 border-t border-border/30 bg-card/40 backdrop-blur-xl safe-bottom">
      {navItems.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
        const showBadge = path === '/direct-chat' && unread > 0 && !isAdmin;
        return (
          <button
            key={path}
            onClick={() => { playNavSound(); navigate(path); }}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all active:scale-95 ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {showBadge && (
                <span
                  className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_hsl(var(--primary)/0.6)] animate-pulse"
                >
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </div>
            <span className="text-[10px]">{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
