import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Radio,
  X,
  Wifi,
  ShieldCheck,
  Clock,
  Tv,
  Plus,
  Minus,
  Maximize2,
  Heart,
} from 'lucide-react';
import { RadioStation, PlaybackStatus } from '../types';
import { SignalStatus } from '../utils/signalBufferMonitor';
import { enableScreenWakeLock, disableScreenWakeLock } from '../utils/backgroundAudio';

interface CarDriverModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: RadioStation;
  playbackStatus: PlaybackStatus;
  onTogglePlay: () => void;
  onPrevStation: () => void;
  onNextStation: () => void;
  volume: number;
  isMuted: boolean;
  onChangeVolume: (val: number) => void;
  onToggleMute: () => void;
  allStations: RadioStation[];
  onSelectStation: (st: RadioStation) => void;
  signalStatus: SignalStatus;
  onToggleRoadBuffer: () => void;
  onSwitchToVideoHub?: () => void;
}

export const CarDriverModeModal: React.FC<CarDriverModeModalProps> = ({
  isOpen,
  onClose,
  station,
  playbackStatus,
  onTogglePlay,
  onPrevStation,
  onNextStation,
  volume,
  isMuted,
  onChangeVolume,
  onToggleMute,
  allStations,
  onSelectStation,
  signalStatus,
  onToggleRoadBuffer,
  onSwitchToVideoHub,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  // Keep screen on while in Car Mode
  useEffect(() => {
    if (isOpen) {
      enableScreenWakeLock();
      const updateClock = () => {
        const d = new Date();
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        setCurrentTime(`${hh}:${mm}:${ss}`);
      };
      updateClock();
      const clockInterval = setInterval(updateClock, 1000);
      return () => {
        clearInterval(clockInterval);
        disableScreenWakeLock();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isPlaying = playbackStatus === 'playing';

  // 6 Quick Preset Stations (Presets 1 to 6)
  const presetStationIds = [
    'army-fm',
    'radio-bayraktar',
    'hit-fm',
    'radio-roks',
    'kiss-fm',
    'radio-relax',
  ];

  const presetStations = presetStationIds
    .map((id) => allStations.find((s) => s.id === id))
    .filter((s): s is RadioStation => s !== undefined);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden animate-in fade-in duration-200">
      {/* Top Cockpit Header: Exit, Digital Clock & Signal Status */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        {/* Exit Car Mode */}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 active:bg-zinc-800 hover:bg-zinc-800 border border-zinc-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition-colors"
          title="Вийти з автомобільного режиму"
        >
          <X className="w-5 h-5 text-red-400" />
          <span>Вихід</span>
        </button>

        {/* Digital Dashboard Clock */}
        <div className="flex items-center gap-2 font-mono text-xl sm:text-2xl font-black text-amber-400 tracking-wider">
          <Clock className="w-5 h-5" />
          <span>{currentTime}</span>
        </div>

        {/* Signal & Smart Road Buffer Badge */}
        <button
          type="button"
          onClick={onToggleRoadBuffer}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
            signalStatus.isRoadBufferActive
              ? 'bg-emerald-950/80 border-emerald-600 text-emerald-400'
              : 'bg-zinc-900 border-zinc-700 text-zinc-400'
          }`}
          title="Розумний буфер для траси та лісосмуг"
        >
          <Wifi className="w-4 h-4" />
          <span className="hidden sm:inline">Буфер траси:</span>
          <span>{signalStatus.isRoadBufferActive ? 'Увімк' : 'Вимк'}</span>
        </button>
      </div>

      {/* Center Display: Station Name, City, Frequency */}
      <div className="my-auto text-center space-y-2 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>{station.city || 'Україна'} • {station.genre}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white line-clamp-1 drop-shadow-md">
          {station.name}
        </h1>

        <div className="text-xl sm:text-2xl font-mono font-bold text-amber-400">
          {station.frequency || 'ONLINE FM'}
        </div>
      </div>

      {/* Massive Driver Controls: Prev, Play/Pause, Next */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 my-4">
        {/* Previous Station (Huge 72px) */}
        <button
          type="button"
          onClick={onPrevStation}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900 active:bg-zinc-800 hover:bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
          title="Попередня станція"
        >
          <SkipBack className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
        </button>

        {/* Play/Pause (Massive 96px Primary) */}
        <button
          type="button"
          onClick={onTogglePlay}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#004643] active:bg-[#003835] hover:bg-[#005a56] border-4 border-emerald-400/40 flex items-center justify-center text-white shadow-2xl transition-transform active:scale-95 cursor-pointer"
          title={isPlaying ? 'Пауза' : 'Відтворити'}
        >
          {isPlaying ? (
            <Pause className="w-12 h-12 sm:w-14 sm:h-14 fill-current" />
          ) : (
            <Play className="w-12 h-12 sm:w-14 sm:h-14 fill-current ml-1.5" />
          )}
        </button>

        {/* Next Station (Huge 72px) */}
        <button
          type="button"
          onClick={onNextStation}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900 active:bg-zinc-800 hover:bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
          title="Наступна станція"
        >
          <SkipForward className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
        </button>
      </div>

      {/* Massive Volume Touch Bar */}
      <div className="max-w-xl mx-auto w-full bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMute}
          className="p-3 bg-zinc-900 active:bg-zinc-800 rounded-xl text-white cursor-pointer"
          title="Без звуку"
        >
          {isMuted || volume === 0 ? <VolumeX className="w-6 h-6 text-red-400" /> : <Volume2 className="w-6 h-6 text-emerald-400" />}
        </button>

        {/* Volume Step -10% */}
        <button
          type="button"
          onClick={() => onChangeVolume(Math.max(0, volume - 0.1))}
          className="p-3 bg-zinc-900 active:bg-zinc-800 rounded-xl text-white font-black text-lg cursor-pointer"
        >
          <Minus className="w-5 h-5" />
        </button>

        {/* Big Range Slider */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
          className="flex-1 h-3 bg-zinc-800 rounded-lg appearance-none accent-[#004643] cursor-pointer"
        />

        {/* Volume Step +10% */}
        <button
          type="button"
          onClick={() => onChangeVolume(Math.min(1, volume + 0.1))}
          className="p-3 bg-zinc-900 active:bg-zinc-800 rounded-xl text-white font-black text-lg cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>

        <span className="font-mono text-sm font-bold text-zinc-300 w-12 text-right">
          {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
        </span>
      </div>

      {/* Car Radio 6 Quick Preset Buttons (1 to 6) */}
      <div className="mt-4 pt-3 border-t border-zinc-800">
        <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 text-center">
          Швидка пам’ять магнітоли (1 — 6)
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-w-4xl mx-auto w-full">
          {presetStations.map((preset, idx) => {
            const isCurrent = station.id === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectStation(preset)}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#004643] border-emerald-400 text-white font-black shadow-lg scale-102 ring-2 ring-emerald-400/50'
                    : 'bg-zinc-900 active:bg-zinc-800 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                }`}
              >
                <span className="text-[10px] font-mono text-amber-400 font-bold">
                  [{idx + 1}]
                </span>
                <span className="text-xs font-bold truncate max-w-full mt-0.5">
                  {preset.name.replace('Радіо ', '')}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {preset.frequency || 'FM'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
