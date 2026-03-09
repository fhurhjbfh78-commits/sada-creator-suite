import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { ChevronRight, Menu, Pen, Eraser } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const COLORS = ['#000000', '#EF4444', '#3B82F6', '#22D3EE'];

const DrawingPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { saveDrawing, profile } = useAppStore();
  const navigate = useNavigate();
  const [color, setColor] = useState(COLORS[2]);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.strokeStyle = isEraser ? '#FFFFFF' : color;
    ctx.lineWidth = isEraser ? 20 : 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => setIsDrawing(false);

  const handleSave = () => {
    const dataUrl = canvasRef.current?.toDataURL();
    if (dataUrl) {
      saveDrawing(dataUrl);
      navigate('/chat');
    }
  };

  return (
    <div className="flex flex-col h-screen gradient-bg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <button><Menu className="w-5 h-5 text-foreground" /></button>
        <h1 className="text-xl font-bold">رسم يدوي</h1>
        <button onClick={() => navigate(-1)}><ChevronRight className="w-5 h-5 text-foreground" /></button>
      </div>

      <div className="flex-1 px-4 py-4">
        <div className="glass-card p-3 h-full flex flex-col">
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-sm">Sada</span>
            <span className="text-lg font-black">صَدي</span>
          </div>
          <canvas
            ref={canvasRef}
            className="flex-1 rounded-xl bg-foreground cursor-crosshair touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          <div className="flex items-center justify-between mt-2 px-2">
            <span className="text-xs font-black">صَدي</span>
            <span className="text-xs text-muted-foreground">{profile.name}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mx-4 mb-4 glass-card p-3 flex items-center justify-between">
        <button onClick={handleSave} className="glow-btn px-6 py-2 text-sm">حفظ</button>
        <div className="flex items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setIsEraser(false); }}
              className="w-7 h-7 rounded-full border-2 transition-all"
              style={{
                backgroundColor: c,
                borderColor: color === c && !isEraser ? 'hsl(195, 100%, 50%)' : 'transparent',
              }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEraser(true)}
            className={`p-2 rounded-lg ${isEraser ? 'bg-primary/20' : ''}`}
          >
            <Eraser className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={() => setIsEraser(false)}
            className={`p-2 rounded-lg ${!isEraser ? 'bg-primary/20' : ''}`}
          >
            <Pen className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default DrawingPage;
