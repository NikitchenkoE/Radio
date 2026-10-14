import { UserTrack, StudioPlaylist } from '../types';
import { INITIAL_STUDIO_PLAYLISTS } from '../data/studioTracks';

const DB_NAME = 'UserStationArchiveDB';
const DB_VERSION = 1;
const STORE_NAME = 'user_tracks';
const QUEUE_ORDER_STORAGE_KEY = 'user_studio_tracks_order';
const PLAYLISTS_STORAGE_KEY = 'user_studio_playlists_v2';
const ACTIVE_PLAYLIST_STORAGE_KEY = 'user_studio_active_playlist_id_v2';

export function saveUserTracksQueueOrder(trackIds: string[]): void {
  try {
    localStorage.setItem(QUEUE_ORDER_STORAGE_KEY, JSON.stringify(trackIds));
  } catch (e) {
    console.warn('Failed to save queue order:', e);
  }
}

export function loadUserTracksQueueOrder(): string[] {
  try {
    const raw = localStorage.getItem(QUEUE_ORDER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

interface DbUserTrackRecord {
  id: string;
  title: string;
  artist?: string;
  fileName: string;
  sizeBytes: number;
  durationSeconds?: number;
  timestamp: number;
  blob: Blob;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveUserTrackToDb(
  item: Omit<UserTrack, 'blobUrl'>,
  blob: Blob
): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const record: DbUserTrackRecord = {
        ...item,
        blob,
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save track to IndexedDB:', err);
  }
}

export async function loadAllUserTracksFromDb(): Promise<UserTrack[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const records: DbUserTrackRecord[] = req.result || [];
        const result: UserTrack[] = [];
        for (const rec of records) {
          try {
            if (rec.blob instanceof Blob) {
              result.push({
                id: rec.id,
                title: rec.title,
                artist: rec.artist,
                fileName: rec.fileName,
                sizeBytes: rec.sizeBytes,
                durationSeconds: rec.durationSeconds,
                timestamp: rec.timestamp,
                blobUrl: URL.createObjectURL(rec.blob),
              });
            }
          } catch {
            // ignore corrupted entry
          }
        }

        const savedOrder = loadUserTracksQueueOrder();
        if (savedOrder && savedOrder.length > 0) {
          const orderMap = new Map<string, number>();
          savedOrder.forEach((id, index) => orderMap.set(id, index));
          result.sort((a, b) => {
            const posA = orderMap.has(a.id) ? orderMap.get(a.id)! : 999999;
            const posB = orderMap.has(b.id) ? orderMap.get(b.id)! : 999999;
            if (posA !== posB) return posA - posB;
            return b.timestamp - a.timestamp;
          });
        } else {
          result.sort((a, b) => b.timestamp - a.timestamp);
        }

        resolve(result);
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to load user tracks from IndexedDB:', err);
    return [];
  }
}

export async function deleteUserTrackFromDb(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete track from IndexedDB:', err);
  }
}

export async function clearAllUserTracksFromDb(): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to clear user tracks from IndexedDB:', err);
  }
}

export function saveStudioPlaylists(playlists: StudioPlaylist[]): void {
  try {
    localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
  } catch (e) {
    console.warn('Failed to save studio playlists:', e);
  }
}

export function loadStudioPlaylists(): StudioPlaylist[] {
  try {
    const raw = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p) => ({
      ...p,
      trackIds: Array.isArray(p.trackIds) ? p.trackIds : [],
    }));
  } catch {
    return [];
  }
}

export function saveActivePlaylistId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PLAYLIST_STORAGE_KEY, id);
  } catch (e) {
    console.warn('Failed to save active playlist id:', e);
  }
}

export function loadActivePlaylistId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PLAYLIST_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getOrCreateDefaultPlaylists(allTrackIds: string[]): StudioPlaylist[] {
  const existing = loadStudioPlaylists();
  if (existing && existing.length > 0) {
    // Check if there are any orphaned tracks not in any playlist
    const trackedIdSet = new Set<string>();
    existing.forEach((pl) => {
      if (!Array.isArray(pl.trackIds)) pl.trackIds = [];
      pl.trackIds.forEach((id) => trackedIdSet.add(id));
    });
    const missing = (allTrackIds || []).filter((id) => !trackedIdSet.has(id));
    if (missing.length > 0) {
      if (!Array.isArray(existing[0].trackIds)) existing[0].trackIds = [];
      existing[0].trackIds = [...missing, ...existing[0].trackIds];
      saveStudioPlaylists(existing);
    }
    return existing;
  }

  const initial = INITIAL_STUDIO_PLAYLISTS.map((p) => ({
    ...p,
    trackIds: [...(p.trackIds || [])],
  }));
  saveStudioPlaylists(initial);
  return initial;
}
