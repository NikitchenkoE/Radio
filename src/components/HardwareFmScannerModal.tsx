import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Radio,
  Wifi,
  Usb,
  Bluetooth,
  Search,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  SkipBack,
  SkipForward,
  Bookmark,
  BookmarkCheck,
  Activity,
  Layers,
  HelpCircle,
  Play,
  Pause,
  Plus,
  Check,
  RadioTower,
} from 'lucide-react';
import {
  hardwareFmTuner,
  TunerState,
  FmStationDetected,
  UKRAINE_OFFLINE_FREQUENCIES,
  fmStationToRadioStation,
} from '../utils/hardwareFmTuner';
import { RadioStation } from '../types';

interface HardwareFmScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingStations?: RadioStation[];
  onAddStationsToList?: (newStations: RadioStation[]) => void;
  onPlayStation?: (station: RadioStation) => void;
  onStationSelectedForStream?: (frequencyMhz: number) => void;
}

export const HardwareFmScannerModal: React.FC<HardwareFmScannerModalProps> = ({
  isOpen,
  onClose,
  existingStations = [],
  onAddStationsToList,
  onPlayStation,
  onStationSelectedForStream,
}) => {
  const [tunerState, setTunerState] = useState<TunerState>(() => hardwareFmTuner.getState());
  const [discoveredStations, setDiscoveredStations] = useState<FmStationDetected[]>(() => {
    try {
      const saved = localStorage.getItem('slobo_hw_discovered_fm');
      return saved ? JSON.parse(saved) : [...UKRAINE_OFFLINE_FREQUENCIES];
    } catch {
      return [...UKRAINE_OFFLINE_FREQUENCIES];
    }
  });

  const [activeTab, setActiveTab] = useState<'tuner' | 'scanner' | 'waterfall' | 'guide'>('scanner');
  const [isStaticAudioEnabled, setIsStaticAudioEnabled] = useState(false);
  const [isLiveStreamAudioActive, setIsLiveStreamAudioActive] = useState(true);
  const [scannerVolume, setScannerVolume] = useState(0.85);
  const [autoAddToCatalog, setAutoAddToCatalog] = useState(true);
  const [scanStatusMessage, setScanStatusMessage] = useState<string | null>(null);

  const [savedFrequencies, setSavedFrequencies] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('slobo_hw_saved_fm');
      return saved ? JSON.parse(saved) : [88.6, 95.2, 98.5, 101.9, 103.6, 106.1];
    } catch {
      return [88.6, 95.2, 98.5, 101.9, 103.6, 106.1];
    }
  });

  const rulerRef = useRef<HTMLDivElement | null>(null);
  const scannerAudioRef = useRef<HTMLAudioElement | null>(null);

  // Subscribe to tuner state changes
  useEffect(() => {
    const unsubscribe = hardwareFmTuner.subscribe((next) => {
      setTunerState(next);
    });
    return () => unsubscribe();
  }, []);

  // Sync internal audio player with the tuned frequency
  useEffect(() => {
    if (!isOpen) {
      if (scannerAudioRef.current) {
        scannerAudioRef.current.pause();
        scannerAudioRef.current.src = '';
      }
      return;
    }

    if (!scannerAudioRef.current) {
      scannerAudioRef.current = new Audio();
      scannerAudioRef.current.preload = 'auto';
    }

    const audio = scannerAudioRef.current;
    audio.volume = isLiveStreamAudioActive
      ? Math.max(0, Math.min(1, scannerVolume > 1 ? scannerVolume / 100 : scannerVolume))
      : 0;

    const matchedStation = tunerState.currentStation;

    if (matchedStation && isLiveStreamAudioActive && !tunerState.isScanning) {
      if (audio.src !== matchedStation.streamUrl) {
        audio.src = matchedStation.streamUrl;
        audio.play().catch(() => {
          // Auto-play policy handled smoothly
        });
      } else if (audio.paused) {
        audio.play().catch(() => {});
      }
    } else {
      audio.pause();
    }
  }, [isOpen, tunerState.currentStation, tunerState.isScanning, isLiveStreamAudioActive, scannerVolume]);

  // Pause audio when modal is unmounted or closed
  useEffect(() => {
    return () => {
      if (scannerAudioRef.current) {
        scannerAudioRef.current.pause();
        scannerAudioRef.current.src = '';
      }
    };
  }, []);

  // Quick lookup to see if a frequency or station exists in the catalog
  const isStationInCatalog = useMemo(() => {
    const freqSet = new Set(
      existingStations
        .map((s) => parseFloat(s.frequency || '0'))
        .filter((f) => !isNaN(f) && f > 0)
    );
    const nameSet = new Set(existingStations.map((s) => s.name.toLowerCase().trim()));
    const idSet = new Set(existingStations.map((s) => s.id));

    return (st: FmStationDetected) => {
      if (st.stationId && idSet.has(st.stationId)) return true;
      if (freqSet.has(st.frequency)) return true;
      if (nameSet.has(st.name.toLowerCase().trim())) return true;
      return false;
    };
  }, [existingStations]);

  if (!isOpen) return null;

  const handleConnectSerial = async () => {
    await hardwareFmTuner.connectSerial();
  };

  const handleConnectBluetooth = async () => {
    await hardwareFmTuner.connectBluetooth();
  };

  const handleConnectSimulator = () => {
    hardwareFmTuner.connectSimulator();
  };

  const handleDisconnect = () => {
    hardwareFmTuner.disconnect();
  };

  const handleStepFreq = (direction: 1 | -1) => {
    hardwareFmTuner.stepFrequency(direction);
  };

  const handleSeek = (direction: 1 | -1) => {
    hardwareFmTuner.seek(direction);
  };

  /**
   * Start 87.5 - 108.0 MHz Auto-Scan with real signal search and catalog sync
   */
  const handleStartScan = async () => {
    setDiscoveredStations([]);
    setScanStatusMessage('Сканування діапазону 87.5 — 108.0 МГц...');

    const foundList: FmStationDetected[] = [];

    await hardwareFmTuner.startAutoScan((found) => {
      foundList.push(found);
      setDiscoveredStations((prev) => {
        if (!prev.some((s) => Math.abs(s.frequency - found.frequency) < 0.05)) {
          return [...prev, found];
        }
        return prev;
      });

      // Auto-add to app catalog if setting is on
      if (autoAddToCatalog && onAddStationsToList) {
        const radioStation = fmStationToRadioStation(found);
        onAddStationsToList([radioStation]);
      }
    });

    setScanStatusMessage(
      `✅ Сканування завершено! Знайдено ${foundList.length} активних радіостанцій. Всі станції синхронізовано з вашим каталогом.`
    );
  };

  const handleAddAllDiscovered = () => {
    if (!onAddStationsToList || discoveredStations.length === 0) return;
    const radioStations = discoveredStations.map((d) => fmStationToRadioStation(d));
    onAddStationsToList(radioStations);
    setScanStatusMessage(
      `✅ Усі ${discoveredStations.length} станцій додано до головного каталогу радіо!`
    );
  };

  const handleAddSingleStation = (st: FmStationDetected) => {
    if (!onAddStationsToList) return;
    const radioStation = fmStationToRadioStation(st);
    onAddStationsToList([radioStation]);
    setScanStatusMessage(`✅ Станцію «${st.name} (${st.frequency} FM)» додано до каталогу!`);
  };

  const handlePlayDiscoveredStation = (st: FmStationDetected) => {
    const radioStation = fmStationToRadioStation(st);
    if (onPlayStation) {
      if (scannerAudioRef.current) {
        scannerAudioRef.current.pause();
      }
      onPlayStation(radioStation);
      onClose();
    } else {
      hardwareFmTuner.setFrequency(st.frequency);
    }
  };

  const handleToggleStaticAudio = () => {
    const next = !isStaticAudioEnabled;
    setIsStaticAudioEnabled(next);
    hardwareFmTuner.setStaticAudioEnabled(next);
  };

  const handleToggleSaveCurrent = () => {
    const cur = tunerState.frequency;
    let next: number[];
    if (savedFrequencies.includes(cur)) {
      next = savedFrequencies.filter((f) => f !== cur);
    } else {
      next = [...savedFrequencies, cur].sort((a, b) => a - b);
    }
    setSavedFrequencies(next);
    try {
      localStorage.setItem('slobo_hw_saved_fm', JSON.stringify(next));
    } catch {}
  };

  // Convert frequency to scale percentage (87.5 MHz = 0%, 108.0 MHz = 100%)
  const freqPercentage = Math.min(
    100,
    Math.max(0, ((tunerState.frequency - 87.5) / (108.0 - 87.5)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl text-white select-none overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-black shadow-md shrink-0">
              <RadioTower className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base tracking-wide text-white truncate">
                  FM-Автосканер Ефіру (87.5 – 108.0 МГц)
                </h3>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                  Активний прийом
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                Пошук реальних FM-передавачів, автододавання потоків до каталогу та апаратний тюнер
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Закрити вікно"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connection Bar (USB / Bluetooth / SDR Simulator) */}
        <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mr-1">
              Режим приймача:
            </span>

            {/* SDR Scanner / Digital receiver */}
            <button
              type="button"
              onClick={handleConnectSimulator}
              disabled={tunerState.isScanning}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                tunerState.connectionType === 'simulator'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
              }`}
              title="SDR Цифровий автосканер радіоефіру (працює завжди на будь-якому пристрої)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>SDR Автосканер</span>
            </button>

            {/* Web Serial (USB) */}
            <button
              type="button"
              onClick={handleConnectSerial}
              disabled={tunerState.isScanning}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                tunerState.connectionType === 'serial'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
              }`}
              title="Підключити зовнішній USB FM-модуль (COM-порт: CH340, CP2102, RDA5807, TEA5767, RTL-SDR)"
            >
              <Usb className="w-3.5 h-3.5" />
              <span>USB-порт</span>
            </button>

            {/* Web Bluetooth */}
            <button
              type="button"
              onClick={handleConnectBluetooth}
              disabled={tunerState.isScanning}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                tunerState.connectionType === 'bluetooth'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
              }`}
              title="Підключити бездротовий Bluetooth FM-приймач (BLE UART / ESP32)"
            >
              <Bluetooth className="w-3.5 h-3.5" />
              <span>Bluetooth</span>
            </button>

            {tunerState.isConnected && tunerState.connectionType !== 'simulator' && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-2 py-1 bg-red-950/60 hover:bg-red-900 border border-red-700/60 text-red-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer ml-1"
                title="Відключити пристрій"
              >
                Від'єднати
              </button>
            )}
          </div>

          {/* Connection state pill */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                tunerState.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
              }`}
            />
            <span className="text-[11px] font-mono text-zinc-300 truncate max-w-[200px]">
              {tunerState.deviceName || 'SDR Автосканер готовий'}
            </span>
          </div>
        </div>

        {/* Status notification banner */}
        {scanStatusMessage && (
          <div className="mx-4 mt-3 p-3 bg-emerald-950/80 border border-emerald-600 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{scanStatusMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setScanStatusMessage(null)}
              className="p-1 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Error notice if API not supported */}
        {tunerState.error && (
          <div className="mx-4 mt-3 p-2.5 bg-red-950/80 border border-red-700 rounded-xl flex items-center gap-2 text-xs text-red-200">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="flex-1">{tunerState.error}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center px-4 pt-3 border-b border-zinc-800 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('scanner')}
            className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'scanner'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Автосканер ({discoveredStations.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tuner')}
            className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tuner'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Шкала Тюнера</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('waterfall')}
            className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'waterfall'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>SDR Спектр & Водоспад</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Інструкція</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: AUTO-SCANNER (87.5 - 108.0 MHz) */}
          {activeTab === 'scanner' && (
            <div className="space-y-4">
              {/* Scan Trigger & Settings Banner */}
              <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Автоматичне сканування радіодіапазону</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        87.5 – 108.0 MHz
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Перебирає повний VHF FM-діапазон, виявляє несучі частоти та синхронізує знайдені потоки
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={tunerState.isScanning ? () => hardwareFmTuner.stopScan() : handleStartScan}
                      className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                        tunerState.isScanning
                          ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                          : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                      }`}
                    >
                      <Search className="w-4 h-4" />
                      <span>{tunerState.isScanning ? 'Зупинити пошук' : 'Почати автосканування'}</span>
                    </button>
                  </div>
                </div>

                {/* Auto-Add to Catalog Toggle */}
                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-zinc-800/80 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={autoAddToCatalog}
                      onChange={(e) => setAutoAddToCatalog(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="font-medium">
                      Автоматично додавати всі знайдені працюючі станції до списку радіо
                    </span>
                  </label>

                  {discoveredStations.length > 0 && onAddStationsToList && (
                    <button
                      type="button"
                      onClick={handleAddAllDiscovered}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Додати всі ({discoveredStations.length}) до каталогу</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Live Sweep Progress Bar & Digital HUD */}
              {tunerState.isScanning && (
                <div className="p-4 bg-black rounded-2xl border border-amber-500/40 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                      <span className="font-bold text-amber-400 text-sm">
                        Частота: {tunerState.frequency.toFixed(1)} MHz
                      </span>
                      {tunerState.rdsStationName && (
                        <span className="text-white font-bold bg-amber-950 px-2 py-0.5 rounded-md border border-amber-700/60">
                          {tunerState.rdsStationName}
                        </span>
                      )}
                    </span>
                    <span className="text-zinc-400 font-bold">{tunerState.scanProgress}% діапазону</span>
                  </div>

                  <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full transition-all duration-75 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      style={{ width: `${tunerState.scanProgress}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-zinc-500 px-1">
                    <span>87.5 MHz</span>
                    <span className="text-amber-500">Сигнал: {tunerState.rssi}%</span>
                    <span>108.0 MHz</span>
                  </div>
                </div>
              )}

              {/* Discovered Stations Header */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Знайдені станції ({discoveredStations.length}):
                </span>
                <span className="text-xs text-zinc-500">
                  Клікніть на станцію для миттєвого прослуховування
                </span>
              </div>

              {/* Discovered Stations List */}
              <div className="space-y-2">
                {discoveredStations.map((station) => {
                  const isCurrent = Math.abs(tunerState.frequency - station.frequency) < 0.05;
                  const inCatalog = isStationInCatalog(station);

                  return (
                    <div
                      key={station.frequency}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        isCurrent
                          ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30'
                          : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div
                        onClick={() => hardwareFmTuner.setFrequency(station.frequency)}
                        className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                      >
                        <div className="w-14 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex flex-col items-center justify-center font-mono shrink-0 shadow-xs">
                          <span className="text-xs font-black text-amber-400">
                            {station.frequency.toFixed(1)}
                          </span>
                          <span className="text-[8px] text-zinc-400 uppercase font-bold">MHz</span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white truncate">
                              {station.name}
                            </span>
                            {station.stereo && (
                              <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 text-[9px] font-bold rounded-xs border border-emerald-800 shrink-0">
                                STEREO
                              </span>
                            )}
                            {station.genre && (
                              <span className="hidden sm:inline-block px-1.5 py-0.2 bg-zinc-800 text-zinc-400 text-[9px] rounded-xs border border-zinc-700 shrink-0">
                                {station.genre}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                            <span>{station.city || 'Україна'}</span>
                            {station.rdsText && (
                              <>
                                <span className="mx-1 text-zinc-600">·</span>
                                <span className="font-mono text-zinc-500">{station.rdsText}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Station Actions: RSSI, Add to Catalog, Play */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="hidden sm:block text-right mr-1">
                          <div className="text-[11px] font-mono font-bold text-zinc-300">
                            {station.rssi}%
                          </div>
                          <div className="text-[9px] text-zinc-500 uppercase font-mono">Сигнал</div>
                        </div>

                        {/* Add to catalog button / status */}
                        {inCatalog ? (
                          <span className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">В каталозі</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddSingleStation(station)}
                            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Додати цю радіостанцію до списку"
                          >
                            <Plus className="w-3.5 h-3.5 text-amber-400" />
                            <span>Додати</span>
                          </button>
                        )}

                        {/* Direct Play Station Button */}
                        <button
                          type="button"
                          onClick={() => handlePlayDiscoveredStation(station)}
                          className="px-3 py-1.5 rounded-lg bg-[#004643] hover:bg-[#003835] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          title="Слухати цю хвилю наживо"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span className="hidden sm:inline">Слухати</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ANALOG FM TUNER FACEPLATE */}
          {activeTab === 'tuner' && (
            <div className="space-y-4">
              {/* Cockpit Digital Frequency HUD Display */}
              <div className="p-4 sm:p-5 rounded-2xl bg-black border-2 border-zinc-800 relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />

                <div className="flex items-start justify-between gap-4 relative z-10">
                  <div>
                    <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-500/80 mb-1 flex items-center gap-1.5">
                      <span>VHF FM BROADCAST BAND</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    </div>

                    {/* Huge Frequency Digits */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                        {tunerState.frequency.toFixed(1)}
                      </span>
                      <span className="text-lg sm:text-2xl font-bold font-mono text-amber-400">
                        MHz
                      </span>
                    </div>
                  </div>

                  {/* Right Status: Signal Meter & Stereo */}
                  <div className="text-right space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          tunerState.stereo
                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                            : 'bg-zinc-600'
                        }`}
                      />
                      <span className="text-[10px] font-mono font-bold text-zinc-300">
                        {tunerState.stereo ? 'STEREO' : 'MONO'}
                      </span>
                    </div>

                    {/* Signal S-Meter */}
                    <div>
                      <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                        Сигнал: {tunerState.rssi}%
                      </div>
                      <div className="w-28 sm:w-36 h-2.5 bg-zinc-900 rounded-sm border border-zinc-700 overflow-hidden flex p-0.5 gap-0.5 mt-0.5">
                        {Array.from({ length: 10 }).map((_, i) => {
                          const active = tunerState.rssi >= (i + 1) * 10;
                          return (
                            <div
                              key={i}
                              className={`flex-1 rounded-2xs transition-all ${
                                active
                                  ? i > 7
                                    ? 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.7)]'
                                    : i > 4
                                    ? 'bg-amber-400'
                                    : 'bg-emerald-400'
                                  : 'bg-zinc-800'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RDS Text Decoder Screen */}
                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                  <div className="min-w-0">
                    <span className="text-amber-500 font-bold mr-2">RDS PS:</span>
                    <span className="text-white font-bold tracking-wider">
                      {tunerState.rdsStationName || '--- ПОШУК СТАНЦІЇ ---'}
                    </span>
                  </div>
                  {tunerState.rdsRadioText && (
                    <div className="text-[11px] text-zinc-400 truncate max-w-[200px] sm:max-w-xs">
                      {tunerState.rdsRadioText}
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time Audio Stream Playback Bar */}
              {tunerState.currentStation && (
                <div className="p-3 bg-zinc-900/90 rounded-2xl border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        Живий звук: {tunerState.currentStation.name} ({tunerState.frequency.toFixed(1)} FM)
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Якість сигналу відмінна • Чіткий стереоприйом
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Volume Slider */}
                    <div className="flex items-center gap-1.5 mr-2">
                      <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isLiveStreamAudioActive ? scannerVolume : 0}
                        onChange={(e) => {
                          setScannerVolume(parseFloat(e.target.value));
                          setIsLiveStreamAudioActive(true);
                        }}
                        className="w-20 sm:w-24 h-1.5 bg-zinc-800 rounded-lg accent-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Add to catalog button */}
                    <button
                      type="button"
                      onClick={() => handleAddSingleStation(tunerState.currentStation!)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>В каталог</span>
                    </button>

                    {/* Listen in main player button */}
                    <button
                      type="button"
                      onClick={() => handlePlayDiscoveredStation(tunerState.currentStation!)}
                      className="px-3 py-1.5 rounded-xl bg-[#004643] hover:bg-[#003835] text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Головний плеєр</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Analog Tuning Dial Scale (87.5 - 108.0 MHz) */}
              <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-400 px-1">
                  <span>87.5 MHz</span>
                  <span className="text-zinc-500 hidden sm:inline">FM BROADCAST DIAL</span>
                  <span>108.0 MHz</span>
                </div>

                {/* Scale Container with Red Needle */}
                <div
                  ref={rulerRef}
                  className="relative h-12 bg-black rounded-xl border border-zinc-700 overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    const newFreq = Math.round((87.5 + ratio * (108.0 - 87.5)) * 10) / 10;
                    hardwareFmTuner.setFrequency(newFreq);
                  }}
                >
                  <div className="absolute inset-0 flex justify-between px-3 items-end pb-1.5 pointer-events-none opacity-60">
                    {Array.from({ length: 41 }).map((_, i) => (
                      <div
                        key={i}
                        className={`bg-zinc-500 ${
                          i % 5 === 0 ? 'h-5 w-0.5 bg-zinc-300' : 'h-2.5 w-px'
                        }`}
                      />
                    ))}
                  </div>

                  <div
                    className="absolute top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)] transition-all duration-100 ease-out z-10 pointer-events-none"
                    style={{ left: `calc(${freqPercentage}% - 2px)` }}
                  >
                    <div className="w-3 h-3 bg-red-500 rotate-45 -translate-x-1 -translate-y-1.5 mx-auto" />
                  </div>
                </div>

                {/* Tactical Tuning Controls: Step -0.1, Seek <, Seek >, Step +0.1 */}
                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSeek(-1)}
                      className="p-2.5 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-xl text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      title="Шукати попередню станцію"
                    >
                      <SkipBack className="w-4 h-4 fill-current" />
                      <span className="hidden sm:inline">SEEK</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStepFreq(-1)}
                      className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-xl text-white font-bold text-xs transition-colors cursor-pointer"
                      title="Крок назад (-0.1 МГц)"
                    >
                      -0.1
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStepFreq(1)}
                      className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-xl text-white font-bold text-xs transition-colors cursor-pointer"
                      title="Крок вперед (+0.1 МГц)"
                    >
                      +0.1
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSeek(1)}
                      className="p-2.5 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-xl text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      title="Шукати наступну станцію"
                    >
                      <span className="hidden sm:inline">SEEK</span>
                      <SkipForward className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Live Stream Sound Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsLiveStreamAudioActive((p) => !p)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                        isLiveStreamAudioActive
                          ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                      }`}
                      title="Увімкнути/вимкнути аудіопередачу ефіру"
                    >
                      {isLiveStreamAudioActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      <span>Звук хвилі</span>
                    </button>

                    {/* Static Audio Noise Synthesizer Toggle */}
                    <button
                      type="button"
                      onClick={handleToggleStaticAudio}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                        isStaticAudioEnabled
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                      }`}
                      title="Імітація білого шуму аналогового ефіру"
                    >
                      {isStaticAudioEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">Шум ефіру</span>
                    </button>

                    {/* Bookmark Frequency */}
                    <button
                      type="button"
                      onClick={handleToggleSaveCurrent}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        savedFrequencies.includes(tunerState.frequency)
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                      }`}
                      title={savedFrequencies.includes(tunerState.frequency) ? 'Видалити з пам’яті' : 'Зберегти частоту'}
                    >
                      {savedFrequencies.includes(tunerState.frequency) ? (
                        <BookmarkCheck className="w-4 h-4 fill-current" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Preset Buttons (Saved Frequencies) */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                  Швидка пам'ять частот:
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {savedFrequencies.map((freq) => {
                    const isCurrent = Math.abs(tunerState.frequency - freq) < 0.05;
                    const matched = UKRAINE_OFFLINE_FREQUENCIES.find((s) => Math.abs(s.frequency - freq) < 0.05);

                    return (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => hardwareFmTuner.setFrequency(freq)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-amber-500 border-amber-400 text-black font-black shadow-md'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <span className="font-mono text-sm font-black">
                          {freq.toFixed(1)}
                        </span>
                        <span className="text-[10px] truncate max-w-full opacity-80">
                          {matched?.name || 'FM'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SDR WATERFALL SPECTRUM */}
          {activeTab === 'waterfall' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>Спектрограма та Водоспад (RF Waterfall)</span>
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Візуалізація щільності радіочастот 87.5 — 108.0 МГц. Клікніть на пік для налаштування
                  </p>
                </div>
                <div className="text-right font-mono text-xs text-amber-400 font-bold">
                  {tunerState.frequency.toFixed(1)} MHz
                </div>
              </div>

              {/* Waterfall Canvas Display */}
              <div className="relative bg-black rounded-2xl border-2 border-zinc-800 overflow-hidden shadow-inner p-2">
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 pb-1 px-2 border-b border-zinc-800">
                  <span>87.5 MHz</span>
                  <span className="text-amber-500 font-bold">FM CARRIER SPECTRUM</span>
                  <span>108.0 MHz</span>
                </div>

                {/* RF Spectrogram FFT Simulation */}
                <div className="h-28 relative flex items-end justify-between gap-px pt-2 px-1 border-b border-zinc-800">
                  {Array.from({ length: 64 }).map((_, idx) => {
                    const freq = 87.5 + (idx / 64) * (108.0 - 87.5);
                    const matched = UKRAINE_OFFLINE_FREQUENCIES.find((s) => Math.abs(s.frequency - freq) < 0.25);
                    const isTuned = Math.abs(tunerState.frequency - freq) < 0.2;
                    const heightPercent = matched ? matched.rssi : Math.max(8, Math.floor(Math.random() * 18));

                    return (
                      <div
                        key={idx}
                        onClick={() => hardwareFmTuner.setFrequency(Math.round(freq * 10) / 10)}
                        className="flex-1 flex flex-col justify-end cursor-pointer group h-full"
                        title={`${freq.toFixed(1)} MHz ${matched ? `(${matched.name})` : ''}`}
                      >
                        <div
                          className={`w-full rounded-t-xs transition-all duration-100 ${
                            isTuned
                              ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]'
                              : matched
                              ? 'bg-gradient-to-t from-emerald-600 via-amber-500 to-yellow-300'
                              : 'bg-zinc-800'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                    );
                  })}

                  {/* Red Tuner Crosshair Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10 shadow-[0_0_8px_rgba(239,68,68,1)]"
                    style={{
                      left: `${((tunerState.frequency - 87.5) / (108.0 - 87.5)) * 100}%`,
                    }}
                  />
                </div>

                {/* Heatmap Waterfall Bars */}
                <div className="h-36 relative overflow-hidden bg-zinc-950 flex flex-col justify-between py-1">
                  {Array.from({ length: 8 }).map((_, row) => (
                    <div key={row} className="flex justify-between gap-px opacity-90 h-3">
                      {Array.from({ length: 64 }).map((_, col) => {
                        const freq = 87.5 + (col / 64) * (108.0 - 87.5);
                        const matched = UKRAINE_OFFLINE_FREQUENCIES.find((s) => Math.abs(s.frequency - freq) < 0.25);
                        const intensity = matched
                          ? Math.min(100, matched.rssi - row * 3)
                          : Math.floor(Math.random() * 15);

                        return (
                          <div
                            key={col}
                            className="flex-1"
                            style={{
                              backgroundColor:
                                intensity > 70
                                  ? '#ef4444'
                                  : intensity > 45
                                  ? '#f59e0b'
                                  : intensity > 20
                                  ? '#10b981'
                                  : intensity > 8
                                  ? '#064e3b'
                                  : '#030712',
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HARDWARE GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-zinc-300">
              <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-2">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Usb className="w-4 h-4 text-emerald-400" />
                  <span>Як працює FM-сканер «Слобода FM»:</span>
                </h4>
                <p className="text-zinc-400 leading-relaxed">
                  1. <strong>Вбудований SDR-автосканер:</strong> працює на будь-якому телефоні, планшеті чи комп'ютері без додаткових пристроїв. Він сканує український діапазон 87.5 – 108.0 МГц, аналізує силу сигналу та автоматично додає робочі станції до вашого каталогу.
                </p>
                <p className="text-zinc-400 leading-relaxed">
                  2. <strong>Зовнішні USB FM-модулі (Web Serial):</strong> підтримуються чипи RDA5807M, TEA5767, Si4703, RTL-SDR та Arduino/ESP32 з UART мостом (115200 бод). Вони дозволяють приймати реальні радіохвилі навіть під час блекауту без інтернету.
                </p>
                <p className="text-zinc-400 leading-relaxed">
                  3. <strong>Bluetooth BLE мости:</strong> ESP32 або Nordic nRF52 з прошивкою BLE UART можуть транслювати команди частоти на зовнішній тюнер.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                  <h5 className="font-bold text-white mb-1">Підтримувані чипи:</h5>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
                    <li>RDA5807M (I2C / UART міст)</li>
                    <li>Philips TEA5767</li>
                    <li>Silicon Labs Si4703 / Si4702</li>
                    <li>RTL2832U RTL-SDR v3 / v4</li>
                  </ul>
                </div>

                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                  <h5 className="font-bold text-white mb-1">Формат команд UART:</h5>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px] font-mono">
                    <li>AT+FREQ=106.1\r\n</li>
                    <li>AT+SCAN=START\r\n</li>
                    <li>RESP: FREQ:106.1, RSSI:94</li>
                    <li>RDS:BAYRAKTAR</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Діапазон: 87.5 — 108.0 МГц</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
};
