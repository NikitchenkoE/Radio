import React, { useEffect } from 'react';
import {
  X,
  Radio,
  Globe2,
  Heart,
  Disc3,
  Layers,
  ArrowUpDown,
  LayoutList,
  LayoutGrid,
  SlidersHorizontal,
  PlusCircle,
  Clock,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  History,
  Check,
  RotateCcw,
  Mic,
  Smartphone,
} from 'lucide-react';
import {
  CountryFilter,
  GenreType,
  GroupByOption,
  StationSortOption,
  ThemeMode,
  RadioStation,
} from '../types';
import { SlobodaLogo } from './SlobodaLogo';

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

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stations: RadioStation[];
  countryFilter: CountryFilter;
  onCountryFilterChange: (country: CountryFilter) => void;
  genreFilter: GenreType;
  onGenreFilterChange: (genre: GenreType) => void;
  groupBy: GroupByOption;
  onGroupByChange: (groupBy: GroupByOption) => void;
  sortOption: StationSortOption;
  onSortOptionChange: (sort: StationSortOption) => void;
  viewLayout: 'rows' | 'cards';
  onViewLayoutChange: (layout: 'rows' | 'cards') => void;
  showFavoritesOnly: boolean;
  onToggleShowFavorites: () => void;
  showRomanticOnly?: boolean;
  onToggleShowRomantic?: () => void;
  favoritesCount: number;
  recordingsCount: number;
  recentStations: RadioStation[];
  onSelectStation: (station: RadioStation) => void;
  onOpenAddModal: () => void;
  onOpenRecordingsModal: () => void;
  onOpenStudioModal: () => void;
  onOpenSleepTimerModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenHelpModal: () => void;
  onOpenVoiceOverlay?: () => void;
  onOpenBackgroundPlayback?: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onResetFilters: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  stations = [],
  countryFilter,
  onCountryFilterChange,
  genreFilter,
  onGenreFilterChange,
  groupBy,
  onGroupByChange,
  sortOption,
  onSortOptionChange,
  viewLayout,
  onViewLayoutChange,
  showFavoritesOnly,
  onToggleShowFavorites,
  showRomanticOnly = false,
  onToggleShowRomantic,
  favoritesCount,
  recordingsCount,
  recentStations = [],
  onSelectStation,
  onOpenAddModal,
  onOpenRecordingsModal,
  onOpenStudioModal,
  onOpenSleepTimerModal,
  onOpenSettingsModal,
  onOpenHelpModal,
  onOpenVoiceOverlay,
  onOpenBackgroundPlayback,
  theme,
  onToggleTheme,
  onResetFilters,
}) => {
  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const hasActiveFilters =
    genreFilter !== 'Всі' || countryFilter !== 'all' || showFavoritesOnly;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        id="sidebar-drawer-menu"
        className="relative z-10 w-full max-w-sm sm:max-w-md h-full card-bg border-r border-theme shadow-2xl flex flex-col font-sans animate-in slide-in-from-left duration-250 overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-theme flex items-center justify-between shrink-0 subtle-bg">
          <div className="flex items-center gap-3">
            <SlobodaLogo size="sm" showText={true} />
          </div>
          <button
            id="btn-close-sidebar"
            type="button"
            onClick={onClose}
            className="p-1.5 subtle-bg border border-theme text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
            title="Закрити меню"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Theme Switcher Bar - Instantly visible on mobile */}
        <div className="px-4 py-2 border-b border-theme subtle-bg flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Оформлення:
          </span>
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 border border-theme">
            <button
              type="button"
              onClick={() => {
                if (theme !== 'day') onToggleTheme();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                theme === 'day'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
              title="Перемкнути на світлу тему (День)"
            >
              <Sun className="w-3.5 h-3.5 fill-current" />
              <span>Світла</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (theme !== 'night') onToggleTheme();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                theme === 'night'
                  ? 'bg-[#004643] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
              title="Перемкнути на темну тему (Ніч)"
            >
              <Moon className="w-3.5 h-3.5 fill-current" />
              <span>Темна</span>
            </button>
          </div>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-5 scrollbar-thin">
          {/* Section 1: Quick Navigation & Country Scope */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Розділи ефіру
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="text-[11px] text-[#004643] dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Скинути
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* All Stations */}
              <button
                type="button"
                onClick={() => {
                  if (showFavoritesOnly) onToggleShowFavorites();
                  onCountryFilterChange('all');
                  onClose();
                }}
                className={`p-2.5 border text-left transition-colors flex items-center justify-between cursor-pointer ${
                  !showFavoritesOnly && countryFilter === 'all'
                    ? 'bg-[#004643] text-white border-[#004643]'
                    : 'subtle-bg border-theme text-slate-800 dark:text-slate-200 hover:border-[#004643]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Radio className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold truncate">Всі станції</span>
                </div>
                <span className="text-[11px] opacity-75 font-mono">{stations.length}</span>
              </button>

              {/* Ukraine */}
              <button
                type="button"
                onClick={() => {
                  if (showFavoritesOnly) onToggleShowFavorites();
                  onCountryFilterChange('UA');
                  onClose();
                }}
                className={`p-2.5 border text-left transition-colors flex items-center justify-between cursor-pointer ${
                  !showFavoritesOnly && countryFilter === 'UA'
                    ? 'bg-[#004643] text-white border-[#004643]'
                    : 'subtle-bg border-theme text-slate-800 dark:text-slate-200 hover:border-[#004643]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm shrink-0">🇺🇦</span>
                  <span className="text-xs font-bold truncate">Україна</span>
                </div>
              </button>

              {/* World */}
              <button
                type="button"
                onClick={() => {
                  if (showFavoritesOnly) onToggleShowFavorites();
                  onCountryFilterChange('World');
                  onClose();
                }}
                className={`p-2.5 border text-left transition-colors flex items-center justify-between cursor-pointer ${
                  !showFavoritesOnly && countryFilter === 'World'
                    ? 'bg-[#004643] text-white border-[#004643]'
                    : 'subtle-bg border-theme text-slate-800 dark:text-slate-200 hover:border-[#004643]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Globe2 className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold truncate">Світ</span>
                </div>
              </button>

              {/* Favorites */}
              <button
                type="button"
                onClick={() => {
                  if (!showFavoritesOnly) onToggleShowFavorites();
                  onClose();
                }}
                className={`p-2.5 border text-left transition-colors flex items-center justify-between cursor-pointer ${
                  showFavoritesOnly
                    ? 'bg-[#004643] text-white border-[#004643]'
                    : 'subtle-bg border-theme text-slate-800 dark:text-slate-200 hover:border-[#004643]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Heart className={`w-4 h-4 shrink-0 ${showFavoritesOnly ? 'fill-current' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold truncate">Обране</span>
                </div>
                {favoritesCount > 0 && (
                  <span className="text-[11px] opacity-85 font-mono">({favoritesCount})</span>
                )}
              </button>

              {/* Romantic Curated Collection */}
              <button
                type="button"
                onClick={() => {
                  if (onToggleShowRomantic) onToggleShowRomantic();
                  onClose();
                }}
                className={`col-span-2 p-2.5 border text-left transition-colors flex items-center justify-between cursor-pointer ${
                  showRomanticOnly
                    ? 'bg-[#004643] text-white border-[#004643]'
                    : 'subtle-bg border-theme text-slate-800 dark:text-slate-200 hover:border-[#004643]'
                }`}
                title="Спеціальна підбірка українських та міжнародних романтичних радіостанцій"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm shrink-0">💖</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate">Романтична підбірка</span>
                    <span className="text-[10px] text-sub block truncate">Україна & Світовий ефір</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 subtle-bg border border-theme font-bold">
                  {stations.filter((s) => s.isRomantic).length} станцій
                </span>
              </button>
            </div>
          </div>

          {/* Section 2: Genres */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
              Музичні жанри
            </span>
            <div className="flex flex-wrap gap-1">
              {GENRES.map((g) => {
                const count =
                  g === 'Всі'
                    ? stations.length
                    : stations.filter((s) => s.genre === g).length;
                const isSelected = genreFilter === g;

                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      onGenreFilterChange(g);
                      onClose();
                    }}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-[#004643] text-white border-[#004643]'
                        : 'subtle-bg hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 border-theme'
                    }`}
                  >
                    <span>{g}</span>
                    <span
                      className={`text-[10px] ${
                        isSelected ? 'text-emerald-200' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Grouping */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Групування
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 border border-theme p-1 subtle-bg">
              {(
                [
                  { id: 'region', label: 'За регіоном' },
                  { id: 'city', label: 'За містом' },
                  { id: 'habit', label: 'За звичками' },
                  { id: 'none', label: 'Без груп' },
                ] as const
              ).map((mode) => {
                const isActive = groupBy === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => onGroupByChange(mode.id)}
                    className={`px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer text-left flex items-center justify-between ${
                      isActive
                        ? 'bg-[#004643] text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    <span className="truncate">{mode.label}</span>
                    {isActive && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Sorting & View Layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* Sorting */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Сортування
                </span>
              </div>
              <div className="border border-theme divide-y divide-theme subtle-bg">
                {(
                  [
                    { id: 'default', label: 'Стандарт' },
                    { id: 'alphabetical', label: 'А — Я' },
                    { id: 'frequency', label: 'Популярні' },
                  ] as const
                ).map((sort) => {
                  const isActive = sortOption === sort.id;
                  return (
                    <button
                      key={sort.id}
                      type="button"
                      onClick={() => onSortOptionChange(sort.id)}
                      className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                        isActive
                          ? 'bg-[#004643] text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                      }`}
                    >
                      <span>{sort.label}</span>
                      {isActive && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* View Layout */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <LayoutList className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Вигляд
                </span>
              </div>
              <div className="border border-theme divide-y divide-theme subtle-bg">
                <button
                  type="button"
                  onClick={() => onViewLayoutChange('rows')}
                  className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    viewLayout === 'rows'
                      ? 'bg-[#004643] text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5 shrink-0" />
                  <span>Список</span>
                </button>
                <button
                  type="button"
                  onClick={() => onViewLayoutChange('cards')}
                  className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    viewLayout === 'cards'
                      ? 'bg-[#004643] text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                  <span>Сітка</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Recently Listened */}
          {(recentStations || []).length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Нещодавно слухали
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {recentStations.slice(0, 6).map((station) => (
                  <button
                    key={`drawer-recent-${station.id}`}
                    type="button"
                    onClick={() => {
                      onSelectStation(station);
                      onClose();
                    }}
                    className="px-2 py-1 text-xs font-medium subtle-bg hover:bg-[#004643] hover:text-white border border-theme transition-colors cursor-pointer truncate max-w-[140px]"
                  >
                    {station.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 6: Additional Apps & Tools */}
          <div className="pt-2 border-t border-theme">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
              Інструменти & Можливості
            </span>
            <div className="border border-theme divide-y divide-theme subtle-bg">
              {/* Voice Commands Hands-free */}
              {onOpenVoiceOverlay && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenVoiceOverlay();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <Mic className="w-4 h-4 text-emerald-500 shrink-0 animate-pulse" />
                  <span className="font-semibold">Голосове керування (Hands-free)</span>
                </button>
              )}

              {/* Background Playback & Screen off */}
              {onOpenBackgroundPlayback && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBackgroundPlayback();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-semibold">Фонове радіо & екран</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStudioModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Студія & архів</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRecordingsModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Disc3 className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Записи ефіру</span>
                </div>
                {recordingsCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold">
                    {recordingsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSleepTimerModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left cursor-pointer"
              >
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Таймер сну</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-sky-500 shrink-0" />
                <span>Додати станцію</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettingsModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Налаштування додатку</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHelpModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Довідка & гарячі клавіші</span>
              </button>

              {/* Theme Toggle in Drawer */}
              <button
                type="button"
                onClick={onToggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {theme === 'day' ? (
                    <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <Moon className="w-4 h-4 text-sky-400 shrink-0" />
                  )}
                  <span>Тема</span>
                </div>
                <span className="text-[11px] text-slate-500 font-normal">
                  {theme === 'day' ? 'День' : 'Ніч'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="px-5 py-3 border-t border-theme subtle-bg flex items-center justify-between text-[11px] text-slate-500">
          <span>Слобода • Українське радіо</span>
          <span>{stations.length} станцій</span>
        </div>
      </aside>
    </div>
  );
};
