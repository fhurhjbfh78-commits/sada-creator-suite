import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const SplashScreen = () => {
  const [showLogo, setShowLogo] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigatedRef = useRef(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
    for (let i = 0; i < 400; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5,
        speed: Math.random() * 0.8 + 0.1,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const logoTimer = setTimeout(() => setShowLogo(true), 250);
    const interval = setInterval(() => {
      setProgress((p) => Math.min(100, p + 4));
    }, 50);
    return () => {
      clearTimeout(logoTimer);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (progress < 100 || loading || navigatedRef.current) return;
    navigatedRef.current = true;
    navigate(user ? '/chat' : '/login', { replace: true });
  }, [loading, navigate, progress, user]);

  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center relative overflow-hidden" style={{ background: '#020617' }}>
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Developer credit - top left */}
      <p
        className={`absolute top-4 left-4 text-xs transition-all duration-700 delay-300 ${showLogo ? 'opacity-60' : 'opacity-0'}`}
        style={{ fontFamily: 'Tajawal, serif', color: '#fbbf24' }}
      >
        تطوير: عبدالله لازم
      </p>

      {/* Logo */}
      <div className={`relative z-10 transition-all duration-[2000ms] ease-out ${showLogo ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'}`}>
        <h1
          className="text-8xl font-black mb-4"
          style={{
            fontFamily: 'Tajawal, serif',
            color: '#fbbf24',
            textShadow: '0 0 60px rgba(251,191,36,0.6), 0 0 120px rgba(251,191,36,0.3), 0 4px 20px rgba(0,0,0,0.8)',
          }}
        >
          صدى
        </h1>
      </div>

      <p className={`relative z-10 text-sm mb-10 transition-all duration-700 delay-700 ${showLogo ? 'opacity-70' : 'opacity-0'}`} style={{ color: '#94a3b8' }}>
        Optimizing App...
      </p>

      <div className="relative z-10 w-48 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div
          className="h-full rounded-full transition-all duration-100"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)',
            boxShadow: '0 0 10px rgba(251,191,36,0.5)',
          }}
        />
      </div>

      <div className="relative z-10 mt-4 animate-spin w-5 h-5 border-2 border-slate-600 border-t-amber-400 rounded-full" />
    </div>
  );
};

export default SplashScreen;
