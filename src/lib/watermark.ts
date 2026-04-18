// Adds a "صدى" watermark to a generated image (data URL or http URL)
// Returns a new data URL (PNG) with the watermark stamped in the bottom-right corner.
export async function addSadaWatermark(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imageUrl);

        ctx.drawImage(img, 0, 0);

        // Watermark sizing relative to image
        const minDim = Math.min(canvas.width, canvas.height);
        const fontSize = Math.max(18, Math.round(minDim * 0.05));
        const padding = Math.round(fontSize * 0.7);
        const text = 'صدى';

        ctx.font = `bold ${fontSize}px "Tajawal", "Segoe UI", system-ui, sans-serif`;
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'right';
        ctx.direction = 'rtl';

        const textWidth = ctx.measureText(text).width;
        const boxW = textWidth + padding * 1.4;
        const boxH = fontSize + padding * 0.6;
        const x = canvas.width - padding;
        const y = canvas.height - padding;

        // Semi-transparent rounded background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
        const bx = x - boxW + padding * 0.4;
        const by = y - boxH + padding * 0.1;
        const r = boxH * 0.3;
        ctx.beginPath();
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + boxW - r, by);
        ctx.quadraticCurveTo(bx + boxW, by, bx + boxW, by + r);
        ctx.lineTo(bx + boxW, by + boxH - r);
        ctx.quadraticCurveTo(bx + boxW, by + boxH, bx + boxW - r, by + boxH);
        ctx.lineTo(bx + r, by + boxH);
        ctx.quadraticCurveTo(bx, by + boxH, bx, by + boxH - r);
        ctx.lineTo(bx, by + r);
        ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.closePath();
        ctx.fill();

        // Text with subtle shadow
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = Math.max(2, fontSize * 0.15);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillText(text, x, y - padding * 0.15);

        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        console.error('Watermark error:', e);
        resolve(imageUrl);
      }
    };
    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
}
