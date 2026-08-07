import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type CallState = 'idle' | 'outgoing' | 'incoming' | 'connecting' | 'active' | 'ended';

interface Signal {
  type: 'offer' | 'answer' | 'ice' | 'hangup';
  from: string;
  fromName?: string;
  payload?: any;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ],
};

/**
 * Peer-to-peer voice calling over WebRTC, signalled through Realtime broadcast.
 * Each user listens on `user-call-<uid>`; signals are pushed to the peer's channel.
 */
export const useVoiceCall = (userId: string | undefined, myName = '') => {
  const [state, setState] = useState<CallState>('idle');
  const [peer, setPeer] = useState<{ id: string; name: string } | null>(null);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const inChannelRef = useRef<RealtimeChannel | null>(null);
  const outChannelRef = useRef<RealtimeChannel | null>(null);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const videoSenderRef = useRef<RTCRtpSender | null>(null);
  const stateRef = useRef<CallState>('idle');
  stateRef.current = state;

  // ---- signalling helpers -------------------------------------------------
  const sendTo = useCallback(async (peerId: string, sig: Omit<Signal, 'from'>) => {
    if (!userId) return;
    let ch = outChannelRef.current;
    if (!ch || (ch as any).topic !== `realtime:user-call-${peerId}`) {
      if (ch) supabase.removeChannel(ch);
      ch = supabase.channel(`user-call-${peerId}`, { config: { broadcast: { ack: false } } });
      outChannelRef.current = ch;
      await new Promise<void>((resolve) => {
        ch!.subscribe((status) => { if (status === 'SUBSCRIBED') resolve(); });
        setTimeout(resolve, 2500);
      });
    }
    await ch.send({ type: 'broadcast', event: 'signal', payload: { ...sig, from: userId, fromName: myName } });
  }, [userId, myName]);

  // ---- teardown -----------------------------------------------------------
  const cleanup = useCallback(() => {
    try { pcRef.current?.getSenders().forEach((s) => s.track?.stop()); } catch { /* noop */ }
    try { pcRef.current?.close(); } catch { /* noop */ }
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    remoteStreamRef.current = null;
    videoSenderRef.current = null;
    pendingOfferRef.current = null;
    pendingIceRef.current = [];
    if (audioElRef.current) { audioElRef.current.srcObject = null; }
    setMuted(false);
    setSharing(false);
    setSeconds(0);
  }, []);

  const hangup = useCallback((notify = true) => {
    const p = peer;
    if (notify && p) sendTo(p.id, { type: 'hangup' });
    cleanup();
    setPeer(null);
    setState('idle');
  }, [peer, sendTo, cleanup]);

  // ---- peer connection ----------------------------------------------------
  const createPc = useCallback(async (peerId: string) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      video: false,
    });
    localStreamRef.current = stream;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;
    stream.getAudioTracks().forEach((tr) => pc.addTrack(tr, stream));
    // reserve a video slot so screen sharing can start mid-call
    videoSenderRef.current = pc.addTransceiver('video', { direction: 'sendrecv' }).sender;

    const remote = new MediaStream();
    remoteStreamRef.current = remote;

    pc.ontrack = (e) => {
      e.streams[0]?.getTracks().forEach((tr) => {
        if (!remote.getTracks().includes(tr)) remote.addTrack(tr);
      });
      if (audioElRef.current) {
        audioElRef.current.srcObject = remote;
        audioElRef.current.play().catch(() => {});
      }
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) sendTo(peerId, { type: 'ice', payload: e.candidate.toJSON() });
    };
    pc.onconnectionstatechange = () => {
      const cs = pc.connectionState;
      if (cs === 'connected') setState('active');
      if (cs === 'failed' || cs === 'closed') {
        setError('انقطع الاتصال');
        cleanup(); setPeer(null); setState('idle');
      }
    };
    return pc;
  }, [sendTo, cleanup]);

  const startCall = useCallback(async (peerId: string, peerName: string) => {
    if (!userId || stateRef.current !== 'idle') return;
    setError(null);
    setPeer({ id: peerId, name: peerName });
    setState('outgoing');
    try {
      const pc = await createPc(peerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendTo(peerId, { type: 'offer', payload: offer });
    } catch (e: any) {
      setError(e?.name === 'NotAllowedError' ? 'يجب السماح بالوصول للميكروفون' : 'تعذّر بدء المكالمة');
      cleanup(); setPeer(null); setState('idle');
    }
  }, [userId, createPc, sendTo, cleanup]);

  const accept = useCallback(async () => {
    const offer = pendingOfferRef.current;
    const p = peer;
    if (!offer || !p) return;
    setState('connecting');
    try {
      const pc = await createPc(p.id);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      for (const c of pendingIceRef.current) { try { await pc.addIceCandidate(c); } catch { /* noop */ } }
      pendingIceRef.current = [];
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await sendTo(p.id, { type: 'answer', payload: answer });
      pendingOfferRef.current = null;
    } catch (e: any) {
      setError(e?.name === 'NotAllowedError' ? 'يجب السماح بالوصول للميكروفون' : 'تعذّر قبول المكالمة');
      cleanup(); setPeer(null); setState('idle');
    }
  }, [peer, createPc, sendTo, cleanup]);

  const decline = useCallback(() => {
    if (peer) sendTo(peer.id, { type: 'hangup' });
    pendingOfferRef.current = null;
    cleanup(); setPeer(null); setState('idle');
  }, [peer, sendTo, cleanup]);

  // ---- in-call controls ---------------------------------------------------
  const toggleMute = useCallback(() => {
    const tracks = localStreamRef.current?.getAudioTracks() || [];
    const next = !muted;
    tracks.forEach((t) => { t.enabled = !next; });
    setMuted(next);
  }, [muted]);

  const toggleSpeaker = useCallback(async () => {
    const el = audioElRef.current as any;
    const next = !speakerOn;
    setSpeakerOn(next);
    if (el?.setSinkId) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const out = devices.filter((d) => d.kind === 'audiooutput');
        const target = next
          ? out.find((d) => /speaker/i.test(d.label)) || out.find((d) => d.deviceId === 'default')
          : out.find((d) => /earpiece|receiver/i.test(d.label)) || out.find((d) => d.deviceId === 'default');
        if (target) await el.setSinkId(target.deviceId);
      } catch { /* not supported — volume fallback below */ }
    }
    if (el) el.volume = next ? 1 : 0.55;
  }, [speakerOn]);

  const toggleShare = useCallback(async () => {
    const sender = videoSenderRef.current;
    if (!sender) return;
    if (sharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      try { await sender.replaceTrack(null); } catch { /* noop */ }
      setSharing(false);
      return;
    }
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = s;
      const track = s.getVideoTracks()[0];
      track.onended = () => {
        screenStreamRef.current = null;
        sender.replaceTrack(null).catch(() => {});
        setSharing(false);
      };
      await sender.replaceTrack(track);
      setSharing(true);
    } catch {
      setError('تعذّرت مشاركة الشاشة على هذا الجهاز');
    }
  }, [sharing]);

  // ---- incoming signals ---------------------------------------------------
  useEffect(() => {
    if (!userId) return;
    const ch = supabase.channel(`user-call-${userId}`, { config: { broadcast: { ack: false } } });
    inChannelRef.current = ch;
    ch.on('broadcast', { event: 'signal' }, async ({ payload }) => {
      const sig = payload as Signal;
      if (!sig || sig.from === userId) return;
      const pc = pcRef.current;

      if (sig.type === 'offer') {
        if (stateRef.current !== 'idle') { sendTo(sig.from, { type: 'hangup' }); return; }
        pendingOfferRef.current = sig.payload;
        pendingIceRef.current = [];
        setPeer({ id: sig.from, name: sig.fromName || 'مستخدم' });
        setState('incoming');
        return;
      }
      if (sig.type === 'answer') {
        if (!pc) return;
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sig.payload));
          for (const c of pendingIceRef.current) { try { await pc.addIceCandidate(c); } catch { /* noop */ } }
          pendingIceRef.current = [];
          setState('connecting');
        } catch { /* noop */ }
        return;
      }
      if (sig.type === 'ice') {
        if (pc && pc.remoteDescription) { try { await pc.addIceCandidate(sig.payload); } catch { /* noop */ } }
        else pendingIceRef.current.push(sig.payload);
        return;
      }
      if (sig.type === 'hangup') {
        cleanup(); setPeer(null); setState('idle');
      }
    }).subscribe();

    return () => {
      supabase.removeChannel(ch);
      inChannelRef.current = null;
      if (outChannelRef.current) { supabase.removeChannel(outChannelRef.current); outChannelRef.current = null; }
    };
  }, [userId, sendTo, cleanup]);

  // ---- call timer ---------------------------------------------------------
  useEffect(() => {
    if (state !== 'active') return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  useEffect(() => () => cleanup(), [cleanup]);

  return {
    state, peer, muted, speakerOn, sharing, seconds, error, setError,
    startCall, accept, decline, hangup, toggleMute, toggleSpeaker, toggleShare,
    audioElRef, remoteVideoRef,
  };
};

export default useVoiceCall;
