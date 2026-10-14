import React from 'react';
import {
  Radio,
  Play,
  Pause,
  SkipForward,
  SlidersHorizontal,
  Music,
  ListMusic,
} from 'lucide-react';
import { StudioPlaylist } from '../types';

interface StudioRadioBannerProps {
  isPersonalBroadcastActive: boolean;
  currentTrackTitle?: string;
  totalTracksCount: number;
  onToggleBroadcast: () => void;
  onNextStudioTrack: () => void;
  onOpenStudio: () => void;
  playbackStatus: string;
  activePlaylistName?: string;
  playlists?: StudioPlaylist[];
  onSelectPlaylist?: (id: string) => void;
  onSwitchToRadio?: () => void;
}

export const StudioRadioBanner: React.FC<StudioRadioBannerProps> = ({
  isPersonalBroadcastActive,
  currentTrackTitle,
  totalTracksCount,
  onToggleBroadcast,
  onNextStudioTrack,
  onOpenStudio,
  playbackStatus,
  activePlaylistName,
  playlists,
  onSelectPlaylist,
}) => {
  const isPlaying = isPersonalBroadcastActive && playbackStatus === 'playing';

  return (
    <div
      id="studio-station-banner"
      className={`card-bg border rounded-lg transition-all mb-4 overflow-hidden shadow-xs ${
        isPersonalBroadcastActive
          ? 'border-[#004643] dark:border-emerald-500/80 bg-emerald-950/10'
          : 'border-theme'
      }`}
    >
      <div className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Station info & Currently playing track */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-md shrink-0 flex items-center justify-center transition-colors ${
              isPersonalBroadcastActive
                ? 'bg-[#004643] text-white shadow-xs'
                : 'subtle-bg text-slate-700 dark:text-slate-200 border border-theme'
            }`}
          >
            <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-main truncate">
                Студія «Своя Хвиля»
              </span>

              {isPersonalBroadcastActive && isPlaying ? (
                <span className="text-[11px] font-bold text-[#004643] dark:text-emerald-400 flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                  <span className="flex items-end gap-[2px] h-3">
                    <span className="w-0.5 bg-emerald-500 rounded-full animate-wave-bar-1" />
                    <span className="w-0.5 bg-emerald-500 rounded-full animate-wave-bar-2" />
                    <span className="w-0.5 bg-emerald-500 rounded-full animate-wave-bar-3" />
                  </span>
                  <span>В ефірі</span>
                </span>
              ) : isPersonalBroadcastActive ? (
                <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                  <span>На паузі</span>
                </span>
              ) : (
                <span className="text-xs text-sub shrink-0">
                  • {totalTracksCount} треків
                </span>
              )}

              {activePlaylistName && (
                <span className="text-xs text-sub shrink-0 hidden xs:inline">
                  • {activePlaylistName}
                </span>
              )}
            </div>

            {/* Currently playing track or subtitle */}
            {isPersonalBroadcastActive && currentTrackTitle ? (
              <p className="text-xs text-[#004643] dark:text-emerald-400 font-semibold truncate mt-0.5 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 shrink-0 animate-pulse text-emerald-500" />
                <span className="truncate">{currentTrackTitle}</span>
              </p>
            ) : (
              <p className="text-xs text-sub truncate mt-0.5">
                Ваша персональна музична станція без реклами
              </p>
            )}
          </div>
        </div>

        {/* Right: 2 PRIMARY ACTIONS + Studio Settings button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Action 1: [ ▶ Грати Свою Хвилю ] / [ ⏸ Пауза ] */}
          <button
            type="button"
            onClick={onToggleBroadcast}
            className={`px-3.5 py-2 rounded-md text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors min-h-[40px] shadow-xs select-none ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-[#004643] hover:bg-[#003330] text-white dark:bg-emerald-600 dark:hover:bg-emerald-500'
            }`}
            title="Увімкнути або зупинити мовлення Своєї Хвилі"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Пауза</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Грати Свою Хвилю</span>
              </>
            )}
          </button>

          {/* Action 2: [ ⏭ Наступна пісня ] (1-клік перемикання якщо трек не підходить) */}
          <button
            type="button"
            onClick={onNextStudioTrack}
            className="px-3 py-2 rounded-md text-xs sm:text-sm font-semibold subtle-bg border border-theme text-main hover:border-[#004643] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer min-h-[40px] flex items-center gap-1.5 shadow-xs select-none"
            title="Якщо пісня не підходить — перемкнути на наступну в 1 клік"
          >
            <SkipForward className="w-3.5 h-3.5 fill-current" />
            <span className="hidden xs:inline">Наступна</span>
          </button>

          {/* Action 3: [ ⚙️ Студія ] (Відкрити керування треками та списками) */}
          <button
            type="button"
            onClick={onOpenStudio}
            className="p-2.5 rounded-md subtle-bg border border-theme text-sub hover:text-main hover:border-[#004643] transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center shadow-xs"
            title="Керувати музикою та списками Студії"
            aria-label="Студія"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Playlists Selector (1-click to switch between lists) */}
      {playlists && playlists.length > 1 && (
        <div className="px-3 pb-2.5 pt-0.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-theme/40">
          <span className="text-[11px] text-sub shrink-0 font-medium mr-1">
            Списки:
          </span>
          {playlists.map((pl) => {
            const isPlActive = activePlaylistName === pl.name;
            return (
              <button
                key={pl.id}
                type="button"
                onClick={() => onSelectPlaylist?.(pl.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isPlActive
                    ? 'bg-[#004643] text-white border-[#004643] dark:bg-emerald-600 dark:border-emerald-500'
                    : 'subtle-bg text-sub border-theme hover:text-main hover:border-slate-400'
                }`}
              >
                <ListMusic className="w-3 h-3" />
                <span>{pl.name}</span>
                <span className="text-[10px] opacity-75 font-mono">
                  ({pl.trackIds ? pl.trackIds.length : 0})
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
