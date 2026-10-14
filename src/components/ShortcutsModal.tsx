import React from 'react';
import { X, Keyboard, Info } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Пробіл (Space)', desc: 'Відтворення / Пауза ефіру' },
    { key: 'M', desc: 'Увімкнути / Вимкнути звук' },
    { key: '◄ / ►', desc: 'Попередня / Наступна радіостанція' },
    { key: '▲ / ▼', desc: 'Збільшити / Зменшити гучність' },
    { key: 'S', desc: 'Відкрити таймер сну' },
    { key: 'T', desc: 'Перемкнути тему (День / Ніч)' },
    { key: 'E', desc: 'Розгорнути студійний екран' },
    { key: 'R', desc: 'Запис / зупинка запису' },
    { key: 'Escape', desc: 'Закрити вікно' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        id="shortcuts-dialog"
        className="w-full max-w-md modal-bg border border-theme rounded-none shadow-2xl p-5 relative select-none animate-in fade-in duration-200"
      >
        <button
          id="btn-close-shortcuts"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 opacity-60 hover:opacity-100 rounded-none hover:bg-zinc-500/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-none subtle-bg text-main border border-theme">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-main uppercase font-mono">Гарячі клавіші</h2>
            <p className="text-xs text-sub font-mono">
              Швидке керування «Palas M.D. Live»
            </p>
          </div>
        </div>

        <div className="space-y-1.5 mb-4">
          {shortcuts.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-none card-bg border border-theme text-xs font-mono"
            >
              <span className="text-sub">{item.desc}</span>
              <kbd className="px-1.5 py-0.5 font-mono font-bold subtle-bg text-main border border-theme rounded-none shadow-xs text-[11px]">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-2.5 rounded-none subtle-bg border border-theme flex items-start gap-2 text-xs text-sub font-mono">
          <Info className="w-3.5 h-3.5 text-[#c5a880] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            «Palas M.D. Live» підтримує фонове відтворення та керування з клавіатури без затримок.
          </p>
        </div>
      </div>
    </div>
  );
};
