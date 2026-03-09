import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Pencil, Settings, Shield, Upload, Image } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';

const ProfilePage = () => {
  const { profile, updateProfile, logout } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(profile.bio);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const navigate = useNavigate();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateProfile({ avatar: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleAdminAccess = () => {
    if (adminCode === 'Abod/0774') {
      navigate('/admin');
      setShowAdmin(false);
      setAdminCode('');
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title="تحميل الملف الشخصي" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Avatar Card */}
        <div className="glass-card p-6 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-4">
            <span className="text-sm font-bold">صَدي</span>
            <span className="text-sm">Sada</span>
          </div>

          <label className="relative cursor-pointer">
            <div className="w-32 h-32 rounded-full border-4 border-primary/40 bg-secondary flex items-center justify-center overflow-hidden">
              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">👤</span>
              )}
            </div>
            <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm">✓</span>
            </div>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>

          <h2 className="mt-3 text-xl font-bold">{profile.name}</h2>

          <button className="w-full mt-4 glow-btn py-3 text-sm active:scale-95 transition-transform">
            تحديث الملف الشخصي
          </button>
        </div>

        <p className="text-right text-sm text-muted-foreground">Sada</p>

        {/* Upload photo */}
        <button className="w-full glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
          <span className="text-sm font-bold">صَدي</span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">رفع صورة</span>
            <Upload className="w-5 h-5 text-primary" />
          </div>
        </button>

        {/* Choose from gallery */}
        <label className="w-full glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer">
          <span className="text-sm font-bold">صَدي</span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">اختيار من المعرض</span>
            <Image className="w-5 h-5 text-primary" />
          </div>
          <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </label>

        {/* Bio section */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => {
              if (isEditing) updateProfile({ bio });
              setIsEditing(!isEditing);
            }}>
              <Pencil className="w-4 h-4 text-primary" />
            </button>
            <h3 className="font-bold text-sm">السيرة الذاتية</h3>
          </div>
          {isEditing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full glass-input p-3 text-sm text-right resize-none h-20 text-foreground"
              autoFocus
            />
          ) : (
            <p className="text-sm text-muted-foreground text-right">
              {profile.bio || 'اضغط على القلم لإضافة سيرة ذاتية'}
            </p>
          )}
        </div>

        {/* Actions */}
        <button onClick={() => navigate('/settings')} className="w-full glow-btn py-3 text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <Settings className="w-5 h-5" /> الاعدادات
        </button>

        <button
          onClick={() => setShowAdmin(true)}
          className="w-full glass-card py-3 text-sm text-muted-foreground flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Shield className="w-4 h-4" /> غرفة المدير
        </button>
      </div>

      {/* Admin modal */}
      {showAdmin && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="glass-card p-6 w-full max-w-sm animate-fade-in">
            <h3 className="text-lg font-bold text-center mb-4">أدخل رمز المدير</h3>
            <input
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminAccess()}
              className="w-full glass-input px-4 py-3 text-center mb-4 text-foreground"
              placeholder="الرمز السري"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={() => { setShowAdmin(false); setAdminCode(''); }} className="flex-1 glass-card py-2.5 text-sm active:scale-95 transition-transform">إلغاء</button>
              <button onClick={handleAdminAccess} className="flex-1 glow-btn py-2.5 text-sm active:scale-95 transition-transform">دخول</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
