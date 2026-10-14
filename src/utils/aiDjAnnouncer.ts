/**
 * AI DJ Host Announcer
 * Synthesizes charismatic Ukrainian radio host voice intros between studio tracks
 * using the Web Speech Synthesis API.
 */

const STORAGE_KEY = 'slobo_ai_dj_enabled';

export class AiDjAnnouncerService {
  private isEnabled: boolean = false;
  private isSpeaking: boolean = false;

  constructor() {
    try {
      this.isEnabled = localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      this.isEnabled = false;
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {}
  }

  public announceTrack(
    trackTitle: string,
    artistName?: string,
    playlistName?: string,
    onFinished?: () => void
  ) {
    if (!this.isEnabled || !this.isSupported()) {
      onFinished?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const phrases = [
        `Ви слухаєте авторський ефір Своя Хвиля. Зараз для вас звучить пісня ${trackTitle} ${
          artistName ? `від ${artistName}` : ''
        }. Приємного прослуховування!`,
        `В ефірі українська музика! Наступний трек у програмі — ${trackTitle}. Гарного настрою на нашій хвилі!`,
        `Спеціально для вас у плейлисті ${playlistName || 'Своя Хвиля'}: звучить композиція ${trackTitle}. Разом до перемоги!`,
      ];

      const selectedPhrase = phrases[Math.floor(Math.random() * phrases.length)];

      const utterance = new SpeechSynthesisUtterance(selectedPhrase);
      utterance.lang = 'uk-UA';
      utterance.rate = 1.05; // Slightly dynamic radio pace
      utterance.pitch = 1.0;
      utterance.volume = 0.9;

      // Find Ukrainian voice if available
      const voices = window.speechSynthesis.getVoices();
      const ukVoice = voices.find((v) => v.lang.startsWith('uk'));
      if (ukVoice) {
        utterance.voice = ukVoice;
      }

      this.isSpeaking = true;

      utterance.onend = () => {
        this.isSpeaking = false;
        onFinished?.();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        onFinished?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.debug('AI DJ Speech error:', e);
      onFinished?.();
    }
  }

  public stop() {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }
}

export const aiDjAnnouncer = new AiDjAnnouncerService();
