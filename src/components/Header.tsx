import React, { useState, useRef, useEffect } from 'react';
import { CountryFilter, ThemeMode } from '../types';
import { SlobodaLogo } from './SlobodaLogo';
import {
  Menu,
  MoreVertical,
  Settings,
  PlusCircle,
  Disc3,
  Moon,
  Sun,
  HelpCircle,
  Heart,
  Search,
  X,
  Mic,
  Smartphone,
  Radio,
  Tv,
  Car,
  Sliders,
  Download,
  Wifi,
  AlarmClock,
  Trophy,
} from 'lucide-react';
import { SignalStatus } from '../utils/signalBufferMonitor';

interface HeaderProps {
  onOpenSidebar: () => void;
  hasActiveFilters?: boolean;
  countryFilter: CountryFilter;
  onCountryFilterChange: (country: CountryFilter) => void;
  showFavoritesOnly: boolean;
  onToggleShowFavorites: () => void;
  favoritesCount: number;
  totalStationsCount: number;
  recordingsCount: number;
  onOpenAddModal: () => void;
  onOpenHelpModal: () => void;
  onOpenRecordingsModal: () => void;
  onOpenVoiceOverlay?: () => void;
  onOpenBackgroundPlayback?: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSettingsModal: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  activeNavMode?: 'radio' | 'video';
  onNavModeChange?: (mode: 'radio' | 'video') => void;
  onOpenCarMode?: () => void;
  onOpenPwaModal?: () => void;
  onOpenEqualizerModal?: () => void;
  signalStatus?: SignalStatus;
  onOpenHardwareFm?: () => void;
  onOpenAlarmModal?: () => void;
  onOpenCastModal?: () => void;
  onOpenWrappedModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  hasActiveFilters = false,
  countryFilter,
  onCountryFilterChange,
  showFavoritesOnly,
  onToggleShowFavorites,
  favoritesCount,
  totalStationsCount,
  recordingsCount,
  onOpenAddModal,
  onOpenHelpModal,
  onOpenRecordingsModal,
  onOpenVoiceOverlay,
  onOpenBackgroundPlayback,
  theme,
  onToggleTheme,
  onOpenSettingsModal,
  searchQuery = '',
  onSearchChange,
  activeNavMode = 'radio',
  onNavModeChange,
  onOpenCarMode,
  onOpenPwaModal,
  onOpenEqualizerModal,
  signalStatus,
  onOpenHardwareFm,
  onOpenAlarmModal,
  onOpenCastModal,
  onOpenWrappedModal,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 header-bg backdrop-blur-md border-b border-theme px-3 sm:px-6 py-2.5 shadow-xs select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Hamburger 'три лінійки' (☰) + Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            id="btn-open-sidebar"
            type="button"
            onClick={onOpenSidebar}
            className="relative p-2 subtle-bg border border-theme text-slate-800 dark:text-slate-200 hover:text-[#004643] dark:hover:text-emerald-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Меню та фільтри (☰)"
            aria-label="Меню та фільтри"
          >
            <Menu className="w-5 h-5" />
            {hasActiveFilters && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#004643] dark:bg-emerald-400 ring-1 ring-white dark:ring-slate-900" />
            )}
          </button>

          <SlobodaLogo size="md" showText={true} />
          <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 border-l border-theme pl-2.5 sm:pl-3 font-medium">
            {totalStationsCount} станцій
          </span>
        </div>

        {/* Primary View Switcher: Radio Studio vs Video Hub */}
        {onNavModeChange && (
          <div className="flex items-center p-0.5 subtle-bg border border-theme rounded-md text-xs font-semibold shrink-0">
            <button
              id="nav-switch-radio"
              type="button"
              onClick={() => onNavModeChange('radio')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xs transition-colors cursor-pointer ${
                activeNavMode === 'radio'
                  ? 'bg-[#004643] text-white shadow-2xs font-bold'
                  : 'text-sub hover:text-main'
              }`}
              title="Радіо Студія — каталог FM станцій та живий еквалайзер"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Радіо</span>
              <span className="hidden sm:inline">Студія</span>
            </button>

            <button
              id="nav-switch-video"
              type="button"
              onClick={() => onNavModeChange('video')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xs transition-colors cursor-pointer ${
                activeNavMode === 'video'
                  ? 'bg-red-600 text-white shadow-2xs font-bold'
                  : 'text-sub hover:text-main'
              }`}
              title="Відео Хаб — телеканали, прямі відеотрансляції, YouTube та кліпи"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Відео</span>
              <span className="hidden sm:inline">Хаб</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping ml-0.5 hidden xs:inline-block" />
            </button>
          </div>
        )}

        {/* Search input */}
        {onSearchChange && (
          <div className="flex-1 max-w-xs md:max-w-sm hidden sm:block">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 pointer-events-none" />
              <input
                id="header-search-input"
                type="text"
                placeholder="Пошук станції, міста, жанру..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs subtle-bg border border-theme text-main placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-[#004643]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right Action Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Country/Favorites Links (Desktop/Tablet only) */}
          <div className="hidden md:flex items-center subtle-bg border border-theme text-xs font-semibold">
            <button
              id="btn-filter-all-countries"
              type="button"
              onClick={() => {
                if (showFavoritesOnly) onToggleShowFavorites();
                onCountryFilterChange('all');
              }}
              className={`px-2.5 py-1 transition-colors cursor-pointer ${
                !showFavoritesOnly && countryFilter === 'all'
                  ? 'bg-[#004643] text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Всі
            </button>
            <button
              id="btn-filter-ua-countries"
              type="button"
              onClick={() => {
                if (showFavoritesOnly) onToggleShowFavorites();
                onCountryFilterChange('UA');
              }}
              className={`px-2.5 py-1 border-l border-theme transition-colors cursor-pointer ${
                !showFavoritesOnly && countryFilter === 'UA'
                  ? 'bg-[#004643] text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              Україна
            </button>
            <button
              id="btn-filter-favorites"
              type="button"
              onClick={onToggleShowFavorites}
              className={`px-2.5 py-1 border-l border-theme flex items-center gap-1 transition-colors cursor-pointer ${
                showFavoritesOnly
                  ? 'bg-[#004643] text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#004643]'
              }`}
              title="Показати лише обрані станції"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  showFavoritesOnly ? 'fill-current' : 'text-slate-600 dark:text-slate-300'
                }`}
              />
              <span className="inline">Обране</span>
              {favoritesCount > 0 && (
                <span className="text-[10px] opacity-90 font-bold">({favoritesCount})</span>
              )}
            </button>
          </div>

          {/* Quick Voice Commands Button (Desktop/Tablet) */}
          {onOpenVoiceOverlay && (
            <button
              id="btn-header-voice-commands"
              type="button"
              onClick={onOpenVoiceOverlay}
              className="hidden md:flex px-2.5 py-1 text-xs font-semibold subtle-bg border border-theme text-slate-700 dark:text-slate-300 hover:text-[#004643] dark:hover:text-emerald-300 items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Голосове керування ефіром: «наступна», «пауза», «гучніше», «тихіше»"
            >
              <Mic className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span className="hidden lg:inline">Голос</span>
            </button>
          )}

          {/* Background Playback & Lock Screen Button (Desktop/Tablet) */}
          {onOpenBackgroundPlayback && (
            <button
              id="btn-header-background-audio"
              type="button"
              onClick={onOpenBackgroundPlayback}
              className="hidden xl:flex px-2.5 py-1 text-xs font-semibold subtle-bg border border-theme text-slate-700 dark:text-slate-300 hover:text-[#004643] dark:hover:text-emerald-300 items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Фонове відтворення радіо (екран вимкнено / фоновий режим)"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              <span>Фонове</span>
            </button>
          )}

          {/* Car Driver Mode Quick Button */}
          {onOpenCarMode && (
            <button
              id="btn-header-car-mode"
              type="button"
              onClick={onOpenCarMode}
              className="flex px-2.5 py-1 text-xs font-semibold subtle-bg border border-theme text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Спеціальний повноекранний режим «Водій в авто» (Car Mode)"
            >
              <Car className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Авто</span>
            </button>
          )}

          {/* Equalizer Quick Button */}
          {onOpenEqualizerModal && (
            <button
              id="btn-header-equalizer"
              type="button"
              onClick={onOpenEqualizerModal}
              className="hidden sm:flex px-2.5 py-1 text-xs font-semibold subtle-bg border border-theme text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Звуковий еквалайзер та пресети тембру (Bass Boost, Вокал, Рок)"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">Еквалайзер</span>
            </button>
          )}

          {/* PWA Install App Button */}
          {onOpenPwaModal && (
            <button
              id="btn-header-install-pwa"
              type="button"
              onClick={onOpenPwaModal}
              className="flex px-2.5 py-1 text-xs font-semibold subtle-bg border border-theme text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Встановити додаток на телефон або комп'ютер (PWA)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Додаток</span>
            </button>
          )}

          {/* Hardware FM Tuner Button */}
          {onOpenHardwareFm && (
            <button
              id="btn-header-hardware-fm"
              type="button"
              onClick={onOpenHardwareFm}
              className="flex px-2.5 py-1 text-xs font-semibold subtle-bg border border-theme text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Апаратний FM-тюнер через USB (Web Serial) або Bluetooth без інтернету"
            >
              <Radio className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">FM Офлайн</span>
            </button>
          )}

          {/* Alarm Clock Button */}
          {onOpenAlarmModal && (
            <button
              id="btn-header-alarm"
              type="button"
              onClick={onOpenAlarmModal}
              className="hidden lg:flex px-2.5 py-1 text-xs font-semibold subtle-bg border border-theme text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Розумний радіобудильник з плавним наростанням звуку"
            >
              <AlarmClock className="w-3.5 h-3.5 text-amber-500" />
              <span>Будильник</span>
            </button>
          )}

          {/* Wrapped / Statistics Button */}
          {onOpenWrappedModal && (
            <button
              id="btn-header-wrapped"
              type="button"
              onClick={onOpenWrappedModal}
              className="hidden xl:flex px-2.5 py-1 text-xs font-semibold subtle-bg border border-theme text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Ваш персональний радіо-підсумок прослуховування"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Підсумок</span>
            </button>
          )}

          {/* Mobile search toggle */}
          {onSearchChange && (
            <button
              id="btn-toggle-search-mobile"
              type="button"
              onClick={() => setIsSearchExpanded((prev) => !prev)}
              className="sm:hidden p-2 subtle-bg border border-theme text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shrink-0 cursor-pointer"
              title="Пошук станцій"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* 1-Click Quick Theme Toggle (Light / Dark) */}
          <button
            id="btn-header-theme-toggle"
            type="button"
            onClick={onToggleTheme}
            className="p-2 subtle-bg border border-theme text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            title={theme === 'day' ? 'Світла тема активна. Клікніть для перемикання на темну (Ніч)' : 'Темна тема активна. Клікніть для перемикання на світлу (День)'}
            aria-label="Перемикач світлої та темної теми"
          >
            {theme === 'day' ? (
              <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
            )}
          </button>

          {/* Hidden Actions Menu Behind '...' Icon */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              id="btn-header-more-menu"
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`p-2 border transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                isMenuOpen
                  ? 'bg-[#004643] text-white border-[#004643]'
                  : 'subtle-bg border-theme text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title="Більше дій (Меню)"
              aria-expanded={isMenuOpen}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu Popover */}
            {isMenuOpen && (
              <div
                id="header-overflow-menu"
                className="absolute right-0 top-full mt-1.5 w-60 max-w-[calc(100vw-20px)] p-1 shadow-2xl card-bg border border-theme animate-in fade-in duration-100 z-50 text-xs font-sans"
              >
                <div className="px-2.5 py-1.5 border-b border-theme flex items-center justify-between mb-1">
                  <span className="font-bold text-main text-xs">
                    Меню
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-0.5">
                  {/* Voice Commands Hands-Free */}
                  {onOpenVoiceOverlay && (
                    <button
                      id="menu-btn-voice-commands"
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenVoiceOverlay();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left font-medium"
                    >
                      <Mic className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
                      <span>Голосове керування (Hands-free)</span>
                    </button>
                  )}

                  {/* Car Driver Mode */}
                  {onOpenCarMode && (
                    <button
                      id="menu-btn-car-mode"
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenCarMode();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left font-medium"
                    >
                      <Car className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Режим «Водій в авто» (Car Mode)</span>
                    </button>
                  )}

                  {/* Audio Equalizer */}
                  {onOpenEqualizerModal && (
                    <button
                      id="menu-btn-equalizer"
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenEqualizerModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left font-medium"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Звуковий еквалайзер & пресети</span>
                    </button>
                  )}

                  {/* Install PWA App */}
                  {onOpenPwaModal && (
                    <button
                      id="menu-btn-pwa-install"
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenPwaModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left font-medium"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Встановити додаток (PWA)</span>
                    </button>
                  )}

                  {/* Hardware FM Tuner */}
                  {onOpenHardwareFm && (
                    <button
                      id="menu-btn-hardware-fm"
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenHardwareFm();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left font-medium"
                    >
                      <Radio className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Апаратний FM-тюнер (USB / Bluetooth)</span>
                    </button>
                  )}

                  {/* Alarm Clock */}
                  {onOpenAlarmModal && (
                    <button
                      id="menu-btn-alarm"
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenAlarmModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left font-medium"
                    >
                      <AlarmClock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Розумний радіобудильник</span>
                    </button>
                  )}

                  {/* Big Screen Mode */}
                  {onOpenCastModal && (
                    <button
                      id="menu-btn-cast"
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenCastModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left font-medium"
                    >
                      <Tv className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>Трансляція на великий екран ТБ</span>
                    </button>
                  )}

                  {/* Radio Wrapped Summary */}
                  {onOpenWrappedModal && (
                    <button
                      id="menu-btn-wrapped"
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenWrappedModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left font-medium"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Мій Радіо-Підсумок (Wrapped)</span>
                    </button>
                  )}

                  {/* Background Playback */}
                  {onOpenBackgroundPlayback && (
                    <button
                      id="menu-btn-background-radio"
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenBackgroundPlayback();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left font-medium"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Фонове радіо & екран</span>
                    </button>
                  )}

                  {/* Settings & Stats */}
                  <button
                    id="menu-btn-settings"
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenSettingsModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left font-medium"
                  >
                    <Settings className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Налаштування & статистика</span>
                  </button>

                  {/* Recordings Archive */}
                  <button
                    id="menu-btn-recordings"
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenRecordingsModal();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left font-medium"
                  >
                    <div className="flex items-center gap-2.5">
                      <Disc3 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Записи ефіру</span>
                    </div>
                    {recordingsCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold">
                        {recordingsCount}
                      </span>
                    )}
                  </button>

                  {/* Add Custom Station */}
                  <button
                    id="menu-btn-add-station"
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenAddModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left font-medium"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span>Додати станцію</span>
                  </button>

                  {/* Theme Switcher */}
                  <button
                    id="menu-btn-theme"
                    type="button"
                    onClick={() => {
                      onToggleTheme();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left font-medium"
                  >
                    <div className="flex items-center gap-2.5">
                      {theme === 'day' ? (
                        <Moon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      ) : (
                        <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                      <span>{theme === 'day' ? 'Темна тема (Ніч)' : 'Світла тема (День)'}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 subtle-bg border border-theme text-slate-600 dark:text-slate-300 font-semibold">
                      {theme === 'day' ? 'Увімкнути темну' : 'Увімкнути світлу'}
                    </span>
                  </button>

                  {/* Keyboard Shortcuts & Help */}
                  <button
                    id="menu-btn-help"
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenHelpModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 hover:bg-[#004643] hover:text-white transition-colors text-left font-medium"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>Довідка & клавіші</span>
                  </button>

                  {/* Signal Quality Status Bar */}
                  {signalStatus && (
                    <div className="pt-2 mt-1 border-t border-theme/70 px-2.5 py-1 flex items-center justify-between text-[11px] text-sub">
                      <div className="flex items-center gap-1.5 font-semibold text-main">
                        <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Зв’язок:</span>
                      </div>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 subtle-bg rounded-xs border border-theme font-bold text-main">
                        {signalStatus.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile expanded search input */}
      {isSearchExpanded && onSearchChange && (
        <div className="sm:hidden pt-2.5 pb-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Пошук станції, міста, жанру..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-8 py-1.5 text-xs subtle-bg border border-theme text-main placeholder:text-slate-400 focus:outline-none focus:border-[#004643]"
            />
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                setIsSearchExpanded(false);
              }}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
