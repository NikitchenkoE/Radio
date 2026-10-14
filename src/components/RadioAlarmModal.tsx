import React, { useState, useEffect } from 'react';
import {
  AlarmClock,
  Clock,
  Volume2,
  X,
  Plus,
  Trash2,
  Check,
  Bell,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { RadioStation } from '../types';
import {
  radioAlarmService,
  RadioAlarmConfig,
} from '../utils/radioAlarmService';

interface RadioAlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: RadioStation[];
  onTriggerAlarmStation: (stationId: string, targetVolume: number, fadeInSeconds: number) => void;
}

const DAY_LABELS = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export const RadioAlarmModal: React.FC<RadioAlarmModalProps> = ({
  isOpen,
  onClose,
  stations,
  onTriggerAlarmStation,
}) => {
  const [alarms, setAlarms] = useState<RadioAlarmConfig[]>(() => radioAlarmService.getAlarms());
  const [isAdding, setIsAdding] = useState(false);

  // New Alarm Form State
  const [newTime, setNewTime] = useState('07:00');
  const [newStationId, setNewStationId] = useState(stations[0]?.id || 'army-fm');
  const [newDays, setNewDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [newLabel, setNewLabel] = useState('Ранкове пробудження');
  const [newFadeIn, setNewFadeIn] = useState(45);
  const [newVolume, setNewVolume] = useState(80);

  useEffect(() => {
    setAlarms(radioAlarmService.getAlarms());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleAlarm = (id: string, currentEnabled: boolean) => {
    radioAlarmService.toggleAlarm(id, !currentEnabled);
    setAlarms(radioAlarmService.getAlarms());
  };

  const handleDeleteAlarm = (id: string) => {
    radioAlarmService.deleteAlarm(id);
    setAlarms(radioAlarmService.getAlarms());
  };

  const handleToggleDay = (dayIndex: number) => {
    if (newDays.includes(dayIndex)) {
      setNewDays(newDays.filter((d) => d !== dayIndex));
    } else {
      setNewDays([...newDays, dayIndex].sort());
    }
  };

  const handleSaveNewAlarm = () => {
    const selectedStation = stations.find((s) => s.id === newStationId) || stations[0];
    const newConfig: RadioAlarmConfig = {
      id: `alarm-${Date.now()}`,
      enabled: true,
      time: newTime,
      stationId: newStationId,
      stationName: selectedStation?.name || 'Радіостанція',
      days: newDays,
      label: newLabel.trim() || 'Радіобудильник',
      fadeInDurationSeconds: newFadeIn,
      targetVolume: newVolume,
    };

    radioAlarmService.saveAlarm(newConfig);
    setAlarms(radioAlarmService.getAlarms());
    setIsAdding(false);
  };

  const handlePreview = () => {
    onTriggerAlarmStation(newStationId, newVolume, 5);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg card-theme rounded-2xl shadow-2xl border border-theme overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-theme subtle-bg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <AlarmClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-main">
                Розумний Радіобудильник
              </h3>
              <p className="text-xs text-sub">
                Прокидайтеся під живу музику з плавним наростанням звуку
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-sub hover:text-main hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Alarms List */}
          {!isAdding ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sub">
                  Ваші будильники ({alarms.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#004643] hover:bg-[#003836] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Додати будильник</span>
                </button>
              </div>

              {alarms.length === 0 ? (
                <div className="text-center py-8 text-sub border border-dashed border-theme rounded-xl">
                  <Clock className="w-8 h-8 mx-auto opacity-40 mb-2" />
                  <p className="text-sm font-semibold">Немає активних будильників</p>
                  <p className="text-xs mt-1">
                    Створіть свій перший будильник для ранкового пробудження
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alarms.map((alarm) => (
                    <div
                      key={alarm.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        alarm.enabled
                          ? 'border-amber-500/50 subtle-bg ring-1 ring-amber-500/20'
                          : 'border-theme opacity-60'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-mono font-black text-main">
                            {alarm.time}
                          </span>
                          <span className="text-xs text-sub truncate">
                            {alarm.days.length === 7
                              ? 'Щодня'
                              : alarm.days.length === 5 && !alarm.days.includes(0) && !alarm.days.includes(6)
                              ? 'Будні'
                              : alarm.days.length === 0
                              ? 'Один раз'
                              : alarm.days.map((d) => DAY_LABELS[d]).join(', ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="font-semibold text-amber-600 dark:text-amber-400 truncate">
                            📻 {alarm.stationName}
                          </span>
                          <span className="text-sub">·</span>
                          <span className="text-sub truncate">
                            Фейд: {alarm.fadeInDurationSeconds}с
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Toggle switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleAlarm(alarm.id, alarm.enabled)}
                          className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                            alarm.enabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                              alarm.enabled ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteAlarm(alarm.id)}
                          className="p-1.5 text-sub hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                          title="Видалити"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Add / Edit Form */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-theme">
                <span className="font-bold text-sm text-main">Налаштування будильника</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-sub hover:text-main"
                >
                  Скасувати
                </button>
              </div>

              {/* Time Input */}
              <div>
                <label className="block text-xs font-semibold text-sub mb-1">
                  Час сигналу
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full text-center text-3xl font-mono font-black py-2.5 rounded-xl border border-theme input-theme"
                  required
                />
              </div>

              {/* Station Selection */}
              <div>
                <label className="block text-xs font-semibold text-sub mb-1">
                  Радіостанція для пробудження
                </label>
                <select
                  value={newStationId}
                  onChange={(e) => setNewStationId(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-theme input-theme text-sm font-semibold"
                >
                  {stations.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} {st.frequency ? `(${st.frequency})` : ''} — {st.genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Days of Week */}
              <div>
                <label className="block text-xs font-semibold text-sub mb-1.5">
                  Повторювати у дні:
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAY_LABELS.map((dayLabel, idx) => {
                    const isSelected = newDays.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToggleDay(idx)}
                        className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-black shadow-sm font-black'
                            : 'subtle-bg border border-theme text-sub hover:text-main'
                        }`}
                      >
                        {dayLabel}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-1.5 text-[11px] text-sub">
                  <button
                    type="button"
                    onClick={() => setNewDays([1, 2, 3, 4, 5])}
                    className="hover:underline"
                  >
                    Будні (Пн-Пт)
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setNewDays([0, 1, 2, 3, 4, 5, 6])}
                    className="hover:underline"
                  >
                    Щодня
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setNewDays([])}
                    className="hover:underline"
                  >
                    Один раз
                  </button>
                </div>
              </div>

              {/* Volume & Fade In Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs text-sub mb-1">
                    <span>Плавне наростання (Fade-in):</span>
                    <span className="font-mono font-bold text-main">{newFadeIn}с</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="5"
                    value={newFadeIn}
                    onChange={(e) => setNewFadeIn(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-sub mt-0.5">
                    Гучність плавно зростає від 0% до {newVolume}%
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-sub mb-1">
                    <span>Кінцева гучність:</span>
                    <span className="font-mono font-bold text-main">{newVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={newVolume}
                    onChange={(e) => setNewVolume(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-theme">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-theme text-xs font-semibold text-sub hover:text-main transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Перевірити звук</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-sub hover:text-main"
                  >
                    Назад
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewAlarm}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    Зберегти будильник
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-theme subtle-bg flex items-center justify-between text-xs text-sub">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Якщо зв'язок відсутній, спрацює приємний офлайн-гонг</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 font-semibold text-main hover:underline"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
