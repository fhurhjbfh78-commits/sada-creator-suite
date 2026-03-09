import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const { login, register } = useAppStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      register(email, password);
    } else {
      login(email, password);
    }
    navigate('/chat');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-bg px-6">
      <h1 className="text-6xl font-black text-foreground mb-2" style={{ fontFamily: 'Tajawal, serif' }}>
        صَدي
      </h1>
      <h2 className="text-2xl font-bold text-foreground mb-10">
        {isRegister ? 'إنشاء حساب' : 'تسجيل الدخول'}
      </h2>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="glass-input flex items-center gap-3 px-4 py-3.5">
          <Mail className="w-5 h-5 text-muted-foreground" />
          <input
            type="email"
            placeholder="الايميل"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-right"
            required
          />
        </div>

        <div className="glass-input flex items-center gap-3 px-4 py-3.5">
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <Eye className="w-5 h-5 text-muted-foreground" /> : <EyeOff className="w-5 h-5 text-muted-foreground" />}
          </button>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-right"
            required
          />
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>

        <button type="submit" className="w-full glow-btn py-3.5 text-lg animate-pulse-glow">
          {isRegister ? 'إنشاء حساب' : 'تسجيل الدخول'}
        </button>

        {!isRegister && (
          <p className="text-center text-muted-foreground text-sm">نسيت كلمة المرور؟</p>
        )}

        <p className="text-center text-muted-foreground text-sm">
          {isRegister ? 'لديك حساب؟' : 'ليس لديك حساب؟'}{' '}
          <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-primary underline">
            {isRegister ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
