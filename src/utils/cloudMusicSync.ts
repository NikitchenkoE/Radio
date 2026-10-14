/**
 * Cloud Music & Favorites Synchronization Service (Firebase Firestore)
 * Syncs user tracks, playlists, and favorite radio stations with cloud backup.
 */
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserTrack, StudioPlaylist } from '../types';

export interface CloudSyncState {
  isSynced: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  cloudTrackCount: number;
}

/**
 * Syncs a user track to the cloud database
 */
export async function syncTrackToCloud(track: UserTrack): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const trackRef = doc(db, 'users', user.uid, 'tracks', track.id);
    await setDoc(
      trackRef,
      {
        id: track.id,
        userId: user.uid,
        title: track.title,
        artist: track.artist || '',
        fileName: track.fileName || '',
        durationSeconds: track.durationSeconds || 0,
        audioUrl: track.blobUrl?.startsWith('http') ? track.blobUrl : '',
        videoUrl: track.videoUrl || '',
        playlistId: track.playlistId || '',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.debug('Failed to sync track to cloud:', err);
    return false;
  }
}

/**
 * Removes a track from cloud
 */
export async function removeTrackFromCloud(trackId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const trackRef = doc(db, 'users', user.uid, 'tracks', trackId);
    await deleteDoc(trackRef);
    return true;
  } catch (err) {
    console.debug('Failed to delete track from cloud:', err);
    return false;
  }
}

/**
 * Fetches all user tracks metadata from cloud
 */
export async function fetchUserTracksFromCloud(): Promise<Partial<UserTrack>[]> {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const tracksColl = collection(db, 'users', user.uid, 'tracks');
    const snapshot = await getDocs(tracksColl);
    return snapshot.docs.map((d) => d.data() as Partial<UserTrack>);
  } catch (err) {
    console.debug('Failed to fetch tracks from cloud:', err);
    return [];
  }
}

/**
 * Syncs user playlists to cloud
 */
export async function syncPlaylistsToCloud(playlists: StudioPlaylist[]): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    for (const pl of playlists) {
      const plRef = doc(db, 'users', user.uid, 'playlists', pl.id);
      await setDoc(
        plRef,
        {
          id: pl.id,
          userId: user.uid,
          name: pl.name,
          description: pl.description || '',
          trackIds: pl.trackIds || [],
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
    return true;
  } catch (err) {
    console.debug('Failed to sync playlists to cloud:', err);
    return false;
  }
}

/**
 * Syncs favorite stations to cloud
 */
export async function syncFavoriteToCloud(stationId: string, isFav: boolean, stationName?: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const favRef = doc(db, 'users', user.uid, 'favorites', stationId);
    if (isFav) {
      await setDoc(favRef, {
        id: stationId,
        userId: user.uid,
        stationId,
        stationName: stationName || '',
        updatedAt: serverTimestamp(),
      });
    } else {
      await deleteDoc(favRef);
    }
  } catch (err) {
    console.debug('Failed to sync favorite to cloud:', err);
  }
}
