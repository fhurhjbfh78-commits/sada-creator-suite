import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const [progress, setProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setShowLogo(true), 200);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => navigate('/login'), 300);
          return 100;
        }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center gradient-bg px-6 relative overflow-hidden">
      {/* 3D-like animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-80 h-80 rounded-full bg-primary/5 blur-3xl -top-20 -right-20 animate-pulse" />
        <div className="absolute w-60 h-60 rounded-full bg-primary/10 blur-3xl bottom-20 -left-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute w-40 h-40 rounded-full bg-primary/5 blur-2xl top-1/3 left-1/3 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Logo with 3D entrance */}
      <div className={`transition-all duration-1000 ease-out ${showLogo ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'}`}>
        <h1
          className="text-8xl font-black text-foreground mb-2 drop-shadow-[0_0_40px_hsl(var(--primary)/0.4)]"
          style={{ fontFamily: 'Tajawal, serif', textShadow: '0 0 60px hsl(var(--primary) / 0.3), 0 4px 20px rgba(0,0,0,0.5)' }}
        >
          صدى
        </h1>
      </div>

      <p className={`text-muted-foreground text-lg mb-12 transition-all duration-700 delay-500 ${showLogo ? 'opacity-100' : 'opacity-0'}`}>
        Optimizing App...
      </p>

      <div className="w-48 h-1.5 bg-secondary rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-100"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(195 80% 70%), hsl(var(--primary)))',
          }}
        />
      </div>

      <div className="mt-4 animate-spin w-5 h-5 border-2 border-muted-foreground border-t-primary rounded-full" />

      {/* Developer credit - only on splash */}
      <p className={`absolute bottom-8 text-sm text-muted-foreground transition-all duration-700 delay-700 ${showLogo ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: 'Tajawal, serif' }}>
        تطوير: عبدالله لازم
      </p>
    </div>
  );
};

export default SplashScreen;
