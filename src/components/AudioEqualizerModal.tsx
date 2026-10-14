import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Volume2,
  Check,
  X,
  Radio,
  Flame,
  Mic,
  Car,
  Music,
} from 'lucide-react';
import { EQ_PRESETS, EqPresetId, audioEqualizer } from '../utils/audioEqualizer';

interface AudioEqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioEqualizerModal: React.FC<AudioEqualizerModalProps> = ({ isOpen, onClose }) => {
  const [activePreset, setActivePreset] = useState<EqPresetId>(() => audioEqualizer.getActivePreset().id);

  if (!isOpen) return null;

  const handleSelectPreset = (id: EqPresetId) => {
    setActivePreset(id);
    audioEqualizer.applyPreset(id);
  };

  const getPresetIcon = (id: EqPresetId) => {
    switch (id) {
      case 'bass_boost':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'vocal':
        return <Mic className="w-4 h-4 text-emerald-500" />;
      case 'rock':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'car':
        return <Car className="w-4 h-4 text-blue-500" />;
      case 'chill':
        return <Music className="w-4 h-4 text-teal-500" />;
      default:
        return <Sliders className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg card-bg border border-theme rounded-xl shadow-2xl p-5 sm:p-6 text-main select-none">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-sub hover:text-main rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title="Закрити"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-theme">
          <div className="w-10 h-10 rounded-lg bg-[#004643] flex items-center justify-center text-white shadow-xs">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-main">
              Звуковий Еквалайзер & Пресети
            </h3>
            <p className="text-xs text-sub mt-0.5">
              Апаратне налаштування тембру звучання радіопотоку
            </p>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="space-y-2 mb-5">
          {EQ_PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id;

            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-[#004643] ring-2 ring-[#004643]/30 bg-[#004643]/10'
                    : 'subtle-bg border-theme hover:border-slate-400'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-black/5 dark:bg-white/5 border border-theme flex items-center justify-center shrink-0">
                    {getPresetIcon(preset.id)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-main truncate">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span className="px-1.5 py-0.2 bg-[#004643] text-white text-[9px] font-bold rounded-xs">
                          АКТИВНО
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-sub line-clamp-1 mt-0.5">
                      {preset.description}
                    </p>
                  </div>
                </div>

                {/* Gain values badge */}
                <div className="flex items-center gap-1 text-[10px] font-mono shrink-0">
                  <span className="px-1.5 py-0.5 subtle-bg rounded-xs border border-theme" title="Низькі частоти (Бас)">
                    B: {preset.bass > 0 ? `+${preset.bass}` : preset.bass}dB
                  </span>
                  <span className="px-1.5 py-0.5 subtle-bg rounded-xs border border-theme" title="Середні частоти (Вокал)">
                    M: {preset.mid > 0 ? `+${preset.mid}` : preset.mid}dB
                  </span>
                  <span className="px-1.5 py-0.5 subtle-bg rounded-xs border border-theme" title="Високі частоти">
                    T: {preset.treble > 0 ? `+${preset.treble}` : preset.treble}dB
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info & close */}
        <div className="pt-3 border-t border-theme flex items-center justify-between text-xs text-sub">
          <span>Web Audio API • 3-Band DSP Engine</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#004643] text-white font-bold rounded-md hover:bg-[#003835] transition-colors cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
