/**
 * Background Audio & MediaSession API Manager
 * Enables seamless online radio playback in background tabs, locked screens,
 * and lock screen / OS media notification controls (play, pause, next, prev).
 */

import { RadioStation } from '../types';

let wakeLockSentinel: any = null;
let keepAliveAudioContext: AudioContext | null = null;
let keepAliveNode: AudioNode | null = null;

/**
 * Generates an SVG Data URI station lock screen artwork
 */
export function generateStationArtwork(stationName: string, frequency?: string, accentColor = '#004643'): string {
  const cleanName = (stationName || 'Радіо Слобода').replace(/[<>&"']/g, '');
  const cleanFreq = (frequency || 'LIVE').replace(/[<>&"']/g, '');
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0b1329" />
        <stop offset="50%" stop-color="#04202c" />
        <stop offset="100%" stop-color="#004643" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" fill="url(#bg)" rx="64" />
    <circle cx="256" cy="200" r="90" fill="${accentColor}" fill-opacity="0.25" stroke="${accentColor}" stroke-width="6" />
    <circle cx="256" cy="200" r="45" fill="${accentColor}" />
    <!-- Wave rings -->
    <path d="M 120 200 A 136 136 0 0 1 392 200" fill="none" stroke="#e0eec6" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 14" opacity="0.6" />
    <path d="M 80 200 A 176 176 0 0 1 432 200" fill="none" stroke="#f9bc60" stroke-width="5" stroke-linecap="round" stroke-dasharray="8 12" opacity="0.75" />
    <!-- Frequency Badge -->
    <rect x="180" y="310" width="152" height="38" rx="8" fill="#f9bc60" />
    <text x="256" y="335" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="900" fill="#001e1d" text-anchor="middle" letter-spacing="2">${cleanFreq}</text>
    <!-- Station Title -->
    <text x="256" y="390" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" fill="#fffffe" text-anchor="middle">${cleanName.slice(0, 22)}</text>
    <text x="256" y="430" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#abd1c6" text-anchor="middle">РАДІО СЛОБОДА • ЕФІР</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Updates navigator.mediaSession metadata and playback state
 */
export function updateMediaSession(params: {
  station: RadioStation;
  isPlaying: boolean;
  trackTitle?: string;
  trackArtist?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onStop?: () => void;
}) {
  if (
    typeof window === 'undefined' ||
    !('mediaSession' in navigator) ||
    typeof MediaMetadata === 'undefined'
  ) {
    return;
  }

  try {
    const { station, isPlaying, trackTitle, trackArtist, onPlay, onPause, onPrev, onNext, onStop } = params;

    const artworkUrl = generateStationArtwork(station.name, station.frequency, station.accentColor);

    navigator.mediaSession.metadata = new MediaMetadata({
      title: trackTitle || station.name,
      artist: trackArtist || station.tagline || 'Онлайн радіо Слобода',
      album: `${station.name} (${station.frequency || 'Live'})`,
      artwork: [
        { src: artworkUrl, sizes: '96x96', type: 'image/svg+xml' },
        { src: artworkUrl, sizes: '128x128', type: 'image/svg+xml' },
        { src: artworkUrl, sizes: '192x192', type: 'image/svg+xml' },
        { src: artworkUrl, sizes: '256x256', type: 'image/svg+xml' },
        { src: artworkUrl, sizes: '384x384', type: 'image/svg+xml' },
        { src: artworkUrl, sizes: '512x512', type: 'image/svg+xml' },
      ],
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    // Register media control actions
    if (onPlay) {
      navigator.mediaSession.setActionHandler('play', onPlay);
    }
    if (onPause) {
      navigator.mediaSession.setActionHandler('pause', onPause);
    }
    if (onPrev) {
      navigator.mediaSession.setActionHandler('previoustrack', onPrev);
    }
    if (onNext) {
      navigator.mediaSession.setActionHandler('nexttrack', onNext);
    }
    if (onStop) {
      navigator.mediaSession.setActionHandler('stop', onStop);
    }
  } catch (err) {
    console.debug('MediaSession update warning:', err);
  }
}

/**
 * Screen WakeLock API: keeps screen alive if enabled by user
 */
export async function enableScreenWakeLock(): Promise<boolean> {
  if (!('wakeLock' in navigator)) return false;
  try {
    if (wakeLockSentinel && !wakeLockSentinel.released) {
      return true;
    }
    wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null;
    });
    return true;
  } catch (err) {
    console.debug('WakeLock request failed or disallowed:', err);
    return false;
  }
}

export async function disableScreenWakeLock(): Promise<void> {
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch {}
    wakeLockSentinel = null;
  }
}

export function isWakeLockActive(): boolean {
  return Boolean(wakeLockSentinel && !wakeLockSentinel.released);
}

/**
 * Web Audio Silent Keep-Alive loop
 * Ensures mobile browsers don't suspend the audio pipeline when the tab is blurred or locked
 */
export function startAudioKeepAlive() {
  if (keepAliveAudioContext) return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    keepAliveAudioContext = new AudioCtx();
    
    // Create an inaudible buffer oscillator (0.00001 gain)
    const oscillator = keepAliveAudioContext.createOscillator();
    const gainNode = keepAliveAudioContext.createGain();
    gainNode.gain.value = 0.00001; // virtually silent, but keeps the audio thread alive
    
    oscillator.connect(gainNode);
    gainNode.connect(keepAliveAudioContext.destination);
    oscillator.start();
    keepAliveNode = oscillator;

    if (keepAliveAudioContext.state === 'suspended') {
      keepAliveAudioContext.resume().catch(() => {});
    }
  } catch (e) {
    console.debug('Silent keepalive warning:', e);
  }
}

export function stopAudioKeepAlive() {
  try {
    if (keepAliveNode) {
      (keepAliveNode as any).stop?.();
      keepAliveNode = null;
    }
    if (keepAliveAudioContext) {
      keepAliveAudioContext.close().catch(() => {});
      keepAliveAudioContext = null;
    }
  } catch {}
}
