import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { ChevronRight, Menu, User, DollarSign, Settings } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const NotificationsPage = () => {
  const { notifications, profile } = useAppStore();
  const navigate = useNavigate();

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'profile': return <User className="w-8 h-8 text-muted-foreground" />;
      case 'payment': return <DollarSign className="w-8 h-8 text-primary" />;
      case 'settings': return <Settings className="w-8 h-8 text-muted-foreground" />;
      default: return <Settings className="w-8 h-8 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen gradient-bg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <button><Menu className="w-5 h-5 text-foreground" /></button>
        <h1 className="text-xl font-bold">التحديثات والاشعارات</h1>
        <button onClick={() => navigate(-1)}><ChevronRight className="w-5 h-5 text-foreground" /></button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {/* User header */}
        <div className="glass-card p-3 flex items-center justify-between">
          <span className="text-sm font-bold">صَدي</span>
          <span className="font-bold">{profile.name}</span>
        </div>

        {notifications.map((n) => (
          <div key={n.id} className="glass-card p-4 flex items-center gap-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center flex-shrink-0">
              {getIcon(n.icon)}
            </div>
            <div className="flex-1 text-right">
              <h3 className="font-bold">{n.title}</h3>
              <p className="text-sm text-muted-foreground">{n.description}</p>
            </div>
          </div>
        ))}

        <button className="glow-btn px-6 py-2 text-sm">المزيد</button>
      </div>

      <BottomNav />
    </div>
  );
};

export default NotificationsPage;
