/**
 * Station Cache Service
 * Safely tracks recently listened stations and ensures seamless, instant start
 * without interfering with live audio streaming connections.
 */

const STORAGE_CACHED_IDS_KEY = 'slobo_cached_station_ids';

export class StationCacheService {
  private cachedStationIds: Set<string> = new Set();
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
    this.cleanupOldAudioCache();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_CACHED_IDS_KEY);
      if (data) {
        this.cachedStationIds = new Set(JSON.parse(data));
      }
    } catch {
      this.cachedStationIds = new Set();
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(
        STORAGE_CACHED_IDS_KEY,
        JSON.stringify(Array.from(this.cachedStationIds))
      );
    } catch {}
  }

  /**
   * Safely deletes any old audio caches from earlier versions
   */
  private async cleanupOldAudioCache() {
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        await caches.delete('sloboda-audio-burst-cache-v2');
      } catch {}
    }
  }

  /**
   * Records a station when played
   */
  public recordStationPlayed(station: { id: string; streamUrl: string; name?: string }) {
    if (!station || !station.id) return;
    this.cachedStationIds.add(station.id);
    this.saveToStorage();
    this.notify();
  }

  public isStationCached(stationId: string): boolean {
    return this.cachedStationIds.has(stationId);
  }

  public getCachedCount(): number {
    return this.cachedStationIds.size;
  }

  public async clearCache(): Promise<void> {
    this.cleanupOldAudioCache();
    this.cachedStationIds.clear();
    this.saveToStorage();
    this.notify();
  }
}

export const stationCacheService = new StationCacheService();
