import { BroadcastRecording } from '../types';

const DB_NAME = 'OnlineRadioRecordingsDB';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';

interface DbRecordingRecord {
  id: string;
  stationId: string;
  stationName: string;
  stationGenre: string;
  timestamp: number;
  durationSeconds: number;
  fileName: string;
  sizeBytes: number;
  format: string;
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

export async function saveRecordingToDb(
  item: Omit<BroadcastRecording, 'blobUrl'>,
  blob: Blob
): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const record: DbRecordingRecord = {
        ...item,
        blob,
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save recording to IndexedDB:', err);
  }
}

export async function loadAllRecordingsFromDb(): Promise<BroadcastRecording[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const records: DbRecordingRecord[] = req.result || [];
        const result: BroadcastRecording[] = records
          .map((rec) => ({
            id: rec.id,
            stationId: rec.stationId,
            stationName: rec.stationName,
            stationGenre: rec.stationGenre,
            timestamp: rec.timestamp,
            durationSeconds: rec.durationSeconds,
            fileName: rec.fileName,
            sizeBytes: rec.sizeBytes,
            format: rec.format,
            blobUrl: URL.createObjectURL(rec.blob),
          }))
          .sort((a, b) => b.timestamp - a.timestamp);

        resolve(result);
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to load recordings from IndexedDB:', err);
    return [];
  }
}

export async function deleteRecordingFromDb(id: string): Promise<void> {
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
    console.error('Failed to delete recording from IndexedDB:', err);
  }
}

export async function clearAllRecordingsFromDb(): Promise<void> {
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
    console.error('Failed to clear recordings from IndexedDB:', err);
  }
}
