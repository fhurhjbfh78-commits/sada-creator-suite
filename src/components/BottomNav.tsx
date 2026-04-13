import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, User, Rss, Gamepad2, Settings, Mail } from 'lucide-react';
import { playNavSound } from '@/lib/sounds';

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

  return (
    <div className="flex-shrink-0 flex items-center justify-around px-2 py-2 border-t border-border/30 bg-card/40 backdrop-blur-xl safe-bottom">
      {navItems.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
        return (
          <button
            key={path}
            onClick={() => { playNavSound(); navigate(path); }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all active:scale-95 ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
