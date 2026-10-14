/**
 * Signal Quality & Smart Audio Buffer Monitor
 * Tracks buffer health, network quality, and provides Smart Road Buffer mode for car trips
 */

export type SignalQualityLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'buffering';

export interface SignalStatus {
  level: SignalQualityLevel;
  bars: number; // 1 to 5
  bufferSeconds: number;
  label: string;
  networkType: string;
  isRoadBufferActive: boolean;
}

const ROAD_BUFFER_STORAGE_KEY = 'slobo_smart_road_buffer_enabled';

export function isSmartRoadBufferSaved(): boolean {
  try {
    return localStorage.getItem(ROAD_BUFFER_STORAGE_KEY) === 'true';
  } catch {
    return true; // enabled by default for stability
  }
}

export function saveSmartRoadBuffer(enabled: boolean) {
  try {
    localStorage.setItem(ROAD_BUFFER_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {}
}

/**
 * Calculates current buffered seconds ahead of currentTime in audio element
 */
export function getBufferedSecondsAhead(audio: HTMLAudioElement | null): number {
  if (!audio || !audio.buffered || audio.buffered.length === 0) return 0;
  try {
    const cur = audio.currentTime;
    for (let i = 0; i < audio.buffered.length; i++) {
      const start = audio.buffered.start(i);
      const end = audio.buffered.end(i);
      if (cur >= start && cur <= end) {
        return Math.max(0, end - cur);
      }
    }
  } catch {}
  return 0;
}

/**
 * Inspects network connection type
 */
export function getNetworkInfo(): { type: string; downlink: number } {
  const nav = navigator as any;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  if (conn) {
    const effectiveType = conn.effectiveType ? conn.effectiveType.toUpperCase() : 'ONLINE';
    const downlink = conn.downlink || 5;
    return { type: effectiveType, downlink };
  }
  return { type: navigator.onLine ? '4G/WIFI' : 'OFFLINE', downlink: 10 };
}

/**
 * Evaluates signal quality from audio element and network state
 */
export function evaluateSignalStatus(
  audio: HTMLAudioElement | null,
  isBuffering: boolean,
  isRoadBufferActive: boolean
): SignalStatus {
  if (!navigator.onLine) {
    return {
      level: 'poor',
      bars: 1,
      bufferSeconds: 0,
      label: 'Немає зв’язку (Офлайн)',
      networkType: 'ОФЛАЙН',
      isRoadBufferActive,
    };
  }

  const { type: netType } = getNetworkInfo();
  const bufferSec = getBufferedSecondsAhead(audio);

  if (isBuffering || (audio && audio.seeking)) {
    return {
      level: 'buffering',
      bars: 1,
      bufferSeconds: bufferSec,
      label: 'Буферизація потоку...',
      networkType: netType,
      isRoadBufferActive,
    };
  }

  if (bufferSec >= 12 || (netType.includes('4G') && bufferSec >= 6)) {
    return {
      level: 'excellent',
      bars: 5,
      bufferSeconds: Math.round(bufferSec),
      label: `Відмінний зв’язок (${netType})`,
      networkType: netType,
      isRoadBufferActive,
    };
  }

  if (bufferSec >= 5 || (netType.includes('3G') && bufferSec >= 3)) {
    return {
      level: 'good',
      bars: 4,
      bufferSeconds: Math.round(bufferSec),
      label: `Стабільний зв’язок (${netType})`,
      networkType: netType,
      isRoadBufferActive,
    };
  }

  if (bufferSec >= 2) {
    return {
      level: 'fair',
      bars: 3,
      bufferSeconds: Math.round(bufferSec),
      label: `Помірний сигнал (${netType})`,
      networkType: netType,
      isRoadBufferActive,
    };
  }

  return {
    level: 'poor',
    bars: 2,
    bufferSeconds: Math.round(bufferSec),
    label: `Слабкий сигнал • Захист увімкнено`,
    networkType: netType,
    isRoadBufferActive,
  };
}
