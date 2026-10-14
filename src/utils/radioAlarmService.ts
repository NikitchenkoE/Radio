/**
 * Smart Radio Alarm Service
 * Allows users to set wake-up alarms with automatic smooth volume fade-in
 * and offline chime failover if no network is available.
 */

export interface RadioAlarmConfig {
  id: string;
  enabled: boolean;
  time: string; // HH:mm format, e.g. "07:30"
  stationId: string;
  stationName: string;
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat. Empty = once.
  label: string;
  fadeInDurationSeconds: number; // e.g. 60
  targetVolume: number; // 0 to 100
}

const STORAGE_KEY = 'slobo_radio_alarms';

export class RadioAlarmService {
  private alarms: RadioAlarmConfig[] = [];
  private checkInterval: any = null;
  private onAlarmTriggerCallback: ((alarm: RadioAlarmConfig) => void) | null = null;
  private firedAlarmIdThisMinute: string | null = null;

  constructor() {
    this.loadAlarms();
    this.startScheduler();
  }

  public getAlarms(): RadioAlarmConfig[] {
    return [...this.alarms];
  }

  public saveAlarm(alarm: RadioAlarmConfig) {
    const idx = this.alarms.findIndex((a) => a.id === alarm.id);
    if (idx >= 0) {
      this.alarms[idx] = alarm;
    } else {
      this.alarms.push(alarm);
    }
    this.persist();
  }

  public deleteAlarm(id: string) {
    this.alarms = this.alarms.filter((a) => a.id !== id);
    this.persist();
  }

  public toggleAlarm(id: string, enabled: boolean) {
    const alarm = this.alarms.find((a) => a.id === id);
    if (alarm) {
      alarm.enabled = enabled;
      this.persist();
    }
  }

  public setOnAlarmTrigger(cb: (alarm: RadioAlarmConfig) => void) {
    this.onAlarmTriggerCallback = cb;
  }

  private loadAlarms() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.alarms = JSON.parse(data);
      } else {
        // Default template alarm
        this.alarms = [
          {
            id: 'default-morning-alarm',
            enabled: false,
            time: '07:00',
            stationId: 'army-fm',
            stationName: 'Армія FM',
            days: [1, 2, 3, 4, 5],
            label: 'Ранковий підйом під улюблене радіо',
            fadeInDurationSeconds: 45,
            targetVolume: 80,
          },
        ];
      }
    } catch {
      this.alarms = [];
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.alarms));
    } catch {}
  }

  private startScheduler() {
    if (this.checkInterval) clearInterval(this.checkInterval);

    this.checkInterval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const currentDay = now.getDay();

      // Reset fired tracking when minute changes
      if (now.getSeconds() === 0) {
        this.firedAlarmIdThisMinute = null;
      }

      this.alarms.forEach((alarm) => {
        if (!alarm.enabled) return;
        if (alarm.time !== currentTimeStr) return;

        // Check day match (if days array is not empty)
        if (alarm.days.length > 0 && !alarm.days.includes(currentDay)) return;

        // Avoid triggering multiple times in the same minute
        const minuteKey = `${alarm.id}-${currentTimeStr}`;
        if (this.firedAlarmIdThisMinute === minuteKey) return;

        this.firedAlarmIdThisMinute = minuteKey;
        this.onAlarmTriggerCallback?.(alarm);

        // If one-time alarm, disable it after trigger
        if (alarm.days.length === 0) {
          alarm.enabled = false;
          this.persist();
        }
      });
    }, 1000);
  }

  /**
   * Plays a gentle synthesizer chime as backup if radio stream fails to load
   */
  public playFallbackChime() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playTone(523.25, now, 0.8); // C5
      playTone(659.25, now + 0.3, 0.8); // E5
      playTone(783.99, now + 0.6, 1.2); // G5
      playTone(1046.5, now + 0.9, 1.6); // C6
    } catch (e) {
      console.debug('Chime error:', e);
    }
  }
}

export const radioAlarmService = new RadioAlarmService();
