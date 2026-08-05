import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { lovable } from '@/integrations/lovable/index';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Seo from '@/components/Seo';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading, signUp, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/chat', { replace: true });
  }, [loading, navigate, user]);

  const stars = useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    width: Math.random() * 3 + 1,
    height: Math.random() * 3 + 1,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    opacity: Math.random() * 0.6 + 0.2,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${Math.random() * 2 + 2}s`,
  })), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    try {
      if (isRegister) {
        const { error } = await signUp(email, password);
        if (error) toast.error(error.message);
        else {
          toast.success('تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتأكيد الحساب.');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) toast.error(error.message);
        else navigate('/chat');
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
      <Seo
        title="تسجيل الدخول — صدى"
        description="سجّل الدخول إلى صدى للوصول إلى الدردشة الذكية، إنشاء الصور، تحليل الملفات، ومنشئ الأكواد."
        path="/login"
      />
      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map(({ id, ...style }) => (
          <div key={id} className="absolute rounded-full bg-white animate-pulse"
            style={style} />
        ))}
      </div>

      <h1 className="text-6xl font-black mb-1 relative z-10 text-center" style={{ fontFamily: 'Tajawal, serif', color: '#fbbf24', textShadow: '0 0 40px rgba(251,191,36,0.5)' }}>
        صدى
        <span className="block mt-2 text-sm font-medium" style={{ color: '#94a3b8', textShadow: 'none' }}>
          منصة الذكاء الاصطناعي العربية المتكاملة
        </span>
      </h1>
      <h2 className="text-lg font-bold mb-6 mt-4 relative z-10" style={{ color: '#e2e8f0' }}>
        {isRegister ? 'إنشاء حساب' : 'تسجيل الدخول'}
      </h2>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3 px-5 relative z-10">
        <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid #fbbf24', backdropFilter: 'blur(10px)' }}>
          <Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#94a3b8' }} />
          <input type="email" placeholder="الايميل" value={email} onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent outline-none text-right text-sm min-w-0" style={{ color: '#e2e8f0' }} required />
        </div>

        <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid #fbbf24', backdropFilter: 'blur(10px)' }}>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="flex-shrink-0"
            aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          >
            {showPassword ? <Eye className="w-4 h-4" style={{ color: '#94a3b8' }} /> : <EyeOff className="w-4 h-4" style={{ color: '#94a3b8' }} />}
          </button>

          <input type={showPassword ? 'text' : 'password'} placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-transparent outline-none text-right text-sm min-w-0" style={{ color: '#e2e8f0' }} required />
          <Lock className="w-4 h-4 flex-shrink-0" style={{ color: '#94a3b8' }} />
        </div>

        <button type="submit" disabled={isLoading}
          className="w-full py-3 text-base font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
          style={{ background: '#fbbf24', color: '#020617' }}>
          {isLoading ? '...' : isRegister ? 'إنشاء حساب' : 'تسجيل الدخول'}
        </button>

        {/* SSO */}
        <div className="space-y-2">
          <p className="text-center text-[11px]" style={{ color: '#94a3b8' }}>أو سجل الدخول عبر</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => handleOAuth('google')}
              className="py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{ background: '#ffffff', color: '#1f1f1f', border: '1px solid rgba(0,0,0,0.1)' }}>
              <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              Google
            </button>
            <button type="button" onClick={() => handleOAuth('apple')}
              className="py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{ background: '#000000', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
              <svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM256.4 84.5c22.4-26.6 20.4-50.8 19.7-59.5-19.8 1.1-42.7 13.4-55.8 28.6-14.4 16.3-22.9 36.5-21.1 57.8 21.4 1.6 40.9-9.4 57.2-26.9z"/>
              </svg>
              Apple
            </button>
          </div>

        </div>

        <p className="text-center text-xs" style={{ color: '#94a3b8' }}>
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
