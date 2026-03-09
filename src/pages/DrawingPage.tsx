import { useRef, useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Pen, Eraser } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';

const COLORS = ['#000000', '#EF4444', '#3B82F6', '#22D3EE'];

const DrawingPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { saveDrawing, profile } = useAppStore();
  const [color, setColor] = useState(COLORS[2]);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
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
    if (dataUrl) saveDrawing(dataUrl);
  };

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title="رسم يدوي" />

      <div className="flex-1 px-4 py-3 flex flex-col min-h-0">
        <div className="glass-card p-3 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs">Sada</span>
            <span className="text-lg font-black">صَدي</span>
          </div>
          <div ref={containerRef} className="flex-1 rounded-xl overflow-hidden min-h-0">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair touch-none"
              style={{ backgroundColor: '#FFFFFF' }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-xs font-black">صَدي</span>
            <span className="text-xs text-muted-foreground">{profile.name}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex-shrink-0 mx-4 mb-2 glass-card p-3 flex items-center justify-between">
        <button onClick={handleSave} className="glow-btn px-5 py-2 text-sm active:scale-95 transition-transform">حفظ</button>
        <div className="flex items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setIsEraser(false); }}
              className="w-6 h-6 rounded-full border-2 transition-all active:scale-90"
              style={{
                backgroundColor: c,
                borderColor: color === c && !isEraser ? 'hsl(195, 100%, 50%)' : 'transparent',
              }}
            />
          ))}
        </div>
        <div className="flex gap-1">
          <button onClick={() => setIsEraser(true)} className={`p-2 rounded-lg active:scale-90 transition-transform ${isEraser ? 'bg-primary/20' : ''}`}>
            <Eraser className="w-5 h-5 text-foreground" />
          </button>
          <button onClick={() => setIsEraser(false)} className={`p-2 rounded-lg active:scale-90 transition-transform ${!isEraser ? 'bg-primary/20' : ''}`}>
            <Pen className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default DrawingPage;
