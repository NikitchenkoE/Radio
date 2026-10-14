/**
 * Background Playback & MediaSession Status Modal
 * Informs the user about background playback, screen off listening,
 * and allows toggling Screen Wake Lock (Always On Display) and Lock Screen integration.
 */

import React, { useState, useEffect } from 'react';
import {
  Radio,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Smartphone,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle2,
  X,
  Volume2,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { RadioStation } from '../types';
import {
  enableScreenWakeLock,
  disableScreenWakeLock,
  isWakeLockActive,
  generateStationArtwork,
} from '../utils/backgroundAudio';

interface BackgroundPlaybackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStation: RadioStation;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextStation: () => void;
  onPrevStation: () => void;
  volume: number;
}

export const BackgroundPlaybackModal: React.FC<BackgroundPlaybackModalProps> = ({
  isOpen,
  onClose,
  currentStation,
  isPlaying,
  onTogglePlay,
  onNextStation,
  onPrevStation,
  volume,
}) => {
  const [wakeLockEnabled, setWakeLockEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('radio_wake_lock_enabled') === 'true';
    } catch {
      return false;
    }
  });

  const [wakeLockStatus, setWakeLockStatus] = useState<boolean>(false);
  const [mediaSessionAvailable, setMediaSessionAvailable] = useState<boolean>(false);

  useEffect(() => {
    setMediaSessionAvailable('mediaSession' in navigator);
    setWakeLockStatus(isWakeLockActive());
  }, [isOpen]);

  const handleToggleWakeLock = async () => {
    const next = !wakeLockEnabled;
    setWakeLockEnabled(next);
    try {
      localStorage.setItem('radio_wake_lock_enabled', String(next));
    } catch {}

    if (next) {
      const success = await enableScreenWakeLock();
      setWakeLockStatus(success);
    } else {
      await disableScreenWakeLock();
      setWakeLockStatus(false);
    }
  };

  if (!isOpen) return null;

  const artworkUri = generateStationArtwork(
    currentStation.name,
    currentStation.frequency,
    currentStation.accentColor
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 shadow-2xl shadow-emerald-950/40 flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Фонове відтворення радіо
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Активно 🟢
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Слухайте онлайн-радіо з вимкненим екраном або у фонових вкладках
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Закрити"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[75vh] space-y-4 text-xs">
          {/* Active Live Simulation Card (Lock Screen Widget Preview) */}
          <div className="p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Вигляд на заблокованому екрані (MediaSession)
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold rounded">
                OS LockScreen Ready
              </span>
            </div>

            <div className="flex items-center gap-3.5 p-3 bg-slate-950/90 rounded-lg border border-slate-800">
              <img
                src={artworkUri}
                alt="Station Lockscreen Artwork"
                className="w-14 h-14 rounded-lg object-cover border border-slate-700 shadow-md shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white truncate">
                  {currentStation.name}
                </div>
                <div className="text-xs text-emerald-400 font-medium truncate">
                  {currentStation.frequency || 'Live'} • {currentStation.genre}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  Радіо Слобода • Безперервне мовлення
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onPrevStation}
                  className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                  title="Попередня станція"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onTogglePlay}
                  className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-full transition-colors cursor-pointer shadow-md"
                  title={isPlaying ? 'Пауза' : 'Грати'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={onNextStation}
                  className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                  title="Наступна станція"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Коли ви вимикаєте екран смартфона або згортаєте браузер на комп’ютері,
              трансляція продовжує грати, а віджетом можна керувати прямо з екрану блокування.
            </p>
          </div>

          {/* Features Checklist */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Як це працює:
            </h4>

            <div className="flex items-start gap-2.5 p-2.5 bg-slate-950/60 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Підтримка екрану блокування (MediaSession API)</strong>
                <span className="text-slate-400 text-[11px]">
                  Інтегровано системний плеєр Android, iOS Control Center та Windows/macOS.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 bg-slate-950/60 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Анти-засинання аудіопотоку (Audio Keep-Alive)</strong>
                <span className="text-slate-400 text-[11px]">
                  Браузер не переводить вкладку в режим сну та не перериває онлайн-потік під час блокування або переходу в іншу програму.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 bg-slate-950/60 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Медіа-клавіші на клавіатурі та навушниках</strong>
                <span className="text-slate-400 text-[11px]">
                  Кнопки Play/Pause, Next/Prev на гарнітурі або клавіатурі працюють навіть коли додаток приховано.
                </span>
              </div>
            </div>
          </div>

          {/* Screen WakeLock Setting Option */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 border border-slate-800 text-amber-400">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block text-xs">
                  Запобігати вимкненню екрану (Screen Wake Lock)
                </strong>
                <span className="text-slate-400 text-[11px]">
                  Не давати екрану гаснути під час прослуховування радіо
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleWakeLock}
              className={`px-3 py-1.5 font-bold text-xs border transition-colors cursor-pointer shrink-0 ${
                wakeLockEnabled
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              {wakeLockEnabled ? 'Увімкнено' : 'Вимкнено'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            Фонове аудіо активне за замовчуванням
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer"
          >
            Зрозуміло
          </button>
        </div>
      </div>
    </div>
  );
};
