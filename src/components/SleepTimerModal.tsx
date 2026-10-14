import React, { useState } from 'react';
import { Clock, X, Check, TimerOff } from 'lucide-react';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSecondsRemaining: number | null;
  onSetTimer: (minutes: number) => void;
  onCancelTimer: () => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  activeSecondsRemaining,
  onSetTimer,
  onCancelTimer,
}) => {
  const [customMinutes, setCustomMinutes] = useState<string>('20');

  if (!isOpen) return null;

  const presets = [15, 30, 45, 60, 90];

  const formatRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMinutes, 10);
    if (!isNaN(val) && val > 0 && val <= 360) {
      onSetTimer(val);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        id="sleep-timer-dialog"
        className="w-full max-w-md modal-bg border border-theme rounded-none shadow-2xl p-5 relative select-none animate-in fade-in duration-200"
      >
        <button
          id="btn-close-sleep-timer"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 opacity-60 hover:opacity-100 rounded-none hover:bg-zinc-500/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-none bg-[#c5a880]/15 text-[#c5a880] border border-[#c5a880]/30 font-mono">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-main uppercase font-mono">Таймер сну</h2>
            <p className="text-xs text-sub font-mono">
              Автоматичне вимкнення ефіру
            </p>
          </div>
        </div>

        {activeSecondsRemaining !== null && activeSecondsRemaining > 0 && (
          <div className="mb-4 p-3 rounded-none bg-[#c5a880]/10 border border-[#c5a880]/30 flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#c5a880] animate-pulse"></span>
              <span className="text-xs font-semibold text-[#c5a880]">
                Залишилося:
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-bold text-[#c5a880]">
                {formatRemaining(activeSecondsRemaining)}
              </span>
              <button
                id="btn-cancel-timer"
                type="button"
                onClick={() => {
                  onCancelTimer();
                  onClose();
                }}
                className="text-xs px-2 py-0.5 rounded-none card-bg text-main hover:text-[#c5a880] flex items-center gap-1 border border-theme uppercase"
              >
                <TimerOff className="w-3 h-3" />
                Скасувати
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {presets.map((mins) => (
            <button
              key={mins}
              id={`btn-preset-timer-${mins}`}
              type="button"
              onClick={() => {
                onSetTimer(mins);
                onClose();
              }}
              className="py-2.5 px-2 rounded-none card-bg hover:bg-zinc-500/10 text-main border border-theme text-xs font-medium flex flex-col items-center justify-center transition-colors hover:border-zinc-400"
            >
              <span className="text-sm font-bold">{mins}</span>
              <span className="text-[10px] text-sub">хв</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleCustomSubmit} className="pt-3 border-t border-theme">
          <label className="block text-xs font-medium text-sub mb-1.5">
            Власний час (хвилини):
          </label>
          <div className="flex items-center gap-2">
            <input
              id="input-custom-timer-mins"
              type="number"
              min="1"
              max="360"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              className="flex-1 input-bg border border-theme rounded-none px-2.5 py-1.5 text-xs text-main focus:outline-none focus:border-zinc-400"
              placeholder="25"
            />
            <button
              id="btn-set-custom-timer"
              type="submit"
              className="px-3 py-1.5 rounded-none btn-primary font-semibold text-xs flex items-center gap-1 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Задати</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
