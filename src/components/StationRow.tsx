import React from 'react';
import { Radio, Play, Pause, Heart, Disc3 } from 'lucide-react';
import { RadioStation, PlaybackStatus } from '../types';

interface StationRowProps {
  station: RadioStation;
  isActive: boolean;
  playbackStatus: PlaybackStatus;
  isFavorite: boolean;
  onSelect: (station: RadioStation) => void;
  onTogglePlay: (station: RadioStation) => void;
  onToggleFavorite: (stationId: string, e: React.MouseEvent) => void;
  onOpenStudio?: (station: RadioStation) => void;
}

export const StationRow: React.FC<StationRowProps> = ({
  station,
  isActive,
  playbackStatus,
  isFavorite,
  onSelect,
  onTogglePlay,
  onToggleFavorite,
}) => {
  const isCurrentlyPlaying = isActive && playbackStatus === 'playing';
  const isBuffering = isActive && playbackStatus === 'loading';

  return (
    <div
      id={`station-row-${station.id}`}
      onClick={() => onSelect(station)}
      className={`group px-3 py-2.5 sm:px-4 sm:py-3 rounded-md border transition-colors flex items-center justify-between gap-3 select-none cursor-pointer mb-2 ${
        isActive
          ? 'card-bg border-[#004643] dark:border-emerald-500 shadow-xs'
          : 'card-bg border-theme hover:border-[#004643]/50'
      }`}
    >
      {/* Left: Station Icon & Clear Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-md flex items-center justify-center border transition-transform group-hover:scale-105 ${
            isActive
              ? 'bg-[#004643] text-white border-[#004643]'
              : 'subtle-bg text-slate-700 dark:text-slate-200 border-theme'
          }`}
        >
          {isCurrentlyPlaying ? (
            <Disc3 className="w-5 h-5 animate-spin text-white" />
          ) : (
            <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-current" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {/* Station Title */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-main font-bold text-sm sm:text-base truncate group-hover:text-[#004643] dark:group-hover:text-emerald-300 transition-colors">
              {station.name}
            </span>

            {isCurrentlyPlaying && (
              <span className="inline-flex items-center gap-1 text-xs text-[#004643] dark:text-emerald-400 font-semibold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                В ефірі
              </span>
            )}

            {station.isRomantic && (
              <span className="text-xs font-semibold text-[#004643] dark:text-emerald-400 shrink-0">
                💖 Романтика
              </span>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-1.5 text-xs text-sub mt-0.5 truncate font-medium">
            <span>{station.genre}</span>
            <span aria-hidden="true" className="text-muted-theme">·</span>
            <span className="truncate">{station.city || station.region || station.location}</span>
            {station.frequency && (
              <>
                <span aria-hidden="true" className="text-muted-theme">·</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{station.frequency}</span>
              </>
            )}
            {station.habit && (
              <>
                <span aria-hidden="true" className="text-muted-theme">·</span>
                <span className="text-sub opacity-80 truncate hidden md:inline">
                  {station.habit}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Clean Action Controls (Favorites + Play) */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={(e) => onToggleFavorite(station.id, e)}
          className={`p-2 rounded-md transition-colors cursor-pointer border min-h-[36px] min-w-[36px] flex items-center justify-center ${
            isFavorite
              ? 'text-rose-500 bg-rose-500/10 border-rose-500/40'
              : 'subtle-bg border-theme text-slate-400 hover:text-rose-500 hover:border-rose-400/40'
          }`}
          title={isFavorite ? 'Видалити з обраного' : 'Додати в обране'}
          aria-label="Обране"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay(station);
          }}
          className={`p-2 rounded-md border transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
            isCurrentlyPlaying
              ? 'bg-[#004643] text-white border-[#004643] hover:bg-[#003330]'
              : 'subtle-bg text-main border-theme hover:border-[#004643] hover:text-[#004643]'
          }`}
          title={isCurrentlyPlaying ? 'Пауза' : 'Слухати'}
          aria-label={isCurrentlyPlaying ? 'Пауза' : 'Слухати'}
        >
          {isBuffering ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent animate-spin inline-block"></span>
          ) : isCurrentlyPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};
