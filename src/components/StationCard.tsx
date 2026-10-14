import React from 'react';
import { RadioStation, PlaybackStatus } from '../types';
import { Play, Pause, Heart, Radio, Disc3 } from 'lucide-react';

interface StationCardProps {
  station: RadioStation;
  isActive: boolean;
  playbackStatus: PlaybackStatus;
  isFavorite: boolean;
  onSelect: (station: RadioStation) => void;
  onTogglePlay: (station: RadioStation) => void;
  onToggleFavorite: (stationId: string, e: React.MouseEvent) => void;
  onOpenStudio?: (station: RadioStation) => void;
}

export const StationCard: React.FC<StationCardProps> = ({
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
  const hasError = isActive && playbackStatus === 'error';

  return (
    <div
      id={`station-card-${station.id}`}
      onClick={() => onSelect(station)}
      className={`group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-md cursor-pointer transition-all duration-150 select-none border h-full ${
        isActive
          ? 'card-bg border-[#004643] dark:border-emerald-500 shadow-xs'
          : 'card-bg border-theme hover:border-[#004643]/40 dark:hover:border-emerald-500/40'
      }`}
    >
      {/* Top Header: Location, Frequency & Favorite Status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-sub min-w-0 font-medium">
          <span className="truncate">{station.city || station.region || 'Україна'}</span>
          {station.frequency && (
            <>
              <span aria-hidden="true" className="text-muted-theme">·</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{station.frequency}</span>
            </>
          )}
          {station.isRomantic && (
            <>
              <span aria-hidden="true" className="text-muted-theme">·</span>
              <span className="text-[#004643] dark:text-emerald-400 font-semibold flex items-center gap-0.5 shrink-0" title="Романтична підбірка">
                <span>💖</span>
                <span>Романтика</span>
              </span>
            </>
          )}
        </div>

        {/* Favorite Button */}
        <button
          id={`btn-fav-${station.id}`}
          type="button"
          onClick={(e) => onToggleFavorite(station.id, e)}
          className={`p-1.5 rounded-md transition-colors cursor-pointer border min-h-[32px] min-w-[32px] flex items-center justify-center ${
            isFavorite
              ? 'text-rose-500 bg-rose-500/10 border-rose-500/40'
              : 'subtle-bg border-theme text-slate-400 hover:text-rose-500 hover:border-rose-400/40'
          }`}
          title={isFavorite ? 'Видалити з обраного' : 'Додати в обране'}
          aria-label="Обране"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Main Body: Station Avatar & Title */}
      <div className="flex items-start gap-3 mb-3.5">
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-md shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 border ${
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
          <h4 className="font-bold text-sm sm:text-base text-main truncate tracking-tight group-hover:text-[#004643] dark:group-hover:text-emerald-300 transition-colors">
            {station.name}
          </h4>

          <div className="flex items-center gap-1.5 text-xs text-sub mt-0.5 truncate">
            <span>{station.genre}</span>
            <span aria-hidden="true" className="text-muted-theme">·</span>
            <span className="font-mono text-muted-theme">{station.bitrate}</span>
          </div>

          {station.habit && (
            <p className="text-xs text-sub opacity-85 mt-1 line-clamp-1">
              {station.habit}
            </p>
          )}
        </div>
      </div>

      {/* Footer: Stream Status & Flat Action Button */}
      <div className="pt-3 border-t border-theme flex items-center justify-between gap-2 mt-auto">
        <div className="min-w-0">
          {hasError ? (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Помилка сигналу</span>
          ) : isCurrentlyPlaying ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#004643] dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              В ефірі
            </span>
          ) : isBuffering ? (
            <span className="text-xs text-[#004643] dark:text-emerald-400 font-medium animate-pulse">З'єднання...</span>
          ) : (
            <span className="text-xs text-muted-theme truncate block">{station.location}</span>
          )}
        </div>

        <button
          id={`btn-card-action-${station.id}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay(station);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer shrink-0 min-h-[36px] ${
            isCurrentlyPlaying
              ? 'bg-[#004643] text-white border-[#004643] hover:bg-[#003330]'
              : 'subtle-bg text-main border-theme hover:border-[#004643] hover:text-[#004643]'
          }`}
          aria-label={isCurrentlyPlaying ? 'Пауза' : 'Слухати'}
        >
          {isBuffering ? (
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent animate-spin"></span>
          ) : isCurrentlyPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Пауза</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              <span>Слухати</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
