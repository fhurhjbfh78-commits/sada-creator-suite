import { useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useStorageUrl } from '@/lib/storageUrl';

interface Props {
  src: string | null;
  onClose: () => void;
}

const ImageLightbox = ({ src: rawSrc, onClose }: Props) => {
  const src = useStorageUrl(rawSrc);

  useEffect(() => {
    if (!rawSrc) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rawSrc, onClose]);

  if (!rawSrc || !src) return null;


  const download = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sada-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('تم التنزيل');
    } catch {
      const a = document.createElement('a');
      a.href = src;
      a.download = `sada-${Date.now()}.png`;
      a.target = '_blank';
      a.click();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
        <button onClick={onClose} className="w-9 h-9 rounded-full glass-card flex items-center justify-center active:scale-90">
          <X className="w-4 h-4 text-foreground" />
        </button>
        <button onClick={download} className="w-9 h-9 rounded-full glass-card flex items-center justify-center active:scale-90">
          <Download className="w-4 h-4 text-primary" />
        </button>
      </div>
      <img
        src={src}
        alt="عرض الصورة"
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-[90dvh] object-contain rounded-2xl"
      />
    </div>
  );
};

export default ImageLightbox;
