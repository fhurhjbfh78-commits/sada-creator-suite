import { useAppStore } from '@/store/useAppStore';
import { User, DollarSign, Settings } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';

const NotificationsPage = () => {
  const { notifications, profile } = useAppStore();

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'profile': return <User className="w-8 h-8 text-muted-foreground" />;
      case 'payment': return <DollarSign className="w-8 h-8 text-primary" />;
      default: return <Settings className="w-8 h-8 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title="التحديثات والاشعارات" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="glass-card p-3 flex items-center justify-between">
          <span className="text-sm font-bold">صَدي</span>
          <span className="font-bold">{profile.name}</span>
        </div>

        {notifications.map((n) => (
          <div key={n.id} className="glass-card p-4 flex items-center gap-4 animate-fade-in active:scale-[0.98] transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center flex-shrink-0">
              {getIcon(n.icon)}
            </div>
            <div className="flex-1 text-right">
              <h3 className="font-bold text-sm">{n.title}</h3>
              <p className="text-xs text-muted-foreground">{n.description}</p>
            </div>
          </div>
        ))}

        <button className="glow-btn px-6 py-2 text-sm active:scale-95 transition-transform">المزيد</button>
      </div>

      <BottomNav />
    </div>
  );
};

export default NotificationsPage;
