import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { ChevronRight, Menu, Pencil, Settings, Shield } from 'lucide-react';
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
    }
  };

  return (
    <div className="flex flex-col min-h-screen gradient-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <button><Menu className="w-5 h-5 text-foreground" /></button>
        <h1 className="text-xl font-bold">الملف الشخصي</h1>
        <button onClick={() => navigate(-1)}><ChevronRight className="w-5 h-5 text-foreground" /></button>
      </div>

      <div className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
        {/* Avatar & Name */}
        <div className="glass-card p-6 flex flex-col items-center">
          <label className="relative cursor-pointer">
            <div className="w-28 h-28 rounded-full bg-secondary border-4 border-border/30 flex items-center justify-center overflow-hidden">
              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-4xl text-muted-foreground">👤</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
          <h2 className="mt-4 text-2xl font-bold">{profile.name}</h2>

          {/* Bio */}
          <div className="w-full mt-4">
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
                className="w-full glass-input p-3 text-sm text-right resize-none h-20"
              />
            ) : (
              <p className="text-sm text-muted-foreground text-right">
                {profile.bio || 'اضغط على القلم لإضافة سيرة ذاتية'}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="w-full glow-btn py-3.5 text-lg"
        >
          تعديل الملف
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="w-full glow-btn py-3.5 text-lg flex items-center justify-center gap-2"
        >
          <Settings className="w-5 h-5" />
          الاعدادات
        </button>

        {/* Admin access */}
        <button
          onClick={() => setShowAdmin(true)}
          className="w-full glass-card py-3 text-sm text-muted-foreground flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4" />
          غرفة المدير
        </button>

        <button onClick={() => { logout(); navigate('/login'); }} className="w-full py-3 text-destructive text-sm">
          تسجيل الخروج
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
              className="w-full glass-input px-4 py-3 text-center mb-4"
              placeholder="الرمز السري"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowAdmin(false)} className="flex-1 glass-card py-2 text-sm">إلغاء</button>
              <button onClick={handleAdminAccess} className="flex-1 glow-btn py-2 text-sm">دخول</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
