import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Radio,
  Upload,
  Play,
  Pause,
  Trash2,
  Music,
  ListMusic,
  GripVertical,
  Shuffle,
  FolderPlus,
  Search,
  CheckCircle2,
  FolderInput,
  Cloud,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RadioStation, PlaybackStatus, UserTrack, StudioPlaylist } from '../types';

export interface StudioViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: RadioStation;
  playbackStatus: PlaybackStatus;
  userTracks: UserTrack[];
  isPersonalBroadcastActive: boolean;
  currentTrackIndex?: number;
  currentPlayingTrackId?: string;
  onPlayUserTrack?: (track: UserTrack, targetPlaylistId?: string) => void;
  onToggleBroadcast?: () => void;
  onTogglePersonalBroadcast?: () => void;
  onAddTracks?: (files: File[], targetPlaylistId?: string) => Promise<void>;
  onAddUserTrack?: (track: Omit<UserTrack, 'id' | 'timestamp'>) => Promise<void>;
  onDeleteTrack: (id: string) => void;
  onReorderTracks?: (fromIndex: number, toIndex: number) => void;
  onMoveTrack?: (fromIndex: number, toIndex: number) => void;
  onClearAllTracks?: () => void;
  isShuffle?: boolean;
  onToggleShuffle?: () => void;
  repeatMode?: 'off' | 'all' | 'one';
  onCycleRepeatMode?: () => void;
  sleepTimerSeconds?: number | null;
  onSetSleepTimer?: (minutes: number | null) => void;
  playlists?: StudioPlaylist[];
  activePlaylistId?: string;
  onSelectPlaylist?: (id: string) => void;
  onCreatePlaylist?: (name: string, color?: string) => void;
  onRenamePlaylist?: (id: string, name: string) => void;
  onDeletePlaylist?: (id: string) => void;
  onMoveTrackToPlaylist?: (trackId: string, targetPlaylistId: string) => void;
  onRemoveTrackFromPlaylist?: (trackId: string, playlistId: string) => void;
}

// Single Sortable Track Row
const SortableTrackRow: React.FC<{
  track: UserTrack;
  indexInActiveList: number;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onDelete: () => void;
  playlists: StudioPlaylist[];
  currentPlaylistId: string;
  onMoveToPlaylist?: (trackId: string, targetPlaylistId: string) => void;
}> = ({
  track,
  indexInActiveList,
  isCurrent,
  isPlaying,
  onPlay,
  onDelete,
  playlists,
  currentPlaylistId,
  onMoveToPlaylist,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: track.id,
  });

  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return '3:30';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-lg border transition-all duration-150 select-none ${
        isDragging
          ? 'opacity-40 border-dashed border-emerald-400 bg-emerald-950/40 shadow-lg'
          : isCurrent
          ? 'bg-[#004643]/15 border-[#004643] dark:border-emerald-500/70 shadow-xs'
          : 'card-bg border-theme hover:border-slate-400 dark:hover:border-slate-600'
      }`}
    >
      {/* Left: Drag Handle, Play/Pause Button & Track Info */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-emerald-400 transition-colors shrink-0 touch-none"
          title="Затисніть для зміни черги"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Play/Pause Button with Live Equalizer Animation */}
        <button
          type="button"
          onClick={onPlay}
          className={`relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
            isCurrent
              ? 'bg-[#004643] text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
              : 'subtle-bg text-main hover:bg-[#004643] hover:text-white border border-theme'
          }`}
          title={isCurrent && isPlaying ? 'Пауза' : 'Слухати цей трек'}
        >
          {isCurrent && isPlaying ? (
            <div className="flex items-end gap-[2px] h-3 px-1">
              <span className="w-0.5 bg-current rounded-full animate-wave-bar-1" />
              <span className="w-0.5 bg-current rounded-full animate-wave-bar-2" />
              <span className="w-0.5 bg-current rounded-full animate-wave-bar-3" />
            </div>
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>

        {/* Track Title, Artist, Duration & Live Status */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-sub shrink-0">
              #{indexInActiveList + 1}
            </span>
            <p className="font-semibold text-xs sm:text-sm text-main truncate">
              {track.title}
            </p>
            {isCurrent && isPlaying && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 uppercase shrink-0">
                В ефірі
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-sub truncate">
            <span className="truncate">{track.artist || 'Студія «Своя Хвиля»'}</span>
            <span>•</span>
            <span className="font-mono">{formatDuration(track.durationSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Right: Actions (Move to another playlist & Delete) */}
      <div className="flex items-center gap-1 shrink-0 relative">
        {playlists.length > 1 && onMoveToPlaylist && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoveMenu((prev) => !prev)}
              className="p-1.5 text-sub hover:text-main rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Перемістити до іншого списку"
            >
              <FolderInput className="w-3.5 h-3.5" />
            </button>

            {showMoveMenu && (
              <div
                className="absolute right-0 bottom-full mb-1 w-44 card-bg border border-theme rounded-md shadow-xl py-1 z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setShowMoveMenu(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold text-sub uppercase tracking-wider border-b border-theme">
                  Перемістити в:
                </div>
                {playlists
                  .filter((p) => p.id !== currentPlaylistId)
                  .map((pl) => (
                    <button
                      key={pl.id}
                      type="button"
                      onClick={() => {
                        onMoveToPlaylist(track.id, pl.id);
                        setShowMoveMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-main hover:bg-[#004643] hover:text-white transition-colors truncate block cursor-pointer"
                    >
                      📁 {pl.name}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 text-sub hover:text-rose-500 rounded transition-colors cursor-pointer"
          title="Видалити трек"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const StudioViewModal: React.FC<StudioViewModalProps> = ({
  isOpen,
  onClose,
  playbackStatus,
  userTracks = [],
  isPersonalBroadcastActive,
  currentPlayingTrackId,
  currentTrackIndex,
  onPlayUserTrack,
  onToggleBroadcast,
  onTogglePersonalBroadcast,
  onAddTracks,
  onAddUserTrack,
  onDeleteTrack,
  onReorderTracks,
  onMoveTrack,
  isShuffle,
  onToggleShuffle,
  playlists = [],
  activePlaylistId,
  onSelectPlaylist,
  onCreatePlaylist,
  onDeletePlaylist,
  onMoveTrackToPlaylist,
}) => {
  // STRICTLY 2 LOGICAL TABS
  const [activeTab, setActiveTab] = useState<'music' | 'upload'>('music');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [youtubeInput, setYoutubeInput] = useState('');
  const [selectedUploadPlaylistId, setSelectedUploadPlaylistId] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fallback playlists
  const effectivePlaylists: StudioPlaylist[] = useMemo(() => {
    if (playlists && playlists.length > 0) return playlists;
    return [
      {
        id: 'default',
        name: 'Моя музика',
        createdAt: Date.now(),
        trackIds: userTracks.map((t) => t.id),
      },
    ];
  }, [playlists, userTracks]);

  // Local selected playlist state to ensure instant switching
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(() => {
    return activePlaylistId || effectivePlaylists[0]?.id || 'default';
  });

  // Sync when activePlaylistId changes from parent
  useEffect(() => {
    if (activePlaylistId) {
      setSelectedPlaylistId(activePlaylistId);
    }
  }, [activePlaylistId]);

  // Active playlist object
  const currentPlaylist = useMemo(() => {
    return (
      effectivePlaylists.find((p) => p.id === selectedPlaylistId) ||
      effectivePlaylists.find((p) => p.id === activePlaylistId) ||
      effectivePlaylists[0]
    );
  }, [effectivePlaylists, selectedPlaylistId, activePlaylistId]);

  // Fast track lookup map
  const trackMap = useMemo(() => {
    const map = new Map<string, UserTrack>();
    userTracks.forEach((t) => map.set(t.id, t));
    return map;
  }, [userTracks]);

  // Accurate track list for the current playlist
  // A track belongs to this playlist if its ID is in trackIds OR its playlistId matches!
  const activeTracksList: UserTrack[] = useMemo(() => {
    if (!currentPlaylist) return userTracks;
    const trackIdSet = new Set(currentPlaylist.trackIds || []);

    // 1. Gather all matching tracks
    const matched = userTracks.filter((t) => {
      return trackIdSet.has(t.id) || t.playlistId === currentPlaylist.id;
    });

    // 2. If trackIds specifies a custom order, respect that order first
    if (currentPlaylist.trackIds && currentPlaylist.trackIds.length > 0) {
      const ordered: UserTrack[] = [];
      const seen = new Set<string>();

      currentPlaylist.trackIds.forEach((id) => {
        const t = trackMap.get(id);
        if (t) {
          ordered.push(t);
          seen.add(t.id);
        }
      });

      matched.forEach((t) => {
        if (!seen.has(t.id)) {
          ordered.push(t);
          seen.add(t.id);
        }
      });

      if (ordered.length > 0) return ordered;
    }

    if (matched.length > 0) return matched;

    // Fallback if playlist is the only one
    if (effectivePlaylists.length <= 1) {
      return userTracks;
    }

    return [];
  }, [currentPlaylist, userTracks, trackMap, effectivePlaylists.length]);

  // Filtered tracks by search query
  const displayedTracks = useMemo(() => {
    if (!searchQuery.trim()) return activeTracksList;
    const q = searchQuery.toLowerCase().trim();
    return activeTracksList.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.artist && t.artist.toLowerCase().includes(q)) ||
        (t.fileName && t.fileName.toLowerCase().includes(q))
    );
  }, [activeTracksList, searchQuery]);

  // Compute accurate track counts for each playlist pill
  const playlistCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    effectivePlaylists.forEach((pl) => {
      const idSet = new Set(pl.trackIds || []);
      const count = userTracks.filter((t) => idSet.has(t.id) || t.playlistId === pl.id).length;
      counts[pl.id] = count;
    });
    return counts;
  }, [effectivePlaylists, userTracks]);

  const isPlaying = isPersonalBroadcastActive && playbackStatus === 'playing';

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const reorderFn = onReorderTracks || onMoveTrack;
    if (!reorderFn) return;

    const fromIdx = activeTracksList.findIndex((t) => t.id === active.id);
    const toIdx = activeTracksList.findIndex((t) => t.id === over.id);
    if (fromIdx !== -1 && toIdx !== -1) {
      const globalFrom = userTracks.findIndex((t) => t.id === active.id);
      const globalTo = userTracks.findIndex((t) => t.id === over.id);
      if (globalFrom !== -1 && globalTo !== -1) {
        reorderFn(globalFrom, globalTo);
      }
    }
  };

  const handlePlayTrack = (track: UserTrack) => {
    if (onPlayUserTrack) {
      onPlayUserTrack(track, currentPlaylist.id);
    }
  };

  const handlePlayCurrentPlaylist = () => {
    if (activeTracksList.length === 0) return;
    const firstTrack = activeTracksList[0];
    if (onPlayUserTrack) {
      onPlayUserTrack(firstTrack, currentPlaylist.id);
    }
  };

  const handleSelectPlaylistTab = (id: string) => {
    setSelectedPlaylistId(id);
    onSelectPlaylist?.(id);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim() || !onCreatePlaylist) return;
    onCreatePlaylist(newFolderName.trim());
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadStatus(`Завантаження ${files.length} аудіофайлів...`);
    try {
      const targetPlId = selectedUploadPlaylistId || currentPlaylist.id;
      if (onAddTracks) {
        await onAddTracks(Array.from(files), targetPlId);
      } else if (onAddUserTrack) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const blobUrl = URL.createObjectURL(file);
          const title = file.name.replace(/\.[^/.]+$/, '');
          await onAddUserTrack({
            title,
            artist: 'Завантажений трек',
            fileName: file.name,
            sizeBytes: file.size,
            durationSeconds: 210,
            blobUrl,
            playlistId: targetPlId,
          });
        }
      }
      setUploadStatus(`Успішно додано ${files.length} файлів до списку!`);
      setTimeout(() => {
        setUploadStatus(null);
        setActiveTab('music');
      }, 1400);
    } catch (err) {
      console.error(err);
      setUploadStatus('Помилка при завантаженні файлів.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddYoutube = async () => {
    if (!youtubeInput.trim()) return;
    setIsUploading(true);
    setUploadStatus('Додавання композиції...');
    try {
      const match = youtubeInput.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
      );
      const targetPlId = selectedUploadPlaylistId || currentPlaylist.id;
      if (onAddUserTrack) {
        if (match) {
          const ytId = match[1];
          await onAddUserTrack({
            title: `YouTube аудіо (${ytId})`,
            artist: 'Онлайн аудіопотік',
            fileName: `youtube-${ytId}.mp3`,
            sizeBytes: 0,
            durationSeconds: 240,
            blobUrl: `https://www.youtube.com/watch?v=${ytId}`,
            youtubeId: ytId,
            playlistId: targetPlId,
          });
        } else {
          await onAddUserTrack({
            title: 'Мережевий аудіотрек',
            artist: 'Зовнішнє джерело',
            fileName: 'audio-stream.mp3',
            sizeBytes: 0,
            durationSeconds: 210,
            blobUrl: youtubeInput.trim(),
            playlistId: targetPlId,
          });
        }
      }
      setYoutubeInput('');
      setUploadStatus('Успішно додано до списку!');
      setTimeout(() => {
        setUploadStatus(null);
        setActiveTab('music');
      }, 1200);
    } catch {
      setUploadStatus('Не вдалося додати посилання.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl card-bg border border-theme rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header - Clean, No Redundant text */}
        <div className="p-3 sm:p-4 border-b border-theme flex items-center justify-between gap-3 subtle-bg">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-[#004643] text-white flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-main truncate">
                  Студія «Своя Хвиля»
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1 shrink-0">
                  <Cloud className="w-3 h-3" />
                  <span>Хмара активна (Firebase)</span>
                </span>
                {isPersonalBroadcastActive && isPlaying && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                    <span className="flex items-end gap-[2px] h-2.5">
                      <span className="w-0.5 bg-emerald-400 rounded-full animate-wave-bar-1" />
                      <span className="w-0.5 bg-emerald-400 rounded-full animate-wave-bar-2" />
                      <span className="w-0.5 bg-emerald-400 rounded-full animate-wave-bar-3" />
                    </span>
                    <span>В ЕФІРІ</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-sub hover:text-main rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Закрити вікно"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 MAIN LOGICAL TABS */}
        <div className="flex items-center border-b border-theme px-3 sm:px-4 bg-black/5 dark:bg-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('music')}
            className={`flex items-center gap-2 py-2.5 sm:py-3 px-3 border-b-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'music'
                ? 'border-[#004643] dark:border-emerald-400 text-[#004643] dark:text-emerald-400'
                : 'border-transparent text-sub hover:text-main'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Моя музика</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full subtle-bg border border-theme font-mono">
              {activeTracksList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 py-2.5 sm:py-3 px-3 border-b-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#004643] dark:border-emerald-400 text-[#004643] dark:text-emerald-400'
                : 'border-transparent text-sub hover:text-main'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>+ Завантажити MP3</span>
          </button>
        </div>

        {/* TAB 1: МОЯ МУЗИКА (Списки зверху, пісні знизу) */}
        {activeTab === 'music' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
            {/* 1. PLAYLIST SELECTOR PILLS */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold text-sub">
                  Добірки:
                </span>
                {onCreatePlaylist && !isCreatingFolder && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingFolder(true)}
                    className="text-xs text-[#004643] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>+ Новий список</span>
                  </button>
                )}
              </div>

              {/* Create new folder input */}
              {isCreatingFolder && (
                <div className="flex items-center gap-2 mb-2 p-2 rounded-lg subtle-bg border border-theme animate-in fade-in">
                  <input
                    type="text"
                    placeholder="Назва нового списку..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                    className="flex-1 text-xs py-1.5 px-2.5 rounded border border-theme card-bg outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateFolder}
                    className="px-3 py-1.5 text-xs bg-[#004643] text-white rounded font-medium cursor-pointer"
                  >
                    Створити
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingFolder(false)}
                    className="px-2 py-1.5 text-xs text-sub hover:text-main cursor-pointer"
                  >
                    Скасувати
                  </button>
                </div>
              )}

              {/* Horizontal pills with accurate track counts */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {effectivePlaylists.map((pl) => {
                  const isActive = currentPlaylist.id === pl.id;
                  const count = playlistCounts[pl.id] ?? (pl.trackIds ? pl.trackIds.length : 0);
                  return (
                    <button
                      key={pl.id}
                      type="button"
                      onClick={() => handleSelectPlaylistTab(pl.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#004643] text-white border-[#004643] dark:bg-emerald-600 dark:border-emerald-500 shadow-xs'
                          : 'subtle-bg text-main border-theme hover:border-slate-400'
                      }`}
                    >
                      <ListMusic className="w-3.5 h-3.5" />
                      <span>{pl.name}</span>
                      <span className="text-[10px] opacity-80 font-mono">
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. UNIFIED ACTION TOOLBAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 pb-1">
              {/* Primary action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlayCurrentPlaylist}
                  disabled={activeTracksList.length === 0}
                  className="px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-bold bg-[#004643] hover:bg-[#003330] text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  title="Почати відтворення цього списку"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Слухати список</span>
                </button>

                {onToggleShuffle && (
                  <button
                    type="button"
                    onClick={onToggleShuffle}
                    className={`px-2.5 py-1.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isShuffle
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'subtle-bg text-sub border-theme hover:text-main'
                    }`}
                    title={isShuffle ? 'Перемішування увімкнено' : 'Увімкнути випадковий порядок'}
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Перемішати</span>
                  </button>
                )}

                {effectivePlaylists.length > 1 && onDeletePlaylist && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Видалити список «${currentPlaylist.name}»?`)) {
                        onDeletePlaylist(currentPlaylist.id);
                      }
                    }}
                    className="p-1.5 text-sub hover:text-rose-500 rounded transition-colors cursor-pointer"
                    title="Видалити цей список"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search input (Clean, integrated) */}
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-sub absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Швидкий пошук..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-7 pr-2.5 py-1.5 rounded-md subtle-bg border border-theme outline-none text-main placeholder:text-sub"
                />
              </div>
            </div>

            {/* 3. TRACKS LIST */}
            {displayedTracks.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-theme rounded-xl card-bg">
                <Music className="w-8 h-8 text-sub mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-main">
                  У цьому списку поки немає пісень
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className="mt-2.5 px-3 py-1.5 text-xs bg-[#004643] text-white rounded-md font-medium cursor-pointer"
                >
                  + Завантажити аудіо
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={displayedTracks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1.5">
                    {displayedTracks.map((track, idx) => {
                      const isCurrent =
                        (currentPlayingTrackId && track.id === currentPlayingTrackId) ||
                        (currentTrackIndex !== undefined && userTracks[currentTrackIndex]?.id === track.id);

                      return (
                        <SortableTrackRow
                          key={track.id}
                          track={track}
                          indexInActiveList={idx}
                          isCurrent={Boolean(isCurrent)}
                          isPlaying={isPlaying}
                          onPlay={() => handlePlayTrack(track)}
                          onDelete={() => onDeleteTrack(track.id)}
                          playlists={effectivePlaylists}
                          currentPlaylistId={currentPlaylist.id}
                          onMoveToPlaylist={onMoveTrackToPlaylist}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}

        {/* TAB 2: ЗАВАНТАЖИТИ (+ Додати нові MP3) */}
        {activeTab === 'upload' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {uploadStatus && (
              <div className="p-2.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{uploadStatus}</span>
              </div>
            )}

            {/* Choose Target Playlist */}
            <div>
              <label className="text-xs font-semibold text-sub block mb-1">
                Додати до списку:
              </label>
              <select
                value={selectedUploadPlaylistId || currentPlaylist.id}
                onChange={(e) => setSelectedUploadPlaylistId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg card-bg border border-theme text-main outline-none cursor-pointer"
              >
                {effectivePlaylists.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    📁 {pl.name} ({playlistCounts[pl.id] ?? 0} треків)
                  </option>
                ))}
              </select>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="audio/*,video/*,.mp3,.wav,.aac,.flac,.m4a,.ogg"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFiles(e.dataTransfer.files);
                }}
                className="border-2 border-dashed border-theme hover:border-[#004643] dark:hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors subtle-bg hover:bg-black/5 dark:hover:bg-white/5"
              >
                <Upload className="w-8 h-8 text-[#004643] dark:text-emerald-400 mx-auto mb-1.5" />
                <h4 className="font-bold text-sm text-main">
                  Натисніть або перетягніть аудіофайли сюди
                </h4>
                <p className="text-xs text-sub mt-1">
                  MP3, WAV, AAC, FLAC, M4A, OGG
                </p>
                <span className="inline-block mt-2.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#004643] text-white">
                  Обрати файли з пристрою
                </span>
              </div>
            </div>

            {/* YouTube Audio Stream Link Import */}
            <div className="p-3.5 rounded-xl subtle-bg border border-theme">
              <h4 className="font-bold text-xs text-main uppercase tracking-wider mb-1.5">
                Або додайте посилання на пісню:
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Посилання на YouTube або аудіопотік..."
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddYoutube()}
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg card-bg border border-theme text-main outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddYoutube}
                  disabled={!youtubeInput.trim() || isUploading}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#004643] text-white hover:bg-[#003330] disabled:opacity-50 cursor-pointer shrink-0"
                >
                  Додати
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
