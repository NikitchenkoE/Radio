import React, { useState } from 'react';
import {
  Sparkles,
  Trophy,
  Headphones,
  Radio,
  Clock,
  Flame,
  Share2,
  Check,
  X,
  Calendar,
  Disc3,
  Award,
} from 'lucide-react';
import { DailyListeningStats, StationPlayStats } from '../types';

interface RadioWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyStats: DailyListeningStats;
  stationPlayStats: StationPlayStats;
  favoritesCount: number;
  recordingsCount: number;
}

export const RadioWrappedModal: React.FC<RadioWrappedModalProps> = ({
  isOpen,
  onClose,
  dailyStats,
  stationPlayStats,
  favoritesCount,
  recordingsCount,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Calculate total seconds listened
  const totalSeconds = Object.values(dailyStats).reduce<number>(
    (acc, val) => acc + (Number(val) || 0),
    0
  );
  const totalHours = Math.max(1, Math.round((totalSeconds / 3600) * 10) / 10);

  // Find top station
  const stationEntries: [string, number][] = Object.entries(stationPlayStats).map(([k, v]) => [
    k,
    Number(v) || 0,
  ]);
  stationEntries.sort((a, b) => b[1] - a[1]);
  const topStationName = stationEntries[0]?.[0] || 'Армія FM';
  const topStationPlays = stationEntries[0]?.[1] || 42;

  const handleShare = () => {
    const summary = `📻 Мій Радіо-Підсумок (Radio Wrapped):\n` +
      `⏱️ Прослухано ефіру: ${totalHours} годин\n` +
      `🏆 Улюблена хвиля: ${topStationName} (${topStationPlays} разів)\n` +
      `⭐ В обраному: ${favoritesCount} станцій\n` +
      `Слухайте українське радіо разом зі мною! 🇺🇦`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-zinc-950 via-zinc-900 to-black rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-black shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-wide text-white flex items-center gap-1.5">
                <span>Радіо-Підсумок</span>
                <span className="text-amber-400 text-xs font-mono">WRAPPED</span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Ваша персональна статистика прослуховування ефіру
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Infographic Card */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Hero Stat: Hours Listened */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-zinc-900 border border-emerald-500/30 relative overflow-hidden">
            <div className="absolute top-3 right-3 opacity-10">
              <Headphones className="w-24 h-24" />
            </div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 mb-1">
              ЧАС В ЕФІРІ
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                {totalHours}
              </span>
              <span className="text-lg font-bold text-emerald-400">годин живої музики</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Дякуємо, що підтримуєте українське мовлення разом із нами!
            </p>
          </div>

          {/* Top Station Gold Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 to-zinc-900 border border-amber-500/40 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>ВАША СТАНЦІЯ №1</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                {topStationPlays} перемикань
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-white">
              «{topStationName}»
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Головний фаворит у вашому приймачі
            </p>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-2 gap-3">
            {/* Favorites */}
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="text-[10px] font-mono uppercase text-zinc-400">Обрані станції</div>
              <div className="text-2xl font-black font-mono text-amber-400 mt-1">
                {favoritesCount}
              </div>
              <div className="text-[11px] text-zinc-500">У швидкому доступі</div>
            </div>

            {/* Recordings */}
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="text-[10px] font-mono uppercase text-zinc-400">Збережено ефірів</div>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                {recordingsCount}
              </div>
              <div className="text-[11px] text-zinc-500">Аудіозаписів на пристрої</div>
            </div>
          </div>

          {/* Listener Profile Badge */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 font-bold">
              🚗
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Профіль: Активний Водій & Слухач
              </div>
              <div className="text-[11px] text-zinc-400">
                Найчастіше слухаєте музику в дорозі та ранковий час
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs transition-colors cursor-pointer shadow-md"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Скопійовано для соцмереж!' : 'Поділитися підсумком'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
};
