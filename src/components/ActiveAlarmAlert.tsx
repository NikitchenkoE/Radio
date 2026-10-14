import React, { useState, useEffect } from 'react';
import { AlarmClock, BellRing, Volume2, X } from 'lucide-react';
import { RadioAlarmConfig } from '../utils/radioAlarmService';

interface ActiveAlarmAlertProps {
  alarm: RadioAlarmConfig | null;
  onDismiss: () => void;
  onSnooze: (minutes?: number) => void;
}

export const ActiveAlarmAlert: React.FC<ActiveAlarmAlertProps> = ({
  alarm,
  onDismiss,
  onSnooze,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
          now.getSeconds()
        ).padStart(2, '0')}`
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!alarm) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md bg-amber-500 text-black p-4 rounded-2xl shadow-2xl border-2 border-amber-300 animate-bounce duration-500">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-black text-amber-400 flex items-center justify-center font-black animate-pulse">
            <BellRing className="w-6 h-6 animate-spin duration-1000" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-black/80">
              ⏰ РАДІОБУДИЛЬНИК СПРАЦЮВАВ!
            </div>
            <div className="text-2xl font-black font-mono tracking-tight">
              {timeStr}
            </div>
            <div className="text-xs font-bold text-black/90 truncate">
              📻 Ефір: {alarm.stationName}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-black/20">
        <button
          type="button"
          onClick={() => onSnooze(5)}
          className="flex-1 py-2 px-3 bg-black/20 hover:bg-black/30 text-black font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
        >
          💤 Відкласти на 5 хв
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="flex-1 py-2 px-3 bg-black hover:bg-zinc-900 text-amber-400 font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer text-center"
        >
          🛑 Зупинити будильник
        </button>
      </div>
    </div>
  );
};
