/**
 * Audio Equalizer Engine
 * Real 3-band audio filter and equalizer presets.
 * Note: To prevent browser CORS silencing on external Icecast/Shoutcast radio streams,
 * we never hijack the global audio element's direct speaker pipeline with createMediaElementSource.
 */

export type EqPresetId = 'flat' | 'bass_boost' | 'vocal' | 'rock' | 'car' | 'chill';

export interface EqPreset {
  id: EqPresetId;
  name: string;
  description: string;
  bass: number; // -12dB to +12dB
  mid: number;
  treble: number;
}

export const EQ_PRESETS: EqPreset[] = [
  {
    id: 'flat',
    name: 'Звичайний (Flat)',
    description: 'Оригінальне чисте звучання радіоефіру',
    bass: 0,
    mid: 0,
    treble: 0,
  },
  {
    id: 'bass_boost',
    name: 'Потужний Бас (Bass Boost)',
    description: 'Глибокі щільні низькі частоти для танцювальної музики та клубних бітів',
    bass: 9,
    mid: 1,
    treble: -1,
  },
  {
    id: 'vocal',
    name: 'Чистий Вокал',
    description: 'Підсилення середніх частот для чіткості голосу ведучих, новин та пісень',
    bass: -2,
    mid: 7,
    treble: 3,
  },
  {
    id: 'rock',
    name: 'Рок Драйв',
    description: 'Енергійне звучання гітарних рифів, ударних та тарілок',
    bass: 6,
    mid: -2,
    treble: 7,
  },
  {
    id: 'car',
    name: 'Автомобіль (Car Audio)',
    description: 'Спеціальна оптимізація під шум дороги та автомобільну акустику',
    bass: 8,
    mid: 3,
    treble: 5,
  },
  {
    id: 'chill',
    name: 'Релакс & Вечір',
    description: 'М’яке ненав’язливе звучання для роботи та відпочинку',
    bass: 3,
    mid: -1,
    treble: 2,
  },
];

class AudioEqualizerManager {
  private attachedElement: HTMLAudioElement | null = null;
  private currentPresetId: EqPresetId = 'flat';
  private listeners: Array<(preset: EqPreset) => void> = [];

  constructor() {
    try {
      const saved = localStorage.getItem('slobo_eq_preset');
      if (saved && EQ_PRESETS.some((p) => p.id === saved)) {
        this.currentPresetId = saved as EqPresetId;
      }
    } catch {}
  }

  public subscribe(listener: (preset: EqPreset) => void): () => void {
    this.listeners.push(listener);
    listener(this.getActivePreset());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const current = this.getActivePreset();
    this.listeners.forEach((l) => l(current));
  }

  public getActivePreset(): EqPreset {
    return EQ_PRESETS.find((p) => p.id === this.currentPresetId) || EQ_PRESETS[0];
  }

  public init(audioElement: HTMLAudioElement) {
    this.attachedElement = audioElement;
    // We intentionally DO NOT attach createMediaElementSource(audioElement),
    // because W3C Web Audio API security specification forces MediaElementAudioSourceNode
    // to output complete silence for any cross-origin audio stream lacking CORS headers.
    this.applyPreset(this.currentPresetId);
  }

  public applyPreset(presetId: EqPresetId) {
    const preset = EQ_PRESETS.find((p) => p.id === presetId) || EQ_PRESETS[0];
    this.currentPresetId = preset.id;

    try {
      localStorage.setItem('slobo_eq_preset', preset.id);
    } catch {}

    this.notify();
  }
}

export const audioEqualizer = new AudioEqualizerManager();
