import React, { useState } from 'react';
import {
  X,
  Sun,
  Moon,
  Settings,
  Volume2,
  ShieldCheck,
  Check,
  BarChart2,
  Clock,
  Radio,
  Calendar,
  Layers,
  Trash2,
} from 'lucide-react';
import { ThemeMode, RadioStation, DailyListeningStats, StationPlayStats } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  autoReconnect: boolean;
  onToggleAutoReconnect: () => void;
  dailyStats: DailyListeningStats;
  stationPlayStats: StationPlayStats;
  stations: RadioStation[];
  totalListeningSeconds: number;
  onResetStats?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  autoReconnect,
  onToggleAutoReconnect,
  dailyStats,
  stationPlayStats,
  stations,
  totalListeningSeconds,
  onResetStats,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'stats'>('stats');

  if (!isOpen) return null;

  const formatHoursMinutes = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    if (hours > 0) {
      return `${hours} год ${minutes} хв`;
    }
    if (minutes > 0) {
      return `${minutes} хв ${seconds} с`;
    }
    return `${seconds} с`;
  };

  interface RegionGroup {
    count: number;
    totalPlays: number;
    stations: RadioStation[];
  }

  // Group listening by days sorted descending
  const dailyEntries = Object.entries(dailyStats)
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .slice(0, 14); // Last 14 days

  // Max seconds in daily stats for relative bar width
  const maxDaySeconds = Math.max(
    1,
    ...dailyEntries.map(([_, secs]) => Number(secs) || 0)
  );

  // Station listening counts & station grouping
  const stationFrequencyList = stations
    .map((station) => ({
      station,
      plays: stationPlayStats[station.id] || 0,
    }))
    .sort((a, b) => b.plays - a.plays);

  // Group stations by Region for statistics overview
  const stationsByRegion: Record<string, RegionGroup> = {};
  stations.forEach((station) => {
    const reg = station.region || 'Інші';
    if (!stationsByRegion[reg]) {
      stationsByRegion[reg] = { count: 0, totalPlays: 0, stations: [] };
    }
    stationsByRegion[reg].count += 1;
    stationsByRegion[reg].totalPlays += stationPlayStats[station.id] || 0;
    stationsByRegion[reg].stations.push(station);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs">
      <div
        id="settings-dialog"
        className="w-full max-w-xl modal-bg border border-theme rounded-none shadow-2xl p-5 sm:p-6 relative select-none animate-in fade-in duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-theme">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#4d5d3e] text-white rounded-none">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-main uppercase tracking-wider font-mono">
                Параметри & Статистика
              </h2>
              <p className="text-[11px] text-sub font-mono">
                Palas M.D. Live • ЗСУ LIVE
              </p>
            </div>
          </div>

          <button
            id="btn-close-settings"
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-mono uppercase tracking-wider card-bg border border-theme text-sub hover:text-main rounded-none transition-colors"
          >
            Закрити
          </button>
        </div>

        {/* Tab Selector: Plain text navigation */}
        <div className="flex items-center gap-2 mb-4 border-b border-theme pb-2 text-xs font-mono">
          <button
            id="btn-tab-stats"
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-none uppercase tracking-wider font-bold transition-colors ${
              activeTab === 'stats'
                ? 'bg-[#c5a880] text-black'
                : 'card-bg text-sub hover:text-main border border-theme'
            }`}
          >
            Моя статистика
          </button>

          <button
            id="btn-tab-settings"
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-none uppercase tracking-wider font-bold transition-colors ${
              activeTab === 'settings'
                ? 'bg-[#c5a880] text-black'
                : 'card-bg text-sub hover:text-main border border-theme'
            }`}
          >
            Налаштування
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 font-mono">
          {activeTab === 'stats' ? (
            /* TASK 3: Panel 'Моя статистика' */
            <div id="my-statistics-panel" className="space-y-4">
              {/* Total Time Summary Card */}
              <div className="p-4 rounded-none subtle-bg border border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#c5a880]/15 border border-[#c5a880]/30 text-[#c5a880] rounded-none">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-theme uppercase tracking-wider block">
                      Загальний час у прямому ефірі
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-main">
                      {formatHoursMinutes(totalListeningSeconds)}
                    </span>
                  </div>
                </div>

                {onResetStats && totalListeningSeconds > 0 && (
                  <button
                    type="button"
                    onClick={onResetStats}
                    className="px-2.5 py-1 text-[11px] text-sub hover:text-[#c5a880] border border-theme card-bg rounded-none uppercase tracking-wider self-start sm:self-auto transition-colors"
                  >
                    Скинути
                  </button>
                )}
              </div>

              {/* Listening Time Grouped by Days */}
              <div className="p-4 rounded-none card-bg border border-theme">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-theme">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#c5a880]" />
                    <h3 className="text-xs font-bold text-main uppercase tracking-wider">
                      Час прослуховування за днями
                    </h3>
                  </div>
                  <span className="text-[11px] text-sub">
                    {dailyEntries.length} {dailyEntries.length === 1 ? 'день' : 'днів'}
                  </span>
                </div>

                {dailyEntries.length === 0 ? (
                  <p className="text-xs text-muted-theme py-4 text-center">
                    Статистика прослуховування формується під час відтворення радіостанцій.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {dailyEntries.map(([dateIso, rawSecs]) => {
                      const seconds = Number(rawSecs) || 0;
                      const percent = Math.round((seconds / maxDaySeconds) * 100);
                      const isToday =
                        dateIso === new Date().toISOString().split('T')[0];

                      return (
                        <div key={dateIso} className="text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-main flex items-center gap-1.5">
                              {dateIso}
                              {isToday && (
                                <span className="text-[10px] bg-[#c5a880]/20 text-[#c5a880] px-1 py-0.2 uppercase font-bold">
                                  Сьогодні
                                </span>
                              )}
                            </span>
                            <span className="text-sub font-bold">
                              {formatHoursMinutes(seconds)}
                            </span>
                          </div>

                          <div className="w-full h-2 subtle-bg rounded-none overflow-hidden border border-theme">
                            <div
                              className="h-full bg-[#c5a880] rounded-none transition-all duration-300"
                              style={{ width: `${Math.max(4, percent)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Grouped Radio Stations Breakdown */}
              <div className="p-4 rounded-none card-bg border border-theme">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-theme">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#c5a880]" />
                    <h3 className="text-xs font-bold text-main uppercase tracking-wider">
                      Згруповані радіостанції та популярність
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(stationsByRegion).map(([regionName, group]: [string, RegionGroup]) => (
                    <div key={regionName} className="p-2.5 subtle-bg border border-theme">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-main uppercase tracking-wider text-[11px]">
                          {regionName} ({group.count})
                        </span>
                        <span className="text-[#c5a880] font-bold text-[11px]">
                          {group.totalPlays} відтворень
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {group.stations.map((st) => (
                          <span
                            key={st.id}
                            className="text-[10px] px-1.5 py-0.5 card-bg border border-theme text-sub"
                          >
                            {st.name} ({stationPlayStats[st.id] || 0})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* General Settings Tab */
            <div className="space-y-4">
              {/* Theme Picker Section with Zero Rounding */}
              <div>
                <label className="block text-xs font-bold text-main uppercase tracking-wider mb-2.5">
                  Тема оформлення
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Day Theme */}
                  <button
                    id="btn-theme-day"
                    type="button"
                    onClick={() => onThemeChange('day')}
                    className={`p-3 border text-left flex flex-col justify-between gap-3 transition-all rounded-none ${
                      theme === 'day'
                        ? 'bg-[#c5a880]/15 border-[#c5a880] text-main font-bold'
                        : 'card-bg text-sub border-theme hover:bg-zinc-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Sun className="w-4 h-4 text-[#c5a880]" />
                      {theme === 'day' && <Check className="w-3.5 h-3.5 text-[#c5a880]" />}
                    </div>
                    <div>
                      <div className="text-xs uppercase font-bold">Світла</div>
                      <div className="text-[10px] opacity-70 mt-0.5">
                        Світлий креативний мінімалізм
                      </div>
                    </div>
                  </button>

                  {/* Night Theme */}
                  <button
                    id="btn-theme-night"
                    type="button"
                    onClick={() => onThemeChange('night')}
                    className={`p-3 border text-left flex flex-col justify-between gap-3 transition-all rounded-none ${
                      theme === 'night'
                        ? 'bg-[#c5a880]/20 border-[#c5a880] text-white font-bold'
                        : 'card-bg text-sub border-theme hover:bg-zinc-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Moon className="w-4 h-4 text-[#c5a880]" />
                      {theme === 'night' && <Check className="w-3.5 h-3.5 text-[#c5a880]" />}
                    </div>
                    <div>
                      <div className="text-xs uppercase font-bold">Ніч (Еротік Нуар)</div>
                      <div className="text-[10px] opacity-70 mt-0.5">
                        Шампань голд, оксамитовий чорний
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Stream Reconnect Settings */}
              <div
                onClick={onToggleAutoReconnect}
                className="p-3.5 rounded-none border border-theme card-bg flex items-center justify-between cursor-pointer hover:bg-zinc-500/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-[#c5a880]" />
                  <div>
                    <div className="text-xs font-semibold text-main uppercase">
                      Автоматичне перепідключення
                    </div>
                    <div className="text-[11px] text-sub">
                      Миттєве відновлення звуку при розриві зв'язку
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-none uppercase ${
                    autoReconnect
                      ? 'bg-[#c5a880] text-black'
                      : 'subtle-bg text-sub border border-theme'
                  }`}
                >
                  {autoReconnect ? 'Увімк' : 'Вимк'}
                </span>
              </div>

              {/* Architecture Info */}
              <div className="p-3 subtle-bg border border-theme text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
                <div className="text-[11px] text-sub leading-relaxed">
                  «Palas M.D. Live» — креативний мінімалістичний онлайн-радіоплеєр. Всі станції мовлять у високій якості напряму зі студійних серверів.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-theme flex justify-end">
          <button
            id="btn-apply-settings"
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-none bg-[#c5a880] hover:bg-[#b0936d] text-black font-mono uppercase tracking-wider font-bold text-xs transition-colors"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
