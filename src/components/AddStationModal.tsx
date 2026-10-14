import React, { useState, useRef } from 'react';
import { X, Plus, Radio, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { RadioStation, GenreType } from '../types';

interface AddStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStation: (station: RadioStation) => void;
}

const GENRES: GenreType[] = [
  'Хіти',
  'Рок',
  'Поп',
  'Новини',
  'Електроніка',
  'Лаунж',
  'Джаз',
  'Класика',
];

export const AddStationModal: React.FC<AddStationModalProps> = ({
  isOpen,
  onClose,
  onAddStation,
}) => {
  const [name, setName] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [genre, setGenre] = useState<GenreType>('Хіти');
  const [country, setCountry] = useState<'UA' | 'World'>('UA');
  const [location, setLocation] = useState('Київ, Україна');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [habit, setHabit] = useState('');
  const [frequency, setFrequency] = useState('');
  const [tagline, setTagline] = useState('');

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const testAudioRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const handleTestStream = () => {
    if (!streamUrl.trim()) {
      setTestStatus('failed');
      setTestMessage('Будь ласка, введіть URL потоку');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Перевірка зв’язку з аудіопотоком...');

    if (testAudioRef.current) {
      testAudioRef.current.pause();
      testAudioRef.current.src = '';
    }

    const audio = new Audio();
    testAudioRef.current = audio;
    audio.preload = 'auto';

    let timeoutId = setTimeout(() => {
      setTestStatus('failed');
      setTestMessage('Час очікування минув або потік недоступний');
      audio.src = '';
    }, 9000);

    audio.oncanplay = () => {
      clearTimeout(timeoutId);
      setTestStatus('success');
      setTestMessage('Потік перевірено та готовий до відтворення');
      audio.pause();
      audio.src = '';
    };

    audio.onerror = () => {
      clearTimeout(timeoutId);
      setTestStatus('failed');
      setTestMessage('Не вдалося підключитися. Перевірте потік');
    };

    audio.src = streamUrl.trim();
    audio.load();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !streamUrl.trim()) return;

    const newStation: RadioStation = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      streamUrl: streamUrl.trim(),
      genre,
      country,
      location: location.trim() || city.trim() || (country === 'UA' ? 'Україна' : 'Світ'),
      region: region.trim() || 'Користувацький регіон',
      city: city.trim() || location.trim() || 'Місто',
      habit: habit.trim() || 'Власний вибір',
      frequency: frequency.trim() || 'WEB',
      tagline: tagline.trim() || 'Власна станція',
      badgeGradient: 'from-[#2e261f] via-[#1c1813] to-[#0e0c0a]',
      accentColor: '#c5a880',
      bitrate: '128 kbps',
      format: streamUrl.toLowerCase().includes('.aac') ? 'AAC' : 'MP3',
      isCustom: true,
    };

    onAddStation(newStation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        id="add-station-dialog"
        className="w-full max-w-lg modal-bg border border-theme rounded-none shadow-2xl p-5 relative max-h-[90vh] overflow-y-auto select-none animate-in fade-in duration-200"
      >
        <button
          id="btn-close-add-station"
          type="button"
          onClick={() => {
            if (testAudioRef.current) {
              testAudioRef.current.pause();
              testAudioRef.current.src = '';
            }
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 opacity-60 hover:opacity-100 rounded-none hover:bg-zinc-500/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-none subtle-bg text-main border border-theme">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-main">Додати власну радіостанцію</h2>
            <p className="text-xs text-sub">
              Вкажіть посилання на потік Icecast або Shoutcast
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-main mb-1">
              Назва станції *
            </label>
            <input
              id="input-station-name"
              type="text"
              required
              placeholder="Наприклад: Радіо Слобода Онлайн"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full input-bg border border-theme rounded-none px-3 py-1.5 text-xs text-main focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1">
              URL аудіопотоку (HTTP/HTTPS MP3 або AAC) *
            </label>
            <div className="flex gap-2">
              <input
                id="input-station-url"
                type="url"
                required
                placeholder="https://.../stream.mp3"
                value={streamUrl}
                onChange={(e) => {
                  setStreamUrl(e.target.value);
                  setTestStatus('idle');
                }}
                className="flex-1 input-bg border border-theme rounded-none px-3 py-1.5 text-xs text-main focus:outline-none focus:border-zinc-400 font-mono"
              />
              <button
                id="btn-test-stream"
                type="button"
                onClick={handleTestStream}
                disabled={testStatus === 'testing'}
                className="px-3 py-1.5 rounded-none btn-secondary text-xs font-medium border border-theme shrink-0 flex items-center gap-1"
              >
                {testStatus === 'testing' ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Перевірка</span>
                  </>
                ) : (
                  'Тест'
                )}
              </button>
            </div>

            {testStatus === 'success' && (
              <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {testMessage}
              </p>
            )}
            {testStatus === 'failed' && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {testMessage}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-main mb-1">
                Жанр
              </label>
              <select
                id="select-station-genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value as GenreType)}
                className="w-full input-bg border border-theme rounded-none px-2.5 py-1.5 text-xs text-main focus:outline-none focus:border-zinc-400"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">
                Країна
              </label>
              <select
                id="select-station-country"
                value={country}
                onChange={(e) => setCountry(e.target.value as 'UA' | 'World')}
                className="w-full input-bg border border-theme rounded-none px-2.5 py-1.5 text-xs text-main focus:outline-none focus:border-zinc-400"
              >
                <option value="UA">🇺🇦 Україна</option>
                <option value="World">🌍 Світ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-main mb-1">
                Регіон
              </label>
              <input
                id="input-station-region"
                type="text"
                placeholder="Центр, Північ, Захід..."
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full input-bg border border-theme rounded-none px-2.5 py-1.5 text-xs text-main focus:outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">
                Місто
              </label>
              <input
                id="input-station-city"
                type="text"
                placeholder="Київ, Чернігів, Харків..."
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (!location) setLocation(e.target.value);
                }}
                className="w-full input-bg border border-theme rounded-none px-2.5 py-1.5 text-xs text-main focus:outline-none focus:border-zinc-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-main mb-1">
                Звички / Вайб
              </label>
              <input
                id="input-station-habit"
                type="text"
                placeholder="Нічний релакс, кава, робота..."
                value={habit}
                onChange={(e) => setHabit(e.target.value)}
                className="w-full input-bg border border-theme rounded-none px-2.5 py-1.5 text-xs text-main focus:outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">
                Частота
              </label>
              <input
                id="input-station-frequency"
                type="text"
                placeholder="104.5 FM"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full input-bg border border-theme rounded-none px-2.5 py-1.5 text-xs text-main focus:outline-none focus:border-zinc-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1">
              Короткий опис
            </label>
            <input
              id="input-station-tagline"
              type="text"
              placeholder="Короткий опис станції..."
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full input-bg border border-theme rounded-none px-2.5 py-1.5 text-xs text-main focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="pt-3 border-t border-theme flex justify-end gap-2">
            <button
              id="btn-cancel-add-station"
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-none btn-secondary text-xs font-medium transition-colors border border-theme"
            >
              Скасувати
            </button>
            <button
              id="btn-submit-add-station"
              type="submit"
              className="px-4 py-1.5 rounded-none btn-primary font-semibold text-xs flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Додати</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
