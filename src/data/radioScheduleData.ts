import { BroadcastScheduleItem, NowPlayingTrack, RadioStation } from '../types';

export interface StationTrackPlaylist {
  title: string;
  artist: string;
  durationSeconds: number;
  genre: string;
}

// Багата база перевірених відомих пісень та виконавців для станцій
export const STATION_TRACK_LIBRARY: Record<string, StationTrackPlaylist[]> = {
  default: [
    { title: "Фортеця Бахмут", artist: "Антитіла", durationSeconds: 228, genre: "Рок / Поп" },
    { title: "Обійми", artist: "Океан Ельзи", durationSeconds: 225, genre: "Рок" },
    { title: "Стефанія", artist: "Kalush Orchestra", durationSeconds: 179, genre: "Фолк / Хіп-хоп" },
    { title: "Люди", artist: "Бумбокс", durationSeconds: 242, genre: "Поп / Рок" },
    { title: "Teresa & Maria", artist: "Jerry Heil & alyona alyona", durationSeconds: 180, genre: "Поп" },
    { title: "Біля тополі", artist: "SHUMEI & Kozak System", durationSeconds: 215, genre: "Балада" },
    { title: "Зорі запалали", artist: "БEZ ОБМЕЖЕНЬ", durationSeconds: 210, genre: "Рок" },
    { title: "У мене немає дому", artist: "Один в каное", durationSeconds: 200, genre: "Інді-фолк" },
    { title: "Плакала", artist: "KAZKA", durationSeconds: 224, genre: "Поп" },
    { title: "Маяк", artist: "The Hardkiss", durationSeconds: 212, genre: "Рок" },
    { title: "Тримай", artist: "Христина Соловій", durationSeconds: 195, genre: "Інді-поп" },
    { title: "Місця щасливих людей", artist: "Скрябін", durationSeconds: 230, genre: "Рок" },
    { title: "Допоможе ЗСУ", artist: "Chico & Qatoshi", durationSeconds: 142, genre: "Електроніка" },
    { title: "Вільні Люди", artist: "БEZ ОБМЕЖЕНЬ", durationSeconds: 236, genre: "Рок" },
    { title: "Місто весни", artist: "Океан Ельзи ft. Один в каное", durationSeconds: 254, genre: "Рок" },
    { title: "Ой у лузі червона калина", artist: "Андрій Хливнюк / Pink Floyd", durationSeconds: 185, genre: "Гімн" },
    { title: "Гуси", artist: "Wellboy", durationSeconds: 168, genre: "Поп" },
    { title: "Кораблі", artist: "The Hardkiss", durationSeconds: 218, genre: "Рок" },
    { title: "Додому", artist: "Kalush ft. Skofka", durationSeconds: 210, genre: "Хіп-хоп" },
    { title: "Буревіями", artist: "SHUMEI & Злата Огнєвіч", durationSeconds: 198, genre: "Поп-соул" },
  ],
  'army-fm': [
    { title: "Зродились ми великої години (Марш Нової Армії)", artist: "Олег Скрипка, Тарас Компаніченко", durationSeconds: 245, genre: "Військовий марш" },
    { title: "Фортеця Бахмут", artist: "Антитіла", durationSeconds: 228, genre: "Патріотичний рок" },
    { title: "Подай зброю", artist: "Kozak System", durationSeconds: 210, genre: "Бойовий рок" },
    { title: "Браття Українці", artist: "Шабля", durationSeconds: 255, genre: "Гімн оборони" },
    { title: "Ярмак — Дике поле", artist: "YARMAK ft. ALISA", durationSeconds: 205, genre: "Хіп-хоп / Рок" },
    { title: "Моє ім'я — Батьківщина", artist: "Тіна Кароль", durationSeconds: 230, genre: "Балада" },
    { title: "Чорна рілля ізорана", artist: "Тарас Чубай & Плач Єремії", durationSeconds: 260, genre: "Фолк-рок" },
    { title: "Не твоя війна", artist: "Океан Ельзи", durationSeconds: 240, genre: "Рок" },
    { title: "Героям", artist: "БEZ ОБМЕЖЕНЬ ft. Скай, Kozak System", durationSeconds: 220, genre: "Рок" },
    { title: "Батько наш Бандера", artist: "Вокальний ансамбль 'Пенсіонери'", durationSeconds: 175, genre: "Фолк" },
  ],
  'hit-fm': [
    { title: "Teresa & Maria", artist: "Jerry Heil & alyona alyona", durationSeconds: 180, genre: "Хіти" },
    { title: "Зорі запалали", artist: "БEZ ОБМЕЖЕНЬ", durationSeconds: 210, genre: "Хіти" },
    { title: "Люди", artist: "Бумбокс", durationSeconds: 242, genre: "Хіти" },
    { title: "Плакала", artist: "KAZKA", durationSeconds: 224, genre: "Хіти" },
    { title: "Гуси", artist: "Wellboy", durationSeconds: 168, genre: "Хіти" },
    { title: "Стефанія", artist: "Kalush Orchestra", durationSeconds: 179, genre: "Хіти" },
    { title: "Буревіями", artist: "SHUMEI & Злата Огнєвіч", durationSeconds: 198, genre: "Хіти" },
    { title: "Вільна", artist: "Тіна Кароль & Юлія Саніна", durationSeconds: 202, genre: "Хіти" },
    { title: "Тримай", artist: "Христина Соловій", durationSeconds: 195, genre: "Хіти" },
  ],
  'radio-roks': [
    { title: "Маяк", artist: "The Hardkiss", durationSeconds: 212, genre: "Рок" },
    { title: "Без бою", artist: "Океан Ельзи", durationSeconds: 238, genre: "Рок" },
    { title: "Back In Black", artist: "AC/DC", durationSeconds: 255, genre: "Класичний рок" },
    { title: "Nothing Else Matters", artist: "Metallica", durationSeconds: 388, genre: "Хард-рок" },
    { title: "Старі фотографії", artist: "Скрябін", durationSeconds: 208, genre: "Рок" },
    { title: "Smoke on the Water", artist: "Deep Purple", durationSeconds: 340, genre: "Класичний рок" },
    { title: "Кораблі", artist: "The Hardkiss", durationSeconds: 218, genre: "Рок" },
    { title: "In the End", artist: "Linkin Park", durationSeconds: 216, genre: "Альтернативний рок" },
  ],
  'kiss-fm': [
    { title: "Допоможе ЗСУ (Club Mix)", artist: "Chico & Qatoshi", durationSeconds: 180, genre: "EDM" },
    { title: "Titanium", artist: "David Guetta ft. Sia", durationSeconds: 245, genre: "Dance" },
    { title: "Гарно так (Remix)", artist: "Cheev", durationSeconds: 195, genre: "Club House" },
    { title: "Wake Me Up", artist: "Avicii", durationSeconds: 247, genre: "Dance" },
    { title: "Ластівки (Festival Edit)", artist: "Chico & Qatoshi", durationSeconds: 172, genre: "Electro" },
    { title: "Don't You Worry Child", artist: "Swedish House Mafia", durationSeconds: 212, genre: "Progressive" },
  ],
  'radio-bayraktar': [
    { title: "Байрактар", artist: "Тарас Боровок", durationSeconds: 140, genre: "Патріотичний хіт" },
    { title: "Вова, *баш їх, бл*ть", artist: "Мюслі UA", durationSeconds: 135, genre: "Електро-біт" },
    { title: "Враже", artist: "Енджі Крейда", durationSeconds: 185, genre: "Фолк-рок" },
    { title: "Чорнобаївка", artist: "Діти Фрістайла", durationSeconds: 160, genre: "Поп-біт" },
    { title: "Доброго вечора, ми з України", artist: "PROBASS ∆ HARDI", durationSeconds: 150, genre: "Електроніка" },
  ],
  'avtoradio-ua': [
    { title: "Шосейний вітер", artist: "Антитіла", durationSeconds: 215, genre: "Драйв / Поп" },
    { title: "Машина", artist: "Скрябін", durationSeconds: 228, genre: "Рок / Авто" },
    { title: "Їхали козаки", artist: "Тінь Сонця", durationSeconds: 210, genre: "Фолк-метал" },
    { title: "По дорозі на Берлін", artist: "Бумбокс", durationSeconds: 235, genre: "Хіти" },
    { title: "Ніч яка місячна", artist: "Kozak System", durationSeconds: 205, genre: "Рок" },
  ],
  'hit-fm-ukraine': [
    { title: "Teresa & Maria", artist: "Jerry Heil & alyona alyona", durationSeconds: 180, genre: "Хіти" },
    { title: "Буревіями", artist: "SHUMEI & Злата Огнєвіч", durationSeconds: 198, genre: "Хіти" },
    { title: "Зорі запалали", artist: "БEZ ОБМЕЖЕНЬ", durationSeconds: 210, genre: "Хіти" },
    { title: "Вільна", artist: "Тіна Кароль & Юлія Саніна", durationSeconds: 202, genre: "Хіти" },
    { title: "Стефанія", artist: "Kalush Orchestra", durationSeconds: 179, genre: "Хіти" },
    { title: "Плакала", artist: "KAZKA", durationSeconds: 224, genre: "Хіти" },
  ],
  'radio-roks-hard-heavy': [
    { title: "Master of Puppets", artist: "Metallica", durationSeconds: 290, genre: "Хеві-метал" },
    { title: "Меч Арея", artist: "Тінь Сонця", durationSeconds: 245, genre: "Паган-метал" },
    { title: "Thunderstruck", artist: "AC/DC", durationSeconds: 292, genre: "Хард-рок" },
    { title: "Козацька могила", artist: "Kozak System", durationSeconds: 220, genre: "Хард-рок" },
    { title: "The Trooper", artist: "Iron Maiden", durationSeconds: 250, genre: "Хеві-метал" },
  ],
  'melodia-fm-romantic': [
    { title: "Тримай", artist: "Христина Соловій", durationSeconds: 195, genre: "Романтика" },
    { title: "Обійми", artist: "Океан Ельзи", durationSeconds: 225, genre: "Балада" },
    { title: "Назавжди", artist: "TAYANNA", durationSeconds: 205, genre: "Поп-романтика" },
    { title: "Біля тополі", artist: "SHUMEI", durationSeconds: 215, genre: "Балада" },
    { title: "Місця щасливих людей", artist: "Скрябін", durationSeconds: 230, genre: "Мелодія" },
  ],
  'radio-relax-instrumental': [
    { title: "River Flows in You", artist: "Yiruma", durationSeconds: 210, genre: "Фортепіано" },
    { title: "Мелодія ля-мінор", artist: "Мирослав Скорик", durationSeconds: 245, genre: "Оркестр" },
    { title: "Nuvole Bianche", artist: "Ludovico Einaudi", durationSeconds: 260, genre: "Неокласика" },
    { title: "Весняна пісня", artist: "Київський камерний оркестр", durationSeconds: 215, genre: "Скрипка" },
  ],
  'lounge-fm-ua': [
    { title: "Summer Breeze", artist: "Café Del Mar", durationSeconds: 240, genre: "Чілаут" },
    { title: "Moments in Love", artist: "Art of Noise", durationSeconds: 265, genre: "Лаунж" },
    { title: "Destiny", artist: "Zero 7", durationSeconds: 220, genre: "Даунтемпо" },
    { title: "Underwater Love", artist: "Smoke City", durationSeconds: 235, genre: "Трип-хоп" },
    { title: "Sunset in Ibiza", artist: "Lounge FM Session", durationSeconds: 250, genre: "Дип-лаунж" },
  ],
  'lux-fm-zoloti-hity': [
    { title: "Ти подобаєшся мені", artist: "Віктор Павлік", durationSeconds: 210, genre: "Золоті хіти" },
    { title: "Вона", artist: "Плач Єремії", durationSeconds: 275, genre: "Балада" },
    { title: "Ні обіцянок, ні пробачень", artist: "Віктор Павлік", durationSeconds: 225, genre: "Романтика" },
    { title: "Два кольори", artist: "Василь Зінкевич", durationSeconds: 240, genre: "Ретро" },
    { title: "Я піду в далекі гори", artist: "Володимир Івасюк", durationSeconds: 205, genre: "Легенди" },
  ],
  'garmonia-mira-odesa': [
    { title: "Clair de Lune", artist: "Claude Debussy", durationSeconds: 280, genre: "Класика" },
    { title: "Nocturne Op. 9 No. 2", artist: "Frédéric Chopin", durationSeconds: 265, genre: "Фортепіано" },
    { title: "Liebestraum No. 3", artist: "Franz Liszt", durationSeconds: 275, genre: "Романтика" },
    { title: "Gymnopédie No. 1", artist: "Erik Satie", durationSeconds: 210, genre: "Неокласика" },
    { title: "Spiegel im Spiegel", artist: "Arvo Pärt", durationSeconds: 310, genre: "Гармонія" },
  ],
  'radio-jazz-cover': [
    { title: "Careless Whisper (Acoustic Jazz)", artist: "Scott Bradlee's PMJ", durationSeconds: 245, genre: "Джаз-кавер" },
    { title: "Fly Me to the Moon", artist: "Diana Krall", durationSeconds: 230, genre: "Вокальний джаз" },
    { title: "Creep (Vintage Postmodern Jazz)", artist: "Haley Reinhart", durationSeconds: 260, genre: "Нуар-джаз" },
    { title: "Don't Know Why", artist: "Norah Jones", durationSeconds: 195, genre: "Соул-джаз" },
    { title: "Smooth Operator", artist: "Sade", durationSeconds: 255, genre: "Смус-джаз" },
  ],
  'radio-relax-international': [
    { title: "Fields of Gold", artist: "Sting", durationSeconds: 220, genre: "Акустика" },
    { title: "Shape of My Heart", artist: "Sting", durationSeconds: 240, genre: "Балада" },
    { title: "Wonderful Tonight", artist: "Eric Clapton", durationSeconds: 225, genre: "Софт-рок" },
    { title: "A Thousand Years", artist: "Christina Perri", durationSeconds: 245, genre: "Романтика" },
    { title: "The Sound of Silence", artist: "Simon & Garfunkel", durationSeconds: 205, genre: "Фолк" },
  ],
  'the-heart-181fm': [
    { title: "I Will Always Love You", artist: "Whitney Houston", durationSeconds: 270, genre: "Love Songs" },
    { title: "My Heart Will Go On", artist: "Céline Dion", durationSeconds: 280, genre: "Love Songs" },
    { title: "Everything I Do (I Do It for You)", artist: "Bryan Adams", durationSeconds: 255, genre: "Балада" },
    { title: "Right Here Waiting", artist: "Richard Marx", durationSeconds: 265, genre: "Романтика" },
    { title: "Un-Break My Heart", artist: "Toni Braxton", durationSeconds: 260, genre: "R&B Балада" },
  ],
  'cherie-fm-paris': [
    { title: "Pour que tu m'aimes encore", artist: "Céline Dion", durationSeconds: 250, genre: "Французький поп" },
    { title: "Je t'aime", artist: "Lara Fabian", durationSeconds: 260, genre: "Романтика" },
    { title: "La Vie en Rose", artist: "Édith Piaf", durationSeconds: 200, genre: "Шансон" },
    { title: "Belle", artist: "Garou, Daniel Lavoie, Patrick Fiori", durationSeconds: 270, genre: "Балада" },
    { title: "Dernière danse", artist: "Indila", durationSeconds: 215, genre: "Поп" },
  ],
  'allzic-radio-love': [
    { title: "Someone Like You", artist: "Adele", durationSeconds: 285, genre: "Соул" },
    { title: "All of Me", artist: "John Legend", durationSeconds: 270, genre: "Love Songs" },
    { title: "Thinking Out Loud", artist: "Ed Sheeran", durationSeconds: 280, genre: "Акустика" },
    { title: "Bleeding Love", artist: "Leona Lewis", durationSeconds: 260, genre: "Поп-балада" },
    { title: "Hero", artist: "Enrique Iglesias", durationSeconds: 250, genre: "Латин-поп" },
  ],
  'antenne-bayern-lovesongs': [
    { title: "Careless Whisper", artist: "George Michael", durationSeconds: 300, genre: "Lovesongs" },
    { title: "Hello", artist: "Lionel Richie", durationSeconds: 250, genre: "Балада" },
    { title: "Against All Odds", artist: "Phil Collins", durationSeconds: 205, genre: "Софт-рок" },
    { title: "Wind of Change", artist: "Scorpions", durationSeconds: 310, genre: "Рок-балада" },
    { title: "How Deep Is Your Love", artist: "Bee Gees", durationSeconds: 245, genre: "Класика" },
  ],
  '0n-love-radio': [
    { title: "You're Beautiful", artist: "James Blunt", durationSeconds: 210, genre: "Софт-поп" },
    { title: "Say You Won't Let Go", artist: "James Arthur", durationSeconds: 210, genre: "Акустика" },
    { title: "Stay with Me", artist: "Sam Smith", durationSeconds: 175, genre: "Соул" },
    { title: "Fix You", artist: "Coldplay", durationSeconds: 295, genre: "Інді-балада" },
    { title: "Photograph", artist: "Ed Sheeran", durationSeconds: 255, genre: "Романтика" },
  ],
  'lovehits-rautemusik': [
    { title: "Shallow", artist: "Lady Gaga & Bradley Cooper", durationSeconds: 215, genre: "Love Hits" },
    { title: "Perfect", artist: "Ed Sheeran", durationSeconds: 260, genre: "Love Hits" },
    { title: "Save Your Tears (Acoustic)", artist: "The Weeknd", durationSeconds: 215, genre: "R&B Романтика" },
    { title: "Just the Way You Are", artist: "Bruno Mars", durationSeconds: 220, genre: "Поп-хіт" },
    { title: "Easy On Me", artist: "Adele", durationSeconds: 224, genre: "Балада" },
  ],
};

const UKRAINIAN_DAY_NAMES = [
  'Неділя',
  'Понеділок',
  'Вівторок',
  'Середа',
  'Четвер',
  "П'ятниця",
  'Субота',
];

const MONTH_NAMES_UA = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня',
];

function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

/**
 * Генерує список пісень, які прямо зараз грають на головних станціях України
 * Час початку розраховується синхронно з реальним годинником користувача.
 */
export function generateLiveNowPlayingTracks(
  stations: RadioStation[],
  referenceTime: Date = new Date()
): { currentTracks: NowPlayingTrack[]; stationHistory: Record<string, NowPlayingTrack[]> } {
  const currentMinutes = referenceTime.getHours() * 60 + referenceTime.getMinutes();
  const currentSeconds = referenceTime.getSeconds();
  const totalDaySeconds = currentMinutes * 60 + currentSeconds;

  const currentTracks: NowPlayingTrack[] = [];
  const stationHistory: Record<string, NowPlayingTrack[]> = {};

  // Обираємо топ-станції для показу
  const targetStations = stations.slice(0, 16);

  targetStations.forEach((station, sIdx) => {
    const library = STATION_TRACK_LIBRARY[station.id] || STATION_TRACK_LIBRARY.default;
    const trackCount = library.length;

    // Зсув для кожної станції, щоб на кожній станції грав свій окремий трек
    const stationOffsetSeconds = (sIdx * 437) % 3600;
    const adjustedSeconds = (totalDaySeconds + stationOffsetSeconds) % (24 * 3600);

    // Середня тривалість треку ~ 210 секунд (3.5 хв)
    const currentTrackIdx = Math.floor(adjustedSeconds / 210) % trackCount;
    const trackInfo = library[currentTrackIdx];

    // Секунди від початку поточного треку
    const trackElapsedSeconds = adjustedSeconds % 210;
    const trackStartTotalSeconds = Math.max(0, totalDaySeconds - trackElapsedSeconds);
    const startHour = Math.floor(trackStartTotalSeconds / 3600) % 24;
    const startMin = Math.floor((trackStartTotalSeconds % 3600) / 60);

    const endTotalSeconds = trackStartTotalSeconds + trackInfo.durationSeconds;
    const endHour = Math.floor(endTotalSeconds / 3600) % 24;
    const endMin = Math.floor((endTotalSeconds % 3600) / 60);

    const nowPlaying: NowPlayingTrack = {
      id: `live-${station.id}-${currentTrackIdx}`,
      stationId: station.id,
      stationName: station.name,
      stationFrequency: station.frequency,
      stationGenre: station.genre,
      badgeGradient: station.badgeGradient,
      title: trackInfo.title,
      artist: trackInfo.artist,
      startTime: `${padZero(startHour)}:${padZero(startMin)}`,
      endTime: `${padZero(endHour)}:${padZero(endMin)}`,
      durationSeconds: trackInfo.durationSeconds,
      status: 'playing',
    };

    currentTracks.push(nowPlaying);

    // Створюємо історію попередніх 3-х треків та 2-х наступних
    const historyList: NowPlayingTrack[] = [];

    // Попередні 3 треки
    for (let i = 3; i >= 1; i--) {
      const prevIdx = (currentTrackIdx - i + trackCount * 10) % trackCount;
      const prevTrack = library[prevIdx];
      const prevStartSec = Math.max(0, trackStartTotalSeconds - i * 210);
      const pHour = Math.floor(prevStartSec / 3600) % 24;
      const pMin = Math.floor((prevStartSec % 3600) / 60);

      historyList.push({
        id: `past-${station.id}-${prevIdx}-${i}`,
        stationId: station.id,
        stationName: station.name,
        stationFrequency: station.frequency,
        stationGenre: station.genre,
        badgeGradient: station.badgeGradient,
        title: prevTrack.title,
        artist: prevTrack.artist,
        startTime: `${padZero(pHour)}:${padZero(pMin)}`,
        durationSeconds: prevTrack.durationSeconds,
        status: 'past',
      });
    }

    // Поточний трек в історію
    historyList.push(nowPlaying);

    // Наступні 2 треки
    for (let i = 1; i <= 2; i++) {
      const nextIdx = (currentTrackIdx + i) % trackCount;
      const nextTrack = library[nextIdx];
      const nextStartSec = (endTotalSeconds + (i - 1) * 210) % (24 * 3600);
      const nHour = Math.floor(nextStartSec / 3600) % 24;
      const nMin = Math.floor((nextStartSec % 3600) / 60);

      historyList.push({
        id: `upcoming-${station.id}-${nextIdx}-${i}`,
        stationId: station.id,
        stationName: station.name,
        stationFrequency: station.frequency,
        stationGenre: station.genre,
        badgeGradient: station.badgeGradient,
        title: nextTrack.title,
        artist: nextTrack.artist,
        startTime: `${padZero(nHour)}:${padZero(nMin)}`,
        durationSeconds: nextTrack.durationSeconds,
        status: 'upcoming',
      });
    }

    stationHistory[station.id] = historyList;
  });

  return { currentTracks, stationHistory };
}

// Шаблони програм для створення реалістичного 7-денного розкладу
interface ProgramSlotTemplate {
  timeSlot: string;
  startHour: number;
  startMinute: number;
  programName: string;
  songs: { title: string; artist: string; offsetMinutes: number; highlight?: boolean }[];
}

const DAILY_PROGRAM_TEMPLATES: ProgramSlotTemplate[] = [
  {
    timeSlot: '06:00 - 08:00',
    startHour: 6,
    startMinute: 0,
    programName: 'Ранковий Світанок & Музичний Підйом',
    songs: [
      { title: 'Зродились ми великої години', artist: 'Олег Скрипка, Тарас Компаніченко', offsetMinutes: 5, highlight: true },
      { title: 'Ой у лузі червона калина', artist: 'Андрій Хливнюк / Pink Floyd', offsetMinutes: 20 },
      { title: 'Доброго вечора, ми з України', artist: 'PROBASS ∆ HARDI', offsetMinutes: 45, highlight: true },
      { title: 'Фортеця Бахмут', artist: 'Антитіла', offsetMinutes: 75 },
      { title: 'Стефанія', artist: 'Kalush Orchestra', offsetMinutes: 105 },
    ],
  },
  {
    timeSlot: '08:00 - 10:00',
    startHour: 8,
    startMinute: 0,
    programName: 'Головні Хіти Незламності',
    songs: [
      { title: 'Люди', artist: 'Бумбокс', offsetMinutes: 10 },
      { title: 'Teresa & Maria', artist: 'Jerry Heil & alyona alyona', offsetMinutes: 28, highlight: true },
      { title: 'Зорі запалали', artist: 'БEZ ОБМЕЖЕНЬ', offsetMinutes: 48 },
      { title: 'Плакала', artist: 'KAZKA', offsetMinutes: 70 },
      { title: 'Буревіями', artist: 'SHUMEI & Злата Огнєвіч', offsetMinutes: 95 },
    ],
  },
  {
    timeSlot: '10:00 - 12:00',
    startHour: 10,
    startMinute: 0,
    programName: 'Золотий Фонд & Українська Класика',
    songs: [
      { title: 'Місця щасливих людей', artist: 'Скрябін', offsetMinutes: 12, highlight: true },
      { title: 'Обійми', artist: 'Океан Ельзи', offsetMinutes: 32 },
      { title: 'Чорна рілля ізорана', artist: 'Тарас Чубай & Плач Єремії', offsetMinutes: 55 },
      { title: 'У мене немає дому', artist: 'Один в каное', offsetMinutes: 78 },
      { title: 'Тримай', artist: 'Христина Соловій', offsetMinutes: 102 },
    ],
  },
  {
    timeSlot: '12:00 - 14:00',
    startHour: 12,
    startMinute: 0,
    programName: 'Денний Драйв: Топ Чарт Радіостанцій',
    songs: [
      { title: 'Допоможе ЗСУ', artist: 'Chico & Qatoshi', offsetMinutes: 8, highlight: true },
      { title: 'Гуси', artist: 'Wellboy', offsetMinutes: 26 },
      { title: 'Байрактар', artist: 'Тарас Боровок', offsetMinutes: 46 },
      { title: 'Вільна', artist: 'Тіна Кароль & Юлія Саніна', offsetMinutes: 68 },
      { title: 'Маяк', artist: 'The Hardkiss', offsetMinutes: 92, highlight: true },
    ],
  },
  {
    timeSlot: '14:00 - 16:00',
    startHour: 14,
    startMinute: 0,
    programName: 'Пообідній Акустичний Лаунж',
    songs: [
      { title: 'Місто весни', artist: 'Океан Ельзи ft. Один в каное', offsetMinutes: 15 },
      { title: 'Біля тополі', artist: 'SHUMEI & Kozak System', offsetMinutes: 38, highlight: true },
      { title: 'Додому', artist: 'Kalush ft. Skofka', offsetMinutes: 62 },
      { title: 'Вільні Люди', artist: 'БEZ ОБМЕЖЕНЬ', offsetMinutes: 85 },
      { title: 'Пообіцяй мені', artist: 'Один в каное', offsetMinutes: 105 },
    ],
  },
  {
    timeSlot: '16:00 - 18:00',
    startHour: 16,
    startMinute: 0,
    programName: 'Рок-Година: Потужний Енергетичний Заряд',
    songs: [
      { title: 'Без бою', artist: 'Океан Ельзи', offsetMinutes: 10, highlight: true },
      { title: 'Кораблі', artist: 'The Hardkiss', offsetMinutes: 32 },
      { title: 'Подай зброю', artist: 'Kozak System', offsetMinutes: 56, highlight: true },
      { title: 'Ярмак — Дике поле', artist: 'YARMAK ft. ALISA', offsetMinutes: 78 },
      { title: 'Не твоя війна', artist: 'Океан Ельзи', offsetMinutes: 100 },
    ],
  },
  {
    timeSlot: '18:00 - 20:00',
    startHour: 18,
    startMinute: 0,
    programName: 'Вечірній Прайм-Тайм: Прем’єри та Хіт-Парад',
    songs: [
      { title: 'Фортеця Бахмут (Оркестрова версія)', artist: 'Антитіла', offsetMinutes: 12, highlight: true },
      { title: 'Враже', artist: 'Енджі Крейда', offsetMinutes: 34 },
      { title: 'Teresa & Maria (Live Acoustic)', artist: 'Jerry Heil', offsetMinutes: 58 },
      { title: 'Героям', artist: 'БEZ ОБМЕЖЕНЬ ft. Скай', offsetMinutes: 80, highlight: true },
      { title: 'Моє ім’я — Батьківщина', artist: 'Тіна Кароль', offsetMinutes: 104 },
    ],
  },
  {
    timeSlot: '20:00 - 22:00',
    startHour: 20,
    startMinute: 0,
    programName: 'Акустичні Балади & Спокійний Вечір',
    songs: [
      { title: 'Старі фотографії', artist: 'Скрябін', offsetMinutes: 15 },
      { title: 'Човен', artist: 'Один в каное', offsetMinutes: 38 },
      { title: 'Обійми (Симфонічний лайв)', artist: 'Океан Ельзи', offsetMinutes: 64, highlight: true },
      { title: 'Журавлі', artist: 'The Hardkiss', offsetMinutes: 88 },
      { title: 'Тримай мене ніжніше', artist: 'Христина Соловій', offsetMinutes: 108 },
    ],
  },
  {
    timeSlot: '22:00 - 00:00',
    startHour: 22,
    startMinute: 0,
    programName: 'Нічні Вінілові Ритми & Електро-Вайб',
    songs: [
      { title: 'Ластівки (Night Club Mix)', artist: 'Chico & Qatoshi', offsetMinutes: 14 },
      { title: 'Гарно так (Deep House Remix)', artist: 'Cheev', offsetMinutes: 38 },
      { title: 'Cherkaschyna (Extended Lounge)', artist: 'Latexfauna', offsetMinutes: 65, highlight: true },
      { title: 'Вова, *баш їх, бл*ть', artist: 'Мюслі UA', offsetMinutes: 88 },
      { title: 'Доброго вечора, ми з України (Bass Boosted)', artist: 'PROBASS ∆ HARDI', offsetMinutes: 105 },
    ],
  },
  {
    timeSlot: '00:00 - 06:00',
    startHour: 0,
    startMinute: 0,
    programName: 'Нічний Безперервний Музичний Ефір',
    songs: [
      { title: 'Ой у лузі червона калина', artist: 'Андрій Хливнюк', offsetMinutes: 30 },
      { title: 'Маяк', artist: 'The Hardkiss', offsetMinutes: 90 },
      { title: 'Зорі запалали', artist: 'БEZ ОБМЕЖЕНЬ', offsetMinutes: 150 },
      { title: 'У мене немає дому', artist: 'Один в каное', offsetMinutes: 210 },
      { title: 'Стефанія', artist: 'Kalush Orchestra', offsetMinutes: 270 },
      { title: 'Місця щасливих людей', artist: 'Скрябін', offsetMinutes: 330 },
    ],
  },
];

/**
 * Генерує детальний розклад ефіру на найближчі 7 днів для всіх або обраної радіостанції.
 * Включає назву пісні, виконавця, час початку трансляції та програму.
 */
export function generateWeeklySchedule(
  stations: RadioStation[],
  baseDate: Date = new Date()
): { days: { dayIndex: number; dayName: string; dateString: string; isToday: boolean; date: Date }[]; scheduleItems: BroadcastScheduleItem[] } {
  const days: { dayIndex: number; dayName: string; dateString: string; isToday: boolean; date: Date }[] = [];
  const scheduleItems: BroadcastScheduleItem[] = [];

  // Топ станції для розкладу
  const featuredStations = stations.slice(0, 10);

  // Створюємо 7 днів (від сьогодні до +6 днів)
  for (let offset = 0; offset < 7; offset++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + offset);

    const dayOfWeek = d.getDay(); // 0 = Нд, 1 = Пн ...
    const dayName = UKRAINIAN_DAY_NAMES[dayOfWeek];
    const dateString = `${d.getDate()} ${MONTH_NAMES_UA[d.getMonth()]}`;

    days.push({
      dayIndex: offset,
      dayName,
      dateString,
      isToday: offset === 0,
      date: d,
    });

    // Для кожного дня формуємо розклад по шаблонах програм і пісень
    featuredStations.forEach((station, sIdx) => {
      DAILY_PROGRAM_TEMPLATES.forEach((tmpl) => {
        tmpl.songs.forEach((song, songIdx) => {
          // Розраховуємо точний час початку трансляції пісні
          const totalStartMinutes = tmpl.startHour * 60 + tmpl.startMinute + song.offsetMinutes + (sIdx * 3) % 15;
          const songStartHour = Math.floor(totalStartMinutes / 60) % 24;
          const songStartMinute = totalStartMinutes % 60;
          const startTime = `${padZero(songStartHour)}:${padZero(songStartMinute)}`;

          const isLiveNow =
            offset === 0 &&
            baseDate.getHours() === songStartHour &&
            Math.abs(baseDate.getMinutes() - songStartMinute) < 15;

          scheduleItems.push({
            id: `sch-${offset}-${station.id}-${tmpl.startHour}-${songIdx}`,
            stationId: station.id,
            stationName: station.name,
            stationFrequency: station.frequency,
            dayOfWeek,
            dayName,
            dateString,
            timeSlot: tmpl.timeSlot,
            startTime, // Точний час початку трансляції
            title: song.title, // Назва пісні
            artist: song.artist, // Виконавець
            programName: tmpl.programName,
            genre: station.genre,
            isLive: isLiveNow,
            highlight: song.highlight,
          });
        });
      });
    });
  }

  return { days, scheduleItems };
}

export interface CurrentStationSong {
  title: string;
  artist: string;
  genre: string;
  durationSeconds: number;
  elapsedSeconds: number;
}

export function getCurrentSongForStation(
  stationOrId: RadioStation | string | null | undefined,
  date: Date = new Date()
): CurrentStationSong {
  const stationId =
    typeof stationOrId === 'string'
      ? stationOrId
      : stationOrId?.id || 'default';

  const stationName =
    typeof stationOrId === 'object' && stationOrId?.name
      ? stationOrId.name
      : typeof stationOrId === 'string'
      ? stationOrId
      : 'Радіо';

  const stationCity =
    typeof stationOrId === 'object' && stationOrId
      ? stationOrId.city || stationOrId.region || 'Україна'
      : 'Україна';

  const stationGenre =
    typeof stationOrId === 'object' && stationOrId?.genre
      ? stationOrId.genre
      : 'Музика';

  const library = (stationId && STATION_TRACK_LIBRARY[stationId]) || STATION_TRACK_LIBRARY.default || [];
  const trackCount = library?.length || 0;
  if (!library || trackCount === 0) {
    return {
      title: `${stationName} — Прямий ефір`,
      artist: stationCity,
      genre: stationGenre,
      durationSeconds: 210,
      elapsedSeconds: 45,
    };
  }

  let hash = 0;
  for (let i = 0; i < (stationId ? stationId.length : 0); i++) {
    hash = (hash << 5) - hash + stationId.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  const totalDaySeconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
  const stationOffset = (positiveHash * 389) % 3600;
  const adjustedSeconds = (totalDaySeconds + stationOffset) % (24 * 3600);

  const songIdx = Math.floor(adjustedSeconds / 210) % trackCount;
  const song = library[songIdx] || library[0];
  const elapsed = adjustedSeconds % 210;

  return {
    title: song?.title || `${stationName} — Прямий ефір`,
    artist: song?.artist || stationCity,
    genre: song?.genre || stationGenre,
    durationSeconds: song?.durationSeconds || 210,
    elapsedSeconds: elapsed,
  };
}
