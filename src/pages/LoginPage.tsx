import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { lovable } from '@/integrations/lovable/index';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, signUp, signIn } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/chat');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    try {
      if (isRegister) {
        const { error } = await signUp(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('تم إنشاء الحساب بنجاح!');
          navigate('/chat');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          navigate('/chat');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    try {
      const { error } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (error) toast.error(String(error));
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ في تسجيل الدخول');
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center relative overflow-hidden" style={{ background: '#020617' }}>
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.2,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`,
            }}
          />
        ))}
      </div>

      <h1 className="text-6xl font-black mb-2 relative z-10" style={{ fontFamily: 'Tajawal, serif', color: '#fbbf24', textShadow: '0 0 40px rgba(251,191,36,0.5)' }}>صدى</h1>
      <h2 className="text-xl font-bold mb-8 relative z-10" style={{ color: '#e2e8f0' }}>
        {isRegister ? 'إنشاء حساب' : 'تسجيل الدخول'}
      </h2>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 px-6 relative z-10">
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid #fbbf24', backdropFilter: 'blur(10px)' }}>
          <Mail className="w-5 h-5" style={{ color: '#94a3b8' }} />
          <input
            type="email"
            placeholder="الايميل"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent outline-none text-right text-sm"
            style={{ color: '#e2e8f0' }}
            required
          />
        </div>

        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid #fbbf24', backdropFilter: 'blur(10px)' }}>
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <Eye className="w-5 h-5" style={{ color: '#94a3b8' }} /> : <EyeOff className="w-5 h-5" style={{ color: '#94a3b8' }} />}
          </button>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-transparent outline-none text-right text-sm"
            style={{ color: '#e2e8f0' }}
            required
          />
          <Lock className="w-5 h-5" style={{ color: '#94a3b8' }} />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 text-lg font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
          style={{ background: '#fbbf24', color: '#020617' }}
        >
          {isLoading ? '...' : isRegister ? 'إنشاء حساب' : 'تسجيل الدخول'}
        </button>

        {/* SSO */}
        <div className="space-y-2">
          <p className="text-center text-xs" style={{ color: '#94a3b8' }}>أو سجل الدخول عبر</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              className="py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span>🔵</span> Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('apple')}
              className="py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span>🍎</span> Apple
            </button>
          </div>
        </div>

        <p className="text-center text-sm" style={{ color: '#94a3b8' }}>
          {isRegister ? 'لديك حساب؟' : 'ليس لديك حساب؟'}{' '}
          <button type="button" onClick={() => setIsRegister(!isRegister)} className="underline" style={{ color: '#fbbf24' }}>
            {isRegister ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
