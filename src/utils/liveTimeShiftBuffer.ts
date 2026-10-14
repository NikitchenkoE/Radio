/**
 * Live Time-Shift (DVR) Buffer Manager
 * Allows pausing live broadcast and rewinding 15-180 seconds back in time,
 * with a quick "LIVE" jump button.
 */

export interface TimeShiftState {
  isTimeShifted: boolean;
  delaySeconds: number; // e.g. 30
  maxBufferSeconds: number; // e.g. 180
  canRewind: boolean;
}

export class LiveTimeShiftManager {
  private audioElement: HTMLAudioElement | null = null;
  private delaySeconds = 0;
  private maxBufferSeconds = 180;
  private listeners: Array<(state: TimeShiftState) => void> = [];

  public init(audio: HTMLAudioElement) {
    this.audioElement = audio;
  }

  public subscribe(listener: (state: TimeShiftState) => void): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getState(): TimeShiftState {
    return {
      isTimeShifted: this.delaySeconds > 0,
      delaySeconds: this.delaySeconds,
      maxBufferSeconds: this.maxBufferSeconds,
      canRewind: true,
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  public rewind(seconds: number) {
    if (!this.audioElement) return;

    try {
      // In HTML5 live streams, if seekable is available, seek back within buffer
      const seekable = this.audioElement.seekable;
      if (seekable && seekable.length > 0) {
        const end = seekable.end(seekable.length - 1);
        const start = seekable.start(0);
        const targetTime = Math.max(start, this.audioElement.currentTime - seconds);
        this.audioElement.currentTime = targetTime;
        this.delaySeconds = Math.max(0, Math.round(end - targetTime));
      } else {
        // Relative simulation offset
        this.delaySeconds = Math.min(this.maxBufferSeconds, this.delaySeconds + seconds);
        if (this.audioElement.currentTime > seconds) {
          this.audioElement.currentTime -= seconds;
        }
      }
    } catch (e) {
      console.debug('Time-shift rewind notice:', e);
    }
    this.notify();
  }

  public returnToLive() {
    if (!this.audioElement) return;

    try {
      const seekable = this.audioElement.seekable;
      if (seekable && seekable.length > 0) {
        const end = seekable.end(seekable.length - 1);
        this.audioElement.currentTime = end - 0.5;
      }
    } catch (e) {
      console.debug('Return to live notice:', e);
    }
    this.delaySeconds = 0;
    this.notify();
  }
}

export const liveTimeShiftManager = new LiveTimeShiftManager();
