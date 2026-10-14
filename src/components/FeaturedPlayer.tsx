import React, { useState, useRef, useEffect, useMemo } from 'react';
import Hls from 'hls.js';
import { RadioStation, PlaybackStatus } from '../types';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  MoreHorizontal,
  SlidersHorizontal,
  CircleDot,
  Clock,
  Disc3,
  Volume2,
  VolumeX,
  Radio,
  X,
  Share2,
  Tv,
  Youtube,
  Sparkles,
  Maximize2,
  Minimize2,
  Music,
  Video as VideoIcon,
  Upload,
  Car,
  Sliders,
  Wifi,
  AlarmClock,
  Mic,
  Zap,
  RotateCw,
} from 'lucide-react';
import { SvgResponsiveEqualizer } from './SvgResponsiveEqualizer';
import { getCurrentSongForStation } from '../data/radioScheduleData';
import { SignalStatus } from '../utils/signalBufferMonitor';

interface FeaturedPlayerProps {
  station: RadioStation;
  playbackStatus: PlaybackStatus;
  onTogglePlay: (station: RadioStation) => void;
  onPrevStation: () => void;
  onNextStation: () => void;
  onNextStudioTrack?: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenStudio: () => void;
  isRecording: boolean;
  recordingSeconds: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onOpenSleepTimer: () => void;
  sleepTimerSeconds: number | null;
  volume?: number;
  isMuted?: boolean;
  onChangeVolume?: (vol: number) => void;
  onToggleMute?: () => void;
  onRetry?: () => void;
  nowPlayingSongTitle?: string;
  nowPlayingSongArtist?: string;
  activeVideoUrl?: string;
  isStudioActive?: boolean;
  activePlaylistName?: string;
  currentTrackTitle?: string;
  currentTrackArtist?: string;
  isVideoModeActive?: boolean;
  onVideoModeToggle?: (isVideo: boolean) => void;
  onOpenVideoHub?: () => void;
  onSearchInVideoHub?: (trackTitle: string, artist?: string) => void;
  onOpenEqualizer?: () => void;
  onOpenCarMode?: () => void;
  signalStatus?: SignalStatus;
  onToggleRoadBuffer?: () => void;
  onOpenHardwareFm?: () => void;
  onOpenCastModal?: () => void;
  onOpenLyricsModal?: () => void;
  onOpenAlarmModal?: () => void;
  isAiDjEnabled?: boolean;
  onToggleAiDj?: () => void;
  onRewindTimeShift?: (seconds: number) => void;
  onReturnToLive?: () => void;
  timeShiftDelaySeconds?: number;
  isStationCached?: boolean;
}

const DEFAULT_VIDEO_STREAMS = [
  {
    id: 'channel-24-live',
    name: '24 Канал 🇺🇦 Новини 24/7 Live HD',
    url: 'https://cdn15.live-tv.cloud/ua_infinitas_tv/news24-abr/playlist.m3u8',
  },
  {
    id: 'muzvar-tv-live',
    name: 'Muzvar TV 🎵 Музика UA Live',
    url: 'https://cdn15.live-tv.cloud/ua_infinitas_tv/muzvar-abr/playlist.m3u8',
  },
  {
    id: 'nashemus-tv-live',
    name: 'НАШЕ Music TV 🎬 Кліпи HD',
    url: 'https://cdn15.live-tv.cloud/ua_infinitas_tv/nashemus-abr/playlist.m3u8',
  },
  {
    id: 'happyradio-tv-live',
    name: 'Happy Radio TV 🎧 Відеорадіо',
    url: 'https://tv.mediacp.eu:8081/happyradio/index.m3u8',
  },
  {
    id: 'fortetsya-bakhmut',
    name: 'Антитіла — Фортеця Бахмут (Кліп)',
    youtubeId: '7M7b0_dGqXk',
    url: 'https://www.youtube-nocookie.com/embed/7M7b0_dGqXk?autoplay=1&enablejsapi=1',
  },
  {
    id: 'chervona-kalyna',
    name: 'Pink Floyd & Хливнюк — Червона калина',
    youtubeId: 'lu8mPxOzvK4',
    url: 'https://www.youtube-nocookie.com/embed/lu8mPxOzvK4?autoplay=1&enablejsapi=1',
  },
];

export function getYoutubeEmbedUrl(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (trimmed.includes('youtube.com/embed/') || trimmed.includes('youtube-nocookie.com/embed/')) {
    return trimmed.includes('autoplay=1')
      ? trimmed
      : `${trimmed}${trimmed.includes('?') ? '&' : '?'}autoplay=1&enablejsapi=1`;
  }
  if (/^[\w-]{11}$/.test(trimmed)) {
    return `https://www.youtube-nocookie.com/embed/${trimmed}?autoplay=1&enablejsapi=1`;
  }
  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/i;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&enablejsapi=1`;
  }
  return null;
}

export const FeaturedPlayer: React.FC<FeaturedPlayerProps> = ({
  station,
  playbackStatus,
  onTogglePlay,
  onPrevStation,
  onNextStation,
  onNextStudioTrack,
  isFavorite,
  onToggleFavorite,
  onOpenStudio,
  isRecording,
  recordingSeconds,
  onStartRecording,
  onStopRecording,
  onOpenSleepTimer,
  sleepTimerSeconds,
  volume = 0.8,
  isMuted = false,
  onChangeVolume,
  onToggleMute,
  onRetry,
  nowPlayingSongTitle,
  nowPlayingSongArtist,
  activeVideoUrl,
  isStudioActive,
  activePlaylistName,
  currentTrackTitle,
  currentTrackArtist,
  isVideoModeActive,
  onVideoModeToggle,
  onOpenVideoHub,
  onSearchInVideoHub,
  onOpenEqualizer,
  onOpenCarMode,
  signalStatus,
  onToggleRoadBuffer,
  onOpenHardwareFm,
  onOpenCastModal,
  onOpenLyricsModal,
  onOpenAlarmModal,
  isAiDjEnabled,
  onToggleAiDj,
  onRewindTimeShift,
  onReturnToLive,
  timeShiftDelaySeconds,
  isStationCached,
}) => {
  const [playerMode, setPlayerMode] = useState<'radio' | 'video'>('radio');
  const [customYoutubeUrl, setCustomYoutubeUrl] = useState<string>('');
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [activeVideoSource, setActiveVideoSource] = useState<string>(
    DEFAULT_VIDEO_STREAMS[0].url
  );
  const [showYoutubeInput, setShowYoutubeInput] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [showMobileVolume, setShowMobileVolume] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoInputRef = useRef<HTMLInputElement | null>(null);
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

  // Sync mode with parent video mode toggle if provided
  useEffect(() => {
    if (isVideoModeActive !== undefined) {
      setPlayerMode(isVideoModeActive ? 'video' : 'radio');
    }
  }, [isVideoModeActive]);

  // Sync station video live URL if station defines one
  useEffect(() => {
    if (activeVideoUrl) {
      setActiveVideoSource(activeVideoUrl);
    } else if (station.youtubeLiveUrl) {
      setActiveVideoSource(station.youtubeLiveUrl);
    } else if (station.youtubeId) {
      const embed = getYoutubeEmbedUrl(station.youtubeId);
      if (embed) setActiveVideoSource(embed);
    }
  }, [station, activeVideoUrl]);

  // Live song title & artist determination
  const liveSong = useMemo(() => {
    return getCurrentSongForStation(station);
  }, [station]);

  const displaySongTitle = isStudioActive
    ? currentTrackTitle || 'Авторський трек Студії'
    : nowPlayingSongTitle || liveSong?.title || station.name;

  const displaySongArtist = isStudioActive
    ? currentTrackArtist || 'Студія «Своя Хвиля»'
    : nowPlayingSongArtist || liveSong?.artist || station.genre;

  const handleSetPlayerMode = (mode: 'radio' | 'video') => {
    setPlayerMode(mode);
    onVideoModeToggle?.(mode === 'video');
  };

  const isVideoFile = (url: string) => {
    return (
      url.startsWith('blob:') ||
      url.endsWith('.mp4') ||
      url.endsWith('.webm') ||
      url.endsWith('.ogg') ||
      url.includes('.m3u8')
    );
  };

  // HLS streaming setup for live video
  useEffect(() => {
    if (playerMode !== 'video' || !activeVideoSource.includes('.m3u8') || !videoRef.current) return;
    const video = videoRef.current;
    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(activeVideoSource);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              hls?.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = activeVideoSource;
      video.play().catch(() => {});
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [playerMode, activeVideoSource]);

  const handleSelectLocalVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setActiveVideoSource(blobUrl);
      handleSetPlayerMode('video');
      setShowYoutubeInput(false);
      setYoutubeError(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShare = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(
          `${station.name} — онлайн радіо: ${window.location.href}`
        );
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleApplyYoutubeUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customYoutubeUrl.trim()) return;

    const embedUrl = getYoutubeEmbedUrl(customYoutubeUrl.trim());
    if (embedUrl) {
      setActiveVideoSource(embedUrl);
      handleSetPlayerMode('video');
      setShowYoutubeInput(false);
      setYoutubeError(null);
    } else {
      setYoutubeError('Не вдалося розпізнати посилання на YouTube.');
    }
  };

  return (
    <section
      id="hero-featured-station"
      aria-label="Зараз в ефірі"
      className={`card-bg p-3.5 sm:p-5 mb-4 font-sans border transition-[border-color,box-shadow] duration-300 ${
        isPlaying
          ? 'border-[#004643] dark:border-emerald-500 shadow-xs'
          : 'border-theme shadow-xs'
      }`}
    >
      {/* Top Bar: Station Name & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-theme mb-3">
        {/* Station Name & Metadata */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 shrink-0 rounded-md flex items-center justify-center text-white font-bold text-xs bg-[#004643] shadow-xs">
            {playerMode === 'video' ? <Tv className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-main truncate">
              {station.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-sub font-medium truncate mt-0.5">
              {isStudioActive ? (
                <>
                  <span className="text-[#004643] dark:text-emerald-400 font-semibold">
                    Студія «Своя Хвиля»
                  </span>
                  <span aria-hidden="true" className="text-muted-theme">·</span>
                  <span className="truncate">{activePlaylistName || 'Мій ефір'}</span>
                </>
              ) : (
                <>
                  <span className="text-[#004643] dark:text-emerald-400 font-semibold">{station.genre}</span>
                  <span aria-hidden="true" className="text-muted-theme">·</span>
                  <span className="truncate">{station.city || station.region || 'Україна'}</span>
                  {station.frequency && (
                    <>
                      <span aria-hidden="true" className="text-muted-theme">·</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{station.frequency}</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Action Bar: Frequency, Signal, Equalizer, Car Mode & Link to Video Hub */}
        <div className="flex items-center gap-1.5 sm:gap-2 self-start sm:self-auto flex-wrap">
          {signalStatus && (
            <button
              type="button"
              onClick={onToggleRoadBuffer}
              className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-mono font-semibold transition-colors cursor-pointer ${
                signalStatus.isRoadBufferActive
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                  : 'subtle-bg border-theme text-sub hover:text-main'
              }`}
              title={`Якість зв’язку: ${signalStatus.label} • Буфер: ${signalStatus.bufferSeconds}с. Клікніть для перемикання режиму траси.`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{signalStatus.networkType}</span>
              <span>{signalStatus.bufferSeconds}с</span>
            </button>
          )}

          {onOpenCarMode && (
            <button
              type="button"
              onClick={onOpenCarMode}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-semibold transition-colors cursor-pointer"
              title="Відкрити повноекранний режим для водія (Car Mode)"
            >
              <Car className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Авто</span>
            </button>
          )}

          {onOpenEqualizer && (
            <button
              type="button"
              onClick={onOpenEqualizer}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
              title="Відкрити звуковий еквалайзер & пресети"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">EQ</span>
            </button>
          )}

          {onOpenHardwareFm && (
            <button
              type="button"
              onClick={onOpenHardwareFm}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
              title="Апаратний FM-сканер через USB або Bluetooth без інтернету"
            >
              <Radio className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xs:inline">FM Офлайн</span>
            </button>
          )}

          {onOpenCastModal && (
            <button
              type="button"
              onClick={onOpenCastModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-theme text-xs font-semibold transition-colors cursor-pointer"
              title="Трансляція на великий екран ТБ або проєктор"
            >
              <Tv className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden xs:inline">ТВ</span>
            </button>
          )}

          {onOpenAlarmModal && (
            <button
              type="button"
              onClick={onOpenAlarmModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
              title="Розумний радіобудильник з плавним наростанням звуку"
            >
              <AlarmClock className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Будильник</span>
            </button>
          )}

          {isStudioActive && onToggleAiDj && (
            <button
              type="button"
              onClick={onToggleAiDj}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                isAiDjEnabled
                  ? 'bg-purple-600/20 border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'subtle-bg border-theme text-sub hover:text-main'
              }`}
              title="ШІ-диктор: голосові підводки українською мовою між треками"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden xs:inline">ШІ-Диктор</span>
            </button>
          )}

          {station.hasYoutubeLive && onOpenVideoHub && (
            <button
              type="button"
              id="btn-goto-videohub"
              onClick={onOpenVideoHub}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
              title="Дивитися прямий відеоефір у Відео Хабі"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Відео Хаб</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            </button>
          )}

          {station.frequency && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md subtle-bg border border-theme text-xs font-mono font-bold text-main">
              <span className="w-2 h-2 rounded-full bg-[#004643] dark:bg-emerald-400" />
              <span>{station.frequency}</span>
            </div>
          )}

          {isStationCached && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-mono font-bold"
              title="Станція збережена в Cache API: миттєвий запуск навіть при нестабільному зв'язку"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span className="hidden xs:inline">Кеш-старт</span>
            </div>
          )}
        </div>
      </div>

      {/* Screen Container: Visualizer or Video */}
      <div
        ref={containerRef}
        id="widescreen-player-container"
        className="relative w-full h-40 sm:h-48 md:h-56 bg-[#050c0b] overflow-hidden rounded-md border border-theme select-none group"
      >
        {/* Mode 1: Radio Visualizer */}
        {playerMode === 'radio' && (
          <div className="relative w-full h-full">
            <SvgResponsiveEqualizer
              isPlaying={isPlaying}
              isLoading={isLoading}
              stationName={isStudioActive ? (currentTrackTitle || 'Студія «Своя Хвиля»') : station.name}
              frequency={isStudioActive ? '100% LIVE • СТУДІЯ' : station.frequency}
              genre={isStudioActive ? (currentTrackArtist || 'Авторський трек') : station.genre}
            />

            {/* Subtle Center Click-to-Play Overlay */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 z-10 pointer-events-none ${
                isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlay(station);
                }}
                className={`relative pointer-events-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-xl backdrop-blur-md cursor-pointer ${
                  isPlaying
                    ? 'bg-black/60 text-white border border-white/20 hover:bg-[#004643]'
                    : 'bg-[#004643]/90 text-white border border-white/30 hover:bg-[#003330]'
                }`}
                title={isPlaying ? 'Пауза' : 'Слухати ефір'}
              >
                {isPlaying && (
                  <span className="absolute -inset-1 rounded-full border-2 border-emerald-400/60 animate-aura-pulse pointer-events-none" />
                )}
                {isLoading ? (
                  <Disc3 className="w-6 h-6 animate-spin text-white" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Mode 2: Video Player */}
        {playerMode === 'video' && (
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            {isVideoFile(activeVideoSource) ? (
              <video
                ref={videoRef}
                src={activeVideoSource}
                controls
                autoPlay
                playsInline
                loop
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <iframe
                key={activeVideoSource}
                ref={iframeRef}
                src={activeVideoSource}
                title={`${station.name} - Відео ефір`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}

            {/* Video Controls in Top-Right */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
              <button
                type="button"
                onClick={() => {
                  const current = activeVideoSource;
                  setActiveVideoSource('');
                  setTimeout(() => setActiveVideoSource(current), 50);
                }}
                className="p-1.5 bg-black/80 hover:bg-black text-white/90 hover:text-white rounded-md border border-white/20 text-xs transition-colors cursor-pointer flex items-center gap-1"
                title="Оновити трансляцію"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id="btn-video-source-options"
                onClick={() => setShowYoutubeInput((prev) => !prev)}
                className="px-2 py-1 bg-black/80 hover:bg-black text-white text-[11px] font-medium rounded-xs border border-white/20 transition-colors flex items-center gap-1 cursor-pointer"
                title="Вибрати джерело відео"
              >
                {isVideoFile(activeVideoSource) ? (
                  <VideoIcon className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                )}
                <span>{isVideoFile(activeVideoSource) ? 'Відеофайл' : 'YouTube'}</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1 bg-black/80 hover:bg-black text-white rounded-xs border border-white/20 transition-colors cursor-pointer"
                title="Повний екран"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            <input
              type="file"
              ref={localVideoInputRef}
              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
              onChange={handleSelectLocalVideo}
              className="hidden"
            />

            {/* Video Source Popover */}
            {showYoutubeInput && (
              <div className="absolute top-10 right-2 z-30 bg-slate-900 border border-slate-700 p-3 text-xs w-72 sm:w-80 shadow-2xl rounded-md text-white max-h-[80vh] overflow-y-auto">
                <div className="font-semibold mb-2 flex items-center justify-between">
                  <span>Джерело відеоплеєра</span>
                  <button
                    type="button"
                    onClick={() => setShowYoutubeInput(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-2.5">
                  <button
                    type="button"
                    onClick={() => localVideoInputRef.current?.click()}
                    className="w-full py-1.5 px-2 bg-[#004643] hover:bg-[#003330] rounded-xs font-medium text-white text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Вибрати відеофайл (MP4, WebM)</span>
                  </button>
                </div>

                <form onSubmit={handleApplyYoutubeUrl} className="mb-2.5">
                  <span className="text-[11px] text-slate-300 block mb-1">
                    YouTube відео або прямий стрім:
                  </span>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={customYoutubeUrl}
                    onChange={(e) => {
                      setCustomYoutubeUrl(e.target.value);
                      if (youtubeError) setYoutubeError(null);
                    }}
                    className="w-full px-2.5 py-1.5 bg-black/80 border border-slate-700 rounded-xs text-white text-xs mb-1 outline-none focus:border-[#004643] placeholder-slate-500"
                  />
                  {youtubeError && (
                    <div className="text-[10px] text-rose-400 mb-1">{youtubeError}</div>
                  )}
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-[#004643] hover:bg-[#003330] rounded-xs font-medium text-white text-center cursor-pointer transition-colors text-xs"
                  >
                    Запустити відео
                  </button>
                </form>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">Прямі трансляції:</span>
                  <div className="space-y-1">
                    {DEFAULT_VIDEO_STREAMS.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setActiveVideoSource(st.url);
                          setShowYoutubeInput(false);
                          setYoutubeError(null);
                        }}
                        className={`w-full text-left px-2 py-1 text-[11px] truncate rounded-xs cursor-pointer block transition-colors ${
                          activeVideoSource === st.url
                            ? 'bg-[#004643] text-white font-medium'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {st.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Primary Hero Control Console: Single Unified Elevation, Fluid & Responsive */}
      <div className="mt-3.5 pt-3.5 border-t border-theme flex flex-col gap-3">
        {/* Row 1: Now Playing Track Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-md bg-[#004643] text-white flex items-center justify-center shrink-0 shadow-xs relative overflow-hidden">
            {isPlaying ? (
              <div className="flex items-end gap-[3px] h-5 justify-center px-1">
                <span className="w-1 bg-white rounded-full animate-wave-bar-1" />
                <span className="w-1 bg-white rounded-full animate-wave-bar-2" />
                <span className="w-1 bg-white rounded-full animate-wave-bar-3" />
                <span className="w-1 bg-white rounded-full animate-wave-bar-4" />
                <span className="w-1 bg-white rounded-full animate-wave-bar-5" />
              </div>
            ) : (
              <Music className="w-5 h-5 text-white/90" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-sub font-medium">
              <span className="inline-flex items-center gap-1 font-semibold">
                {isPlaying ? (
                  <span className="flex items-center gap-1.5 text-red-600 dark:text-red-500 font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    <span>{isStudioActive ? 'Студія «Своя Хвиля» в ефірі' : 'Прямий ефір'}</span>
                  </span>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                    <span>{isStudioActive ? 'Студія «Своя Хвиля»' : 'На паузі'}</span>
                  </span>
                )}
              </span>
              <span aria-hidden="true" className="text-muted-theme">·</span>
              <span className="truncate">
                {isStudioActive ? (activePlaylistName || 'Мій ефір') : station.name}
              </span>
            </div>

            <div className="flex items-center gap-2 truncate mt-0.5">
              <span
                className="text-sm sm:text-base font-bold text-main truncate"
                title={displaySongTitle}
              >
                «{displaySongTitle}»
              </span>
              {displaySongArtist && (
                <span
                  className="text-xs sm:text-sm text-sub truncate shrink-0"
                  title={displaySongArtist}
                >
                  — {displaySongArtist}
                </span>
              )}
              {isPlaying && (
                <span className="flex items-end gap-0.5 h-3.5 px-1 shrink-0 text-emerald-500 dark:text-emerald-400" title="Живий звук">
                  <span className="w-0.5 bg-current rounded-full animate-wave-bar-1" />
                  <span className="w-0.5 bg-current rounded-full animate-wave-bar-2" />
                  <span className="w-0.5 bg-current rounded-full animate-wave-bar-3" />
                  <span className="w-0.5 bg-current rounded-full animate-wave-bar-4" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Transport Controls, Volume, Favorite & Menu */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 pt-1">
          {/* Left: Favorite & More Actions */}
          <div className="flex items-center gap-1.5">
            {/* Favorite Button */}
            <button
              id="btn-hero-favorite"
              type="button"
              onClick={onToggleFavorite}
              className={`p-2 rounded-md border transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center ${
                isFavorite
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-500'
                  : 'subtle-bg border-theme text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:border-rose-400/40'
              }`}
              title={isFavorite ? 'Видалити з обраного' : 'Додати в обране'}
              aria-label="Обране"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            {/* More Actions Popover */}
            <div className="relative" ref={menuRef}>
              <button
                id="btn-hero-more-actions"
                type="button"
                onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                className="p-2 rounded-md subtle-bg border border-theme text-slate-700 dark:text-slate-200 hover:text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Більше дій"
                aria-label="Меню дій"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMoreMenuOpen && (
                <div
                  id="hero-overflow-menu"
                  className="absolute bottom-full mb-1.5 left-0 w-56 max-w-[calc(100vw-2rem)] p-1.5 shadow-xl card-bg border border-theme rounded-md animate-in fade-in duration-100 z-50 text-xs"
                >
                  <div className="px-2.5 py-1.5 border-b border-theme flex items-center justify-between mb-1">
                    <span className="font-bold text-main text-xs">Дії ефіру</span>
                    <button
                      type="button"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onOpenStudio();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xs text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-medium">Студія: треки & відео</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        if (isRecording) {
                          onStopRecording();
                        } else {
                          onStartRecording();
                        }
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xs text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left cursor-pointer"
                    >
                      <CircleDot
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isRecording ? 'text-rose-500 animate-pulse' : ''
                        }`}
                      />
                      <span className="font-medium">
                        {isRecording ? `Зупинити запис (${recordingSeconds}с)` : 'Запис фрагменту'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onOpenSleepTimer();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xs text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-medium">
                        {sleepTimerSeconds !== null ? 'Таймер сну: активний' : 'Таймер сну'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        handleShare();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xs text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-medium">
                        {copiedToast ? 'Посилання скопійовано!' : 'Поділитись станцією'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Transport Controls (Prev, Play/Pause, Next) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrevStation}
              className="p-2 sm:p-2.5 rounded-md border border-theme subtle-bg text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Попередня станція"
              aria-label="Попередня станція"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Main Play / Pause Button */}
            {hasError ? (
              <button
                type="button"
                onClick={onRetry || (() => onTogglePlay(station))}
                className="px-4 py-2 sm:py-2.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5 min-h-[40px]"
              >
                <span>Повторити</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onTogglePlay(station)}
                className="relative px-5 py-2 sm:py-2.5 rounded-md text-white flex items-center justify-center font-medium text-xs sm:text-sm transition-colors cursor-pointer bg-[#004643] hover:bg-[#003330] min-h-[40px] shadow-xs gap-2 select-none"
                title={isPlaying ? 'Пауза' : 'Слухати'}
                aria-label={isPlaying ? 'Пауза' : 'Слухати'}
              >
                {isPlaying && (
                  <span className="absolute -inset-1 rounded-md border border-emerald-400/60 animate-aura-pulse pointer-events-none" />
                )}
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                ) : isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Пауза</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Слухати</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={isStudioActive && onNextStudioTrack ? onNextStudioTrack : onNextStation}
              className="p-2 sm:p-2.5 rounded-md border border-theme subtle-bg text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Наступна станція"
              aria-label="Наступна станція"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            {/* Time-Shift Rewind Controls */}
            {onRewindTimeShift && (
              <div className="hidden sm:flex items-center gap-1 ml-1.5">
                <button
                  type="button"
                  onClick={() => onRewindTimeShift(30)}
                  className="px-2 py-1.5 rounded-md text-[11px] font-mono font-bold subtle-bg border border-theme text-sub hover:text-main transition-colors cursor-pointer"
                  title="Відмотати ефір назад на 30 секунд"
                >
                  -30с
                </button>
                <button
                  type="button"
                  onClick={() => onRewindTimeShift(15)}
                  className="px-2 py-1.5 rounded-md text-[11px] font-mono font-bold subtle-bg border border-theme text-sub hover:text-main transition-colors cursor-pointer"
                  title="Відмотати ефір назад на 15 секунд"
                >
                  -15с
                </button>
                {timeShiftDelaySeconds && timeShiftDelaySeconds > 0 ? (
                  <button
                    type="button"
                    onClick={onReturnToLive}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-red-600 text-white text-[11px] font-mono font-black shadow-sm cursor-pointer animate-pulse"
                    title="Повернутися до прямого ефіру (Live)"
                  >
                    <span>-00:{String(timeShiftDelaySeconds).padStart(2, '0')}</span>
                    <span>LIVE</span>
                  </button>
                ) : (
                  <span className="flex items-center gap-1 px-1.5 py-1 text-[10px] font-mono font-black text-red-500 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    <span>LIVE</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right: Volume Control (Mobile Vertical Popover UP/DOWN, Desktop Horizontal) */}
          <div className="relative flex items-center gap-1.5 sm:gap-2 shrink-0" ref={mobileVolRef}>
            {/* Mobile Button: Toggles Vertical Volume Popover (Up / Down) */}
            <button
              type="button"
              onClick={() => setShowMobileVolume((prev) => !prev)}
              className="sm:hidden p-2 rounded-md border border-theme subtle-bg text-slate-700 dark:text-slate-200 hover:text-[#004643] dark:hover:text-emerald-400 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
              title="Налаштувати гучність (вгору / вниз)"
              aria-label="Гучність"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#004643] dark:text-emerald-400" />
              )}
            </button>

            {/* Mobile Vertical Volume Popup (Opens Upwards, Slides Up/Down) */}
            {showMobileVolume && (
              <div
                className="sm:hidden absolute bottom-full mb-2 right-0 card-bg border-2 border-[#004643] dark:border-emerald-500 rounded-lg p-3 shadow-2xl z-50 flex flex-col items-center gap-2.5 min-w-[64px]"
                style={{ backdropFilter: 'blur(8px)' }}
              >
                <span className="text-xs font-mono font-bold text-main">
                  {isMuted || volume === 0 ? '0%' : `${Math.round(volume * 100)}%`}
                </span>

                {/* Vertical Slider moving Up (louder) & Down (quieter) */}
                <div className="h-32 flex items-center justify-center py-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => onChangeVolume?.(parseFloat(e.target.value))}
                    className="h-28 w-3 cursor-pointer accent-[#004643] dark:accent-emerald-400"
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
                  className="p-1 rounded text-xs font-semibold text-sub hover:text-main"
                  title={isMuted ? 'Увімкнути звук' : 'Вимкнути звук'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-rose-500 mx-auto" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-[#004643] dark:text-emerald-400 mx-auto" />
                  )}
                </button>
              </div>
            )}

            {/* Desktop / Tablet Mute Button */}
            <button
              type="button"
              onClick={onToggleMute}
              className="hidden sm:flex p-2 rounded-md border border-theme subtle-bg text-slate-700 dark:text-slate-200 hover:text-[#004643] dark:hover:text-emerald-400 transition-colors cursor-pointer min-h-[40px] min-w-[40px] items-center justify-center shrink-0"
              title={isMuted || volume === 0 ? 'Увімкнути звук' : 'Вимкнути звук'}
              aria-label="Гучність"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#004643] dark:text-emerald-400" />
              )}
            </button>

            {/* Desktop Horizontal Volume Slider */}
            <div className="hidden sm:flex items-center gap-2 w-28 md:w-36">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => onChangeVolume?.(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full cursor-pointer accent-[#004643] dark:accent-emerald-500"
                title={`Гучність: ${isMuted || volume === 0 ? 'Без звуку' : Math.round(volume * 100) + '%'}`}
              />
              <span className="text-xs font-mono font-medium text-sub w-8 text-right shrink-0">
                {isMuted || volume === 0 ? '0%' : `${Math.round(volume * 100)}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Clean Editorial Tagline / Vibe (NO # hashtag) */}
        {(station.tagline || station.habit) && (
          <div className="pt-2 text-xs text-sub flex items-center justify-between gap-2 border-t border-theme/40">
            <p className="line-clamp-1 italic text-slate-600 dark:text-slate-400">
              {station.tagline || station.habit}
            </p>
            {station.tagline && station.habit && (
              <span className="shrink-0 font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
                {station.habit}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
