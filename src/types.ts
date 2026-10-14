export type CountryFilter = 'all' | 'UA' | 'World';

export type ThemeMode = 'day' | 'night'; // 'Слобода День' | 'Слобода Ніч'

export type GenreType =
  | 'Всі'
  | 'Хіти'
  | 'Рок'
  | 'Поп'
  | 'Новини'
  | 'Електроніка'
  | 'Лаунж'
  | 'Джаз'
  | 'Класика';

export interface StationCoordinates {
  x: number;
  y: number;
}

export type RegionMapKey =
  | 'kyiv'
  | 'kharkiv'
  | 'lviv'
  | 'odesa'
  | 'bessarabia'
  | 'dnipro'
  | 'chernivtsi'
  | 'vinnytsia'
  | 'bukovyna'
  | 'podillya'
  | 'zaporizhzhia'
  | 'world';

export interface RadioStation {
  id: string;
  name: string;
  streamUrl: string;
  genre: GenreType;
  country: 'UA' | 'World';
  location: string;
  region?: string;
  city?: string;
  habit?: string; // Звички / вайб (наприклад: Інтимний вечір, Нічний лаунж, Міський драйв, тощо)
  frequency?: string;
  tagline: string;
  badgeGradient: string;
  accentColor: string;
  bitrate: string;
  format: 'MP3' | 'AAC';
  isCustom?: boolean;
  coordinates?: StationCoordinates;
  regionKey?: RegionMapKey;
  videoStreamUrl?: string;
  youtubeId?: string;
  youtubeLiveUrl?: string;
  hasYoutubeLive?: boolean;
  isRomantic?: boolean; // Підбірка романтичних станцій (Україна & Світ)
  collection?: 'romantic' | 'general';
}

export type StationSortOption = 'default' | 'alphabetical' | 'frequency';
export type GroupByOption = 'none' | 'region' | 'city' | 'habit';

export interface DailyListeningStats {
  [dateIso: string]: number; // seconds
}

export interface StationPlayStats {
  [stationId: string]: number; // play count
}

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface AudioVisualizerPreset {
  id: 'bars' | 'wave' | 'circle';
  name: string;
}

export interface BroadcastRecording {
  id: string;
  stationId: string;
  stationName: string;
  stationGenre: string;
  timestamp: number;
  durationSeconds: number;
  blobUrl: string;
  fileName: string;
  sizeBytes: number;
  format: string;
}

export interface UserTrack {
  id: string;
  title: string;
  artist?: string;
  fileName: string;
  sizeBytes: number;
  durationSeconds?: number;
  timestamp: number;
  blobUrl: string;
  isVideo?: boolean;
  videoUrl?: string;
  youtubeId?: string;
  playlistId?: string;
}

export interface StudioPlaylist {
  id: string;
  name: string; // Назва папки / списку
  createdAt: number;
  trackIds: string[];
  color?: string; // Колір папки (напр. 'emerald', 'cyan', 'amber', 'rose', 'indigo')
  description?: string;
}

export type MusicFolder = StudioPlaylist;


export interface NowPlayingTrack {
  id: string;
  stationId: string;
  stationName: string;
  stationFrequency?: string;
  stationGenre: string;
  badgeGradient?: string;
  title: string; // Назва пісні
  artist: string; // Виконавець
  startTime: string; // Час початку трансляції (наприклад "14:32")
  endTime?: string;
  durationSeconds: number;
  albumArt?: string;
  status: 'playing' | 'past' | 'upcoming';
}

export interface BroadcastScheduleItem {
  id: string;
  stationId: string;
  stationName: string;
  stationFrequency?: string;
  dayOfWeek: number; // 0=Нд, 1=Пн, 2=Вт, 3=Ср, 4=Чт, 5=Пт, 6=Сб
  dayName: string; // "Понеділок", "Вівторок" ...
  dateString: string; // "24 вересня" ...
  timeSlot: string; // "08:00 - 09:00"
  startTime: string; // Час початку трансляції (наприклад "08:15")
  title: string; // Назва пісні / треку
  artist: string; // Виконавець
  programName?: string; // Назва програми / рубрики
  genre: string;
  isLive?: boolean;
  highlight?: boolean;
}

