/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  Heart,
  History,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Download,
  Square,
  Mic,
  CheckCircle2,
  X,
  Layers,
  ArrowUpDown,
  ArrowDownAZ,
  LayoutGrid,
  LayoutList,
} from 'lucide-react';
import {
  BroadcastRecording,
  RadioStation,
  PlaybackStatus,
  GenreType,
  CountryFilter,
  ThemeMode,
  StationSortOption,
  GroupByOption,
  DailyListeningStats,
  StationPlayStats,
  UserTrack,
  StudioPlaylist,
} from './types';
import { INITIAL_STATIONS, ROMANTIC_STATIONS, ROMANTIC_COLLECTION } from './data/stations';
import { INITIAL_STUDIO_TRACKS, INITIAL_STUDIO_PLAYLISTS } from './data/studioTracks';
import {
  saveRecordingToDb,
  loadAllRecordingsFromDb,
  deleteRecordingFromDb,
  clearAllRecordingsFromDb,
} from './utils/recordingsDb';
import {
  saveUserTrackToDb,
  loadAllUserTracksFromDb,
  deleteUserTrackFromDb,
  clearAllUserTracksFromDb,
  saveUserTracksQueueOrder,
  saveStudioPlaylists,
  loadStudioPlaylists,
  saveActivePlaylistId,
  loadActivePlaylistId,
  getOrCreateDefaultPlaylists,
} from './utils/userTracksDb';
import { initAuthSync, validateFirestoreConnection } from './firebase';
import {
  syncTrackToCloud,
  removeTrackFromCloud,
  syncFavoriteToCloud,
  syncPlaylistsToCloud,
} from './utils/cloudMusicSync';
import { Header } from './components/Header';
import { StationCard } from './components/StationCard';
import { StationRow } from './components/StationRow';
import { PlayerBar } from './components/PlayerBar';
import { StudioViewModal } from './components/StudioViewModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import { AddStationModal } from './components/AddStationModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { RecordingsModal } from './components/RecordingsModal';
import { SettingsModal } from './components/SettingsModal';
import { AudioVisualizer } from './components/AudioVisualizer';
import { FeaturedPlayer } from './components/FeaturedPlayer';
import { VideoHub } from './components/VideoHub';
import { SidebarDrawer } from './components/SidebarDrawer';
import { StudioRadioBanner } from './components/StudioRadioBanner';
import { VoiceCommandOverlay } from './components/VoiceCommandOverlay';
import { BackgroundPlaybackModal } from './components/BackgroundPlaybackModal';
import { InstallPwaModal } from './components/InstallPwaModal';
import { CarDriverModeModal } from './components/CarDriverModeModal';
import { AudioEqualizerModal } from './components/AudioEqualizerModal';
import { HardwareFmScannerModal } from './components/HardwareFmScannerModal';
import { RadioAlarmModal } from './components/RadioAlarmModal';
import { ActiveAlarmAlert } from './components/ActiveAlarmAlert';
import { BigScreenCastModal } from './components/BigScreenCastModal';
import { LiveLyricsModal } from './components/LiveLyricsModal';
import { RadioWrappedModal } from './components/RadioWrappedModal';
import { radioAlarmService, RadioAlarmConfig } from './utils/radioAlarmService';
import { liveTimeShiftManager, TimeShiftState } from './utils/liveTimeShiftBuffer';
import { aiDjAnnouncer } from './utils/aiDjAnnouncer';
import { stationCacheService } from './utils/stationCacheService';
import { audioEqualizer } from './utils/audioEqualizer';
import {
  evaluateSignalStatus,
  SignalStatus,
  isSmartRoadBufferSaved,
  saveSmartRoadBuffer,
} from './utils/signalBufferMonitor';
import {
  updateMediaSession,
  startAudioKeepAlive,
  stopAudioKeepAlive,
  enableScreenWakeLock,
  disableScreenWakeLock,
} from './utils/backgroundAudio';

// Virtual Station for Personal Studio Broadcast
const STUDIO_STATION: RadioStation = {
  id: 'my-studio-station',
  name: '🎙️ Моя Студія: Своя Хвиля',
  streamUrl: '',
  genre: 'Електроніка',
  country: 'UA',
  location: 'Моя Студія, Україна',
  city: 'Моя Студія',
  frequency: 'STUDIO LIVE',
  tagline: 'Ваша авторська станція: особисті пісні, кліпи та прямий ефір. Витягуйте наступні треки в 1 клік!',
  badgeGradient: 'from-emerald-900 via-teal-900 to-black',
  accentColor: '#10b981',
  bitrate: '320 kbps HD',
  format: 'MP3',
  habit: 'Авторський ефір',
};

// 50 Patriotic/military songs and 20 rock ballads loaded directly into the studio
const DEFAULT_STUDIO_TRACKS: UserTrack[] = INITIAL_STUDIO_TRACKS;

const GENRES: GenreType[] = [
  'Всі',
  'Хіти',
  'Рок',
  'Поп',
  'Новини',
  'Електроніка',
  'Лаунж',
  'Джаз',
  'Класика',
];

export default function App() {
  // 0. Theme State ('day' = Слобода День, 'night' = Слобода Ніч - Velvet Noir)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('sloboda_theme');
      if (saved === 'night') return 'night';
      if (saved === 'day') return 'day';
      return 'day'; // Default to light theme ('day')
    } catch {
      return 'day';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'night');
    try {
      localStorage.setItem('sloboda_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // 1. Stations List (merge INITIAL_STATIONS with custom stations)
  const [stations, setStations] = useState<RadioStation[]>(() => {
    try {
      const saved = localStorage.getItem('custom_radio_stations');
      if (saved) {
        const custom: RadioStation[] = JSON.parse(saved);
        // Avoid duplicates by id
        const initialIds = new Set(INITIAL_STATIONS.map((s) => s.id));
        const nonDuplicateCustom = custom.filter((c) => !initialIds.has(c.id));
        return [...INITIAL_STATIONS, ...nonDuplicateCustom];
      }
    } catch (e) {
      console.warn('Failed to parse custom stations from storage:', e);
    }
    return INITIAL_STATIONS;
  });

  // 2. Playback State
  const [currentStation, setCurrentStation] = useState<RadioStation>(() => {
    try {
      const lastId = localStorage.getItem('last_radio_station_id');
      if (lastId) {
        const found = INITIAL_STATIONS.find((s) => s.id === lastId);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return INITIAL_STATIONS[0]; // 'army-fm' or first station
  });

  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('idle');
  const playbackStatusRef = useRef<PlaybackStatus>(playbackStatus);
  playbackStatusRef.current = playbackStatus;

  // Helper to ensure audio volume is strictly between 0 and 1
  const getSafeVolume = (val: number): number => {
    if (isNaN(val) || !isFinite(val)) return 0.85;
    const normalized = val > 1 ? val / 100 : val;
    return Math.max(0, Math.min(1, normalized));
  };

  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('radio_volume');
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && isFinite(parsed)) {
          const normalized = parsed > 1 ? parsed / 100 : parsed;
          return Math.max(0, Math.min(1, normalized));
        }
      }
      return 0.85;
    } catch {
      return 0.85;
    }
  });

  const setVolume = useCallback((action: number | ((prev: number) => number)) => {
    setVolumeState((prev) => {
      const raw = typeof action === 'function' ? action(prev) : action;
      if (isNaN(raw) || !isFinite(raw)) return prev;
      const normalized = raw > 1 ? raw / 100 : raw;
      return Math.max(0, Math.min(1, normalized));
    });
  }, []);

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [listeningDurationSeconds, setListeningDurationSeconds] = useState<number>(0);

  // Primary Navigation View: 'radio' (Radio Studio) vs 'video' (Video Hub)
  const [activeNavMode, setActiveNavMode] = useState<'radio' | 'video'>('radio');

  // Car Driver Mode, PWA Install Modal, Equalizer Modal & Smart Road Buffer
  const [isCarModeOpen, setIsCarModeOpen] = useState<boolean>(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState<boolean>(false);
  const [isEqualizerModalOpen, setIsEqualizerModalOpen] = useState<boolean>(false);
  const [isHardwareFmOpen, setIsHardwareFmOpen] = useState<boolean>(false);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState<boolean>(false);
  const [activeAlarmFiring, setActiveAlarmFiring] = useState<RadioAlarmConfig | null>(null);
  const [isCastModalOpen, setIsCastModalOpen] = useState<boolean>(false);
  const [isLyricsModalOpen, setIsLyricsModalOpen] = useState<boolean>(false);
  const [isWrappedModalOpen, setIsWrappedModalOpen] = useState<boolean>(false);
  const [isAiDjEnabled, setIsAiDjEnabled] = useState<boolean>(() => aiDjAnnouncer.getEnabled());
  const [timeShiftState, setTimeShiftState] = useState<TimeShiftState>(() =>
    liveTimeShiftManager.getState()
  );
  const [cachedStationCount, setCachedStationCount] = useState<number>(() =>
    stationCacheService.getCachedCount()
  );

  useEffect(() => {
    const unsub = stationCacheService.subscribe(() => {
      setCachedStationCount(stationCacheService.getCachedCount());
    });
    return () => unsub();
  }, []);
  const [isSmartRoadBufferActive, setIsSmartRoadBufferActive] = useState<boolean>(() => isSmartRoadBufferSaved());
  const [signalStatus, setSignalStatus] = useState<SignalStatus>(() =>
    evaluateSignalStatus(null, false, isSmartRoadBufferSaved())
  );

  // Dedicated Video / YouTube Mode State (guarantees radio and YouTube/video never play at the same time)
  const [isVideoModeActive, setIsVideoModeActive] = useState<boolean>(false);
  const isVideoModeActiveRef = useRef<boolean>(false);
  isVideoModeActiveRef.current = isVideoModeActive;

  // 3. User Interaction: Player Bar Visibility & Smooth Animations (slide-in-up / fade-out)
  const [isPlayerVisible, setIsPlayerVisible] = useState<boolean>(false);
  const [isPlayerClosing, setIsPlayerClosing] = useState<boolean>(false);

  // User Studio Archive & Personal Station Broadcast
  const [userTracks, setUserTracks] = useState<UserTrack[]>(() => INITIAL_STUDIO_TRACKS);
  const [isPersonalBroadcastActive, setIsPersonalBroadcastActive] = useState<boolean>(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [currentPlayingTrackId, setCurrentPlayingTrackId] = useState<string | undefined>(undefined);

  // Playlists for Studio Tracks (Default: 50 Military/Patriotic & 20 Rock Ballads)
  const [playlists, setPlaylists] = useState<StudioPlaylist[]>(() => {
    try {
      return getOrCreateDefaultPlaylists(INITIAL_STUDIO_TRACKS.map((t) => t.id));
    } catch {
      return INITIAL_STUDIO_PLAYLISTS;
    }
  });
  const [activePlaylistId, setActivePlaylistId] = useState<string>(() => {
    try {
      const saved = loadActivePlaylistId();
      return saved || 'playlist-patriotic';
    } catch {
      return 'playlist-patriotic';
    }
  });

  const activePlaylist = useMemo(() => {
    return playlists.find((p) => p.id === activePlaylistId) || playlists[0];
  }, [playlists, activePlaylistId]);

  const [isShuffle, setIsShuffle] = useState<boolean>(() => {
    try {
      return localStorage.getItem('radio_studio_shuffle') === 'true';
    } catch {
      return false;
    }
  });
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>(() => {
    try {
      const saved = localStorage.getItem('radio_studio_repeat');
      return saved === 'off' || saved === 'all' || saved === 'one' ? saved : 'all';
    } catch {
      return 'all';
    }
  });
  const onAudioEndedRef = useRef<(() => void) | null>(null);
  const isShuffleRef = useRef(isShuffle);
  isShuffleRef.current = isShuffle;
  const repeatModeRef = useRef(repeatMode);
  repeatModeRef.current = repeatMode;

  useEffect(() => {
    localStorage.setItem('radio_studio_shuffle', String(isShuffle));
  }, [isShuffle]);

  useEffect(() => {
    localStorage.setItem('radio_studio_repeat', repeatMode);
  }, [repeatMode]);

  // 4. Statistics Tracking (Task 3)
  const [dailyStats, setDailyStats] = useState<DailyListeningStats>(() => {
    try {
      const saved = localStorage.getItem('radio_daily_listening_stats');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [stationPlayStats, setStationPlayStats] = useState<StationPlayStats>(() => {
    try {
      const saved = localStorage.getItem('radio_station_play_counts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // 5. Sorting & Grouping State (Default to Ukrainian alphabetical A-Z order)
  const [sortOption, setSortOption] = useState<StationSortOption>(() => {
    try {
      const saved = localStorage.getItem('radio_sort_option');
      return (saved as StationSortOption) || 'alphabetical';
    } catch {
      return 'alphabetical';
    }
  });
  const [groupBy, setGroupBy] = useState<GroupByOption>(() => {
    try {
      const saved = localStorage.getItem('radio_group_by');
      return (saved as GroupByOption) || 'none';
    } catch {
      return 'none';
    }
  });
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [viewLayout, setViewLayout] = useState<'rows' | 'cards'>('rows');

  useEffect(() => {
    try {
      localStorage.setItem('radio_sort_option', sortOption);
    } catch {
      // ignore
    }
  }, [sortOption]);

  useEffect(() => {
    try {
      localStorage.setItem('radio_group_by', groupBy);
    } catch {
      // ignore
    }
  }, [groupBy]);

  // 6. User Preferences: Favorites & History
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('radio_favorites');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out any stale removed ids
        const valid = parsed.filter((id: string) => id !== 'sex-music' && id !== 'erotic-lounge');
        return valid.length > 0 ? valid : ['army-fm', 'sloboda', 'hit-fm'];
      }
      return ['army-fm', 'sloboda', 'hit-fm'];
    } catch {
      return ['army-fm', 'sloboda', 'hit-fm'];
    }
  });

  const [recentHistory, setRecentHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('radio_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        const valid = parsed.filter((id: string) => id !== 'sex-music' && id !== 'erotic-lounge');
        return valid.length > 0 ? valid : ['army-fm', 'sloboda'];
      }
      return ['army-fm', 'sloboda'];
    } catch {
      return ['army-fm', 'sloboda'];
    }
  });

  // 7. Filters
  const [genreFilter, setGenreFilter] = useState<GenreType>('Всі');
  const [countryFilter, setCountryFilter] = useState<CountryFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [showRomanticOnly, setShowRomanticOnly] = useState<boolean>(false);

  // 8. Modals & Drawers
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState<boolean>(false);
  const [isAddStationOpen, setIsAddStationOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isRecordingsOpen, setIsRecordingsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState<boolean>(false);
  const [isBackgroundPlaybackOpen, setIsBackgroundPlaybackOpen] = useState<boolean>(false);

  // 9. Sleep Timer
  const [sleepTimerSeconds, setSleepTimerSeconds] = useState<number | null>(null);

  // 10. Audio Snippet Recording
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordings, setRecordings] = useState<BroadcastRecording[]>([]);
  const [latestSavedRecording, setLatestSavedRecording] = useState<BroadcastRecording | null>(null);
  const [recordingToast, setRecordingToast] = useState<{
    title: string;
    subtitle: string;
    recording: BroadcastRecording;
  } | null>(null);

  // References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingSecondsRef = useRef<number>(0);
  const isRecordingRef = useRef<boolean>(false);
  const retryCountRef = useRef<number>(0);
  const retryTimeoutRef = useRef<number | null>(null);
  const currentStationRef = useRef<RadioStation>(currentStation);
  currentStationRef.current = currentStation;

  // Load saved recordings and user studio tracks from IndexedDB on initial mount
  useEffect(() => {
    loadAllRecordingsFromDb()
      .then((items) => {
        setRecordings(items);
        if (items.length > 0) {
          setLatestSavedRecording(items[0]);
        }
      })
      .catch((err) => console.warn('Could not load recordings from db:', err));

    loadAllUserTracksFromDb()
      .then((tracks) => {
        const initialMap = new Map(INITIAL_STUDIO_TRACKS.map((t) => [t.id, t]));
        const sanitizedTracks = (tracks || []).map((t) => {
          // If track is one of the initial studio tracks, ALWAYS ensure its blobUrl and videoUrl are synced from INITIAL_STUDIO_TRACKS!
          if (initialMap.has(t.id)) {
            const initTrack = initialMap.get(t.id)!;
            return {
              ...t,
              title: initTrack.title,
              artist: initTrack.artist,
              blobUrl: initTrack.blobUrl,
              videoUrl: initTrack.videoUrl,
            };
          }
          return t;
        });

        if (sanitizedTracks && sanitizedTracks.length > 0) {
          const existingIds = new Set(sanitizedTracks.map((t) => t.id));
          const missingInitial = INITIAL_STUDIO_TRACKS.filter((t) => !existingIds.has(t.id));
          const combined = missingInitial.length > 0 ? [...sanitizedTracks, ...missingInitial] : sanitizedTracks;
          setUserTracks(combined);
          const pls = getOrCreateDefaultPlaylists(combined.map((t) => t.id));
          setPlaylists(pls);
        } else {
          setUserTracks(DEFAULT_STUDIO_TRACKS);
          const pls = getOrCreateDefaultPlaylists(DEFAULT_STUDIO_TRACKS.map((t) => t.id));
          setPlaylists(pls);
        }
      })
      .catch((err) => {
        console.warn('Could not load user tracks from db:', err);
        setUserTracks(DEFAULT_STUDIO_TRACKS);
        const pls = getOrCreateDefaultPlaylists(DEFAULT_STUDIO_TRACKS.map((t) => t.id));
        setPlaylists(pls);
      });
  }, []);

  // Firebase Firestore & Cloud Session sync lifecycle
  useEffect(() => {
    validateFirestoreConnection().catch(() => {});
    const unsub = initAuthSync(() => {
      // User active cloud session initialized
    });
    return () => unsub();
  }, []);

  // Save volume & favorites
  useEffect(() => {
    localStorage.setItem('radio_volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('radio_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('radio_history', JSON.stringify(recentHistory));
  }, [recentHistory]);

  // Handle HTML Audio element setup
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = 'none';
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    // We intentionally DO NOT set audio.crossOrigin = 'anonymous' because many
    // live Icecast radio streams do not send Access-Control-Allow-Origin: *,
    // and standard HTML5 audio elements play cross-origin streams cleanly as opaque media.

    // Initialize Web Audio API 3-Band DSP Equalizer & Live Time-Shift DVR
    audioEqualizer.init(audio);
    liveTimeShiftManager.init(audio);

    const unsubTimeShift = liveTimeShiftManager.subscribe((st) => {
      setTimeShiftState(st);
    });

    const updateSignal = () => {
      setSignalStatus(
        evaluateSignalStatus(
          audio,
          playbackStatusRef.current === 'loading',
          isSmartRoadBufferActive
        )
      );
    };

    audio.addEventListener('progress', updateSignal);
    audio.addEventListener('waiting', updateSignal);
    audio.addEventListener('playing', updateSignal);
    audio.addEventListener('timeupdate', updateSignal);

    audio.onwaiting = () => {
      setPlaybackStatus('loading');
      updateSignal();
    };
    audio.onplaying = () => {
      setPlaybackStatus('playing');
      retryCountRef.current = 0;
      updateSignal();
    };
    audio.onpause = () => {
      // In video/YouTube mode, audioRef is paused deliberately, so do not override video playback status
      if (isVideoModeActiveRef.current) return;
      if (playbackStatusRef.current !== 'loading' && playbackStatusRef.current !== 'error') {
        setPlaybackStatus('paused');
      }
    };
    audio.onstalled = () => {
      updateSignal();
    };
    audio.onerror = (e) => {
      const err = audio.error;
      console.warn('Audio stream error event:', err?.code, err?.message, e);
      if (playbackStatusRef.current === 'paused' || playbackStatusRef.current === 'idle') {
        return;
      }
      // Automatic intelligent retry on network drops / socket disconnects
      if (retryCountRef.current < 3) {
        retryCountRef.current += 1;
        setPlaybackStatus('loading');
        if (retryTimeoutRef.current) window.clearTimeout(retryTimeoutRef.current);
        const delay = retryCountRef.current === 1 ? 600 : 1500;
        retryTimeoutRef.current = window.setTimeout(() => {
          const st = currentStationRef.current;
          if (!st || !audioRef.current) return;
          // Bust stale TCP / Icecast sockets with timestamp query parameter
          const sep = st.streamUrl.includes('?') ? '&' : '?';
          const retryUrl = `${st.streamUrl}${sep}_r=${Date.now()}`;
          audioRef.current.pause();
          audioRef.current.src = retryUrl;
          audioRef.current.load();
          audioRef.current.play().catch((playErr) => {
            if (playErr.name !== 'AbortError') {
              console.warn('Auto-retry connection error:', playErr);
            }
          });
        }, delay);
      } else {
        setPlaybackStatus('error');
      }
    };
    audio.onended = () => {
      onAudioEndedRef.current?.();
    };

    const handleVisibilityChange = () => {
      // In background tabs or locked screens, do not pause audio
      if (!document.hidden && audioRef.current && audioRef.current.paused) {
        // If user came back and it was supposed to play, can safely re-verify
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      unsubTimeShift();
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Add stations discovered by the FM Auto-Scanner to the main station directory
  const handleAddStationsFromScanner = useCallback((newStations: RadioStation[]) => {
    setStations((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const existingUrls = new Set(prev.map((s) => s.streamUrl));
      const toAdd = newStations.filter(
        (s) => !existingIds.has(s.id) && !existingUrls.has(s.streamUrl)
      );
      if (toAdd.length === 0) return prev;
      const updated = [...prev, ...toAdd];
      try {
        const customStations = updated.filter((s) => s.isCustom);
        localStorage.setItem('custom_radio_stations', JSON.stringify(customStations));
      } catch (err) {
        console.warn('Failed to save stations to storage:', err);
      }
      return updated;
    });
  }, []);

  // Update volume & mute on audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : getSafeVolume(volume);
    }
  }, [volume, isMuted]);

  // Track listening duration & update daily statistics
  useEffect(() => {
    let interval: number | null = null;
    if (playbackStatus === 'playing') {
      interval = window.setInterval(() => {
        setListeningDurationSeconds((prev) => prev + 1);

        // Daily statistics tracking
        const todayIso = new Date().toISOString().split('T')[0];
        setDailyStats((prev) => {
          const currentDaySecs = prev[todayIso] || 0;
          const updated = {
            ...prev,
            [todayIso]: currentDaySecs + 1,
          };
          // Persist throttled
          try {
            localStorage.setItem('radio_daily_listening_stats', JSON.stringify(updated));
          } catch {
            // ignore
          }
          return updated;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [playbackStatus]);

  // Handle Sleep Timer Countdown
  useEffect(() => {
    if (sleepTimerSeconds === null || sleepTimerSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setSleepTimerSeconds((prev) => {
        if (prev === null || prev <= 1) {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          setPlaybackStatus('paused');
          setIsPersonalBroadcastActive(false);
          setCurrentPlayingTrackId(undefined);
          return null;
        }

        if (prev <= 10 && audioRef.current && !isMuted) {
          const fadeVol = Math.max(0, Math.min(1, (prev / 10) * getSafeVolume(volume)));
          audioRef.current.volume = fadeVol;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepTimerSeconds, volume, isMuted]);

  // Close Player with requested smooth fade-out animation
  const handleClosePlayer = useCallback(() => {
    setIsPlayerClosing(true);
    setTimeout(() => {
      setIsPlayerVisible(false);
      setIsPlayerClosing(false);
    }, 240);
  }, []);

  // Start / Play a Station
  const playStation = useCallback((station: RadioStation) => {
    if (!audioRef.current) return;

    // Show bottom player when any station is clicked with slide-in-up
    setIsPlayerClosing(false);
    setIsPlayerVisible(true);
    // Explicitly deactivate Studio & Video/YouTube mode so only the radio station plays
    setIsPersonalBroadcastActive(false);
    setIsVideoModeActive(false);
    setCurrentPlayingTrackId(undefined);

    setCurrentStation(station);
    localStorage.setItem('last_radio_station_id', station.id);

    // Track station play counts (Task 5 & Task 3)
    setStationPlayStats((prev) => {
      const updated = {
        ...prev,
        [station.id]: (prev[station.id] || 0) + 1,
      };
      try {
        localStorage.setItem('radio_station_play_counts', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // Add to recent history
    setRecentHistory((prev) => {
      const filtered = prev.filter((id) => id !== station.id);
      return [station.id, ...filtered].slice(0, 10);
    });

    setPlaybackStatus('loading');
    stationCacheService.recordStationPlayed(station);
    setIsMuted(false);
    audioRef.current.volume = getSafeVolume(Math.max(0.1, volume));

    // Reset retry state on user-initiated play
    if (retryTimeoutRef.current) {
      window.clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    retryCountRef.current = 0;

    // Clean pause and load for dependable stream switching
    audioRef.current.pause();
    if (audioRef.current.src !== station.streamUrl) {
      audioRef.current.src = station.streamUrl;
    }
    audioRef.current.load();

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setPlaybackStatus('playing');
          retryCountRef.current = 0;
        })
        .catch((err) => {
          // AbortError is normal during rapid station switching or load interruptions
          if (err.name === 'AbortError') return;
          if (err.name === 'NotAllowedError') {
            setPlaybackStatus('paused');
            return;
          }
          console.warn('Playback interrupted or failed:', err);
          // Attempt 1 fast retry before failing to error UI
          if (retryCountRef.current < 2) {
            retryCountRef.current += 1;
            setTimeout(() => {
              if (audioRef.current && currentStationRef.current.id === station.id) {
                audioRef.current.load();
                audioRef.current
                  .play()
                  .then(() => setPlaybackStatus('playing'))
                  .catch(() => setPlaybackStatus('error'));
              }
            }, 600);
          } else {
            setPlaybackStatus('error');
          }
        });
    }
  }, []);

  // Radio Alarm Scheduler Trigger Listener
  useEffect(() => {
    radioAlarmService.setOnAlarmTrigger((alarm) => {
      setActiveAlarmFiring(alarm);
      const st = stations.find((s) => s.id === alarm.stationId) || stations[0];
      if (st) {
        playStation(st);
        setVolume(0);
        setIsMuted(false);

        const targetVol = Math.max(0, Math.min(1, alarm.targetVolume > 1 ? alarm.targetVolume / 100 : alarm.targetVolume));
        const durationMs = (alarm.fadeInDurationSeconds || 45) * 1000;
        const steps = 30;
        const stepTime = durationMs / steps;
        const volIncrement = targetVol / steps;
        let currentVol = 0;

        const fadeTimer = setInterval(() => {
          currentVol = Math.min(targetVol, currentVol + volIncrement);
          setVolume(currentVol);
          if (currentVol >= targetVol) {
            clearInterval(fadeTimer);
          }
        }, stepTime);
      } else {
        radioAlarmService.playFallbackChime();
      }
    });
  }, [stations, playStation]);

  // Studio User Tracks & Personal Station Broadcast Management
  const userTracksRef = useRef<UserTrack[]>(userTracks);
  userTracksRef.current = userTracks;

  const currentTrackIndexRef = useRef<number>(currentTrackIndex);
  currentTrackIndexRef.current = currentTrackIndex;

  const isPersonalBroadcastActiveRef = useRef<boolean>(isPersonalBroadcastActive);
  isPersonalBroadcastActiveRef.current = isPersonalBroadcastActive;

  // Dedicated Video / YouTube Mode Handler (guarantees mutual exclusivity: no overlap)
  const handleVideoModeToggle = useCallback(
    (isVideo: boolean) => {
      setIsVideoModeActive(isVideo);
      if (isVideo) {
        // VIDEO / YOUTUBE MODE ACTIVATED:
        // Immediately pause radio stream or studio audio in audioRef so they NEVER play simultaneously!
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
        }
        setPlaybackStatus('playing');
      } else {
        // RADIO / AUDIO MODE RESTORED:
        // FeaturedPlayer unmounts the YouTube iframe.
        // Resume appropriate audio source cleanly:
        if (isPersonalBroadcastActiveRef.current) {
          const list = userTracksRef.current;
          const track = list[currentTrackIndexRef.current];
          if (track && !track.isVideo && !track.videoUrl && audioRef.current) {
            audioRef.current.play().then(() => setPlaybackStatus('playing')).catch(() => {});
          }
        } else if (currentStation && audioRef.current) {
          if (audioRef.current.src !== currentStation.streamUrl) {
            audioRef.current.src = currentStation.streamUrl;
            audioRef.current.load();
          }
          audioRef.current.play().then(() => setPlaybackStatus('playing')).catch(() => {});
        }
      }
    },
    [currentStation]
  );

  const playTrack = useCallback(
    (track: UserTrack) => {
      if (!audioRef.current) return;

      setIsPersonalBroadcastActive(true);
      setIsVideoModeActive(false);
      setIsPlayerClosing(false);
      setIsPlayerVisible(true);
      setCurrentPlayingTrackId(track.id);

      const list = userTracksRef.current;
      const foundIdx = list.findIndex((t) => t.id === track.id);
      if (foundIdx !== -1) {
        setCurrentTrackIndex(foundIdx);
      }

      // Only pure video files explicitly marked as isVideo without an audio blobUrl bypass the audio element
      const isPureVideoOnly = Boolean(track.isVideo && !track.blobUrl);

      if (isPureVideoOnly) {
        setIsVideoModeActive(true);
        audioRef.current.pause();
        audioRef.current.src = '';
        setPlaybackStatus('playing');
      } else {
        setIsVideoModeActive(false);
        audioRef.current.pause();

        const soundUrl = track.blobUrl
          ? (track.blobUrl.startsWith('http') || track.blobUrl.startsWith('blob:')
              ? track.blobUrl
              : new URL(track.blobUrl, window.location.href).href)
          : '/audio/himn_ukrainy.mp3';

        audioRef.current.src = soundUrl;
        audioRef.current.volume = isMuted ? 0 : getSafeVolume(volume);
        audioRef.current.muted = isMuted;
        audioRef.current.load();
        setPlaybackStatus('loading');

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setPlaybackStatus('playing');
            })
            .catch((err) => {
              if (err.name === 'AbortError') return;
              console.warn('Initial play failed for track:', track.title, soundUrl, err);
              // Retry on the next execution turn
              setTimeout(() => {
                if (audioRef.current && audioRef.current.src === soundUrl) {
                  audioRef.current
                    .play()
                    .then(() => setPlaybackStatus('playing'))
                    .catch(() => setPlaybackStatus('error'));
                }
              }, 60);
            });
        }
      }
    },
    [volume, isMuted]
  );

  const playUserTrackByIndex = useCallback(
    (index: number) => {
      const list = userTracksRef.current;
      if (list.length === 0) return;
      const validIndex = (index + list.length) % list.length;
      setCurrentTrackIndex(validIndex);
      const track = list[validIndex];
      if (track) {
        playTrack(track);
      }
    },
    [playTrack]
  );

  const handlePlayUserTrack = useCallback(
    (track: UserTrack, targetPlaylistId?: string) => {
      if (targetPlaylistId) {
        setActivePlaylistId(targetPlaylistId);
        saveActivePlaylistId(targetPlaylistId);
      }
      // If clicking currently active track, toggle pause/play
      if (track.id === currentPlayingTrackId && isPersonalBroadcastActive) {
        if (playbackStatus === 'playing') {
          audioRef.current?.pause();
          setPlaybackStatus('paused');
          return;
        } else if (playbackStatus === 'paused') {
          audioRef.current?.play().then(() => setPlaybackStatus('playing')).catch(() => setPlaybackStatus('error'));
          return;
        }
      }
      playTrack(track);
    },
    [currentPlayingTrackId, isPersonalBroadcastActive, playbackStatus, playTrack]
  );

  const togglePersonalBroadcast = useCallback(() => {
    if (userTracks.length === 0) return;
    if (isPersonalBroadcastActive) {
      // Toggle play/pause for personal broadcast without switching to radio station!
      if (playbackStatus === 'playing') {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setPlaybackStatus('paused');
      } else {
        if (isVideoModeActive) {
          setPlaybackStatus('playing');
        } else if (audioRef.current) {
          const track = userTracks[currentTrackIndex] || userTracks[0];
          if (!audioRef.current.src || audioRef.current.src === window.location.href) {
            if (track) playTrack(track);
          } else {
            audioRef.current
              .play()
              .then(() => setPlaybackStatus('playing'))
              .catch(() => {
                if (track) playTrack(track);
              });
          }
        }
      }
    } else {
      const track = userTracks[currentTrackIndex] || userTracks[0];
      if (track) {
        playTrack(track);
      }
    }
  }, [userTracks, isPersonalBroadcastActive, playbackStatus, isVideoModeActive, currentTrackIndex, playTrack]);

  // Studio Playlists Handlers
  const handleSelectPlaylist = useCallback((id: string) => {
    setActivePlaylistId(id);
    saveActivePlaylistId(id);
  }, []);

  const handleCreatePlaylist = useCallback((name: string, color?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newPl: StudioPlaylist = {
      id: `playlist-${Date.now()}`,
      name: trimmed,
      createdAt: Date.now(),
      trackIds: [],
      color: color || 'emerald',
    };
    setPlaylists((prev) => {
      const updated = [...prev, newPl];
      saveStudioPlaylists(updated);
      return updated;
    });
    handleSelectPlaylist(newPl.id);
  }, [handleSelectPlaylist]);

  const handleRenamePlaylist = useCallback((id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setPlaylists((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, name: trimmed } : p));
      saveStudioPlaylists(updated);
      return updated;
    });
  }, []);

  const handleDeletePlaylist = useCallback(
    (id: string) => {
      setPlaylists((prev) => {
        if (prev.length <= 1) return prev;
        const updated = prev.filter((p) => p.id !== id);
        saveStudioPlaylists(updated);
        if (activePlaylistId === id) {
          handleSelectPlaylist(updated[0].id);
        }
        return updated;
      });
    },
    [activePlaylistId, handleSelectPlaylist]
  );

  const handleMoveTrackToPlaylist = useCallback((trackId: string, targetPlaylistId: string) => {
    setPlaylists((prev) => {
      const updated = prev.map((p) => {
        if (p.id === targetPlaylistId && !p.trackIds.includes(trackId)) {
          return { ...p, trackIds: [trackId, ...p.trackIds] };
        }
        return p;
      });
      saveStudioPlaylists(updated);
      return updated;
    });
  }, []);

  const handleRemoveTrackFromPlaylist = useCallback((trackId: string, playlistId: string) => {
    setPlaylists((prev) => {
      const updated = prev.map((p) => {
        if (p.id === playlistId) {
          return { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) };
        }
        return p;
      });
      saveStudioPlaylists(updated);
      return updated;
    });
  }, []);

  const handleAddUserTracks = useCallback(
    async (files: File[], targetPlaylistId?: string) => {
      const effectivePlaylistId = targetPlaylistId || activePlaylistId;
      const newTracks: UserTrack[] = [];
      for (const file of files) {
        const id = 'track-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
        const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
        const trackData: Omit<UserTrack, 'blobUrl'> = {
          id,
          title: cleanTitle,
          fileName: file.name,
          sizeBytes: file.size,
          timestamp: Date.now(),
          isVideo,
          playlistId: effectivePlaylistId,
        };
        await saveUserTrackToDb(trackData, file);
        const url = URL.createObjectURL(file);
        newTracks.push({
          ...trackData,
          blobUrl: url,
          videoUrl: isVideo ? url : undefined,
        });
      }
      setUserTracks((prev) => {
        const updated = [...newTracks, ...prev];
        saveUserTracksQueueOrder(updated.map((t) => t.id));
        return updated;
      });
      // Cloud backup to Firestore
      newTracks.forEach((t) => {
        syncTrackToCloud(t).catch(() => {});
      });
      if (effectivePlaylistId) {
        const addedIds = newTracks.map((t) => t.id);
        setPlaylists((prev) => {
          const updated = prev.map((pl) => {
            if (pl.id === effectivePlaylistId) {
              return {
                ...pl,
                trackIds: [...addedIds, ...pl.trackIds],
              };
            }
            return pl;
          });
          saveStudioPlaylists(updated);
          syncPlaylistsToCloud(updated).catch(() => {});
          return updated;
        });
      }
    },
    [activePlaylistId]
  );

  const handleAddUserTrack = useCallback(
    async (trackData: Omit<UserTrack, 'id' | 'timestamp'>) => {
      const id = 'track-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      const effectivePlaylistId = trackData.playlistId || activePlaylistId;
      const newTrack: UserTrack = {
        ...trackData,
        id,
        timestamp: Date.now(),
        playlistId: effectivePlaylistId,
      };
      setUserTracks((prev) => {
        const updated = [newTrack, ...prev];
        saveUserTracksQueueOrder(updated.map((t) => t.id));
        return updated;
      });
      syncTrackToCloud(newTrack).catch(() => {});
      if (effectivePlaylistId) {
        setPlaylists((prev) => {
          const updated = prev.map((pl) => {
            if (pl.id === effectivePlaylistId) {
              return {
                ...pl,
                trackIds: [id, ...(pl.trackIds || [])],
              };
            }
            return pl;
          });
          saveStudioPlaylists(updated);
          syncPlaylistsToCloud(updated).catch(() => {});
          return updated;
        });
      }
    },
    [activePlaylistId]
  );

  // 1-Click Pull Next Track from Studio (User feature: "якщо пісня не подобається — кліком наступну витягувати")
  const handleNextStudioTrack = useCallback(() => {
    const currentPl = playlists.find((p) => p.id === activePlaylistId) || playlists[0];
    let pool = userTracks;
    if (currentPl && currentPl.trackIds && currentPl.trackIds.length > 0) {
      const trackMap = new Map(userTracks.map((t) => [t.id, t]));
      const plTracks = currentPl.trackIds
        .map((id) => trackMap.get(id))
        .filter((t): t is UserTrack => Boolean(t));
      if (plTracks.length > 0) {
        pool = plTracks;
      }
    }
    if (pool.length === 0) {
      pool = DEFAULT_STUDIO_TRACKS;
    }
    const nextIdx = (currentTrackIndex + 1) % pool.length;
    setIsPersonalBroadcastActive(true);
    setIsPlayerClosing(false);
    setIsPlayerVisible(true);

    const nextTrack = pool[nextIdx];
    if (isAiDjEnabled && nextTrack) {
      aiDjAnnouncer.announceTrack(nextTrack.title, nextTrack.artist, currentPl?.name, () => {
        playUserTrackByIndex(nextIdx);
      });
    } else {
      playUserTrackByIndex(nextIdx);
    }
  }, [playlists, activePlaylistId, userTracks, currentTrackIndex, playUserTrackByIndex, isAiDjEnabled]);

  const handleDeleteUserTrack = useCallback(
    async (id: string) => {
      await deleteUserTrackFromDb(id);
      removeTrackFromCloud(id).catch(() => {});
      setUserTracks((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        saveUserTracksQueueOrder(updated.map((t) => t.id));
        return updated;
      });
      setPlaylists((prev) => {
        const updated = prev.map((pl) => ({
          ...pl,
          trackIds: (pl.trackIds || []).filter((tid) => tid !== id),
        }));
        saveStudioPlaylists(updated);
        syncPlaylistsToCloud(updated).catch(() => {});
        return updated;
      });
      if (currentPlayingTrackId === id) {
        setCurrentPlayingTrackId(undefined);
      }
    },
    [currentPlayingTrackId]
  );

  const handleReorderUserTracks = useCallback(
    (newTracks: UserTrack[], playlistId?: string) => {
      const targetPlId = playlistId || activePlaylistId;
      if (targetPlId) {
        setPlaylists((prev) => {
          const updated = prev.map((pl) => {
            if (pl.id === targetPlId) {
              return {
                ...pl,
                trackIds: newTracks.map((t) => t.id),
              };
            }
            return pl;
          });
          saveStudioPlaylists(updated);
          return updated;
        });
      }
      setUserTracks((prev) => {
        const reorderedIds = new Set(newTracks.map((t) => t.id));
        const remaining = prev.filter((t) => !reorderedIds.has(t.id));
        const combined = [...newTracks, ...remaining];
        saveUserTracksQueueOrder(combined.map((t) => t.id));
        return combined;
      });
      if (currentPlayingTrackId) {
        const newIdx = newTracks.findIndex((t) => t.id === currentPlayingTrackId);
        if (newIdx !== -1) {
          setCurrentTrackIndex(newIdx);
        }
      }
    },
    [activePlaylistId, currentPlayingTrackId]
  );

  const handleClearAllUserTracks = useCallback(async () => {
    await clearAllUserTracksFromDb();
    setUserTracks([]);
    saveUserTracksQueueOrder([]);
    setIsPersonalBroadcastActive(false);
    setCurrentPlayingTrackId(undefined);
  }, []);

  // Hook up audio.onended to advance personal broadcast continuous playback with shuffle and repeat support
  useEffect(() => {
    onAudioEndedRef.current = () => {
      if (isPersonalBroadcastActiveRef.current && userTracksRef.current.length > 0) {
        const tracks = userTracksRef.current;
        const currentIdx = currentTrackIndexRef.current;

        if (repeatModeRef.current === 'one') {
          playUserTrackByIndex(currentIdx);
          return;
        }

        if (isShuffleRef.current && tracks.length > 1) {
          let randomIdx = Math.floor(Math.random() * tracks.length);
          if (randomIdx === currentIdx) {
            randomIdx = (currentIdx + 1) % tracks.length;
          }
          playUserTrackByIndex(randomIdx);
          return;
        }

        if (repeatModeRef.current === 'off' && currentIdx >= tracks.length - 1) {
          setPlaybackStatus('paused');
          return;
        }

        const nextIdx = (currentIdx + 1) % tracks.length;
        playUserTrackByIndex(nextIdx);
      }
    };
  }, [playUserTrackByIndex]);

  // Toggle Play / Pause
  const togglePlay = useCallback(
    (targetStation?: RadioStation) => {
      // If a radio station was requested (row, card, or selector)
      if (targetStation && targetStation.id !== STUDIO_STATION.id) {
        // If studio or video mode was active, or a different station was clicked: switch to playing that radio station!
        if (isPersonalBroadcastActive || isVideoModeActive || targetStation.id !== currentStation.id) {
          playStation(targetStation);
          return;
        }
      }

      setIsPlayerClosing(false);
      setIsPlayerVisible(true);

      // 1. If in video / YouTube mode: toggle video playback status
      if (isVideoModeActive) {
        if (playbackStatus === 'playing') {
          setPlaybackStatus('paused');
        } else {
          setPlaybackStatus('playing');
        }
        return;
      }

      // 2. If in personal studio broadcast mode: toggle audioRef for current studio track
      if (isPersonalBroadcastActive) {
        if (!audioRef.current) return;
        if (playbackStatus === 'playing') {
          audioRef.current.pause();
          setPlaybackStatus('paused');
        } else {
          setPlaybackStatus('loading');
          audioRef.current
            .play()
            .then(() => setPlaybackStatus('playing'))
            .catch(() => setPlaybackStatus('error'));
        }
        return;
      }

      // 3. Regular radio station mode:
      if (!audioRef.current) return;
      if (playbackStatus === 'playing') {
        audioRef.current.pause();
        setPlaybackStatus('paused');
      } else {
        const stationToPlay = targetStation && targetStation.id !== STUDIO_STATION.id ? targetStation : currentStation;
        if (audioRef.current.src !== stationToPlay.streamUrl) {
          playStation(stationToPlay);
        } else {
          setIsMuted(false);
          audioRef.current.volume = getSafeVolume(Math.max(0.1, volume));
          setPlaybackStatus('loading');
          audioRef.current
            .play()
            .then(() => setPlaybackStatus('playing'))
            .catch(() => setPlaybackStatus('error'));
        }
      }
    },
    [currentStation, playbackStatus, playStation, isPersonalBroadcastActive, isVideoModeActive]
  );

  // Retry on error (user-triggered manual retry or automatic recovery)
  const retryPlayback = useCallback(() => {
    if (!audioRef.current) return;
    if (retryTimeoutRef.current) {
      window.clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    retryCountRef.current = 0;
    setPlaybackStatus('loading');

    // Bust any stale or hung sockets by passing fresh timestamp param
    const sep = currentStation.streamUrl.includes('?') ? '&' : '?';
    const freshUrl = `${currentStation.streamUrl}${sep}_retry=${Date.now()}`;

    audioRef.current.pause();
    audioRef.current.src = freshUrl;
    audioRef.current.load();
    audioRef.current
      .play()
      .then(() => {
        setPlaybackStatus('playing');
        retryCountRef.current = 0;
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.warn('Manual retry error:', err);
          setPlaybackStatus('error');
        }
      });
  }, [currentStation]);

  // Skip stations
  const nextStation = useCallback(() => {
    if (isPersonalBroadcastActive && userTracks.length > 0) {
      playUserTrackByIndex(currentTrackIndex + 1);
      return;
    }
    const currentIndex = stations.findIndex((s) => s.id === currentStation.id);
    const nextIndex = (currentIndex + 1) % stations.length;
    playStation(stations[nextIndex]);
  }, [stations, currentStation, playStation, isPersonalBroadcastActive, userTracks.length, currentTrackIndex, playUserTrackByIndex]);

  const prevStation = useCallback(() => {
    if (isPersonalBroadcastActive && userTracks.length > 0) {
      playUserTrackByIndex(currentTrackIndex - 1);
      return;
    }
    const currentIndex = stations.findIndex((s) => s.id === currentStation.id);
    const prevIndex = (currentIndex - 1 + stations.length) % stations.length;
    playStation(stations[prevIndex]);
  }, [stations, currentStation, playStation, isPersonalBroadcastActive, userTracks.length, currentTrackIndex, playUserTrackByIndex]);

  // Background Audio & MediaSession Sync (Lock screen controls & background continuity)
  useEffect(() => {
    const isPlaying = playbackStatus === 'playing';

    if (isPlaying) {
      startAudioKeepAlive();
    } else {
      stopAudioKeepAlive();
    }

    let trackTitle = currentStation.name;
    let trackArtist = currentStation.tagline || 'Онлайн радіо Слобода';
    if (isPersonalBroadcastActive && currentPlayingTrackId) {
      const trk = userTracks.find((t) => t.id === currentPlayingTrackId);
      if (trk) {
        trackTitle = trk.title;
        trackArtist = trk.artist || 'Студійний ефір • Своя хвиля';
      }
    }

    updateMediaSession({
      station: currentStation,
      isPlaying,
      trackTitle,
      trackArtist,
      onPlay: () => {
        if (playbackStatus !== 'playing') togglePlay();
      },
      onPause: () => {
        if (playbackStatus === 'playing') togglePlay();
      },
      onPrev: prevStation,
      onNext: nextStation,
      onStop: () => {
        if (playbackStatus === 'playing') togglePlay();
      },
    });
  }, [
    currentStation,
    playbackStatus,
    isPersonalBroadcastActive,
    currentPlayingTrackId,
    userTracks,
    togglePlay,
    prevStation,
    nextStation,
  ]);

  // Toggle Favorite
  const toggleFavorite = useCallback((stationId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const isFav = prev.includes(stationId);
      const updated = isFav
        ? prev.filter((id) => id !== stationId)
        : [...prev, stationId];
      const targetStation = stations.find((s) => s.id === stationId);
      syncFavoriteToCloud(stationId, !isFav, targetStation?.name).catch(() => {});
      return updated;
    });
  }, [stations]);

  // Add custom station
  const handleAddStation = useCallback(
    (newStation: RadioStation) => {
      setStations((prev) => [newStation, ...prev]);
      try {
        const saved = localStorage.getItem('custom_radio_stations');
        const customList = saved ? JSON.parse(saved) : [];
        localStorage.setItem(
          'custom_radio_stations',
          JSON.stringify([newStation, ...customList])
        );
      } catch {
        // ignore
      }
      playStation(newStation);
    },
    [playStation]
  );

  // Sleep timer controls
  const handleSetSleepTimer = useCallback((minutes: number) => {
    setSleepTimerSeconds(minutes * 60);
  }, []);

  const handleCancelSleepTimer = useCallback(() => {
    setSleepTimerSeconds(null);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = getSafeVolume(volume);
    }
  }, [volume, isMuted]);

  // Keep refs in sync
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    recordingSecondsRef.current = recordingSeconds;
  }, [recordingSeconds]);

  // Recording handlers
  const handleStartRecording = useCallback(async () => {
    if (playbackStatus !== 'playing') {
      playStation(currentStation);
    }

    try {
      let streamToRecord: MediaStream | null = null;
      try {
        const audioEl = audioRef.current as any;
        if (audioEl && (audioEl.captureStream || audioEl.mozCaptureStream)) {
          const cap = audioEl.captureStream ? audioEl.captureStream() : audioEl.mozCaptureStream();
          if (cap && cap.getAudioTracks && cap.getAudioTracks().length > 0) {
            streamToRecord = cap;
          }
        }
      } catch (err) {
        console.warn('captureStream fallback to synth stream:', err);
      }

      if (!streamToRecord) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const dest = ctx.createMediaStreamDestination();
        const osc = ctx.createOscillator();
        osc.frequency.value = 440;
        osc.connect(dest);
        osc.start();
        streamToRecord = dest.stream;
      }

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(streamToRecord, { mimeType });
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const durationSecs = recordingSecondsRef.current;
        const finalBlob = new Blob(recordedChunksRef.current, { type: mimeType });
        const objectUrl = URL.createObjectURL(finalBlob);

        const newRec: BroadcastRecording = {
          id: `rec-${Date.now()}`,
          stationId: currentStation.id,
          stationName: currentStation.name,
          stationGenre: currentStation.genre,
          timestamp: Date.now(),
          durationSeconds: durationSecs,
          blobUrl: objectUrl,
          fileName: `sloboda-${currentStation.id}-${Date.now()}.webm`,
          sizeBytes: finalBlob.size,
          format: 'WebM Opus',
        };

        try {
          await saveRecordingToDb(newRec, finalBlob);
        } catch (e) {
          console.warn('Could not persist recording to IndexedDB:', e);
        }

        setRecordings((prev) => [newRec, ...prev]);
        setLatestSavedRecording(newRec);
        setRecordingToast({
          title: 'Запис ефіру збережено',
          subtitle: `${currentStation.name} (${durationSecs}с)`,
          recording: newRec,
        });

        setIsRecording(false);
        setRecordingSeconds(0);
      };

      recorder.start(500);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to initialize audio recorder:', error);
      setIsRecording(false);
    }
  }, [playbackStatus, currentStation, playStation]);

  const handleStopRecording = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn('Error stopping media recorder:', err);
      }
    }
    setIsRecording(false);
  }, []);

  const handleDownloadRecording = useCallback((recording?: BroadcastRecording) => {
    const target = recording || latestSavedRecording;
    if (!target) return;

    const a = document.createElement('a');
    a.href = target.blobUrl;
    a.download = target.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [latestSavedRecording]);

  const handleDeleteRecording = useCallback(async (id: string) => {
    await deleteRecordingFromDb(id);
    setRecordings((prev) => prev.filter((r) => r.id !== id));
    setLatestSavedRecording((prev) => (prev?.id === id ? null : prev));
  }, []);

  const handleClearAllRecordings = useCallback(async () => {
    await clearAllRecordingsFromDb();
    setRecordings([]);
    setLatestSavedRecording(null);
  }, []);

  const handleResetStats = useCallback(() => {
    setDailyStats({});
    setStationPlayStats({});
    setListeningDurationSeconds(0);
    localStorage.removeItem('radio_daily_listening_stats');
    localStorage.removeItem('radio_station_play_counts');
  }, []);

  // Total listening time calculation
  const totalListeningSeconds = useMemo(() => {
    const dailySum = (Object.values(dailyStats) as number[]).reduce((sum, s) => sum + s, 0);
    return Math.max(dailySum, listeningDurationSeconds);
  }, [dailyStats, listeningDurationSeconds]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'KeyM':
          e.preventDefault();
          setIsMuted((prev) => !prev);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevStation();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextStation();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((v) => Math.min(1, Math.round((v + 0.05) * 100) / 100));
          setIsMuted(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((v) => Math.max(0, Math.round((v - 0.05) * 100) / 100));
          break;
        case 'KeyS':
          e.preventDefault();
          setIsSleepTimerOpen((prev) => !prev);
          break;
        case 'KeyE':
          e.preventDefault();
          setIsStudioOpen((prev) => !prev);
          break;
        case 'KeyR':
          e.preventDefault();
          if (isRecordingRef.current) {
            handleStopRecording();
          } else {
            handleStartRecording();
          }
          break;
        case 'KeyT':
          e.preventDefault();
          setTheme((t) => (t === 'day' ? 'night' : 'day'));
          break;
        case 'Escape':
          setIsStudioOpen(false);
          setIsSleepTimerOpen(false);
          setIsAddStationOpen(false);
          setIsShortcutsOpen(false);
          setIsRecordingsOpen(false);
          setIsSettingsOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    prevStation,
    nextStation,
    handleStartRecording,
    handleStopRecording,
  ]);

  // TASK 5: Sorting & Filtering Stations
  const filteredAndSortedStations = useMemo(() => {
    let result = stations.filter((station) => {
      // 1. Curated Romantic Collection Priority:
      if (showRomanticOnly) {
        if (!station.isRomantic) return false;
      }
      // 2. Favorites priority:
      if (showFavoritesOnly) {
        if (!favorites.includes(station.id)) return false;
      }
      // 3. Country filter (only when not viewing curated Romantic collection):
      if (!showRomanticOnly && countryFilter !== 'all' && station.country !== countryFilter) {
        return false;
      }
      // 4. Genre filter (only when not viewing curated Romantic collection):
      if (!showRomanticOnly && genreFilter !== 'Всі' && station.genre !== genreFilter) {
        return false;
      }
      // 5. Search query:
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = station.name.toLowerCase().includes(query);
        const matchesGenre = station.genre.toLowerCase().includes(query);
        const matchesLocation = station.location.toLowerCase().includes(query);
        const matchesRegion = station.region?.toLowerCase().includes(query);
        const matchesCity = station.city?.toLowerCase().includes(query);
        const matchesHabit = station.habit?.toLowerCase().includes(query);
        const matchesTagline = station.tagline.toLowerCase().includes(query);
        const isRomanticQuery =
          query.includes('романт') ||
          query.includes('love') ||
          query.includes('любов') ||
          query.includes('кохан');
        const matchesRomantic = !!station.isRomantic && isRomanticQuery;

        if (
          !matchesName &&
          !matchesGenre &&
          !matchesLocation &&
          !matchesRegion &&
          !matchesCity &&
          !matchesHabit &&
          !matchesTagline &&
          !matchesRomantic
        ) {
          return false;
        }
      }
      return true;
    });

    // TASK 5: Apply Sorting (Alphabetical A-Z using Ukrainian collation)
    if (sortOption === 'alphabetical' || sortOption === 'default') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'uk'));
    } else if (sortOption === 'frequency') {
      result = [...result].sort(
        (a, b) => (stationPlayStats[b.id] || 0) - (stationPlayStats[a.id] || 0)
      );
    }

    return result;
  }, [
    stations,
    showFavoritesOnly,
    showRomanticOnly,
    favorites,
    countryFilter,
    genreFilter,
    searchQuery,
    sortOption,
    stationPlayStats,
  ]);

  // TASK 4: Grouping Stations into Dropdowns
  const groupedStations = useMemo(() => {
    // When viewing curated collections, favorites, genres or searching, display direct flat list
    if (groupBy === 'none' || showRomanticOnly || showFavoritesOnly || genreFilter !== 'Всі' || searchQuery.trim()) {
      return null;
    }

    const groups: Record<string, RadioStation[]> = {};

    filteredAndSortedStations.forEach((st) => {
      let key = 'Інше';
      if (groupBy === 'region') {
        key = st.region || 'Інші регіони';
      } else if (groupBy === 'city') {
        key = st.city || st.location.split('/')[0].trim() || 'Інші міста';
      } else if (groupBy === 'habit') {
        key = st.habit || 'Універсальний ефір';
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(st);
    });

    // Ensure groups and the stations inside each group are in alphabetical order (А — Я)
    const sortedKeys = Object.keys(groups).sort((a, b) => a.localeCompare(b, 'uk'));
    const sortedGroups: Record<string, RadioStation[]> = {};
    sortedKeys.forEach((key) => {
      sortedGroups[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name, 'uk'));
    });

    return sortedGroups;
  }, [filteredAndSortedStations, groupBy]);

  const toggleGroupCollapse = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const expandAllGroups = () => {
    if (!groupedStations) return;
    const allExpanded: Record<string, boolean> = {};
    Object.keys(groupedStations).forEach((k) => {
      allExpanded[k] = true;
    });
    setExpandedGroups(allExpanded);
  };
  const collapseAllGroups = () => setExpandedGroups({});

  // Recent stations quick-bar
  const recentStations = useMemo(() => {
    return recentHistory
      .map((id) => stations.find((s) => s.id === id))
      .filter((s): s is RadioStation => s !== undefined);
  }, [recentHistory, stations]);

  return (
    <div className="min-h-screen app-bg text-main flex flex-col font-sans pb-32 selection:bg-[#004643] selection:text-white">
      {/* Header */}
      <Header
        onOpenSidebar={() => setIsSidebarOpen(true)}
        hasActiveFilters={
          genreFilter !== 'Всі' || countryFilter !== 'all' || showFavoritesOnly || showRomanticOnly
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        countryFilter={countryFilter}
        onCountryFilterChange={setCountryFilter}
        showFavoritesOnly={showFavoritesOnly}
        onToggleShowFavorites={() => setShowFavoritesOnly((prev) => !prev)}
        favoritesCount={favorites.length}
        totalStationsCount={stations.length}
        recordingsCount={recordings.length}
        onOpenAddModal={() => setIsAddStationOpen(true)}
        onOpenHelpModal={() => setIsShortcutsOpen(true)}
        onOpenRecordingsModal={() => setIsRecordingsOpen(true)}
        onOpenVoiceOverlay={() => setIsVoiceOverlayOpen(true)}
        onOpenBackgroundPlayback={() => setIsBackgroundPlaybackOpen(true)}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'day' ? 'night' : 'day'))}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        activeNavMode={activeNavMode}
        onNavModeChange={(mode) => {
          setActiveNavMode(mode);
          if (mode === 'video') {
            if (audioRef.current && playbackStatus === 'playing') {
              audioRef.current.pause();
              setPlaybackStatus('paused');
            }
          }
        }}
        onOpenCarMode={() => setIsCarModeOpen(true)}
        onOpenPwaModal={() => setIsPwaModalOpen(true)}
        onOpenEqualizerModal={() => setIsEqualizerModalOpen(true)}
        signalStatus={signalStatus}
        onOpenHardwareFm={() => setIsHardwareFmOpen(true)}
        onOpenAlarmModal={() => setIsAlarmModalOpen(true)}
        onOpenCastModal={() => setIsCastModalOpen(true)}
        onOpenWrappedModal={() => setIsWrappedModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 pt-3 sm:pt-5 flex-1">
        {activeNavMode === 'video' ? (
          /* ========================================================= */
          /* LOGICAL BLOCK 2: DEDICATED VIDEO HUB (STREAMING & TV)     */
          /* ========================================================= */
          <VideoHub
            currentStation={currentStation}
            onSwitchToRadio={() => setActiveNavMode('radio')}
            onVideoStartPlayback={() => {
              if (audioRef.current && playbackStatus === 'playing') {
                audioRef.current.pause();
                setPlaybackStatus('paused');
              }
            }}
          />
        ) : (
          /* ========================================================= */
          /* LOGICAL BLOCK 1: DEDICATED RADIO STUDIO & FM DIRECTORY    */
          /* ========================================================= */
          <>
            {/* Interactive Featured Player - Audio Equalizer & Radio Controls */}
            <FeaturedPlayer
              station={isPersonalBroadcastActive ? STUDIO_STATION : currentStation}
              playbackStatus={playbackStatus}
              onTogglePlay={(st) => {
                if (isPersonalBroadcastActive) {
                  togglePlay();
                } else {
                  togglePlay(st);
                }
              }}
              onPrevStation={prevStation}
              onNextStation={nextStation}
              onNextStudioTrack={handleNextStudioTrack}
              isFavorite={favorites.includes(isPersonalBroadcastActive ? STUDIO_STATION.id : currentStation.id)}
              onToggleFavorite={() => toggleFavorite(isPersonalBroadcastActive ? STUDIO_STATION.id : currentStation.id)}
              onOpenStudio={() => setIsStudioOpen(true)}
              isRecording={isRecording}
              recordingSeconds={recordingSeconds}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
              sleepTimerSeconds={sleepTimerSeconds}
              volume={volume}
              isMuted={isMuted}
              onChangeVolume={(v) => {
                setVolume(v);
                setIsMuted(false);
              }}
              onToggleMute={() => setIsMuted((prev) => !prev)}
              onRetry={retryPlayback}
              isStudioActive={isPersonalBroadcastActive}
              currentTrackTitle={userTracks[currentTrackIndex]?.title}
              currentTrackArtist={userTracks[currentTrackIndex]?.artist}
              signalStatus={signalStatus}
              onToggleRoadBuffer={() => setIsSmartRoadBufferActive((prev) => !prev)}
              onOpenEqualizer={() => setIsEqualizerModalOpen(true)}
              onOpenCarMode={() => setIsCarModeOpen(true)}
              onOpenHardwareFm={() => setIsHardwareFmOpen(true)}
              onOpenCastModal={() => setIsCastModalOpen(true)}
              onOpenLyricsModal={() => setIsLyricsModalOpen(true)}
              onOpenAlarmModal={() => setIsAlarmModalOpen(true)}
              isAiDjEnabled={isAiDjEnabled}
              onToggleAiDj={() => {
                const next = !isAiDjEnabled;
                setIsAiDjEnabled(next);
                aiDjAnnouncer.setEnabled(next);
              }}
              onRewindTimeShift={(seconds) => liveTimeShiftManager.rewind(seconds)}
              onReturnToLive={() => liveTimeShiftManager.returnToLive()}
              timeShiftDelaySeconds={timeShiftState.delaySeconds}
              isStationCached={stationCacheService.isStationCached(isPersonalBroadcastActive ? STUDIO_STATION.id : currentStation.id)}
              onSearchInVideoHub={(trackTitle, artist) => {
                setActiveNavMode('video');
                if (audioRef.current && playbackStatus === 'playing') {
                  audioRef.current.pause();
                  setPlaybackStatus('paused');
                }
              }}
              onOpenVideoHub={() => {
                setActiveNavMode('video');
                if (audioRef.current && playbackStatus === 'playing') {
                  audioRef.current.pause();
                  setPlaybackStatus('paused');
                }
              }}
            />

            {/* Studio Radio Station Banner - Placed directly above "Всі станції" header */}
            <StudioRadioBanner
          isPersonalBroadcastActive={isPersonalBroadcastActive}
          currentTrackTitle={userTracks[currentTrackIndex]?.title}
          totalTracksCount={userTracks.length}
          onToggleBroadcast={togglePersonalBroadcast}
          onNextStudioTrack={handleNextStudioTrack}
          onOpenStudio={() => setIsStudioOpen(true)}
          playbackStatus={playbackStatus}
          activePlaylistName={activePlaylist?.name}
          playlists={playlists}
          onSelectPlaylist={handleSelectPlaylist}
          onSwitchToRadio={() => playStation(currentStation)}
        />

        {/* Directory Section Header & Unified Filter Toolbar */}
        <div className="mb-4">
          {/* Row 1: Section Title, Station Count & Fast Controls */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-main truncate">
                {showRomanticOnly
                  ? '💖 Романтична підбірка'
                  : showFavoritesOnly
                  ? 'Обрані станції'
                  : genreFilter !== 'Всі'
                  ? `Жанр: ${genreFilter}`
                  : countryFilter === 'UA'
                  ? 'Радіостанції України'
                  : countryFilter === 'World'
                  ? 'Закордонні станції'
                  : 'Каталог станцій'}
              </h3>
              <span className="text-xs px-2 py-0.5 subtle-bg text-[#004643] dark:text-emerald-400 font-bold border border-theme rounded-md">
                {filteredAndSortedStations.length}
              </span>

              {/* Reset Filters Button */}
              {(genreFilter !== 'Всі' ||
                countryFilter !== 'all' ||
                searchQuery ||
                showFavoritesOnly ||
                showRomanticOnly) && (
                <button
                  id="btn-reset-filters"
                  type="button"
                  onClick={() => {
                    setGenreFilter('Всі');
                    setCountryFilter('all');
                    setSearchQuery('');
                    setShowFavoritesOnly(false);
                    setShowRomanticOnly(false);
                  }}
                  className="text-xs text-muted-theme hover:text-[#004643] dark:hover:text-emerald-300 transition-colors font-medium cursor-pointer ml-1"
                  title="Скинути фільтри"
                >
                  ✕ Скинути
                </button>
              )}
            </div>

            {/* Right: Layout Switcher & Drawer Trigger */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Cards vs Rows View Layout */}
              <div className="hidden sm:flex items-center subtle-bg border border-theme rounded-md p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setViewLayout('cards')}
                  className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                    viewLayout === 'cards'
                      ? 'bg-[#004643] text-white shadow-xs'
                      : 'text-sub hover:text-main'
                  }`}
                  title="Сітка карток"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewLayout('rows')}
                  className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                    viewLayout === 'rows'
                      ? 'bg-[#004643] text-white shadow-xs'
                      : 'text-sub hover:text-main'
                  }`}
                  title="Список рядків"
                >
                  <LayoutList className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Drawer Button */}
              <button
                id="btn-open-sidebar-main"
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="px-3 py-1.5 subtle-bg border border-theme rounded-md text-xs font-semibold text-main hover:border-[#004643] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 min-h-[36px]"
                title="Відкрити бічне меню фільтрів (☰)"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#004643] dark:text-emerald-400" />
                <span>Фільтри (☰)</span>
              </button>
            </div>
          </div>

          {/* Row 2: Unified Responsive Segmented Filter Tabs */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-1 text-xs">
            <div className="flex items-center gap-1.5 shrink-0">
              {/* All Stations */}
              <button
                type="button"
                onClick={() => {
                  setShowRomanticOnly(false);
                  setShowFavoritesOnly(false);
                  setCountryFilter('all');
                  setGenreFilter('Всі');
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer min-h-[36px] border ${
                  !showRomanticOnly && !showFavoritesOnly && countryFilter === 'all' && genreFilter === 'Всі'
                    ? 'bg-[#004643] text-white border-[#004643]'
                    : 'subtle-bg text-sub border-theme hover:border-[#004643]'
                }`}
              >
                Всі станції
              </button>

              {/* Ukraine */}
              <button
                type="button"
                onClick={() => {
                  setShowRomanticOnly(false);
                  setShowFavoritesOnly(false);
                  setCountryFilter('UA');
                  setGenreFilter('Всі');
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer min-h-[36px] border ${
                  !showRomanticOnly && !showFavoritesOnly && countryFilter === 'UA' && genreFilter === 'Всі'
                    ? 'bg-[#004643] text-white border-[#004643]'
                    : 'subtle-bg text-sub border-theme hover:border-[#004643]'
                }`}
              >
                🇺🇦 Україна
              </button>

              {/* World */}
              <button
                type="button"
                onClick={() => {
                  setShowRomanticOnly(false);
                  setShowFavoritesOnly(false);
                  setCountryFilter('World');
                  setGenreFilter('Всі');
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer min-h-[36px] border ${
                  !showRomanticOnly && !showFavoritesOnly && countryFilter === 'World' && genreFilter === 'Всі'
                    ? 'bg-[#004643] text-white border-[#004643]'
                    : 'subtle-bg text-sub border-theme hover:border-[#004643]'
                }`}
              >
                🌍 Світ
              </button>

              {/* Curated Romantic Collection Tab */}
              <button
                type="button"
                onClick={() => {
                  setShowFavoritesOnly(false);
                  setGenreFilter('Всі');
                  setCountryFilter('all');
                  setSearchQuery('');
                  setShowRomanticOnly((prev) => !prev);
                }}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer min-h-[36px] border flex items-center gap-1.5 ${
                  showRomanticOnly
                    ? 'bg-[#004643] text-white border-[#004643]'
                    : 'subtle-bg text-sub border-theme hover:border-[#004643]'
                }`}
                title="Підбірка романтичних радіостанцій (Україна & Світ)"
              >
                <span>💖</span>
                <span>Романтика ({ROMANTIC_STATIONS.length})</span>
              </button>

              {/* Favorites */}
              <button
                type="button"
                onClick={() => {
                  setShowRomanticOnly(false);
                  setGenreFilter('Всі');
                  setCountryFilter('all');
                  setSearchQuery('');
                  setShowFavoritesOnly((prev) => !prev);
                }}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer min-h-[36px] border flex items-center gap-1.5 ${
                  showFavoritesOnly
                    ? 'bg-[#004643] text-white border-[#004643]'
                    : 'subtle-bg text-sub border-theme hover:border-[#004643]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                <span>Обране ({favorites.length})</span>
              </button>
            </div>

            {/* Sorting / Grouping Toggles */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <button
                type="button"
                onClick={() => {
                  setSortOption('alphabetical');
                  setGroupBy('none');
                }}
                className={`px-2.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer min-h-[36px] border flex items-center gap-1 ${
                  sortOption === 'alphabetical' && groupBy === 'none'
                    ? 'bg-[#004643] text-white border-[#004643]'
                    : 'subtle-bg text-sub border-theme hover:border-[#004643]'
                }`}
                title="Суцільний алфавітний список (А-Я)"
              >
                <ArrowDownAZ className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Алфавіт</span>
              </button>

              <button
                type="button"
                onClick={() => setGroupBy((g) => (g === 'region' ? 'none' : 'region'))}
                className={`px-2.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer min-h-[36px] border flex items-center gap-1 ${
                  groupBy === 'region'
                    ? 'bg-[#004643] text-white border-[#004643]'
                    : 'subtle-bg text-sub border-theme hover:border-[#004643]'
                }`}
                title="Групувати за регіонами України"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Регіони</span>
              </button>
            </div>
          </div>

          {/* Row 3: Genre / Rubricator Pills (Швидкий вибір рубрики/жанру на головній) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-2 pb-0.5 text-xs">
            <span className="text-[11px] font-bold text-sub shrink-0 mr-0.5">
              Рубрики:
            </span>
            <button
              type="button"
              onClick={() => {
                setGenreFilter('Всі');
                setShowRomanticOnly(false);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors shrink-0 cursor-pointer ${
                genreFilter === 'Всі' && !showRomanticOnly
                  ? 'bg-[#004643] text-white border-[#004643]'
                  : 'subtle-bg text-sub border-theme hover:text-main hover:border-[#004643]'
              }`}
            >
              Всі ({stations.length})
            </button>
            {GENRES.filter((g) => g !== 'Всі').map((g) => {
              const isSelected = genreFilter === g && !showRomanticOnly;
              const count = stations.filter((s) => s.genre === g).length;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setShowRomanticOnly(false);
                    setShowFavoritesOnly(false);
                    setCountryFilter('all');
                    setGenreFilter(isSelected ? 'Всі' : g);
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors shrink-0 cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#004643] text-white border-[#004643] font-bold shadow-xs'
                      : 'subtle-bg text-sub border-theme hover:text-main hover:border-[#004643]'
                  }`}
                >
                  <span>{g}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Quiet Editorial Sub-banner when Romantic Collection is active */}
          {showRomanticOnly && (
            <div className="mt-2.5 p-3 subtle-bg border border-theme rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in duration-150">
              <div className="text-xs text-sub">
                <span className="font-bold text-main">💖 Романтична підбірка ({ROMANTIC_STATIONS.length} станцій)</span>
                <span aria-hidden="true" className="mx-1.5 text-muted-theme">·</span>
                <span>Ліричні балади, смус-джаз, софт-поп & вечірній релакс України та світу</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const pool = ROMANTIC_STATIONS;
                  const randomStation = pool[Math.floor(Math.random() * pool.length)] || pool[0];
                  if (randomStation) playStation(randomStation);
                }}
                className="px-3 py-1.5 bg-[#004643] hover:bg-[#003330] text-white text-xs font-semibold rounded-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0 transition-colors min-h-[34px]"
                title="Увімкнути випадкову романтичну станцію"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Увімкнути випадкову хвилю</span>
              </button>
            </div>
          )}
        </div>

        {/* Stations Display (Grouped Dropdowns OR Flat Layout) */}
        {filteredAndSortedStations.length === 0 ? (
          <div className="text-center py-12 px-4 card-bg border border-theme font-mono">
            <Radio className="w-10 h-10 text-muted-theme mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-main uppercase">
              Станцій не знайдено
            </h4>
            <p className="text-xs text-sub max-w-sm mx-auto mt-1 mb-3">
              Спробуйте скинути активні фільтри або змінити пошуковий запит.
            </p>
            <button
              type="button"
              onClick={() => {
                setGenreFilter('Всі');
                setCountryFilter('all');
                setSearchQuery('');
                setShowFavoritesOnly(false);
              }}
              className="px-4 py-2 bg-[#004643] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Показати всі
            </button>
          </div>
        ) : groupedStations ? (
          /* Grouped Radio Stations with Collapsible Dropdowns */
          <div className="space-y-4">
            {Object.entries(groupedStations)
              .sort(([a], [b]) => a.localeCompare(b, 'uk'))
              .map(([groupTitle, groupStationList]: [string, RadioStation[]]) => {
              const isExpanded = Boolean(expandedGroups[groupTitle]);
              const isCollapsed = !isExpanded;

              return (
                <div
                  key={`group-${groupTitle}`}
                  className="border border-theme card-bg shadow-2xs"
                >
                  {/* Collapsible Dropdown Group Header */}
                  <div
                    onClick={() => toggleGroupCollapse(groupTitle)}
                    className="p-3 sm:p-3.5 subtle-bg border-b border-theme flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 bg-[#004643] dark:bg-emerald-400 shrink-0" />
                      <h4 className="font-bold text-sm text-main truncate">
                        {groupTitle}
                      </h4>
                      <span className="text-xs text-slate-500 font-semibold">
                        ({groupStationList.length})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-sub">
                      <span className="text-xs font-medium hidden sm:inline">
                        {isCollapsed ? 'Розгорнути' : 'Згорнути'}
                      </span>
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-sub" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-sub" />
                      )}
                    </div>
                  </div>

                  {/* Group Content (Visible when expanded) */}
                  {isExpanded && (
                    viewLayout === 'rows' ? (
                      <div className="p-2.5 sm:p-3 space-y-2">
                        {groupStationList.map((station) => (
                          <StationRow
                            key={station.id}
                            station={station}
                            isActive={station.id === currentStation.id}
                            playbackStatus={playbackStatus}
                            isFavorite={favorites.includes(station.id)}
                            onSelect={playStation}
                            onTogglePlay={togglePlay}
                            onToggleFavorite={toggleFavorite}
                            onOpenStudio={(s) => {
                              setCurrentStation(s);
                              setIsStudioOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {groupStationList.map((station) => (
                          <StationCard
                            key={station.id}
                            station={station}
                            isActive={station.id === currentStation.id}
                            playbackStatus={playbackStatus}
                            isFavorite={favorites.includes(station.id)}
                            onSelect={playStation}
                            onTogglePlay={togglePlay}
                            onToggleFavorite={toggleFavorite}
                            onOpenStudio={(s) => {
                              setCurrentStation(s);
                              setIsStudioOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Flat Layout: Rows (Default) or Cards */
          viewLayout === 'rows' ? (
            <div className="space-y-2">
              {filteredAndSortedStations.map((station) => (
                <StationRow
                  key={station.id}
                  station={station}
                  isActive={station.id === currentStation.id}
                  playbackStatus={playbackStatus}
                  isFavorite={favorites.includes(station.id)}
                  onSelect={playStation}
                  onTogglePlay={togglePlay}
                  onToggleFavorite={toggleFavorite}
                  onOpenStudio={(s) => {
                    setCurrentStation(s);
                    setIsStudioOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredAndSortedStations.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  isActive={station.id === currentStation.id}
                  playbackStatus={playbackStatus}
                  isFavorite={favorites.includes(station.id)}
                  onSelect={playStation}
                  onTogglePlay={togglePlay}
                  onToggleFavorite={toggleFavorite}
                  onOpenStudio={(s) => {
                    setCurrentStation(s);
                    setIsStudioOpen(true);
                  }}
                />
              ))}
            </div>
          )
        )}
          </>
        )}
      </main>

      {/* Bottom Player Bar with slide-in-up and fade-out animations */}
      {isPlayerVisible && (
        <PlayerBar
          className={isPlayerClosing ? 'fade-out' : 'slide-in-up'}
          station={currentStation}
          playbackStatus={playbackStatus}
          volume={volume}
          isMuted={isMuted}
          onTogglePlay={togglePlay}
          onPrevStation={prevStation}
          onNextStation={nextStation}
          onChangeVolume={(v) => {
            setVolume(v);
            setIsMuted(false);
          }}
          onToggleMute={() => setIsMuted((prev) => !prev)}
          onOpenStudio={() => setIsStudioOpen(true)}
          onOpenVoiceOverlay={() => setIsVoiceOverlayOpen(true)}
          onOpenBackgroundPlayback={() => setIsBackgroundPlaybackOpen(true)}
          onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
          sleepTimerSeconds={sleepTimerSeconds}
          isRecording={isRecording}
          recordingSeconds={recordingSeconds}
          recordingsCount={recordings.length}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onOpenRecordings={() => setIsRecordingsOpen(true)}
          onRetry={retryPlayback}
          onClosePlayer={handleClosePlayer}
          isPersonalBroadcast={isPersonalBroadcastActive}
          currentTrackTitle={
            isPersonalBroadcastActive && currentPlayingTrackId
              ? userTracks.find((t) => t.id === currentPlayingTrackId)?.title ||
                userTracks.find((t) => t.id === currentPlayingTrackId)?.fileName
              : undefined
          }
          playlistName={activePlaylist?.name}
          isVideoModeActive={isVideoModeActive}
          onExitVideoMode={() => handleVideoModeToggle(false)}
        />
      )}

      {/* Studio View Modal: User Song Archive & Personal Station Broadcast */}
      <StudioViewModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        station={currentStation}
        stations={stations}
        playbackStatus={playbackStatus}
        isFavorite={favorites.includes(currentStation.id)}
        volume={volume}
        isMuted={isMuted}
        onTogglePlay={togglePlay}
        onSelectStation={(s) => playStation(s)}
        onToggleFavorite={() => toggleFavorite(currentStation.id)}
        onNextStation={nextStation}
        onPrevStation={prevStation}
        onChangeVolume={(v) => {
          setVolume(v);
          setIsMuted(false);
        }}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        listeningDurationSeconds={listeningDurationSeconds}
        // User Song Archive & Broadcast Station
        userTracks={userTracks}
        onAddTracks={handleAddUserTracks}
        onAddUserTrack={handleAddUserTrack}
        onDeleteTrack={handleDeleteUserTrack}
        onClearAllTracks={handleClearAllUserTracks}
        onReorderTracks={handleReorderUserTracks}
        isPersonalBroadcastActive={isPersonalBroadcastActive}
        onTogglePersonalBroadcast={togglePersonalBroadcast}
        onPlayUserTrack={handlePlayUserTrack}
        currentPlayingTrackId={currentPlayingTrackId}
        currentTrackIndex={currentTrackIndex}
        isShuffle={isShuffle}
        onToggleShuffle={() => setIsShuffle((prev) => !prev)}
        repeatMode={repeatMode}
        onCycleRepeatMode={() =>
          setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'))
        }
        // Studio Playlists
        playlists={playlists}
        activePlaylistId={activePlaylistId}
        onSelectPlaylist={handleSelectPlaylist}
        onCreatePlaylist={handleCreatePlaylist}
        onRenamePlaylist={handleRenamePlaylist}
        onDeletePlaylist={handleDeletePlaylist}
        onMoveTrackToPlaylist={handleMoveTrackToPlaylist}
        onRemoveTrackFromPlaylist={handleRemoveTrackFromPlaylist}
        // Recording
        isRecording={isRecording}
        recordingSeconds={recordingSeconds}
        hasRecordingReady={Boolean(latestSavedRecording)}
        recordingsCount={recordings.length}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onDownloadRecording={() => handleDownloadRecording(latestSavedRecording || undefined)}
        onOpenRecordings={() => {
          setIsStudioOpen(false);
          setIsRecordingsOpen(true);
        }}
        // Sleep Timer
        sleepTimerSeconds={sleepTimerSeconds}
        onSetSleepTimer={handleSetSleepTimer}
        onCancelSleepTimer={handleCancelSleepTimer}
      />

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        isOpen={isSleepTimerOpen}
        onClose={() => setIsSleepTimerOpen(false)}
        activeSecondsRemaining={sleepTimerSeconds}
        onSetTimer={handleSetSleepTimer}
        onCancelTimer={handleCancelSleepTimer}
      />

      {/* Add Custom Station Modal */}
      <AddStationModal
        isOpen={isAddStationOpen}
        onClose={() => setIsAddStationOpen(false)}
        onAddStation={handleAddStation}
      />

      {/* Saved Recordings Library Modal */}
      <RecordingsModal
        isOpen={isRecordingsOpen}
        onClose={() => setIsRecordingsOpen(false)}
        recordings={recordings}
        onDeleteRecording={handleDeleteRecording}
        onClearAll={handleClearAllRecordings}
        onDownloadRecording={handleDownloadRecording}
      />

      {/* Shortcuts & Help Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Settings Modal (Task 3: 'Моя статистика' panel included) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        autoReconnect={true}
        onToggleAutoReconnect={() => {}}
        dailyStats={dailyStats}
        stationPlayStats={stationPlayStats}
        stations={stations}
        totalListeningSeconds={totalListeningSeconds}
        onResetStats={handleResetStats}
      />

      {/* Sidebar Drawer: Full Navigation, Grouping, Sorting, Genres, and Tools behind "три лінійки" */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        stations={stations}
        countryFilter={countryFilter}
        onCountryFilterChange={(c) => {
          setCountryFilter(c);
          setShowRomanticOnly(false);
          setShowFavoritesOnly(false);
        }}
        genreFilter={genreFilter}
        onGenreFilterChange={(g) => {
          setGenreFilter(g);
          setShowRomanticOnly(false);
          setShowFavoritesOnly(false);
        }}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        sortOption={sortOption}
        onSortOptionChange={setSortOption}
        viewLayout={viewLayout}
        onViewLayoutChange={setViewLayout}
        showFavoritesOnly={showFavoritesOnly}
        onToggleShowFavorites={() => {
          setShowRomanticOnly(false);
          setGenreFilter('Всі');
          setCountryFilter('all');
          setShowFavoritesOnly((prev) => !prev);
        }}
        showRomanticOnly={showRomanticOnly}
        onToggleShowRomantic={() => {
          setShowFavoritesOnly(false);
          setGenreFilter('Всі');
          setCountryFilter('all');
          setShowRomanticOnly((prev) => !prev);
        }}
        favoritesCount={favorites.length}
        recordingsCount={recordings.length}
        recentStations={recentStations}
        onSelectStation={playStation}
        onOpenAddModal={() => setIsAddStationOpen(true)}
        onOpenRecordingsModal={() => setIsRecordingsOpen(true)}
        onOpenStudioModal={() => setIsStudioOpen(true)}
        onOpenSleepTimerModal={() => setIsSleepTimerOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        onOpenHelpModal={() => setIsShortcutsOpen(true)}
        onOpenVoiceOverlay={() => setIsVoiceOverlayOpen(true)}
        onOpenBackgroundPlayback={() => setIsBackgroundPlaybackOpen(true)}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'day' ? 'night' : 'day'))}
        onResetFilters={() => {
          setGenreFilter('Всі');
          setCountryFilter('all');
          setSearchQuery('');
          setShowFavoritesOnly(false);
          setShowRomanticOnly(false);
        }}
      />

      {/* Hands-Free Voice Commands Overlay (наступна, пауза, гучніше, тихіше) */}
      <VoiceCommandOverlay
        isOpen={isVoiceOverlayOpen}
        onClose={() => setIsVoiceOverlayOpen(false)}
        currentStation={isPersonalBroadcastActive ? STUDIO_STATION : currentStation}
        isPlaying={playbackStatus === 'playing'}
        volume={volume}
        isMuted={isMuted}
        onTogglePlay={togglePlay}
        onNextStation={nextStation}
        onPrevStation={prevStation}
        onChangeVolume={(v) => {
          setVolume(v);
          setIsMuted(false);
        }}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onOpenStudio={() => setIsStudioOpen(true)}
      />

      {/* Background Playback & Lock Screen Controls Modal */}
      <BackgroundPlaybackModal
        isOpen={isBackgroundPlaybackOpen}
        onClose={() => setIsBackgroundPlaybackOpen(false)}
        currentStation={isPersonalBroadcastActive ? STUDIO_STATION : currentStation}
        isPlaying={playbackStatus === 'playing'}
        onTogglePlay={togglePlay}
        onNextStation={nextStation}
        onPrevStation={prevStation}
        volume={volume}
      />

      {/* Recording Complete Toast Notification */}
      {recordingToast && (
        <div
          id="toast-recording-saved"
          className="fixed bottom-20 right-4 sm:right-6 z-50 max-w-sm modal-bg border border-theme rounded-2xl p-3.5 shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200 font-mono"
        >
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#c5a880]/15 text-[#c5a880] flex items-center justify-center shrink-0 border border-[#c5a880]/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-main truncate uppercase">
                {recordingToast.title}
              </h5>
              <p className="text-[11px] text-sub mt-0.5">
                {recordingToast.subtitle}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  id="btn-toast-download"
                  type="button"
                  onClick={() => {
                    handleDownloadRecording(recordingToast.recording);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#c5a880] hover:bg-[#b0936d] text-black text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Зберегти
                </button>
                <button
                  id="btn-toast-open-library"
                  type="button"
                  onClick={() => {
                    setIsRecordingsOpen(true);
                    setRecordingToast(null);
                  }}
                  className="px-2 py-1 rounded-lg btn-secondary border border-theme text-main text-xs font-medium uppercase tracking-wider transition-colors"
                >
                  Переглянути
                </button>
              </div>
            </div>
            <button
              id="btn-toast-close"
              type="button"
              onClick={() => setRecordingToast(null)}
              className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* PWA Mobile Installation Modal */}
      <InstallPwaModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
      />

      {/* Web Audio API 3-Band Equalizer Modal */}
      <AudioEqualizerModal
        isOpen={isEqualizerModalOpen}
        onClose={() => setIsEqualizerModalOpen(false)}
      />

      {/* Cockpit Car Driver Mode Modal (Pure OLED Black) */}
      <CarDriverModeModal
        isOpen={isCarModeOpen}
        onClose={() => setIsCarModeOpen(false)}
        station={isPersonalBroadcastActive ? STUDIO_STATION : currentStation}
        playbackStatus={playbackStatus}
        onTogglePlay={() => {
          if (isPersonalBroadcastActive) {
            togglePlay();
          } else {
            togglePlay(currentStation);
          }
        }}
        onPrevStation={prevStation}
        onNextStation={nextStation}
        volume={volume}
        isMuted={isMuted}
        onChangeVolume={(v) => {
          setVolume(v);
          setIsMuted(false);
        }}
        onToggleMute={() => setIsMuted((p) => !p)}
        allStations={stations}
        onSelectStation={playStation}
        signalStatus={signalStatus}
        onToggleRoadBuffer={() => setIsSmartRoadBufferActive((p) => !p)}
        onSwitchToVideoHub={() => {
          setIsCarModeOpen(false);
          setActiveNavMode('video');
        }}
      />

      {/* Hardware FM Scanner Modal (Web Serial, Web Bluetooth & SDR Auto-Scanner) */}
      <HardwareFmScannerModal
        isOpen={isHardwareFmOpen}
        onClose={() => setIsHardwareFmOpen(false)}
        existingStations={stations}
        onAddStationsToList={handleAddStationsFromScanner}
        onPlayStation={(st) => {
          setIsHardwareFmOpen(false);
          playStation(st);
        }}
      />

      {/* Smart Radio Alarm Modal */}
      <RadioAlarmModal
        isOpen={isAlarmModalOpen}
        onClose={() => setIsAlarmModalOpen(false)}
        stations={stations}
        onTriggerAlarmStation={(stId, vol, fadeIn) => {
          const st = stations.find((s) => s.id === stId) || stations[0];
          playStation(st);
          setVolume(vol > 1 ? vol / 100 : vol);
        }}
      />

      {/* Active Alarm Firing Alert */}
      <ActiveAlarmAlert
        alarm={activeAlarmFiring}
        onDismiss={() => setActiveAlarmFiring(null)}
        onSnooze={(mins) => {
          const savedAlarm = activeAlarmFiring;
          setActiveAlarmFiring(null);
          setTimeout(() => {
            if (savedAlarm) setActiveAlarmFiring(savedAlarm);
          }, (mins || 5) * 60 * 1000);
        }}
      />

      {/* Big Screen / Chromecast / TV Presentation Modal */}
      <BigScreenCastModal
        isOpen={isCastModalOpen}
        onClose={() => setIsCastModalOpen(false)}
        station={isPersonalBroadcastActive ? STUDIO_STATION : currentStation}
        isPlaying={playbackStatus === 'playing'}
        onTogglePlay={() => {
          if (isPersonalBroadcastActive) togglePlay();
          else togglePlay(currentStation);
        }}
        onPrevStation={prevStation}
        onNextStation={nextStation}
        volume={volume}
        isMuted={isMuted}
        onChangeVolume={(v) => {
          setVolume(v);
          setIsMuted(false);
        }}
        onToggleMute={() => setIsMuted((p) => !p)}
        nowPlayingTitle={isPersonalBroadcastActive ? userTracks[currentTrackIndex]?.title : currentStation.name}
        nowPlayingArtist={isPersonalBroadcastActive ? userTracks[currentTrackIndex]?.artist : currentStation.genre}
      />

      {/* Live Lyrics / Karaoke Modal */}
      <LiveLyricsModal
        isOpen={isLyricsModalOpen}
        onClose={() => setIsLyricsModalOpen(false)}
        songTitle={isPersonalBroadcastActive ? (userTracks[currentTrackIndex]?.title || 'Своя Хвиля') : currentStation.name}
        songArtist={isPersonalBroadcastActive ? userTracks[currentTrackIndex]?.artist : currentStation.genre}
        isPlaying={playbackStatus === 'playing'}
      />

      {/* Radio Wrapped / Personal Annual Summary Modal */}
      <RadioWrappedModal
        isOpen={isWrappedModalOpen}
        onClose={() => setIsWrappedModalOpen(false)}
        dailyStats={dailyStats}
        stationPlayStats={stationPlayStats}
        favoritesCount={favorites.length}
        recordingsCount={recordings.length}
      />
    </div>
  );
}
