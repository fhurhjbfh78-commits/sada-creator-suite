import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
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
    <div className="flex min-h-screen flex-col items-center justify-center gradient-bg px-6">
      <h1 className="text-8xl font-black text-foreground mb-4" style={{ fontFamily: 'Tajawal, serif' }}>
        صَدي
      </h1>
      <p className="text-muted-foreground text-lg mb-12">تطور : عبدالله لازم</p>
      <div className="w-48 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-4 animate-spin w-5 h-5 border-2 border-muted-foreground border-t-primary rounded-full" />
    </div>
  );
};

export default SplashScreen;
