import React, { useState, useRef, useEffect, useMemo } from 'react';
import Hls from 'hls.js';
import {
  Tv,
  Radio,
  Play,
  Maximize2,
  Minimize2,
  Upload,
  Youtube,
  Film,
  Sparkles,
  ExternalLink,
  Search,
  Check,
  Flame,
  Music2,
  Newspaper,
  RadioTower,
  Bookmark,
  BookmarkCheck,
  Trash2,
  Plus,
  SkipBack,
  SkipForward,
  Shuffle,
  Clock,
  LayoutGrid,
  LayoutList,
  X,
  Volume2,
  RotateCw,
} from 'lucide-react';
import { RadioStation } from '../types';

export interface VideoChannel {
  id: string;
  title: string;
  description: string;
  category: 'tv' | 'music' | 'studio' | 'custom';
  streamUrl: string; // YouTube embed URL or direct HLS/video URL
  thumbnailGradient: string;
  isLive: boolean;
  channelName: string;
  badgeText: string;
  isCustom?: boolean;
}

export const CURATED_VIDEO_CHANNELS: VideoChannel[] = [
  // --- TV & NEWS (Live 24/7 HLS Streams) ---
  {
    id: 'channel-24-live',
    title: '24 Канал — Прямий Ефір (24/7)',
    description: 'Головний інформаційний телеканал новин України у високій якості Full HD.',
    category: 'tv',
    streamUrl: 'https://cdn15.live-tv.cloud/ua_infinitas_tv/news24-abr/playlist.m3u8',
    thumbnailGradient: 'from-red-950 via-zinc-900 to-black',
    isLive: true,
    channelName: '24 Канал',
    badgeText: 'НАЖИВО HD',
  },
  {
    id: '1plus1-marathon-live',
    title: '1+1 Марафон — Єдині Новини',
    description: 'Загальнонаціональний телемарафон новин: оперативні зведення, включення з фронту.',
    category: 'tv',
    streamUrl: 'https://dash2.antik.sk/live/1plus1_marathon/playlist.m3u8',
    thumbnailGradient: 'from-blue-950 via-indigo-950 to-black',
    isLive: true,
    channelName: '1+1 Марафон',
    badgeText: 'МАРАФОН',
  },
  {
    id: 'freedom-tv-live',
    title: 'FREEДОМ — Міжнародне Мовлення',
    description: 'Офіційне міжнародне українське телемовлення про події в Україні та світі.',
    category: 'tv',
    streamUrl: 'https://dash4.antik.sk/live/test_uatv/playlist.m3u8',
    thumbnailGradient: 'from-sky-950 via-blue-950 to-black',
    isLive: true,
    channelName: 'FREEДОМ',
    badgeText: 'МІЖНАРОДНЕ',
  },
  {
    id: 'channel-366-live',
    title: '36.6 TV — Простір Життя HD',
    description: 'Пізнавальний телеканал про здоровий спосіб життя, психологію та медицину.',
    category: 'tv',
    streamUrl: 'https://dash2.antik.sk/live/test_tridsatsest_hd_atktv/playlist.m3u8',
    thumbnailGradient: 'from-emerald-950 via-teal-950 to-black',
    isLive: true,
    channelName: '36.6 TV',
    badgeText: 'HD ЕФІР',
  },

  // --- MUSIC CHANNELS & VISUAL RADIO (24/7 HLS LIVE) ---
  {
    id: 'muzvar-tv-live',
    title: 'Muzvar TV — Музичний Канал України',
    description: 'Сучасна українська музика, щоденні прем’єри кліпів, чарти та живі інтерв’ю.',
    category: 'music',
    streamUrl: 'https://cdn15.live-tv.cloud/ua_infinitas_tv/muzvar-abr/playlist.m3u8',
    thumbnailGradient: 'from-purple-950 via-fuchsia-950 to-black',
    isLive: true,
    channelName: 'Muzvar UA',
    badgeText: 'МУЗИКА 24/7',
  },
  {
    id: 'nashemus-tv-live',
    title: 'NASHE Music TV — Українські Кліпи HD',
    description: 'Цілодобовий ефір золотих та нових українських відеокліпів у якості Full HD.',
    category: 'music',
    streamUrl: 'https://cdn15.live-tv.cloud/ua_infinitas_tv/nashemus-abr/playlist.m3u8',
    thumbnailGradient: 'from-amber-950 via-orange-950 to-black',
    isLive: true,
    channelName: 'НАШЕ Music',
    badgeText: 'КЛІПИ HD',
  },
  {
    id: 'happyradio-tv-live',
    title: 'Happy Radio TV — Студія & Відеорадіо',
    description: 'Візуальне радіо, прямі включення зі студії, клубний саунд та електронні DJ-сети.',
    category: 'studio',
    streamUrl: 'https://tv.mediacp.eu:8081/happyradio/index.m3u8',
    thumbnailGradient: 'from-pink-950 via-rose-950 to-black',
    isLive: true,
    channelName: 'Happy Radio Live',
    badgeText: 'СТУДІЯ',
  },

  // --- MUSIC CLIPS (Verified Permanent YouTube Embeds) ---
  {
    id: 'clip-antytila-fortetsya',
    title: 'Антитіла — Фортеця Бахмут (Офіційний Кліп)',
    description: 'Потужне присвячення незламним воїнам та місту-фортеці. Реальні кадри бойової роботи артилерії.',
    category: 'music',
    streamUrl: 'https://www.youtube-nocookie.com/embed/7M7b0_dGqXk?autoplay=1&enablejsapi=1',
    thumbnailGradient: 'from-zinc-900 via-stone-900 to-black',
    isLive: false,
    channelName: 'Антитіла',
    badgeText: 'ВІДЕОКЛІП',
  },
  {
    id: 'clip-boombox-kalyna',
    title: 'Андрій Хливнюк & Pink Floyd — Ой у лузі червона калина',
    description: 'Легендарне виконання, що об’єднало весь вільний світ навколо України.',
    category: 'music',
    streamUrl: 'https://www.youtube-nocookie.com/embed/lu8mPxOzvK4?autoplay=1&enablejsapi=1',
    thumbnailGradient: 'from-yellow-950 via-amber-950 to-black',
    isLive: false,
    channelName: 'Pink Floyd / Бумбокс',
    badgeText: 'ГІМН',
  },
  {
    id: 'clip-marsh-novoyi-armiyi',
    title: 'Зродились ми великої години (Марш Нової Армії)',
    description: 'Олег Скрипка, Тарас Компаніченко. Офіційний гімн Збройних Сил України.',
    category: 'music',
    streamUrl: 'https://www.youtube-nocookie.com/embed/4Jt75pQYvD4?autoplay=1&enablejsapi=1',
    thumbnailGradient: 'from-emerald-950 via-zinc-900 to-black',
    isLive: false,
    channelName: 'Марш Нової Армії',
    badgeText: 'МАРШ',
  },
  {
    id: 'clip-kalush-stefania',
    title: 'Kalush Orchestra — Стефанія (Офіційне Відео)',
    description: 'Переможна пісня Євробачення, присвячена матерям України.',
    category: 'music',
    streamUrl: 'https://www.youtube-nocookie.com/embed/F1fl60ypdLs?autoplay=1&enablejsapi=1',
    thumbnailGradient: 'from-rose-950 via-indigo-950 to-black',
    isLive: false,
    channelName: 'Kalush Orchestra',
    badgeText: 'ЄВРОБАЧЕННЯ',
  },
  {
    id: 'clip-jerry-alyona-teresa',
    title: 'alyona alyona & Jerry Heil — Teresa & Maria',
    description: 'Гімн сили українських жінок та пісня-символ єдності на європейській арені.',
    category: 'music',
    streamUrl: 'https://www.youtube-nocookie.com/embed/Y0iRz85t7o8?autoplay=1&enablejsapi=1',
    thumbnailGradient: 'from-amber-900 via-orange-950 to-slate-950',
    isLive: false,
    channelName: 'alyona alyona & Jerry Heil',
    badgeText: 'ХІТ',
  },
  {
    id: 'clip-okean-elzy-obiymy',
    title: 'Океан Ельзи — Обійми',
    description: 'Культова балада Святослава Вакарчука, що торкається найглибших струн душі.',
    category: 'music',
    streamUrl: 'https://www.youtube-nocookie.com/embed/gT8B25o1QkQ?autoplay=1&enablejsapi=1',
    thumbnailGradient: 'from-cyan-950 via-slate-900 to-black',
    isLive: false,
    channelName: 'Океан Ельзи',
    badgeText: 'БАЛАДА',
  },
  {
    id: 'clip-kozak-system-topolya',
    title: 'KOZAK SYSTEM & SHUMEI — Біля тополі',
    description: 'Душевна народна балада-реквієм пам’яті захисників України.',
    category: 'music',
    streamUrl: 'https://www.youtube-nocookie.com/embed/jZ_y-hR_1bE?autoplay=1&enablejsapi=1',
    thumbnailGradient: 'from-stone-900 via-zinc-950 to-black',
    isLive: false,
    channelName: 'Kozak System',
    badgeText: 'БАЛАДА',
  },
  {
    id: 'clip-boombox-lyudy',
    title: 'Бумбокс — Люди',
    description: 'Один із найулюбленіших філософських треків гурту Бумбокс.',
    category: 'music',
    streamUrl: 'https://www.youtube-nocookie.com/embed/hswkQ_v4qEw?autoplay=1&enablejsapi=1',
    thumbnailGradient: 'from-blue-950 via-purple-950 to-black',
    isLive: false,
    channelName: 'Бумбокс',
    badgeText: 'РОК / ПОП',
  },
  {
    id: 'clip-shumei-bureviyamy',
    title: 'SHUMEI x Злата Огнєвіч — Буревіями',
    description: 'Чуттєвий та драматичний дует нової хвилі української поп-музики.',
    category: 'music',
    streamUrl: 'https://www.youtube-nocookie.com/embed/z4bW9WwL050?autoplay=1&enablejsapi=1',
    thumbnailGradient: 'from-purple-900 via-slate-950 to-black',
    isLive: false,
    channelName: 'SHUMEI',
    badgeText: 'ДУЕТ',
  },
  {
    id: 'clip-okean-elzy-bez-boyu',
    title: 'Океан Ельзи — Без бою',
    description: 'Легендарний рок-гімн незламності та боротьби.',
    category: 'music',
    streamUrl: 'https://www.youtube-nocookie.com/embed/e2XXg_zO6a4?autoplay=1&enablejsapi=1',
    thumbnailGradient: 'from-zinc-900 via-cyan-950 to-black',
    isLive: false,
    channelName: 'Океан Ельзи',
    badgeText: 'РОК',
  },
];

const CUSTOM_CHANNELS_KEY = 'slobo_custom_video_channels';

function loadSavedCustomChannels(): VideoChannel[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CHANNELS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCustomChannelsToStorage(channels: VideoChannel[]) {
  try {
    localStorage.setItem(CUSTOM_CHANNELS_KEY, JSON.stringify(channels));
  } catch {}
}

interface VideoHubProps {
  currentStation?: RadioStation;
  onSwitchToRadio: () => void;
  onVideoStartPlayback?: () => void;
}

export const VideoHub: React.FC<VideoHubProps> = ({
  currentStation,
  onSwitchToRadio,
  onVideoStartPlayback,
}) => {
  const [activeChannel, setActiveChannel] = useState<VideoChannel>(CURATED_VIDEO_CHANNELS[0]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'tv' | 'music' | 'studio' | 'saved' | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  
  // Custom video inputs
  const [customYoutubeUrl, setCustomYoutubeUrl] = useState('');
  const [customChannelTitle, setCustomChannelTitle] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // User saved channels & sleep timer
  const [savedChannels, setSavedChannels] = useState<VideoChannel[]>(() => loadSavedCustomChannels());
  const [videoSleepTimerSeconds, setVideoSleepTimerSeconds] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoElemRef = useRef<HTMLVideoElement | null>(null);

  // HLS stream management for live TV & direct streams
  useEffect(() => {
    const isHls = !localVideoUrl && activeChannel.streamUrl.includes('.m3u8');
    const video = videoElemRef.current;
    if (!isHls || !video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
      });
      hls.loadSource(activeChannel.streamUrl);
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
      video.src = activeChannel.streamUrl;
      video.play().catch(() => {});
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [activeChannel.streamUrl, localVideoUrl, reloadKey]);

  // Video Sleep Timer countdown
  useEffect(() => {
    if (videoSleepTimerSeconds === null || videoSleepTimerSeconds <= 0) return;
    const interval = setInterval(() => {
      setVideoSleepTimerSeconds((prev) => {
        if (prev === null || prev <= 1) {
          // Pause / clear playback
          setLocalVideoUrl(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [videoSleepTimerSeconds]);

  // Synchronize with currently selected radio station if it has a live video
  const stationChannel: VideoChannel | null = useMemo(() => {
    if (currentStation?.hasYoutubeLive && currentStation.youtubeLiveUrl) {
      return {
        id: `station-live-${currentStation.id}`,
        title: `${currentStation.name} — Пряма Студійна Відеотрансляція`,
        description: `Студійний живий відеопотік радіостанції «${currentStation.name}» (${currentStation.city || 'Україна'}).`,
        category: 'studio',
        streamUrl: currentStation.youtubeLiveUrl,
        thumbnailGradient: 'from-emerald-950 via-teal-950 to-black',
        isLive: true,
        channelName: currentStation.name,
        badgeText: 'СТУДІЯ FM',
      };
    }
    return null;
  }, [currentStation]);

  const allChannels = useMemo(() => {
    const list: VideoChannel[] = [];
    if (stationChannel) {
      list.push(stationChannel);
    }
    // Saved channels
    savedChannels.forEach((sc) => {
      if (!list.some((c) => c.id === sc.id)) {
        list.push(sc);
      }
    });
    // Curated channels
    CURATED_VIDEO_CHANNELS.forEach((cc) => {
      if (!list.some((c) => c.id === cc.id)) {
        list.push(cc);
      }
    });
    return list;
  }, [stationChannel, savedChannels]);

  // Filter channels by category & search
  const filteredChannels = useMemo(() => {
    return allChannels.filter((c) => {
      let matchesCategory = true;
      if (activeCategory === 'saved') {
        matchesCategory = Boolean(c.isCustom || savedChannels.some((s) => s.id === c.id));
      } else if (activeCategory !== 'all') {
        matchesCategory = c.category === activeCategory;
      }

      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.channelName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [allChannels, activeCategory, searchQuery, savedChannels]);

  const handleSelectChannel = (channel: VideoChannel) => {
    setActiveChannel(channel);
    setLocalVideoUrl(null);
    onVideoStartPlayback?.();
  };

  // Previous / Next channel
  const currentIndex = allChannels.findIndex((c) => c.id === activeChannel.id);
  const handlePrevChannel = () => {
    if (currentIndex > 0) {
      handleSelectChannel(allChannels[currentIndex - 1]);
    } else {
      handleSelectChannel(allChannels[allChannels.length - 1]);
    }
  };

  const handleNextChannel = () => {
    if (currentIndex >= 0 && currentIndex < allChannels.length - 1) {
      handleSelectChannel(allChannels[currentIndex + 1]);
    } else {
      handleSelectChannel(allChannels[0]);
    }
  };

  const handleShuffleChannel = () => {
    const randomIdx = Math.floor(Math.random() * allChannels.length);
    handleSelectChannel(allChannels[randomIdx]);
  };

  // Add / Remove from saved channels
  const isChannelSaved = savedChannels.some((s) => s.id === activeChannel.id);
  const handleToggleSaveCurrent = () => {
    if (isChannelSaved) {
      const next = savedChannels.filter((s) => s.id !== activeChannel.id);
      setSavedChannels(next);
      saveCustomChannelsToStorage(next);
    } else {
      const next = [{ ...activeChannel, isCustom: true }, ...savedChannels];
      setSavedChannels(next);
      saveCustomChannelsToStorage(next);
    }
  };

  const handleDeleteSavedChannel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = savedChannels.filter((s) => s.id !== id);
    setSavedChannels(next);
    saveCustomChannelsToStorage(next);
  };

  const handleApplyCustomYoutube = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customYoutubeUrl.trim()) return;

    try {
      const parsed = new URL(customYoutubeUrl.trim());
      let videoId = '';
      if (parsed.hostname.includes('youtube.com')) {
        videoId = parsed.searchParams.get('v') || '';
      } else if (parsed.hostname.includes('youtu.be')) {
        videoId = parsed.pathname.replace('/', '');
      }

      if (!videoId) {
        setCustomError('Вкажіть коректне посилання (наприклад: https://www.youtube.com/watch?v=...)');
        return;
      }

      const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
      const title = customChannelTitle.trim() || 'Користувацьке YouTube Відео';
      const customCh: VideoChannel = {
        id: `custom-${Date.now()}`,
        title,
        description: `Трансляція за посиланням: ${customYoutubeUrl}`,
        category: 'custom',
        streamUrl: embedUrl,
        thumbnailGradient: 'from-red-950 via-slate-900 to-black',
        isLive: false,
        channelName: 'Мій Стрім',
        badgeText: 'ВЛАСНЕ',
        isCustom: true,
      };

      // Add to saved list automatically
      const next = [customCh, ...savedChannels];
      setSavedChannels(next);
      saveCustomChannelsToStorage(next);

      setActiveChannel(customCh);
      setLocalVideoUrl(null);
      setCustomError(null);
      setCustomYoutubeUrl('');
      setCustomChannelTitle('');
      onVideoStartPlayback?.();
    } catch {
      setCustomError('Невірний формат посилання на YouTube');
    }
  };

  const handleSelectLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setLocalVideoUrl(objectUrl);
      const fileChannel: VideoChannel = {
        id: `local-${Date.now()}`,
        title: file.name,
        description: `Локальний відеофайл (${(file.size / (1024 * 1024)).toFixed(1)} МБ)`,
        category: 'custom',
        streamUrl: objectUrl,
        thumbnailGradient: 'from-emerald-950 via-zinc-900 to-black',
        isLive: false,
        channelName: 'Мій Відеофайл',
        badgeText: 'MP4 ВІДЕО',
      };
      setActiveChannel(fileChannel);
      onVideoStartPlayback?.();
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Keyboard controls (F for fullscreen, T for theater)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        handleToggleFullscreen();
      } else if (e.key === 't' || e.key === 'T') {
        setIsTheaterMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner / Mode Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 subtle-bg border border-theme rounded-md shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-md bg-red-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Tv className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-main tracking-tight truncate">
                Відео Хаб «Своя Хвиля»
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-600/20 text-red-600 dark:text-red-400 border border-red-500/30 uppercase tracking-wider rounded-xs flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                Live TV & Video Hub
              </span>
            </div>
            <p className="text-xs text-sub truncate mt-0.5">
              Українські телеканали, студійні стріми радіостанцій, музичні кліпи та власний YouTube
            </p>
          </div>
        </div>

        {/* Fast Switch back to Radio Studio */}
        <div className="flex items-center gap-2 shrink-0">
          {stationChannel && (
            <button
              type="button"
              onClick={() => handleSelectChannel(stationChannel)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title={`Дивитися відеостудію станції «${stationChannel.channelName}»`}
            >
              <RadioTower className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Стрім станції:</span>
              <span className="font-bold truncate max-w-[120px]">{stationChannel.channelName}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSwitchToRadio}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-md bg-[#004643] hover:bg-[#003835] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Повернутися до Радіо Студії та живого еквалайзера"
          >
            <Radio className="w-4 h-4" />
            <span>До Радіо Студії</span>
          </button>
        </div>
      </div>

      {/* Main Theater Video Stage (16:9) with Sticky Mini-Player option */}
      <div
        ref={containerRef}
        className={`bg-black rounded-lg overflow-hidden shadow-2xl border border-theme transition-all duration-300 ${
          isMiniPlayer
            ? 'fixed bottom-4 right-4 z-50 w-80 sm:w-96 shadow-2xl border-2 border-red-500 animate-in slide-in-from-bottom duration-200'
            : isTheaterMode
            ? 'w-full max-w-full'
            : 'w-full'
        }`}
      >
        {/* Top Floating Controls on Video */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
          {/* Channel Name Badge */}
          <div className="flex items-center gap-2 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/20 text-white pointer-events-auto shadow-md">
            {activeChannel.isLive ? (
              <span className="flex items-center gap-1.5 text-xs text-red-500 font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>НАЖИВО</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <Film className="w-3.5 h-3.5" />
                <span>Відеозапис</span>
              </span>
            )}
            <span className="text-white/40">|</span>
            <span className="text-xs font-bold truncate max-w-[150px] sm:max-w-xs">
              {activeChannel.channelName}
            </span>
          </div>

          {/* Action Buttons: PiP, Theater mode, Fullscreen */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Reload Stream Button */}
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="p-2 bg-black/80 hover:bg-black text-white rounded-md border border-white/20 transition-colors cursor-pointer shadow-md"
              title="Перезавантажити відеотрансляцію"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* External Direct Link */}
            <a
              href={activeChannel.streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-black/80 hover:bg-black text-white rounded-md border border-white/20 transition-colors cursor-pointer shadow-md inline-flex items-center justify-center"
              title="Відкрити пряме посилання у новій вкладці"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Mini Player Toggle */}
            <button
              type="button"
              onClick={() => setIsMiniPlayer(!isMiniPlayer)}
              className="p-2 bg-black/80 hover:bg-black text-white rounded-md border border-white/20 transition-colors cursor-pointer shadow-md"
              title={isMiniPlayer ? 'Розгорнути плеєр' : 'Згорнути в міні-вікно (PiP)'}
            >
              {isMiniPlayer ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>

            {!isMiniPlayer && (
              <>
                <button
                  type="button"
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  className="p-2 bg-black/80 hover:bg-black text-white rounded-md border border-white/20 transition-colors cursor-pointer shadow-md"
                  title={isTheaterMode ? 'Звичайний розмір (T)' : 'Театральний режим (T)'}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  className="p-2 bg-black/80 hover:bg-black text-white rounded-md border border-white/20 transition-colors cursor-pointer shadow-md"
                  title="Повний екран (F)"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* 16:9 Video Canvas */}
        <div className="w-full aspect-video flex items-center justify-center bg-black relative">
          {localVideoUrl || activeChannel.streamUrl.includes('.m3u8') ? (
            <video
              key={`hls-stream-${activeChannel.id}-${reloadKey}`}
              ref={videoElemRef}
              src={localVideoUrl || (videoElemRef.current?.canPlayType('application/vnd.apple.mpegurl') ? activeChannel.streamUrl : undefined)}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <iframe
              key={`iframe-stream-${activeChannel.id}-${reloadKey}`}
              src={activeChannel.streamUrl}
              title={activeChannel.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
        </div>

        {/* Bottom Control Bar under screen (when not in mini player) */}
        {!isMiniPlayer && (
          <div className="p-3 sm:p-4 subtle-bg border-t border-theme flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Channel Info & Live indicator */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded-xs">
                  {activeChannel.badgeText}
                </span>
                {activeChannel.streamUrl.includes('.m3u8') ? (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    HLS HD Live 24/7
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-xs flex items-center gap-1">
                    <Youtube className="w-3 h-3" />
                    YouTube HD
                  </span>
                )}
                <h3 className="font-bold text-sm sm:text-base text-main truncate">
                  {activeChannel.title}
                </h3>
              </div>
              <p className="text-xs text-sub mt-0.5 line-clamp-1">
                {activeChannel.description}
              </p>
            </div>

            {/* Quick playback switcher: Prev, Shuffle, Next & Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-end md:self-auto flex-wrap">
              {/* Reload Stream Button */}
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="p-2 subtle-bg border border-theme text-main rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                title="Оновити трансляцію"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Оновити</span>
              </button>
              <button
                type="button"
                onClick={handlePrevChannel}
                className="p-2 subtle-bg border border-theme text-main rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Попередній канал"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleShuffleChannel}
                className="p-2 subtle-bg border border-theme text-main rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Випадковий канал або кліп"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleNextChannel}
                className="p-2 subtle-bg border border-theme text-main rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Наступний канал"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              {/* Bookmark channel */}
              <button
                type="button"
                onClick={handleToggleSaveCurrent}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                  isChannelSaved
                    ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                    : 'subtle-bg border-theme text-sub hover:text-main'
                }`}
                title={isChannelSaved ? 'Видалити із збережених' : 'Зберегти у Мої Канали'}
              >
                {isChannelSaved ? <BookmarkCheck className="w-3.5 h-3.5 fill-current" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isChannelSaved ? 'Збережено' : 'В обране'}</span>
              </button>

              {/* Sleep timer dropdown for video */}
              <button
                type="button"
                onClick={() => {
                  if (videoSleepTimerSeconds) {
                    setVideoSleepTimerSeconds(null);
                  } else {
                    setVideoSleepTimerSeconds(30 * 60); // 30 min default
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                  videoSleepTimerSeconds
                    ? 'bg-[#004643] text-white border-[#004643]'
                    : 'subtle-bg border-theme text-sub hover:text-main'
                }`}
                title={videoSleepTimerSeconds ? 'Вимкнути таймер' : 'Встановити таймер сну на 30 хв'}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {videoSleepTimerSeconds
                    ? `${Math.floor(videoSleepTimerSeconds / 60)} хв`
                    : 'Таймер'}
                </span>
              </button>

              {/* Share */}
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md subtle-bg border border-theme text-main text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Скопіювати посилання"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <ExternalLink className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copiedLink ? 'Скопійовано' : 'Поділитися'}</span>
              </button>

              {/* Local File Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md subtle-bg border border-theme text-main text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Відкрити власний відеофайл (MP4/WebM)"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Файл</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="video/mp4,video/webm,video/ogg,video/*"
                onChange={handleSelectLocalFile}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>

      {/* Custom YouTube Input Section with Title */}
      <div className="p-4 subtle-bg border border-theme rounded-md shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <Youtube className="w-4 h-4 text-red-500" />
          <h4 className="text-xs font-bold text-main uppercase tracking-wider">
            Додати власний YouTube стрім або кліп у відеотеку
          </h4>
        </div>
        <form onSubmit={handleApplyCustomYoutube} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Вставте YouTube посилання (https://www.youtube.com/watch?v=... або https://youtu.be/...)"
              value={customYoutubeUrl}
              onChange={(e) => {
                setCustomYoutubeUrl(e.target.value);
                if (customError) setCustomError(null);
              }}
              className="w-full px-3 py-2 text-xs card-bg border border-theme rounded-md text-main placeholder-slate-400 focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="w-full sm:w-56">
            <input
              type="text"
              placeholder="Назва відео (опціонально)"
              value={customChannelTitle}
              onChange={(e) => setCustomChannelTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs card-bg border border-theme rounded-md text-main placeholder-slate-400 focus:outline-none focus:border-red-600"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Увімкнути</span>
          </button>
        </form>
        {customError && <p className="text-xs text-rose-500 mt-1.5 font-medium">{customError}</p>}
      </div>

      {/* Curated Channels & Clips Directory */}
      <div className="space-y-3">
        {/* Category Tabs, Search & Layout Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-theme">
          {/* Categories */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: `Всі канали (${allChannels.length})`, icon: Flame },
              { id: 'tv', label: 'Телеканали & Новини', icon: Newspaper },
              { id: 'music', label: 'Музичні кліпи', icon: Music2 },
              { id: 'studio', label: 'Студійні ефіри', icon: RadioTower },
              { id: 'saved', label: `Мої збережені (${savedChannels.length})`, icon: Bookmark },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveCategory(id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  activeCategory === id
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'subtle-bg text-sub border border-theme hover:text-main'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Search bar & View mode (Grid / List) */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Пошук кліпу або телеканалу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs card-bg border border-theme rounded-md text-main placeholder-slate-400 focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="flex items-center border border-theme rounded-md p-0.5 subtle-bg shrink-0">
              <button
                type="button"
                onClick={() => setViewLayout('grid')}
                className={`p-1 rounded-xs transition-colors cursor-pointer ${
                  viewLayout === 'grid' ? 'bg-red-600 text-white' : 'text-sub hover:text-main'
                }`}
                title="Сітка каналів"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('list')}
                className={`p-1 rounded-xs transition-colors cursor-pointer ${
                  viewLayout === 'list' ? 'bg-red-600 text-white' : 'text-sub hover:text-main'
                }`}
                title="Список каналів"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Channels Grid / List */}
        {filteredChannels.length === 0 ? (
          <div className="p-8 text-center subtle-bg border border-theme rounded-md text-sub text-xs">
            <Film className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
            <p className="font-semibold text-main">Не знайдено каналів за вашим запитом</p>
            <p className="text-[11px] mt-1">Спробуйте змінити пошукове слово або обрати іншу рубрику</p>
          </div>
        ) : viewLayout === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredChannels.map((channel) => {
              const isCurrent = activeChannel.id === channel.id;

              return (
                <div
                  key={channel.id}
                  onClick={() => handleSelectChannel(channel)}
                  className={`group relative p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? 'card-bg border-red-600 ring-2 ring-red-500/30 shadow-md'
                      : 'card-bg border-theme hover:border-red-500/50 hover:shadow-xs'
                  }`}
                >
                  {/* Visual Thumbnail */}
                  <div
                    className={`w-full aspect-video rounded-md bg-gradient-to-br ${channel.thumbnailGradient} relative flex items-center justify-center overflow-hidden mb-2.5 shadow-2xs`}
                  >
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors" />

                    {/* Play icon overlay */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform transform group-hover:scale-110 shadow-md ${
                        isCurrent
                          ? 'bg-red-600 text-white'
                          : 'bg-white/20 backdrop-blur-xs text-white group-hover:bg-red-600'
                      }`}
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>

                    {/* Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-black/75 backdrop-blur-xs text-white rounded-xs uppercase tracking-wider">
                        {channel.badgeText}
                      </span>
                      {channel.isLive && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-600 text-white rounded-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          LIVE
                        </span>
                      )}
                    </div>

                    {/* Delete button if user custom saved channel */}
                    {channel.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSavedChannel(channel.id, e)}
                        className="absolute top-2 right-2 p-1 bg-black/70 hover:bg-red-600 text-white rounded-xs transition-colors"
                        title="Видалити із збережених"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold text-red-600 dark:text-red-400 mb-0.5 uppercase tracking-wide">
                      {channel.channelName}
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-main line-clamp-1 group-hover:text-red-600 transition-colors">
                      {channel.title}
                    </h4>
                    <p className="text-[11px] text-sub line-clamp-2 mt-1">
                      {channel.description}
                    </p>
                  </div>

                  {/* Footer status */}
                  <div className="mt-2.5 pt-2 border-t border-theme/60 flex items-center justify-between text-[11px] font-semibold">
                    <span className={isCurrent ? 'text-red-600 dark:text-red-400 font-bold' : 'text-sub'}>
                      {isCurrent ? '▶ Відтворюється' : 'Дивитися'}
                    </span>
                    <Tv className="w-3.5 h-3.5 text-sub" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List Layout */
          <div className="space-y-1.5">
            {filteredChannels.map((channel) => {
              const isCurrent = activeChannel.id === channel.id;

              return (
                <div
                  key={channel.id}
                  onClick={() => handleSelectChannel(channel)}
                  className={`p-2.5 rounded-md border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isCurrent
                      ? 'card-bg border-red-600 ring-1 ring-red-500/30 shadow-xs'
                      : 'card-bg border-theme hover:border-red-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-12 h-8 rounded-xs bg-gradient-to-br ${channel.thumbnailGradient} flex items-center justify-center shrink-0 text-white`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-main truncate">
                          {channel.title}
                        </span>
                        {channel.isLive && (
                          <span className="px-1.5 py-0.2 text-[8px] font-bold bg-red-600 text-white rounded-xs">
                            LIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-sub truncate">
                        <span className="font-semibold text-red-600 dark:text-red-400">{channel.channelName}</span>
                        <span className="mx-1.5 text-muted-theme">·</span>
                        <span>{channel.description}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {channel.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSavedChannel(channel.id, e)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        title="Видалити"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className={`text-xs font-bold ${isCurrent ? 'text-red-600' : 'text-sub'}`}>
                      {isCurrent ? 'В ефірі' : 'Увімкнути'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
