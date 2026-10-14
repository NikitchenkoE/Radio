/**
 * Voice Command Overlay
 * Hands-free speech recognition overlay supporting commands:
 * 'наступна', 'попередня', 'пауза', 'грати', 'гучніше', 'тихіше', 'без звуку', 'студія'
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Radio,
  Sliders,
} from 'lucide-react';
import { RadioStation } from '../types';

interface VoiceCommandOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentStation: RadioStation;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  onTogglePlay: () => void;
  onNextStation: () => void;
  onPrevStation: () => void;
  onChangeVolume: (volume: number) => void;
  onToggleMute: () => void;
  onOpenStudio?: () => void;
}

interface CommandAction {
  id: string;
  keyword: string;
  aliases: string[];
  label: string;
  description: string;
  icon: React.ReactNode;
  execute: () => void;
}

// Subtle audio feedback tone
function playChirpTone(type: 'success' | 'start' | 'error') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {}
}

export const VoiceCommandOverlay: React.FC<VoiceCommandOverlayProps> = ({
  isOpen,
  onClose,
  currentStation,
  isPlaying,
  volume,
  isMuted,
  onTogglePlay,
  onNextStation,
  onPrevStation,
  onChangeVolume,
  onToggleMute,
  onOpenStudio,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastExecutedCommand, setLastExecutedCommand] = useState<string | null>(null);
  const [lastExecutedLabel, setLastExecutedLabel] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [continuousMode, setContinuousMode] = useState(true);

  const recognitionRef = useRef<any>(null);
  const isExecutingRef = useRef<boolean>(false);

  // Command Action Definitions
  const commands: CommandAction[] = [
    {
      id: 'next',
      keyword: 'наступна',
      aliases: ['наступна', 'вперед', 'далі', 'слідуюча', 'next'],
      label: 'Наступна станція',
      description: 'Перемикає на наступне радіо або трек',
      icon: <SkipForward className="w-4 h-4 text-emerald-400" />,
      execute: () => {
        onNextStation();
        setLastExecutedCommand('наступна');
        setLastExecutedLabel('Увімкнено наступну станцію');
        playChirpTone('success');
      },
    },
    {
      id: 'prev',
      keyword: 'попередня',
      aliases: ['попередня', 'назад', 'попередня станція', 'previous', 'back'],
      label: 'Попередня станція',
      description: 'Повертає до попередньої станції',
      icon: <SkipBack className="w-4 h-4 text-emerald-400" />,
      execute: () => {
        onPrevStation();
        setLastExecutedCommand('попередня');
        setLastExecutedLabel('Увімкнено попередню станцію');
        playChirpTone('success');
      },
    },
    {
      id: 'pause',
      keyword: 'пауза',
      aliases: ['пауза', 'стоп', 'зупини', 'зачекай', 'вимкни', 'pause', 'stop'],
      label: 'Пауза',
      description: 'Призупиняє прямий ефір',
      icon: <Pause className="w-4 h-4 text-amber-400" />,
      execute: () => {
        if (isPlaying) onTogglePlay();
        setLastExecutedCommand('пауза');
        setLastExecutedLabel('Ефір призупинено');
        playChirpTone('success');
      },
    },
    {
      id: 'play',
      keyword: 'грати',
      aliases: ['грати', 'старт', 'увімкни', 'продовжити', 'слухати', 'поїхали', 'play'],
      label: 'Грати / Старт',
      description: 'Відновлює трансляцію ефіру',
      icon: <Play className="w-4 h-4 text-emerald-400 fill-current" />,
      execute: () => {
        if (!isPlaying) onTogglePlay();
        setLastExecutedCommand('грати');
        setLastExecutedLabel('Відтворення запущено');
        playChirpTone('success');
      },
    },
    {
      id: 'louder',
      keyword: 'гучніше',
      aliases: ['гучніше', 'голосніше', 'додай звуку', 'підвищ', 'гучніш', 'плюс', 'louder'],
      label: 'Гучніше',
      description: 'Збільшує гучність на 15%',
      icon: <Volume2 className="w-4 h-4 text-cyan-400" />,
      execute: () => {
        const nextVol = Math.min(1, Math.round((volume + 0.15) * 100) / 100);
        onChangeVolume(nextVol);
        setLastExecutedCommand('гучніше');
        setLastExecutedLabel(`Гучність збільшено до ${Math.round(nextVol * 100)}%`);
        playChirpTone('success');
      },
    },
    {
      id: 'quieter',
      keyword: 'тихіше',
      aliases: ['тихіше', 'зменш звук', 'тихіш', 'зменши', 'мінус', 'quieter'],
      label: 'Тихіше',
      description: 'Зменшує гучність на 15%',
      icon: <Volume2 className="w-4 h-4 text-amber-300" />,
      execute: () => {
        const nextVol = Math.max(0.05, Math.round((volume - 0.15) * 100) / 100);
        onChangeVolume(nextVol);
        setLastExecutedCommand('тихіше');
        setLastExecutedLabel(`Гучність зменшено до ${Math.round(nextVol * 100)}%`);
        playChirpTone('success');
      },
    },
    {
      id: 'mute',
      keyword: 'без звуку',
      aliases: ['без звуку', 'тиша', 'заглуши', 'мют', 'mute', 'unmute'],
      label: 'Без звуку / Звук',
      description: 'Вмикає або вимикає режим без звуку',
      icon: <VolumeX className="w-4 h-4 text-rose-400" />,
      execute: () => {
        onToggleMute();
        setLastExecutedCommand('без звуку');
        setLastExecutedLabel(isMuted ? 'Звук увімкнено' : 'Звук вимкнено (Mute)');
        playChirpTone('success');
      },
    },
    {
      id: 'studio',
      keyword: 'студія',
      aliases: ['студія', 'моя студія', 'власна станція', 'studio'],
      label: 'Відкрити студію',
      description: 'Відкриває панель авторської студії',
      icon: <Radio className="w-4 h-4 text-emerald-400" />,
      execute: () => {
        if (onOpenStudio) onOpenStudio();
        setLastExecutedCommand('студія');
        setLastExecutedLabel('Студія відкрита');
        playChirpTone('success');
        onClose();
      },
    },
  ];

  // Match recognized text to actions
  const processCommandText = useCallback(
    (text: string) => {
      const clean = text.toLowerCase().trim();
      if (!clean) return;

      // Find matched command
      for (const cmd of commands) {
        const match = cmd.aliases.some((alias) => clean.includes(alias.toLowerCase()));
        if (match) {
          cmd.execute();
          return;
        }
      }
    },
    [commands]
  );

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'uk-UA';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        playChirpTone('start');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        const currentText = (final || interim).trim();
        setTranscript(currentText);

        if (currentText && !isExecutingRef.current) {
          isExecutingRef.current = true;
          processCommandText(currentText);
          setTimeout(() => {
            isExecutingRef.current = false;
          }, 600);
        }
      };

      recognition.onerror = (event: any) => {
        console.debug('Speech recognition event:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Доступ до мікрофону заблоковано. Дозвольте доступ у налаштуваннях браузера.');
          setIsListening(false);
        } else if (event.error === 'network') {
          setSpeechError('Мережева помилка сервісу розпізнавання мови.');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Статус розпізнавання: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Auto-restart if modal is still open and continuous mode is active
        if (isOpen && continuousMode && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch {}
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('SpeechRecognition init error:', e);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [processCommandText, isOpen, continuousMode]);

  // Handle open/close state
  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      setTranscript('');
      setLastExecutedCommand(null);
      setLastExecutedLabel(null);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // May already be started
        }
      }
    }
  }, [isOpen]);

  // Clear executed toast after 4s
  useEffect(() => {
    if (lastExecutedLabel) {
      const timer = setTimeout(() => {
        setLastExecutedLabel(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [lastExecutedLabel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-slate-900 border border-emerald-500/40 shadow-2xl shadow-emerald-950/50 flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Mic className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Голосове керування
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Hands-Free Live
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Керуйте ефіром без дотику голосом українською мовою
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Закрити"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Voice Wave & Listening Status Area */}
        <div className="p-6 bg-gradient-to-b from-slate-950/80 via-slate-900 to-slate-950 border-b border-slate-800/80 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Animated Pulsing Rings */}
          <div className="relative mb-4 flex items-center justify-center">
            {isListening ? (
              <>
                <div className="absolute w-28 h-28 rounded-full bg-emerald-500/10 animate-ping" />
                <div className="absolute w-20 h-20 rounded-full bg-emerald-500/20 animate-pulse" />
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30">
                  <Mic className="w-8 h-8 animate-bounce text-slate-950" />
                </div>
              </>
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                <MicOff className="w-8 h-8" />
              </div>
            )}
          </div>

          {/* Real-time Status Text */}
          <div className="space-y-1 max-w-md">
            <div className="flex items-center justify-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  isListening ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {isListening ? 'Слухаю ваш голос...' : 'Мікрофон очікує'}
              </span>
            </div>

            {/* Recognized transcript */}
            <div className="min-h-[32px] flex items-center justify-center">
              {transcript ? (
                <p className="text-sm font-semibold text-emerald-300 italic bg-emerald-950/40 px-3 py-1 rounded border border-emerald-500/30">
                  «{transcript}»
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  Вимовте слово, наприклад: <strong className="text-emerald-400 font-bold">«наступна»</strong>, <strong className="text-emerald-400 font-bold">«пауза»</strong>, або <strong className="text-emerald-400 font-bold">«гучніше»</strong>
                </p>
              )}
            </div>

            {/* Action Feedback Banner */}
            {lastExecutedLabel && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold animate-in fade-in zoom-in-95 duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{lastExecutedLabel}</span>
              </div>
            )}

            {speechError && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mt-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{speechError}</span>
              </div>
            )}
          </div>

          {/* Quick Mic Control Toggle */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  try {
                    recognitionRef.current?.stop();
                  } catch {}
                  setIsListening(false);
                } else {
                  try {
                    recognitionRef.current?.start();
                  } catch {}
                }
              }}
              className={`px-3 py-1.5 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border ${
                isListening
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900/50'
                  : 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Вимкнути слухання</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span>Увімкнути слухання</span>
                </>
              )}
            </button>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={continuousMode}
                onChange={(e) => setContinuousMode(e.target.checked)}
                className="accent-emerald-500 cursor-pointer"
              />
              <span>Постійне слухання</span>
            </label>
          </div>
        </div>

        {/* Interactive Keywords Grid & Test Buttons */}
        <div className="p-4 sm:p-5 overflow-y-auto max-h-[46vh] space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Доступні голосові команди
            </span>
            <span className="text-[11px] font-normal normal-case text-slate-400">
              (Клікніть для тесту без мікрофону)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {commands.map((cmd) => {
              const isMatch =
                lastExecutedCommand === cmd.keyword ||
                (transcript && cmd.aliases.some((a) => transcript.toLowerCase().includes(a)));

              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => cmd.execute()}
                  className={`p-3 text-left border transition-all cursor-pointer flex items-start gap-3 relative overflow-hidden ${
                    isMatch
                      ? 'bg-emerald-950/80 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="p-2 bg-slate-900 border border-slate-800 shrink-0">
                    {cmd.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-xs font-black text-emerald-400">
                        «{cmd.keyword}»
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold truncate">
                        {cmd.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                      {cmd.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {cmd.aliases.slice(1, 4).map((alias) => (
                        <span
                          key={alias}
                          className="px-1.5 py-0.2 bg-slate-900 text-slate-400 text-[10px] rounded"
                        >
                          {alias}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Broadcast Status Strip */}
          <div className="p-2.5 bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate">
                Зараз грає: <strong className="text-white font-bold">{currentStation.name}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-slate-400">
                Гучність: <strong className="text-emerald-400">{Math.round(volume * 100)}%</strong>
              </span>
              <span className="text-slate-400">
                Стан: <strong className={isPlaying ? 'text-emerald-400' : 'text-amber-400'}>{isPlaying ? 'Ефір' : 'Пауза'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Слухання адаптовано до української вимови</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
