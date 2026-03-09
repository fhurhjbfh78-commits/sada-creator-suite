import { useAppStore } from '@/store/useAppStore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';

const lineData = [
  { name: 'انفي', value: 20 },
  { name: 'اوار', value: 35 },
  { name: 'صدال', value: 50 },
  { name: 'سوق', value: 45 },
  { name: 'سمر', value: 65 },
  { name: '', value: 80 },
  { name: ' ', value: 90 },
];

const barData = [
  { name: 'شوى', value: 30 },
  { name: 'سوق', value: 45 },
  { name: 'شطق', value: 55 },
  { name: 'سات', value: 50 },
  { name: 'اوار', value: 80 },
  { name: 'أنمر', value: 100 },
  { name: 'يومد', value: 120 },
];

const AnalyticsPage = () => {
  const { profile, chatRooms } = useAppStore();

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title="تحليل البيانات واستخدام الـ API" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* OpenAI Usage Chart */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground">تحديث: {profile.name}</span>
            <h3 className="font-bold text-primary">استخدام OpenAI</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 30% 20%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(210 15% 55%)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'hsl(210 15% 55%)', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'hsl(210 45% 12%)', border: 'none', borderRadius: 8, color: '#fff' }} />
              <Line type="monotone" dataKey="value" stroke="hsl(195 100% 50%)" strokeWidth={2} dot={{ fill: 'hsl(195 100% 50%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Database Size Chart */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground">تحديث: {profile.name}</span>
            <h3 className="font-bold text-primary">حجم قاعدة البيانات</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 30% 20%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(210 15% 55%)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'hsl(210 15% 55%)', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'hsl(210 45% 12%)', border: 'none', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="value" fill="hsl(195 100% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Processed messages */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">تحديث: {profile.name}</span>
            <h3 className="font-bold text-primary">الرسائل المعالجة</h3>
          </div>
          {chatRooms.slice(0, 5).map((room) => (
            <div key={room.id} className="glass-input p-3 mb-2 flex items-center justify-between">
              <span className="text-xs">Sada</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">Sada صَدي</span>
              </div>
            </div>
          ))}
          {chatRooms.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">لا توجد رسائل بعد</p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AnalyticsPage;
