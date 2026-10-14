import React, { useState, useMemo } from 'react';
import { Compass, Play, Pause, Radio, Disc3 } from 'lucide-react';
import { RadioStation, PlaybackStatus, RegionMapKey } from '../types';

interface InteractiveMapProps {
  stations: RadioStation[];
  activeStation: RadioStation | null;
  playbackStatus: PlaybackStatus;
  onSelectStation: (station: RadioStation) => void;
  onTogglePlay: (station: RadioStation) => void;
}

interface RegionMeta {
  key: RegionMapKey;
  name: string;
  shortName: string;
  cityName: string;
  pin: { x: number; y: number };
  svgPath: string;
}

const REGIONS: RegionMeta[] = [
  {
    key: 'kyiv',
    name: 'Київщина & Столиця',
    shortName: 'Київ & Центр',
    cityName: 'Київ',
    pin: { x: 490, y: 175 },
    svgPath: 'M 430,120 L 550,110 L 560,230 L 440,230 Z',
  },
  {
    key: 'kharkiv',
    name: 'Слобожанщина',
    shortName: 'Слобожанщина',
    cityName: 'Харків',
    pin: { x: 745, y: 205 },
    svgPath: 'M 670,140 L 820,150 L 800,280 L 660,270 Z',
  },
  {
    key: 'lviv',
    name: 'Галичина',
    shortName: 'Галичина',
    cityName: 'Львів',
    pin: { x: 195, y: 230 },
    svgPath: 'M 110,170 L 260,160 L 260,300 L 120,300 Z',
  },
  {
    key: 'odesa',
    name: 'Одеса & Одеська область',
    shortName: 'Одещина & Південь',
    cityName: 'Одеса',
    pin: { x: 480, y: 430 },
    svgPath: 'M 400,340 L 560,340 L 560,490 L 410,480 Z',
  },
  {
    key: 'zaporizhzhia',
    name: 'Запоріжжя & Запорізький Край',
    shortName: 'Запоріжжя',
    cityName: 'Запоріжжя',
    pin: { x: 700, y: 355 },
    svgPath: 'M 640,320 L 760,320 L 760,420 L 640,420 Z',
  },
  {
    key: 'dnipro',
    name: 'Придніпров’я & Індустріальний Центр',
    shortName: 'Придніпров’я',
    cityName: 'Дніпро',
    pin: { x: 670, y: 310 },
    svgPath: 'M 580,250 L 750,250 L 740,380 L 580,380 Z',
  },
  {
    key: 'bukovyna',
    name: 'Буковина & Карпати',
    shortName: 'Буковина',
    cityName: 'Чернівці',
    pin: { x: 265, y: 340 },
    svgPath: 'M 200,310 L 320,310 L 320,400 L 200,400 Z',
  },
  {
    key: 'podillya',
    name: 'Поділля',
    shortName: 'Поділля',
    cityName: 'Вінниця',
    pin: { x: 380, y: 260 },
    svgPath: 'M 320,210 L 430,210 L 440,320 L 320,320 Z',
  },
  {
    key: 'world',
    name: 'Міжнародні Стріми & Ефір',
    shortName: 'Світовий Ефір',
    cityName: 'Світовий Ефір',
    pin: { x: 80, y: 70 },
    svgPath: 'M 20,20 L 140,20 L 140,110 L 20,110 Z',
  },
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  stations = [],
  activeStation,
  playbackStatus,
  onSelectStation,
  onTogglePlay,
}) => {
  const [selectedRegionKey, setSelectedRegionKey] = useState<RegionMapKey | 'all'>('kyiv');
  const [hoveredRegionKey, setHoveredRegionKey] = useState<RegionMapKey | null>(null);

  // Group stations by region
  const stationsByRegion = useMemo(() => {
    const map: Record<string, RadioStation[]> = {};
    REGIONS.forEach((reg) => {
      map[reg.key] = stations.filter(
        (s) => s.regionKey === reg.key || (s.region && s.region.includes(reg.shortName))
      );
    });
    // Fallback assignment for stations that might not have explicit regionKey
    stations.forEach((s) => {
      if (!s.regionKey) {
        if (s.city?.includes('Харків') || s.region?.includes('Слобожанщина')) {
          map.kharkiv = [...(map.kharkiv || []), s];
        } else if (s.city?.includes('Львів') || s.region?.includes('Галичина')) {
          map.lviv = [...(map.lviv || []), s];
        } else if (
          s.city?.includes('Одеса') ||
          s.city?.includes('Подільськ') ||
          s.city?.includes('Балта') ||
          s.city?.includes('Чорноморськ') ||
          s.region?.includes('Одес') ||
          s.region?.includes('Південь')
        ) {
          map.odesa = [...(map.odesa || []), s];
        } else if (s.city?.includes('Запоріжжя') || s.region?.includes('Запоріжжя')) {
          map.zaporizhzhia = [...(map.zaporizhzhia || []), s];
        } else if (s.country === 'World' || s.region?.includes('Світ')) {
          map.world = [...(map.world || []), s];
        } else {
          map.kyiv = [...(map.kyiv || []), s];
        }
      }
    });
    return map;
  }, [stations]);

  // Determine which region has the active station
  const activeRegionKey = useMemo(() => {
    if (!activeStation) return null;
    return activeStation.regionKey || 'kyiv';
  }, [activeStation]);

  const displayedStations = useMemo(() => {
    if (selectedRegionKey === 'all') return stations;
    return stationsByRegion[selectedRegionKey] || [];
  }, [selectedRegionKey, stationsByRegion, stations]);

  const selectedRegionMeta = useMemo(() => {
    if (selectedRegionKey === 'all') return null;
    return REGIONS.find((r) => r.key === selectedRegionKey);
  }, [selectedRegionKey]);

  return (
    <div id="interactive-regions-map" className="space-y-4 select-none">
      {/* Map Control Bar / Quick Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-theme text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#004643]/10 text-[#004643] flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-bold text-main tracking-tight text-sm">
            Мапа розташування станцій та регіонів
          </span>
        </div>

        {/* Smooth Pills for Regions */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          <button
            type="button"
            onClick={() => setSelectedRegionKey('all')}
            className={`px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
              selectedRegionKey === 'all'
                ? 'bg-[#004643] text-white font-semibold shadow-xs'
                : 'card-bg text-sub hover:text-[#004643] border border-theme hover:border-[#004643]/30'
            }`}
          >
            Всі ({stations.length})
          </button>

          {REGIONS.map((reg) => {
            const count = (stationsByRegion[reg.key] || []).length;
            const isSelected = selectedRegionKey === reg.key;
            const isLiveHere = activeRegionKey === reg.key && playbackStatus === 'playing';

            return (
              <button
                key={`filter-tab-${reg.key}`}
                type="button"
                onClick={() => setSelectedRegionKey(reg.key)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#004643] text-white font-semibold shadow-xs'
                    : 'card-bg text-sub hover:text-[#004643] border border-theme hover:border-[#004643]/30'
                }`}
              >
                {isLiveHere && (
                  <span className="w-2 h-2 bg-emerald-400 animate-ping rounded-full inline-block" />
                )}
                <span>{reg.cityName}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Canvas and Regional Station Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Vector SVG Map Container */}
        <div className="lg:col-span-7 bg-[#0b1615] border border-[#004643]/30 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between shadow-sm">
          {/* Subtle Radar Background Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#00a896_1px,transparent_1px)] [background-size:18px_18px]" />

          {/* Map Header Overlay */}
          <div className="relative z-10 flex items-center justify-between text-xs text-sub pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00a896] rounded-full inline-block animate-pulse"></span>
              <span className="text-[#00a896] font-bold tracking-wider text-[11px] uppercase">
                РЕГІОНАЛЬНИЙ РАДАР UKR-FM
              </span>
            </div>
            {activeStation && (
              <div className="text-emerald-300 font-medium truncate max-w-[220px] text-xs">
                В ЕФІРІ: {activeStation.name} ({activeStation.frequency || 'HD'})
              </div>
            )}
          </div>

          {/* SVG Vector Canvas */}
          <div className="relative z-10 w-full h-[280px] sm:h-[340px] flex items-center justify-center">
            <svg
              viewBox="0 0 900 540"
              className="w-full h-full max-h-[340px] select-none"
              style={{ filter: 'drop-shadow(0 4px 16px rgba(0,70,67,0.15))' }}
            >
              {/* Ukraine Boundary Guideline Backdrop */}
              <path
                d="M 120,160 L 260,130 L 420,110 L 580,100 L 760,120 L 860,200 L 830,320 L 730,370 L 630,410 L 540,490 L 410,480 L 330,400 L 230,380 L 130,310 L 90,220 Z"
                fill="#0e1f1e"
                stroke="#1f3b39"
                strokeWidth="2"
                strokeDasharray="4,4"
              />

              {/* Individual Region Polygons */}
              {REGIONS.map((reg) => {
                const isSelected = selectedRegionKey === reg.key;
                const isHovered = hoveredRegionKey === reg.key;
                const isActiveReg = activeRegionKey === reg.key;

                return (
                  <g key={`region-poly-${reg.key}`}>
                    <path
                      d={reg.svgPath}
                      fill={
                        isSelected
                          ? '#00464388'
                          : isHovered
                          ? '#00464355'
                          : isActiveReg
                          ? '#00464333'
                          : '#122524'
                      }
                      stroke={isSelected ? '#00a896' : isHovered ? '#48cae4' : '#224644'}
                      strokeWidth={isSelected ? '2.5' : '1.2'}
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => setSelectedRegionKey(reg.key)}
                      onMouseEnter={() => setHoveredRegionKey(reg.key)}
                      onMouseLeave={() => setHoveredRegionKey(null)}
                    />
                  </g>
                );
              })}

              {/* Inter-region Coordinate Network Lines */}
              <line x1="490" y1="175" x2="195" y2="230" stroke="#1f4240" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="490" y1="175" x2="745" y2="205" stroke="#1f4240" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="490" y1="175" x2="480" y2="430" stroke="#1f4240" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="490" y1="175" x2="670" y2="310" stroke="#1f4240" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="490" y1="175" x2="700" y2="355" stroke="#1f4240" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="670" y1="310" x2="700" y2="355" stroke="#1f4240" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="480" y1="430" x2="700" y2="355" stroke="#1f4240" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="195" y1="230" x2="265" y2="340" stroke="#1f4240" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="490" y1="175" x2="380" y2="260" stroke="#1f4240" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="490" y1="175" x2="80" y2="70" stroke="#00a896" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="5,5" />

              {/* Interactive City Beacons / Circular Pins (No rigid squares) */}
              {REGIONS.map((reg) => {
                const isSelected = selectedRegionKey === reg.key;
                const isHovered = hoveredRegionKey === reg.key;
                const isActiveReg = activeRegionKey === reg.key;
                const isCurrentlyPlaying = isActiveReg && playbackStatus === 'playing';
                const stationCount = (stationsByRegion[reg.key] || []).length;
                const pin = reg.pin;

                return (
                  <g
                    key={`pin-${reg.key}`}
                    className="cursor-pointer"
                    onClick={() => setSelectedRegionKey(reg.key)}
                    onMouseEnter={() => setHoveredRegionKey(reg.key)}
                    onMouseLeave={() => setHoveredRegionKey(null)}
                  >
                    {/* Live Broadcast Sonar Wave if currently playing here */}
                    {isCurrentlyPlaying && (
                      <>
                        <circle
                          cx={pin.x}
                          cy={pin.y}
                          r="26"
                          fill="none"
                          stroke="#00a896"
                          strokeWidth="2"
                          className="animate-ping opacity-60"
                        />
                        <circle
                          cx={pin.x}
                          cy={pin.y}
                          r="15"
                          fill="none"
                          stroke="#00a896"
                          strokeWidth="1.5"
                          className="opacity-40"
                        />
                      </>
                    )}

                    {/* Circular Pin Outer Ring */}
                    <circle
                      cx={pin.x}
                      cy={pin.y}
                      r={isSelected || isCurrentlyPlaying ? '9' : '7'}
                      fill={isSelected || isCurrentlyPlaying ? '#004643' : isHovered ? '#006863' : '#142a29'}
                      stroke={isSelected || isCurrentlyPlaying ? '#ffffff' : '#00a896'}
                      strokeWidth="2"
                      className="transition-all"
                    />

                    {/* Inner Center Dot */}
                    <circle
                      cx={pin.x}
                      cy={pin.y}
                      r="3.5"
                      fill={isSelected || isCurrentlyPlaying ? '#ffffff' : '#00a896'}
                    />

                    {/* City Label & Station Count Badge */}
                    <text
                      x={pin.x}
                      y={pin.y + 22}
                      textAnchor="middle"
                      fill={isSelected || isCurrentlyPlaying ? '#02c39a' : '#f8fafc'}
                      fontSize="11"
                      fontWeight={isSelected || isCurrentlyPlaying ? 'bold' : '500'}
                      letterSpacing="0.04em"
                    >
                      {reg.cityName} ({stationCount})
                    </text>

                    {/* Live Badge when active */}
                    {isCurrentlyPlaying && (
                      <text
                        x={pin.x}
                        y={pin.y - 14}
                        textAnchor="middle"
                        fill="#02c39a"
                        fontSize="9"
                        fontWeight="bold"
                        letterSpacing="0.06em"
                      >
                        ● ЕФІР
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom Coordinates & Legend */}
          <div className="relative z-10 flex flex-wrap items-center justify-between pt-2.5 border-t border-[#1a3835] text-[11px] text-zinc-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#004643] border border-[#00a896] rounded-full inline-block"></span>
                <span>Обраний регіон</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#142a29] border border-[#00a896] rounded-full inline-block"></span>
                <span>Передавачі</span>
              </span>
            </div>
            <div className="text-zinc-400">
              Натисніть на місто або регіон для перегляду станцій
            </div>
          </div>
        </div>

        {/* Stations for Selected Region List / Drawer */}
        <div className="lg:col-span-5 flex flex-col justify-between card-bg border border-theme rounded-2xl p-4 space-y-3 shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-theme">
              <div>
                <h4 className="text-base font-bold text-main tracking-tight">
                  {selectedRegionMeta ? selectedRegionMeta.name : 'Усі станції України та Світу'}
                </h4>
                <p className="text-xs text-sub mt-0.5">
                  {selectedRegionMeta
                    ? `Місто мовлення: ${selectedRegionMeta.cityName} • Станцій: ${displayedStations.length}`
                    : `Загалом доступно: ${displayedStations.length} радіостанцій`}
                </p>
              </div>

              {selectedRegionMeta && (
                <button
                  type="button"
                  onClick={() => setSelectedRegionKey('all')}
                  className="px-2.5 py-1 text-xs rounded-full text-sub hover:text-[#004643] hover:bg-[#004643]/10 transition-colors"
                >
                  Скинути
                </button>
              )}
            </div>

            {/* Scrollable list of stations in this region */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {displayedStations.length === 0 ? (
                <div className="p-6 text-center text-xs text-sub">
                  Немає активних станцій у цьому регіоні
                </div>
              ) : (
                displayedStations.map((station) => {
                  const isActive = activeStation?.id === station.id;
                  const isPlaying = isActive && playbackStatus === 'playing';
                  const isBuffering = isActive && playbackStatus === 'loading';

                  return (
                    <div
                      key={`region-station-${station.id}`}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isActive
                          ? 'border-[#004643] bg-[#004643]/5 shadow-xs ring-1 ring-[#004643]/20'
                          : 'border-theme card-bg hover:border-[#004643]/30 hover:shadow-xs'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-xs text-main truncate">
                            {station.name}
                          </span>
                          {station.frequency && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-[#004643]/10 text-[#004643] rounded-full font-mono font-bold">
                              {station.frequency}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-sub truncate">
                          <span>{station.city || station.location}</span>
                          <span>•</span>
                          <span className="text-[#004643] truncate font-medium">
                            {station.habit || station.genre}
                          </span>
                        </div>
                      </div>

                      {/* Station Direct Play Button with Cyprus #004643 */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isActive) {
                            onTogglePlay(station);
                          } else {
                            onSelectStation(station);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                          isPlaying
                            ? 'bg-[#004643] text-white hover:bg-[#003330] ring-2 ring-[#004643]/20'
                            : 'bg-[#004643] text-white hover:bg-[#003330] hover:scale-105'
                        }`}
                      >
                        {isBuffering ? (
                          <span className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                        ) : isPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>Пауза</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Слухати</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Regional Quick Info Footer */}
          <div className="pt-3 border-t border-theme text-xs text-sub flex items-center justify-between">
            <span>Якість аудіопотоку: 256–320 kbps</span>
            <span className="text-[#004643] font-semibold">UKRAINE LIVE MAP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
