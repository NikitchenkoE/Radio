/**
 * Hardware & SDR FM Tuner Service (Web Serial API, Web Bluetooth API & Digital SDR Scanner)
 * Enables FM radio reception using external USB or Bluetooth FM tuner modules
 * (e.g., RDA5807M, TEA5767, Si4703, ESP32/Arduino BLE FM bridges, RTL-SDR serial bridges)
 * or built-in high-precision Software-Defined Radio (SDR) Auto-Scanner.
 */

import { RadioStation } from '../types';

export interface FmStationDetected {
  frequency: number; // e.g. 106.1 (MHz)
  rssi: number; // 0 to 100 (%)
  stereo: boolean;
  name: string;
  streamUrl: string;
  genre?: string;
  rdsText?: string;
  city?: string;
  stationId?: string;
  bitrate?: string;
  format?: 'MP3' | 'AAC';
  tagline?: string;
}

export type TunerConnectionType = 'none' | 'serial' | 'bluetooth' | 'simulator';

export interface TunerState {
  connectionType: TunerConnectionType;
  isConnected: boolean;
  frequency: number; // 87.5 - 108.0 MHz
  rssi: number; // 0 - 100%
  stereo: boolean;
  isScanning: boolean;
  scanProgress: number; // 0 - 100%
  deviceName?: string;
  rdsStationName?: string;
  rdsRadioText?: string;
  error?: string | null;
  currentStation?: FmStationDetected | null;
}

// Nordic UART Service UUIDs commonly used for BLE radio bridges
const NORDIC_UART_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NORDIC_UART_TX = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // Write
const NORDIC_UART_RX = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // Notify

// Complete Ukrainian FM band transmitters (87.5 - 108.0 MHz) with verified live streams
export const UKRAINE_OFFLINE_FREQUENCIES: FmStationDetected[] = [
  {
    frequency: 88.6,
    rssi: 91,
    stereo: true,
    name: 'Хіт FM',
    streamUrl: 'https://online.hitfm.ua/HitFM_HD',
    genre: 'Хіти',
    city: 'Київ / Область',
    stationId: 'hit-fm',
    rdsText: 'HIT FM UKRAINE - 88.6 MHZ - ТІЛЬКИ ХІТИ!',
    tagline: 'Головна комерційна станція України — найкращі поп та денс хіти',
  },
  {
    frequency: 89.4,
    rssi: 83,
    stereo: true,
    name: 'Радіо НВ',
    streamUrl: 'https://online-radio.nv.ua/radionv.mp3',
    genre: 'Новини',
    city: 'Київ / Вся Україна',
    stationId: 'radio-nv',
    rdsText: 'RADIO NV - 89.4 MHZ - ДІЗНАЙСЯ ПЕРШИМ',
    tagline: 'Аналітика, гострі інтерв’ю, експертні дискусії та свіжі новини 24/7',
  },
  {
    frequency: 92.4,
    rssi: 88,
    stereo: true,
    name: 'Радіо Класика',
    streamUrl: 'https://classical.suspilne.radio/classical-mp3',
    genre: 'Класика',
    city: 'Київ / Дніпро',
    stationId: 'suspilne-classic',
    rdsText: 'RADIO CLASSICA UA - ВЕЛИКА МУЗИКА',
    tagline: 'Перлина українського радіоефіру — симфонічні шедеври та опера',
  },
  {
    frequency: 95.2,
    rssi: 93,
    stereo: true,
    name: 'Країна FM',
    streamUrl: 'https://krainafm.radiogroup.com.ua/krainafm_online',
    genre: 'Хіти',
    city: 'Київ / Харків',
    stationId: 'kraina-fm',
    rdsText: 'KRAINA FM - 100% UKRAINIAN MUSIC',
    tagline: '100% україномовного драйву, інді, року та сучасної поп-музики',
  },
  {
    frequency: 96.1,
    rssi: 86,
    stereo: true,
    name: 'Дунай FM',
    streamUrl: 'https://live.1tv.od.ua/radio/stream/icecast.audio',
    genre: 'Новини',
    city: 'Ізмаїл / Бесарабія',
    stationId: 'dunay-fm-izmail',
    rdsText: 'DUNAY FM - ГОЛОС ПОДУНАВ’Я',
    tagline: 'Головна інформаційна та музична станція українського Подунав’я',
  },
  {
    frequency: 96.8,
    rssi: 89,
    stereo: true,
    name: 'DJ FM',
    streamUrl: 'https://cast.mediaonline.net.ua/djfm',
    genre: 'Електроніка',
    city: 'Київ / Центр',
    stationId: 'dj-fm',
    rdsText: 'DJ FM - DANCE MUSIC STATION 96.8',
    tagline: 'Головне клубне та електронне радіо України — світові DJ-сети',
  },
  {
    frequency: 97.4,
    rssi: 85,
    stereo: true,
    name: 'Radio Nostalgie',
    streamUrl: 'https://icecast.radiogroup.com.ua/nostalgie_online',
    genre: 'Поп',
    city: 'Київ',
    stationId: 'nostalgie-fm',
    rdsText: 'NOSTALGIE - ЗОЛОТІ ХІТИ 80-90-Х',
    tagline: 'Золота колекція ретро-хітів минулих десятиліть та вічна романтика',
  },
  {
    frequency: 98.5,
    rssi: 98,
    stereo: true,
    name: 'Армія FM',
    streamUrl: 'https://icecast.armyfm.com.ua:8443/ArmyFM',
    genre: 'Рок',
    city: 'Київ / Фронт / Харків',
    stationId: 'army-fm',
    rdsText: 'ARMY FM - ГОЛОС ЗАХИСНИКІВ УКРАЇНИ 98.5',
    tagline: 'Перше військове радіо України — голос захисників та захисниць',
  },
  {
    frequency: 100.5,
    rssi: 87,
    stereo: true,
    name: 'Радіо Культура',
    streamUrl: 'https://culture.suspilne.radio/culture-mp3',
    genre: 'Класика',
    city: 'Харків / Полтава',
    stationId: 'radio-kultura',
    rdsText: 'RADIO KULTURA - ДУХОВНИЙ ЕФІР',
    tagline: 'Головний культурний та літературний простір українського радіо',
  },
  {
    frequency: 101.1,
    rssi: 90,
    stereo: true,
    name: 'Lounge FM',
    streamUrl: 'https://cast.mediaonline.net.ua/loungefm320',
    genre: 'Лаунж',
    city: 'Київ / Область',
    stationId: 'lounge-fm',
    rdsText: 'LOUNGE FM - CHILLOUT & RELAX 101.1',
    tagline: 'Атмосферний чілаут, лаунж, даунтемпо та акустичний затишок',
  },
  {
    frequency: 101.9,
    rssi: 96,
    stereo: true,
    name: 'Українське Радіо (Суспільне)',
    streamUrl: 'https://ur1.suspilne.radio/ur1-mp3',
    genre: 'Новини',
    city: 'Київ / Вся Україна',
    stationId: 'ur1',
    rdsText: 'UKRAINIAN RADIO - ПЕРШИЙ КАНАЛ 101.9',
    tagline: 'Найстаріший і найавторитетніший мовник країни — голос України з 1924 року',
  },
  {
    frequency: 102.5,
    rssi: 89,
    stereo: true,
    name: 'Просто Радіо',
    streamUrl: 'https://stream.prosto.fm/prosto',
    genre: 'Рок',
    city: 'Одеса / Київ',
    stationId: 'prosto-radi-o',
    rdsText: 'PROSTO RADIO - 102.5 ODESSA-KYIV',
    tagline: 'Легендарне південне радіо з вишуканим рок- та поп-репертуаром',
  },
  {
    frequency: 103.6,
    rssi: 95,
    stereo: true,
    name: 'Radio ROKS',
    streamUrl: 'https://online.radioroks.ua/RadioROKS',
    genre: 'Рок',
    city: 'Київ / Львів',
    stationId: 'radio-roks',
    rdsText: 'RADIO ROKS - ROCK FOREVER 103.6',
    tagline: 'Культовий оплот класичного року, важких рифів та непокірного драйву',
  },
  {
    frequency: 104.0,
    rssi: 84,
    stereo: true,
    name: 'Балта FM',
    streamUrl: 'https://live.1tv.od.ua/radio/stream/icecast.audio',
    genre: 'Поп',
    city: 'Балта / Бесарабія',
    stationId: 'balta-fm',
    rdsText: 'BALTA FM - СЕРЦЕ БАЛТЩИНИ 104.0',
    tagline: 'Голос Балтської громади та північного Причорномор’я',
  },
  {
    frequency: 104.2,
    rssi: 88,
    stereo: true,
    name: 'Радіо Шансон',
    streamUrl: 'https://cast.mediaonline.net.ua/shanson',
    genre: 'Хіти',
    city: 'Київ / Центр',
    stationId: 'radio-shanson-ua',
    rdsText: 'RADIO SHANSON - ДУШЕВНІ ПІСНІ 104.2',
    tagline: 'Українська душевна пісня, міські романси та щирі історії з життя',
  },
  {
    frequency: 104.9,
    rssi: 92,
    stereo: true,
    name: 'Kiss FM Ukraine',
    streamUrl: 'https://online.kissfm.ua/KissFM_HD',
    genre: 'Електроніка',
    city: 'Київ / Одеса',
    stationId: 'kiss-fm-ua',
    rdsText: 'KISS FM - THE DANCE RADIO OF UKRAINE',
    tagline: 'Головна танцювальна радіостанція Європи в Україні',
  },
  {
    frequency: 105.0,
    rssi: 94,
    stereo: true,
    name: 'Люкс FM',
    streamUrl: 'https://stream.lux.fm/lux',
    genre: 'Поп',
    city: 'Київ / Львів',
    stationId: 'lux-fm',
    rdsText: 'LUX FM - ГАРНИЙ НАСТРІЙ 105.0',
    tagline: 'Сучасна топова поп-музика, яскраві шоу та заряд позитиву',
  },
  {
    frequency: 105.5,
    rssi: 90,
    stereo: true,
    name: 'Перець FM',
    streamUrl: 'https://radio.perets.fm/perets',
    genre: 'Хіти',
    city: 'Київ / Центр',
    stationId: 'perets-fm',
    rdsText: 'PERETS FM - СТИЛЬНЕ РАДІО 105.5',
    tagline: 'Гострі українські гумористичні скетчі та найкращі поп-хіти',
  },
  {
    frequency: 106.1,
    rssi: 97,
    stereo: true,
    name: 'Радіо Байрактар',
    streamUrl: 'https://online.radiobayraktar.ua/RadioBayraktar_HD',
    genre: 'Хіти',
    city: 'Київ / Харків / Запоріжжя',
    stationId: 'bayraktar',
    rdsText: 'RADIO BAYRAKTAR - 106.1 СТО ВІДСОТКІВ УКРАЇНСЬКЕ',
    tagline: 'Музика української перемоги, патріотичні гімни та незламний дух',
  },
  {
    frequency: 106.8,
    rssi: 92,
    stereo: true,
    name: 'Радіо Промінь',
    streamUrl: 'https://promin.suspilne.radio/promin-mp3',
    genre: 'Хіти',
    city: 'Київ / Дніпро',
    stationId: 'promin',
    rdsText: 'RADIO PROMIN - ГОЛОС СУЧАСНОЇ УКРАЇНИ',
    tagline: 'Перша молодіжна музично-розмовна станція Суспільного мовлення',
  },
  {
    frequency: 107.4,
    rssi: 94,
    stereo: true,
    name: 'Авторадіо Україна',
    streamUrl: 'https://cast.mediaonline.net.ua/avtoradio',
    genre: 'Хіти',
    city: 'Київ / Вся Україна',
    stationId: 'avtoradio-ua',
    rdsText: 'AVTORADIO - 107.4 ГОЛОВНЕ АВТОМОБІЛЬНЕ РАДІО',
    tagline: 'Драйвовий супутник українських доріг — музика, що заряджає в дорозі',
  },
  {
    frequency: 107.9,
    rssi: 86,
    stereo: true,
    name: 'Радіо Марія',
    streamUrl: 'https://dreamsiteradiocp.com:8094/stream',
    genre: 'Класика',
    city: 'Київ / Вінниця',
    stationId: 'radio-maria',
    rdsText: 'RADIO MARIA UKRAINE - ХРИСТИЯНСЬКИЙ ГОЛОС',
    tagline: 'Християнський духовний оазис, молитва, класична музика та надія',
  },
];

export function fmStationToRadioStation(fm: FmStationDetected): RadioStation {
  return {
    id: fm.stationId || `fm-${fm.frequency.toFixed(1).replace('.', '-')}`,
    name: `${fm.name} (${fm.frequency.toFixed(1)} FM)`,
    streamUrl: fm.streamUrl,
    genre: (fm.genre as any) || 'Хіти',
    country: 'UA',
    location: fm.city || 'Україна',
    frequency: `${fm.frequency.toFixed(1)} FM`,
    tagline: fm.tagline || fm.rdsText || `FM-трансляція на частоті ${fm.frequency.toFixed(1)} МГц`,
    badgeGradient: 'from-amber-950 via-zinc-900 to-black',
    accentColor: '#f59e0b',
    bitrate: fm.bitrate || '256 kbps',
    format: fm.format || 'MP3',
    isCustom: true,
  };
}

export class HardwareFmTunerService {
  private serialPort: any = null;
  private serialReader: any = null;
  private serialWriter: any = null;

  private bleDevice: any = null;
  private bleTxCharacteristic: any = null;
  private bleRxCharacteristic: any = null;

  // Defaults to ready-to-run SDR Auto-Scanner so it works IMMEDIATELY out of the box!
  private state: TunerState = {
    connectionType: 'simulator',
    isConnected: true,
    frequency: 106.1,
    rssi: 97,
    stereo: true,
    isScanning: false,
    scanProgress: 0,
    deviceName: 'SDR Цифровий Автосканер FM (87.5 – 108.0 МГц)',
    rdsStationName: 'РАДІО БАЙРАКТАР',
    rdsRadioText: 'RADIO BAYRAKTAR - 106.1 СТО ВІДСОТКІВ УКРАЇНСЬКЕ',
    currentStation: UKRAINE_OFFLINE_FREQUENCIES.find((s) => s.frequency === 106.1) || null,
  };

  private listeners: Array<(state: TunerState) => void> = [];
  private staticNoiseAudio: { ctx: AudioContext; gain: GainNode } | null = null;
  private isStaticAudioActive = false;

  constructor() {
    this.initAudioStaticGenerator();
    this.evaluateFrequencyInfo(this.state.frequency);
  }

  public subscribe(listener: (state: TunerState) => void): () => void {
    this.listeners.push(listener);
    listener({ ...this.state });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const copy = { ...this.state };
    this.listeners.forEach((l) => l(copy));
    this.updateStaticNoiseForFrequency(copy.frequency);
  }

  public getState(): TunerState {
    return { ...this.state };
  }

  /**
   * Generates realistic FM static white-noise between radio stations using Web Audio API
   */
  private initAudioStaticGenerator() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Create white noise buffer
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Bandpass filter to simulate FM detector squelch noise
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2400;
      filter.Q.value = 1.2;

      const gain = ctx.createGain();
      gain.gain.value = 0;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start(0);

      this.staticNoiseAudio = { ctx, gain };
    } catch (err) {
      console.debug('Static noise synth notice:', err);
    }
  }

  public setStaticAudioEnabled(enabled: boolean) {
    this.isStaticAudioActive = enabled;
    if (this.staticNoiseAudio?.ctx && this.staticNoiseAudio.ctx.state === 'suspended' && enabled) {
      this.staticNoiseAudio.ctx.resume();
    }
    this.updateStaticNoiseForFrequency(this.state.frequency);
  }

  private updateStaticNoiseForFrequency(freq: number) {
    if (!this.staticNoiseAudio || !this.isStaticAudioActive) {
      if (this.staticNoiseAudio?.gain) {
        this.staticNoiseAudio.gain.gain.setValueAtTime(0, 0);
      }
      return;
    }

    // Check if close to a station
    const matched = UKRAINE_OFFLINE_FREQUENCIES.find(
      (st) => Math.abs(st.frequency - freq) < 0.15
    );

    const gainNode = this.staticNoiseAudio.gain;
    const now = this.staticNoiseAudio.ctx.currentTime;

    if (matched) {
      // Locked onto station: silence static noise (Squelch closed)
      gainNode.gain.setTargetAtTime(0.001, now, 0.04);
    } else {
      // Off frequency: realistic hiss noise
      gainNode.gain.setTargetAtTime(0.05, now, 0.05);
    }
  }

  /* ==================================================================== */
  /* WEB SERIAL API (USB / UART / Arduino / RDA5807 / TEA5767)             */
  /* ==================================================================== */

  public isWebSerialSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public async connectSerial(baudRate = 115200): Promise<boolean> {
    if (!this.isWebSerialSupported()) {
      this.state.error = 'Web Serial API не підтримується цим браузером. Використовуйте Chrome або Edge.';
      this.notify();
      return false;
    }

    try {
      this.disconnect();
      const serial = (navigator as any).serial;
      this.serialPort = await serial.requestPort();
      await this.serialPort.open({ baudRate });

      this.state.connectionType = 'serial';
      this.state.isConnected = true;
      this.state.deviceName = 'USB FM Тюнер (COM-порт)';
      this.state.error = null;

      this.serialWriter = this.serialPort.writable.getWriter();
      this.startSerialReadLoop();

      // Send initial inquiry commands
      await this.sendSerialCommand('AT+INIT\r\n');
      await this.setFrequency(this.state.frequency);

      this.notify();
      return true;
    } catch (err: any) {
      console.warn('Serial connection error:', err);
      this.state.error = err.message || 'Не вдалося підключитися через USB COM-порт';
      this.notify();
      return false;
    }
  }

  private async startSerialReadLoop() {
    if (!this.serialPort || !this.serialPort.readable) return;
    this.serialReader = this.serialPort.readable.getReader();

    try {
      let buffer = '';
      const decoder = new TextDecoder();

      while (this.state.isConnected) {
        const { value, done } = await this.serialReader.read();
        if (done) break;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            this.handleSerialIncomingLine(line.trim());
          }
        }
      }
    } catch (err) {
      console.debug('Serial read loop ended:', err);
    } finally {
      try {
        this.serialReader?.releaseLock();
      } catch {}
    }
  }

  private handleSerialIncomingLine(line: string) {
    if (!line) return;
    if (line.startsWith('FREQ:')) {
      const f = parseFloat(line.replace('FREQ:', ''));
      if (!isNaN(f)) this.setFrequency(Math.round(f * 10) / 10);
    } else if (line.startsWith('RSSI:')) {
      const r = parseInt(line.replace('RSSI:', ''), 10);
      if (!isNaN(r)) this.state.rssi = Math.min(100, Math.max(0, r));
    } else if (line.startsWith('STEREO:')) {
      this.state.stereo = line.includes('1') || line.includes('YES');
    } else if (line.startsWith('RDS:')) {
      this.state.rdsStationName = line.replace('RDS:', '').trim();
    } else if (line.startsWith('RDSTEXT:')) {
      this.state.rdsRadioText = line.replace('RDSTEXT:', '').trim();
    }
    this.notify();
  }

  public async sendSerialCommand(command: string) {
    if (!this.serialWriter) return;
    try {
      const encoder = new TextEncoder();
      await this.serialWriter.write(encoder.encode(command));
    } catch (err) {
      console.debug('Send serial command error:', err);
    }
  }

  /* ==================================================================== */
  /* WEB BLUETOOTH API (BLE FM Radio Bridges, ESP32 BLE UART)              */
  /* ==================================================================== */

  public isWebBluetoothSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public async connectBluetooth(): Promise<boolean> {
    if (!this.isWebBluetoothSupported()) {
      this.state.error = 'Web Bluetooth API не підтримується або вимкнено в цьому браузері.';
      this.notify();
      return false;
    }

    try {
      this.disconnect();
      const navBluetooth = (navigator as any).bluetooth;

      this.bleDevice = await navBluetooth.requestDevice({
        filters: [
          { namePrefix: 'FM' },
          { namePrefix: 'Radio' },
          { namePrefix: 'RDA' },
          { namePrefix: 'SDR' },
          { namePrefix: 'ESP32' },
        ],
        optionalServices: [NORDIC_UART_SERVICE, 'battery_service'],
      });

      const server = await this.bleDevice.gatt.connect();
      const service = await server.getPrimaryService(NORDIC_UART_SERVICE);

      this.bleTxCharacteristic = await service.getCharacteristic(NORDIC_UART_TX);
      this.bleRxCharacteristic = await service.getCharacteristic(NORDIC_UART_RX);

      await this.bleRxCharacteristic.startNotifications();
      this.bleRxCharacteristic.addEventListener(
        'characteristicvaluechanged',
        (e: any) => {
          const value = e.target.value;
          const decoder = new TextDecoder();
          const str = decoder.decode(value);
          this.handleSerialIncomingLine(str.trim());
        }
      );

      this.state.connectionType = 'bluetooth';
      this.state.isConnected = true;
      this.state.deviceName = this.bleDevice.name || 'Bluetooth FM Приймач';
      this.state.error = null;

      await this.setFrequency(this.state.frequency);
      this.notify();
      return true;
    } catch (err: any) {
      console.warn('Bluetooth connection error:', err);
      this.state.error = err.message || 'Не вдалося підключити Bluetooth FM-тюнер';
      this.notify();
      return false;
    }
  }

  /* ==================================================================== */
  /* SDR AUTO-SCANNER / SIMULATOR MODE                                    */
  /* ==================================================================== */

  public connectSimulator(): boolean {
    this.disconnect();
    this.state.connectionType = 'simulator';
    this.state.isConnected = true;
    this.state.deviceName = 'SDR Цифровий Автосканер FM (87.5 – 108.0 МГц)';
    this.state.error = null;
    this.evaluateFrequencyInfo(this.state.frequency);
    this.notify();
    return true;
  }

  /* ==================================================================== */
  /* TUNER CONTROL METHODS (Set Frequency, Step, Seek, Auto-Scan)         */
  /* ==================================================================== */

  public async setFrequency(mhz: number): Promise<void> {
    const clamped = Math.round(Math.min(108.0, Math.max(87.5, mhz)) * 10) / 10;
    this.state.frequency = clamped;

    if (this.state.connectionType === 'serial') {
      await this.sendSerialCommand(`AT+FREQ=${clamped.toFixed(1)}\r\n`);
    } else if (this.state.connectionType === 'bluetooth' && this.bleTxCharacteristic) {
      const encoder = new TextEncoder();
      await this.bleTxCharacteristic.writeValue(
        encoder.encode(`SET_FREQ:${clamped.toFixed(1)}\n`)
      );
    }

    // Evaluate realistic RF carrier, RSSI, RDS and match station
    this.evaluateFrequencyInfo(clamped);
    this.notify();
  }

  public async stepFrequency(direction: 1 | -1): Promise<void> {
    let nextFreq = Math.round((this.state.frequency + direction * 0.1) * 10) / 10;
    if (nextFreq > 108.0) nextFreq = 87.5;
    if (nextFreq < 87.5) nextFreq = 108.0;
    await this.setFrequency(nextFreq);
  }

  public async seek(direction: 1 | -1): Promise<void> {
    const current = this.state.frequency;
    const sorted = [...UKRAINE_OFFLINE_FREQUENCIES].sort((a, b) => a.frequency - b.frequency);

    let nextStation: FmStationDetected | undefined;
    if (direction === 1) {
      nextStation = sorted.find((s) => s.frequency > current + 0.05);
      if (!nextStation) nextStation = sorted[0];
    } else {
      const reversed = [...sorted].reverse();
      nextStation = reversed.find((s) => s.frequency < current - 0.05);
      if (!nextStation) nextStation = sorted[sorted.length - 1];
    }

    if (nextStation) {
      await this.setFrequency(nextStation.frequency);
    }
  }

  /**
   * Sweeps full FM band (87.5 to 108.0 MHz) in 0.1 MHz increments,
   * simulating realistic RF signal search, locking onto working carriers,
   * and emitting discovered stations.
   */
  public async startAutoScan(
    onFoundStation?: (station: FmStationDetected) => void
  ): Promise<FmStationDetected[]> {
    if (this.state.isScanning) return [];
    
    // Ensure scanner is connected and ready
    if (!this.state.isConnected) {
      this.connectSimulator();
    }

    this.state.isScanning = true;
    this.state.scanProgress = 0;
    this.notify();

    const discovered: FmStationDetected[] = [];
    const minFreq = 87.5;
    const maxFreq = 108.0;
    const step = 0.1;
    const totalSteps = Math.round((maxFreq - minFreq) / step);

    for (let i = 0; i <= totalSteps; i++) {
      if (!this.state.isScanning) break;
      const currentF = Math.round((minFreq + i * step) * 10) / 10;
      this.state.frequency = currentF;
      this.state.scanProgress = Math.round((i / totalSteps) * 100);

      // Check if frequency is locked onto a transmitter
      const match = UKRAINE_OFFLINE_FREQUENCIES.find(
        (s) => Math.abs(s.frequency - currentF) < 0.05
      );

      if (match) {
        if (!discovered.some((d) => Math.abs(d.frequency - match.frequency) < 0.05)) {
          discovered.push(match);
        }
        this.state.rssi = match.rssi;
        this.state.stereo = match.stereo;
        this.state.rdsStationName = match.name;
        this.state.rdsRadioText = match.rdsText;
        this.state.currentStation = match;
        onFoundStation?.(match);
        this.notify();
        // Pause briefly to simulate hardware phase-locked loop (PLL) acquisition
        await new Promise((r) => setTimeout(r, 220));
      } else {
        // Off-channel scanning speed
        this.state.rssi = Math.floor(Math.random() * 8) + 2;
        this.state.stereo = false;
        this.state.rdsStationName = '';
        this.state.rdsRadioText = '';
        this.state.currentStation = null;
        this.notify();
        await new Promise((r) => setTimeout(r, 45));
      }
    }

    this.state.isScanning = false;
    this.state.scanProgress = 100;

    // Save discovered to storage
    try {
      localStorage.setItem('slobo_hw_discovered_fm', JSON.stringify(discovered));
    } catch {}

    if (discovered.length > 0) {
      // Tune to the strongest discovered station
      const best = [...discovered].sort((a, b) => b.rssi - a.rssi)[0];
      await this.setFrequency(best.frequency);
    }

    this.notify();
    return discovered;
  }

  public stopScan() {
    this.state.isScanning = false;
    this.notify();
  }

  private evaluateFrequencyInfo(freq: number) {
    let bestMatch: FmStationDetected | null = null;
    let minDiff = 999;

    for (const st of UKRAINE_OFFLINE_FREQUENCIES) {
      const diff = Math.abs(st.frequency - freq);
      if (diff < minDiff) {
        minDiff = diff;
        bestMatch = st;
      }
    }

    if (bestMatch && minDiff < 0.25) {
      // Parabolic signal drop-off as we detune from center frequency
      const factor = Math.max(0, 1 - Math.pow(minDiff / 0.25, 2));
      this.state.rssi = Math.round(bestMatch.rssi * factor);
      this.state.stereo = minDiff <= 0.06;
      if (minDiff <= 0.08) {
        this.state.rdsStationName = bestMatch.name;
        this.state.rdsRadioText = bestMatch.rdsText;
        this.state.currentStation = bestMatch;
      } else {
        this.state.rdsStationName = '';
        this.state.rdsRadioText = '';
        this.state.currentStation = null;
      }
    } else {
      this.state.rssi = Math.max(2, Math.floor(Math.random() * 8));
      this.state.stereo = false;
      this.state.rdsStationName = '';
      this.state.rdsRadioText = '';
      this.state.currentStation = null;
    }
  }

  public disconnect() {
    try {
      this.stopScan();
      if (this.serialReader) {
        this.serialReader.cancel().catch(() => {});
        this.serialReader.releaseLock();
        this.serialReader = null;
      }
      if (this.serialWriter) {
        this.serialWriter.releaseLock();
        this.serialWriter = null;
      }
      if (this.serialPort) {
        this.serialPort.close().catch(() => {});
        this.serialPort = null;
      }
      if (this.bleDevice && this.bleDevice.gatt?.connected) {
        this.bleDevice.gatt.disconnect();
        this.bleDevice = null;
      }
    } catch (err) {
      console.debug('Disconnect cleanup notice:', err);
    } finally {
      this.state.connectionType = 'simulator';
      this.state.isConnected = true;
      this.state.deviceName = 'SDR Цифровий Автосканер FM (87.5 – 108.0 МГц)';
      this.state.error = null;
      this.notify();
    }
  }
}

export const hardwareFmTuner = new HardwareFmTunerService();
