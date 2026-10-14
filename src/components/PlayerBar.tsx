import React, { useState, useRef, useEffect, useMemo } from 'react';
import { RadioStation, PlaybackStatus } from '../types';
import { getCurrentSongForStation } from '../data/radioScheduleData';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Clock,
  Radio,
  Disc3,
  X,
  SlidersHorizontal,
  CircleDot,
  MoreVertical,
  Music2,
  ChevronUp,
  Mic,
  Smartphone,
  Tv,
  Youtube,
} from 'lucide-react';

interface PlayerBarProps {
  station: RadioStation;
  playbackStatus: PlaybackStatus;
  volume: number;
  isMuted: boolean;
  onTogglePlay: () => void;
  onPrevStation: () => void;
  onNextStation: () => void;
  onChangeVolume: (vol: number) => void;
  onToggleMute: () => void;
  onOpenStudio: () => void;
  onOpenVoiceOverlay?: () => void;
  onOpenBackgroundPlayback?: () => void;
  onOpenSleepTimer: () => void;
  sleepTimerSeconds: number | null;
  isRecording: boolean;
  recordingSeconds: number;
  recordingsCount: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onOpenRecordings: () => void;
  onRetry: () => void;
  onClosePlayer?: () => void;
  className?: string;
  isPersonalBroadcast?: boolean;
  currentTrackTitle?: string;
  playlistName?: string;
  isVideoModeActive?: boolean;
  onExitVideoMode?: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  station,
  playbackStatus,
  volume,
  isMuted,
  onTogglePlay,
  onPrevStation,
  onNextStation,
  onChangeVolume,
  onToggleMute,
  onOpenStudio,
  onOpenVoiceOverlay,
  onOpenBackgroundPlayback,
  onOpenSleepTimer,
  sleepTimerSeconds,
  isRecording,
  recordingSeconds,
  onStartRecording,
  onStopRecording,
  onRetry,
  onClosePlayer,
  className = '',
  isPersonalBroadcast = false,
  currentTrackTitle,
  playlistName,
  isVideoModeActive = false,
  onExitVideoMode,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMobileVolume, setShowMobileVolume] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const mobileVolRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileVolRef.current && !mobileVolRef.current.contains(e.target as Node)) {
        setShowMobileVolume(false);
      }
    };
    if (showMobileVolume) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileVolume]);

  const isPlaying = playbackStatus === 'playing';
  const isLoading = playbackStatus === 'loading';
  const hasError = playbackStatus === 'error';

  // Strict 0.0 - 1.0 volume range for real-time acoustic reactivity
  const normalizedVol = isMuted
    ? 0
    : volume > 1
    ? Math.min(1, Math.max(0, volume / 100))
    : Math.min(1, Math.max(0, volume));

  const liveSong = useMemo(() => {
    if (isPersonalBroadcast) {
      return {
        title: currentTrackTitle || 'Власний аудіотрек',
        artist: playlistName || 'Студія',
      };
    }
    return getCurrentSongForStation(station);
  }, [isPersonalBroadcast, currentTrackTitle, playlistName, station]);

  // Close overflow menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <aside
      id="bottom-player-bar"
      aria-label="Аудіоплеєр прямого ефіру"
      className={`fixed bottom-0 left-0 right-0 z-40 px-2.5 sm:px-6 pb-2 sm:pb-3 pt-1 select-none pointer-events-none ${className}`}
    >
      <div className="max-w-5xl mx-auto pointer-events-auto relative">
        {/* Three Dots Overflow Popover Menu */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute bottom-full right-2 sm:right-4 mb-2 w-64 p-2.5 shadow-2xl card-bg border border-theme animate-in fade-in slide-in-from-bottom-2 duration-150 z-50 text-xs"
          >
            <div className="flex items-center justify-between px-2.5 py-1.5 pb-2 border-b border-theme mb-1">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Опції плеєра
              </span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 border border-theme subtle-bg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Studio / Archive */}
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenStudio();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
              <div className="flex-1 min-w-0">
                <span className="font-bold block">Студія & архів</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  Закачка треків та ефір
                </span>
              </div>
            </button>

            {/* Sleep Timer */}
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenSleepTimer();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left"
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <div className="flex-1 min-w-0">
                <span className="font-bold block">
                  {sleepTimerSeconds !== null
                    ? `Таймер сну: ${formatTimer(sleepTimerSeconds)}`
                    : 'Таймер сну'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  Автоматичне вимкнення
                </span>
              </div>
            </button>

            {/* Recording */}
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                if (isRecording) {
                  onStopRecording();
                } else if (isPlaying) {
                  onStartRecording();
                }
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left"
            >
              <CircleDot
                className={`w-4 h-4 ${
                  isRecording ? 'text-rose-500 animate-pulse' : 'text-rose-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <span className="font-bold block">
                  {isRecording ? `Зупинити запис (${recordingSeconds}с)` : 'Записати фрагмент'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  Зберегти аудіо у файл
                </span>
              </div>
            </button>

            {/* Voice Control Hands-Free */}
            {onOpenVoiceOverlay && (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenVoiceOverlay();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left"
              >
                <Mic className="w-4 h-4 text-emerald-500 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <span className="font-bold block">Голосове керування</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    «наступна», «пауза», «гучніше»
                  </span>
                </div>
              </button>
            )}

            {/* Background Playback & Lock Screen */}
            {onOpenBackgroundPlayback && (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenBackgroundPlayback();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left"
              >
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <div className="flex-1 min-w-0">
                  <span className="font-bold block">Фонове радіо & екран</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    Екран блокування / фоновий режим
                  </span>
                </div>
              </button>
            )}

            {/* Volume slider in menu */}
            <div className="px-3 py-2 border-t border-theme mt-1">
              <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Гучність</span>
                <button
                  type="button"
                  onClick={onToggleMute}
                  className="text-[#004643] dark:text-emerald-400 font-medium"
                >
                  {isMuted || volume === 0 ? 'Без звуку' : `${Math.round(volume * 100)}%`}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleMute}
                  className="text-slate-500 hover:text-slate-300"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 cursor-pointer accent-[#004643]"
                />
              </div>
            </div>

            {/* Close / Minimize */}
            {onClosePlayer && (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onClosePlayer();
                }}
                className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-rose-500 hover:bg-rose-500/10 transition-colors text-left"
              >
                <X className="w-4 h-4" />
                <span className="font-semibold">Згорнути плеєр</span>
              </button>
            )}
          </div>
        )}

        {/* The Clean, Compact Player Bar Card */}
        <div className="player-bg backdrop-blur-xl border border-theme rounded-md shadow-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5 sm:gap-4 transition-all">
          {/* Left: Station info with Thumbnail & Status */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 sm:max-w-xs md:max-w-sm">
            <div
              onClick={isVideoModeActive && onExitVideoMode ? onExitVideoMode : onOpenStudio}
              className={`relative shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-md flex items-center justify-center cursor-pointer shadow-xs transition-all overflow-hidden ${
                isVideoModeActive
                  ? 'bg-red-700 text-white'
                  : 'bg-[#004643] text-white'
              }`}
              style={{
                boxShadow: isPlaying && normalizedVol > 0
                  ? `0 0 ${Math.round(14 * normalizedVol)}px rgba(16, 185, 129, ${0.35 + 0.35 * normalizedVol})`
                  : undefined,
              }}
              title={
                isVideoModeActive
                  ? 'Повернутися до Радіо & Еквалайзера'
                  : `Станція в ефірі (Рівень звуку: ${Math.round(normalizedVol * 100)}%) • Відкрити студію`
              }
            >
              {/* Outer pulsing ring that scales with volume */}
              {isPlaying && normalizedVol > 0 && (
                <span
                  className="absolute inset-0 rounded-md border border-emerald-400 pointer-events-none animate-ping"
                  style={{
                    animationDuration: `${Math.max(0.6, 2.2 - normalizedVol * 1.4)}s`,
                    opacity: 0.2 + normalizedVol * 0.4,
                  }}
                />
              )}

              {isVideoModeActive ? (
                <Tv className="w-5 h-5 text-white animate-pulse" />
              ) : isPlaying ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Subtle rotating vinyl backdrop */}
                  <Disc3
                    className="w-7 h-7 sm:w-8 sm:h-8 text-white/25 animate-spin absolute"
                    style={{ animationDuration: `${Math.max(1.4, 3.8 - normalizedVol * 2.2)}s` }}
                  />

                  {/* Volume-Reactive Dynamic Mini Equalizer Bars */}
                  <div className="z-10 flex items-end justify-center gap-[2px] h-5 sm:h-6 px-1">
                    {[
                      { base: 0.65, speed: 0.75 },
                      { base: 0.95, speed: 1.1 },
                      { base: 0.75, speed: 0.65 },
                      { base: 0.85, speed: 1.25 },
                    ].map((bar, idx) => {
                      const currentHeightPercent = Math.max(
                        12,
                        Math.round(bar.base * normalizedVol * 100)
                      );
                      return (
                        <span
                          key={idx}
                          className="w-1 rounded-full bg-gradient-to-t from-emerald-400 to-amber-300 transition-all"
                          style={{
                            height: `${currentHeightPercent}%`,
                            transitionDuration: '100ms',
                            opacity: 0.4 + normalizedVol * 0.6,
                            animation: normalizedVol > 0
                              ? `wave-bar-${(idx % 4) + 1} ${Math.max(0.35, bar.speed - normalizedVol * 0.3)}s ease-in-out infinite alternate`
                              : 'none',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : (
                <Radio className="w-4 h-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm truncate">
                  {isVideoModeActive
                    ? `▶ ${station.name}`
                    : liveSong.title}
                </span>
                {isPlaying && (
                  <span
                    className="flex items-end gap-[2px] h-3.5 px-1 shrink-0 text-emerald-500 dark:text-emerald-400 transition-all"
                    title={`Живий звук (Гучність: ${Math.round(normalizedVol * 100)}%)`}
                    style={{
                      opacity: 0.35 + normalizedVol * 0.65,
                      transform: `scale(${0.75 + normalizedVol * 0.35})`,
                      transformOrigin: 'bottom center',
                    }}
                  >
                    <span className="w-0.5 bg-current rounded-full animate-wave-bar-1" />
                    <span className="w-0.5 bg-current rounded-full animate-wave-bar-2" />
                    <span className="w-0.5 bg-current rounded-full animate-wave-bar-3" />
                    <span className="w-0.5 bg-current rounded-full animate-wave-bar-4" />
                  </span>
                )}
                {isVideoModeActive && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 uppercase tracking-wider shrink-0 rounded-xs">
                    Відео
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5 font-medium">
                {isVideoModeActive ? (
                  <button
                    type="button"
                    onClick={onExitVideoMode}
                    className="text-red-600 dark:text-red-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    title="Вимкнути відео та повернутися до аудіопотоку"
                  >
                    <span>Відеоефір</span>
                    <span className="text-[10px] text-[#004643] dark:text-emerald-400 underline ml-1">• До радіо</span>
                  </button>
                ) : isPersonalBroadcast ? (
                  <span className="text-[#004643] dark:text-emerald-400 font-bold truncate">
                    Студія • {playlistName || 'Мій ефір'}
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">{liveSong.artist}</span>
                    <span>•</span>
                    <span className="truncate">{station.name}</span>
                    {isPlaying && (
                      <>
                        <span>•</span>
                        <span className="text-red-600 dark:text-red-500 font-bold inline-flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                          Прямий ефір
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center: Centered Primary Player Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Prev Button */}
            <button
              id="btn-player-prev"
              type="button"
              onClick={onPrevStation}
              className="p-2 rounded-md border border-theme subtle-bg text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="Попередня станція"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Play/Pause Button */}
            {hasError ? (
              <button
                id="btn-player-retry"
                type="button"
                onClick={onRetry}
                className="px-3 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors cursor-pointer min-h-[38px]"
              >
                Повторити
              </button>
            ) : (
              <button
                id="btn-player-play-toggle"
                type="button"
                onClick={onTogglePlay}
                className="relative px-4 py-2 rounded-md bg-[#004643] text-white flex items-center justify-center font-medium text-xs hover:bg-[#003330] transition-colors cursor-pointer min-h-[38px] shadow-xs select-none"
                title={isPlaying ? 'Пауза' : 'Слухати'}
              >
                {isPlaying && (
                  <span className="absolute -inset-0.5 rounded-md border border-emerald-400/60 animate-aura-pulse pointer-events-none" />
                )}
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            )}

            {/* Next Button */}
            <button
              id="btn-player-next"
              type="button"
              onClick={onNextStation}
              className="p-2 rounded-md border border-theme subtle-bg text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="Наступна станція"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Right: Clean desktop controls + Three Dots Menu for Mobile / Compact */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Vertical Volume Control */}
            <div className="relative sm:hidden" ref={mobileVolRef}>
              <button
                type="button"
                onClick={() => setShowMobileVolume((prev) => !prev)}
                className="p-1.5 rounded subtle-bg border border-theme text-slate-700 dark:text-slate-200 hover:text-[#004643] dark:hover:text-emerald-400 transition-colors"
                title="Гучність (вгору / вниз)"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-500" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#004643] dark:text-emerald-400" />
                )}
              </button>

              {showMobileVolume && (
                <div
                  className="absolute bottom-full mb-2 right-0 card-bg border-2 border-[#004643] dark:border-emerald-500 rounded-lg p-2.5 shadow-2xl z-50 flex flex-col items-center gap-2 min-w-[56px]"
                  style={{ backdropFilter: 'blur(8px)' }}
                >
                  <span className="text-[11px] font-mono font-bold text-main">
                    {isMuted || volume === 0 ? '0%' : `${Math.round(volume * 100)}%`}
                  </span>

                  <div className="h-28 flex items-center justify-center py-1">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                      className="h-24 w-2.5 cursor-pointer accent-[#004643] dark:accent-emerald-400"
                      style={{
                        WebkitAppearance: 'slider-vertical',
                        writingMode: 'vertical-lr',
                        direction: 'rtl',
                      }}
                      title={`Гучність: ${isMuted || volume === 0 ? 'Без звуку' : Math.round(volume * 100) + '%'}`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={onToggleMute}
                    className="p-1 rounded text-sub hover:text-main"
                    title={isMuted ? 'Увімкнути звук' : 'Вимкнути звук'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-[#004643] dark:text-emerald-400" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Volume Slider: Horizontal inline */}
            <div className="hidden sm:flex items-center gap-1.5 md:gap-2 w-20 md:w-28">
              <button
                id="btn-player-mute"
                type="button"
                onClick={onToggleMute}
                className="p-1 text-slate-500 hover:text-[#004643] dark:hover:text-emerald-400 transition-colors shrink-0"
                title={isMuted ? 'Увімкнути звук' : 'Вимкнути звук'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#004643] dark:text-emerald-400" />
                )}
              </button>
              <input
                id="input-player-volume"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer accent-[#004643]"
                title={`Гучність: ${isMuted || volume === 0 ? 'Без звуку' : Math.round(volume * 100) + '%'}`}
              />
            </div>

            {/* Voice Control Quick Button */}
            {onOpenVoiceOverlay && (
              <button
                id="btn-player-voice-commands"
                type="button"
                onClick={onOpenVoiceOverlay}
                className="hidden md:flex p-2 rounded-md subtle-bg border border-theme text-slate-700 dark:text-slate-200 hover:text-[#004643] dark:hover:text-emerald-300 transition-colors cursor-pointer items-center justify-center min-h-[38px] min-w-[38px]"
                title="Голосове керування: наступна, пауза, гучніше, тихіше"
              >
                <Mic className="w-4 h-4 text-[#004643] dark:text-emerald-400" />
              </button>
            )}

            {/* Background Playback Quick Button */}
            {onOpenBackgroundPlayback && (
              <button
                id="btn-player-background-audio"
                type="button"
                onClick={onOpenBackgroundPlayback}
                className="hidden lg:flex p-2 rounded-md subtle-bg border border-theme text-slate-700 dark:text-slate-200 hover:text-[#004643] dark:hover:text-emerald-300 transition-colors cursor-pointer items-center justify-center min-h-[38px] min-w-[38px]"
                title="Фонове відтворення та вимкнений екран"
              >
                <Smartphone className="w-4 h-4 text-[#004643] dark:text-emerald-400" />
              </button>
            )}

            {/* Three Dots Overflow Menu Button */}
            <button
              id="btn-player-overflow-menu"
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`p-2 rounded-md border transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center ${
                isMenuOpen
                  ? 'bg-[#004643] text-white border-[#004643]'
                  : 'subtle-bg border-theme text-slate-700 dark:text-slate-200 hover:border-[#004643]'
              }`}
              title="Більше опцій"
              aria-label="Меню опцій плеєра"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
