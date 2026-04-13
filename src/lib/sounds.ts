// Web Audio API sound effects for app navigation
const audioCtx = () => {
  if (!(window as any).__sadaAudioCtx) {
    (window as any).__sadaAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return (window as any).__sadaAudioCtx as AudioContext;
};

const playTone = (freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) => {
  try {
    const ctx = audioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
};

// Sound 1: Navigation click (used for all section navigation)
export const playNavSound = () => playTone(800, 0.1, 'sine', 0.12);

// Sound 2: Send message
export const playSendSound = () => {
  playTone(600, 0.08, 'sine', 0.1);
  setTimeout(() => playTone(900, 0.1, 'sine', 0.1), 80);
};

// Sound 3: Receive / notification
export const playReceiveSound = () => {
  playTone(500, 0.12, 'triangle', 0.12);
  setTimeout(() => playTone(700, 0.15, 'triangle', 0.1), 120);
};

// Sound 4: Success / confirm
export const playSuccessSound = () => {
  playTone(523, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.1), 100);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.1), 200);
};

// Sound 5: Error / warning
export const playErrorSound = () => {
  playTone(300, 0.15, 'square', 0.08);
  setTimeout(() => playTone(250, 0.2, 'square', 0.08), 150);
};
