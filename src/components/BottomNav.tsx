import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, User, Pen, Bell, CreditCard } from 'lucide-react';

const navItems = [
  { path: '/payment', icon: CreditCard, label: 'الدفع' },
  { path: '/notifications', icon: Bell, label: 'إشعارات' },
  { path: '/drawing', icon: Pen, label: 'رسم' },
  { path: '/profile', icon: User, label: 'الملف' },
  { path: '/chat', icon: MessageCircle, label: 'دردشة' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-around px-2 py-2 border-t border-border/30 bg-card/40 backdrop-blur-xl">
      {navItems.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
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
