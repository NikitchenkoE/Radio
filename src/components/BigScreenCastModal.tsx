import React, { useState, useEffect } from 'react';
import {
  Tv,
  Cast,
  Maximize2,
  Minimize2,
  X,
  Radio,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  QrCode,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { RadioStation } from '../types';

interface BigScreenCastModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: RadioStation;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrevStation: () => void;
  onNextStation: () => void;
  volume: number;
  isMuted: boolean;
  onChangeVolume: (val: number) => void;
  onToggleMute: () => void;
  nowPlayingTitle?: string;
  nowPlayingArtist?: string;
}

export const BigScreenCastModal: React.FC<BigScreenCastModalProps> = ({
  isOpen,
  onClose,
  station,
  isPlaying,
  onTogglePlay,
  onPrevStation,
  onNextStation,
  volume,
  isMuted,
  onChangeVolume,
  onToggleMute,
  nowPlayingTitle,
  nowPlayingArtist,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [isCastSupported, setIsCastSupported] = useState(false);

  useEffect(() => {
    // Check if Remote Playback API is available
    if ('remote' in HTMLMediaElement.prototype) {
      setIsCastSupported(true);
    }

    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleNativeCast = () => {
    const audio = document.querySelector('audio');
    if (audio && (audio as any).remote) {
      (audio as any).remote.prompt().catch((err: any) => {
        console.debug('Cast prompt notice:', err);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col text-white select-none animate-in fade-in duration-200 overflow-hidden">
      {/* Top Bar for Big Screen */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800 bg-zinc-950/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-wider uppercase text-zinc-200">
              Трансляція на Великий Екран (Big Screen Mode)
            </h2>
            <p className="text-xs text-zinc-400">
              Оптимізовано для телевізорів, проєкторів та колонок AirPlay / Cast
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Native Cast button */}
          <button
            type="button"
            onClick={handleNativeCast}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold transition-colors cursor-pointer border border-zinc-700"
            title="Підключити бездротову колонку або Smart TV"
          >
            <Cast className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Chromecast / AirPlay</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Повноекранний режим телевізора"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Вийти з режиму ТВ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Center Area: Ambient visualizer backdrop, huge station badge, now playing */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 gap-8 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-emerald-500/5 to-transparent pointer-events-none" />

        {/* Left / Center Info */}
        <div className="flex-1 z-10 space-y-6 max-w-2xl">
          {/* Station Badge & Frequency */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/40 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>НАЖИВО В ЕФІРІ</span>
            </span>

            {station.frequency && (
              <span className="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono font-bold text-amber-400">
                {station.frequency}
              </span>
            )}

            <span className="text-xs text-zinc-400 font-medium">
              {station.city || 'Україна'} · {station.genre}
            </span>
          </div>

          {/* Huge Station Name */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white drop-shadow-md">
            {station.name}
          </h1>

          {/* Now Playing Song Banner */}
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md space-y-2 shadow-xl">
            <div className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ЗАРАЗ ЗВУЧИТЬ В ЕФІРІ</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white truncate">
              {nowPlayingTitle ? `«${nowPlayingTitle}»` : station.name}
            </div>
            {nowPlayingArtist && (
              <div className="text-base sm:text-xl text-zinc-300 font-semibold truncate">
                — {nowPlayingArtist}
              </div>
            )}
          </div>

          {/* Animated Wave Spectrum Bars */}
          <div className="flex items-end gap-1 sm:gap-2 h-16 pt-2">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-emerald-500 to-amber-400 rounded-t-sm transition-all duration-150"
                style={{
                  height: isPlaying ? `${Math.max(15, (Math.sin(i * 0.4 + Date.now() * 0.002) + 1) * 45)}%` : '6%',
                  opacity: isPlaying ? 0.9 : 0.2,
                }}
              />
            ))}
          </div>
        </div>

        {/* Right Info: Digital Clock & QR Code Mobile Remote */}
        <div className="z-10 flex flex-col items-center lg:items-end justify-between gap-6 shrink-0">
          {/* Big Digital Clock */}
          <div className="text-right">
            <div className="text-5xl sm:text-7xl font-mono font-black tracking-tight text-zinc-100">
              {timeStr}
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mt-1">
              КИЇВСЬКИЙ ЧАС
            </div>
          </div>

          {/* Mobile Remote QR Card */}
          <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex flex-col items-center text-center max-w-[200px] shadow-lg">
            <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center shadow-inner">
              <QrCode className="w-20 h-20 text-black" />
            </div>
            <span className="text-xs font-bold text-zinc-200 mt-2.5">
              Керування з телефону
            </span>
            <span className="text-[10px] text-zinc-400 mt-0.5">
              Скануйте камерою для вибору треків
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="p-4 sm:p-6 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-4">
        {/* Prev / Play / Next */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPrevStation}
            className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-colors cursor-pointer"
            title="Попередня станція"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            className="p-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-black transition-colors cursor-pointer shadow-lg"
            title={isPlaying ? 'Пауза' : 'Відтворити'}
          >
            {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={onNextStation}
            className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-colors cursor-pointer"
            title="Наступна станція"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 max-w-xs w-full">
          <button
            type="button"
            onClick={onToggleMute}
            className="p-2 text-zinc-400 hover:text-white"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => onChangeVolume(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <span className="font-mono text-xs text-zinc-400 w-8 text-right">
            {isMuted ? 0 : volume}%
          </span>
        </div>
      </div>
    </div>
  );
};
