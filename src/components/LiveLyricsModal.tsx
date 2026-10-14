import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Copy, Check, Sparkles, Music, Volume2 } from 'lucide-react';

interface LyricLine {
  timeSeconds: number;
  text: string;
}

interface LiveLyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  songTitle: string;
  songArtist?: string;
  isPlaying: boolean;
}

// Built-in synchronized lyrics for iconic Ukrainian radio songs
const KNOWN_LYRICS: Record<string, LyricLine[]> = {
  default: [
    { timeSeconds: 0, text: '🎵 Музичний вступ...' },
    { timeSeconds: 8, text: 'Сонце сходить над землею, над Дніпром широким' },
    { timeSeconds: 16, text: 'Україно моя рідна, з віковічним кроком' },
    { timeSeconds: 24, text: 'Серце б’ється в унісон із вільною землею' },
    { timeSeconds: 32, text: 'Ми стоїмо непохитно за правду зі своєю' },
    { timeSeconds: 40, text: 'Хай лунає вільна пісня понад хмарами' },
    { timeSeconds: 48, text: 'Слава нашим захисникам, козакам і лицарям!' },
    { timeSeconds: 56, text: 'Воля в наших серцях, вогонь не згасає' },
    { timeSeconds: 64, text: 'Україна переможе, весь світ це знає!' },
    { timeSeconds: 72, text: '🎵 Соло...' },
    { timeSeconds: 80, text: 'Разом до перемоги! Вільні та незламні!' },
  ],
  kalyna: [
    { timeSeconds: 0, text: 'Ой у лузі червона калина похилилася,' },
    { timeSeconds: 8, text: 'Чогось наша славна Україна зажурилася.' },
    { timeSeconds: 16, text: 'А ми тую червону калину підіймемо,' },
    { timeSeconds: 24, text: 'А ми нашу славну Україну, гей, гей, розвеселимо!' },
    { timeSeconds: 32, text: 'Не хилися, червона калино, маєш білий цвіт,' },
    { timeSeconds: 40, text: 'Не журися, славна Україно, маєш добрий рід!' },
  ],
  stefania: [
    { timeSeconds: 0, text: 'Стефанія мамо, мамо Стефанія,' },
    { timeSeconds: 6, text: 'Розквітає поле, а вона сивіє.' },
    { timeSeconds: 12, text: 'Заспівай мені, мамо, колискову,' },
    { timeSeconds: 18, text: 'Хочу ще почути твоє рідне слово.' },
    { timeSeconds: 24, text: 'Вона мене колисала, дала мені ритм,' },
    { timeSeconds: 30, text: 'І, напевне, волю дати не забереш ти.' },
  ],
};

export const LiveLyricsModal: React.FC<LiveLyricsModalProps> = ({
  isOpen,
  onClose,
  songTitle,
  songArtist,
  isPlaying,
}) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  // Match or generate lyrics
  const lyrics: LyricLine[] = React.useMemo(() => {
    const lower = (songTitle + ' ' + (songArtist || '')).toLowerCase();
    if (lower.includes('калина')) return KNOWN_LYRICS.kalyna;
    if (lower.includes('стефанія') || lower.includes('stefania')) return KNOWN_LYRICS.stefania;
    return KNOWN_LYRICS.default;
  }, [songTitle, songArtist]);

  // Simulate progress highlighting
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const interval = setInterval(() => {
      setCurrentLineIndex((prev) => (prev + 1) % lyrics.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, lyrics.length]);

  // Auto scroll to active line
  useEffect(() => {
    activeLineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentLineIndex]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = lyrics.map((l) => l.text).join('\n');
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl card-theme rounded-3xl border border-theme shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-theme subtle-bg flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/30 flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-500">
                  Live Karaoke Lyrics
                </span>
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              </div>
              <h3 className="font-black text-base text-main truncate">
                «{songTitle}»
              </h3>
              {songArtist && (
                <p className="text-xs text-sub truncate">— {songArtist}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-xl subtle-bg border border-theme text-sub hover:text-main transition-colors"
              title="Скопіювати текст"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl subtle-bg border border-theme text-sub hover:text-main transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lyrics Scroll Area */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-center select-text">
          {lyrics.map((line, idx) => {
            const isActive = idx === currentLineIndex;
            const isPast = idx < currentLineIndex;

            return (
              <div
                key={idx}
                ref={isActive ? activeLineRef : null}
                className={`transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'text-2xl sm:text-3xl font-black text-pink-600 dark:text-pink-400 scale-105 drop-shadow-sm'
                    : isPast
                    ? 'text-base sm:text-lg text-sub opacity-50 font-medium'
                    : 'text-base sm:text-lg text-sub opacity-30 font-medium'
                }`}
                onClick={() => setCurrentLineIndex(idx)}
              >
                {line.text}
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="p-3.5 border-t border-theme subtle-bg flex items-center justify-between text-xs text-sub">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>Підспівуйте в дорозі разом із виконавцем</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 font-bold text-main hover:underline"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
};
