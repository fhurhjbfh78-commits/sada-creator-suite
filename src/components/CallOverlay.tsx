import { useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, MonitorUp, PhoneOff, Phone, User } from 'lucide-react';
import { useT } from '@/hooks/useT';
import type useVoiceCall from '@/hooks/useVoiceCall';

type Call = ReturnType<typeof useVoiceCall>;

const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

const CallOverlay = ({ call }: { call: Call }) => {
  const { t } = useT();
  const { state, peer, muted, speakerOn, sharing, seconds, error } = call;

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => call.setError(null), 4000);
    return () => clearTimeout(id);
  }, [error, call]);

  if (state === 'idle') return <audio ref={call.audioElRef} autoPlay className="hidden" />;

  const status =
    state === 'outgoing' ? t('calling')
    : state === 'incoming' ? t('incomingCall')
    : state === 'connecting' ? t('connecting')
    : fmt(seconds);

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-between py-10 px-6 animate-fade-in">
      <audio ref={call.audioElRef} autoPlay className="hidden" />

      <div className="flex flex-col items-center gap-3 mt-6 text-center">
        <div className="w-24 h-24 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center animate-pulse">
          <User className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-xl font-bold truncate max-w-[80vw]">{peer?.name || '...'}</h2>
        <p className="text-sm text-muted-foreground">{status}</p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {sharing && (
        <video ref={call.remoteVideoRef} autoPlay playsInline muted className="hidden" />
      )}
      <video
        ref={call.remoteVideoRef}
        autoPlay
        playsInline
        className="w-full max-w-sm rounded-2xl bg-black/40 max-h-[38vh] object-contain"
      />

      {state === 'incoming' ? (
        <div className="w-full max-w-sm flex items-center justify-around">
          <button
            onClick={call.decline}
            aria-label={t('decline')}
            className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center active:scale-90 transition-transform"
          >
            <PhoneOff className="w-7 h-7 text-destructive-foreground" />
          </button>
          <button
            onClick={call.accept}
            aria-label={t('accept')}
            className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center active:scale-90 transition-transform animate-pulse"
          >
            <Phone className="w-7 h-7 text-white" />
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-5">
          <div className="flex items-center justify-around">
            <button
              onClick={call.toggleMute}
              aria-label={muted ? t('unmute') : t('mute')}
              className={`flex flex-col items-center gap-1 w-16 ${muted ? 'text-destructive' : 'text-foreground'}`}
            >
              <span className={`w-14 h-14 rounded-full flex items-center justify-center border ${muted ? 'bg-destructive/20 border-destructive/50' : 'bg-card/60 border-border/40'}`}>
                {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </span>
              <span className="text-[10px] truncate w-full text-center">{muted ? t('unmute') : t('mute')}</span>
            </button>

            <button
              onClick={call.toggleSpeaker}
              aria-label={t('speaker')}
              className={`flex flex-col items-center gap-1 w-16 ${speakerOn ? 'text-primary' : 'text-foreground'}`}
            >
              <span className={`w-14 h-14 rounded-full flex items-center justify-center border ${speakerOn ? 'bg-primary/20 border-primary/50' : 'bg-card/60 border-border/40'}`}>
                {speakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </span>
              <span className="text-[10px] truncate w-full text-center">{t('speaker')}</span>
            </button>

            <button
              onClick={call.toggleShare}
              aria-label={t('shareScreen')}
              className={`flex flex-col items-center gap-1 w-16 ${sharing ? 'text-primary' : 'text-foreground'}`}
            >
              <span className={`w-14 h-14 rounded-full flex items-center justify-center border ${sharing ? 'bg-primary/20 border-primary/50' : 'bg-card/60 border-border/40'}`}>
                <MonitorUp className="w-6 h-6" />
              </span>
              <span className="text-[10px] truncate w-full text-center">{t('shareScreen')}</span>
            </button>
          </div>

          <button
            onClick={() => call.hangup(true)}
            aria-label={t('endCall')}
            className="w-full py-4 rounded-2xl bg-destructive text-destructive-foreground font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <PhoneOff className="w-5 h-5" /> {t('endCall')}
          </button>
        </div>
      )}
    </div>
  );
};

export default CallOverlay;
