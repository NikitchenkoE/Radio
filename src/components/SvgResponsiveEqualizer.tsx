import React, { useEffect, useRef, useState } from 'react';

export type EqualizerMode = 'complete' | 'reactor' | 'cyber' | 'wave';
export type VisualizerColorTheme = 'emerald' | 'plasma' | 'synthwave' | 'solar';

export interface SvgResponsiveEqualizerProps {
  isPlaying: boolean;
  isLoading?: boolean;
  stationName: string;
  frequency?: string;
  genre?: string;
  accentColor?: string;
  mode?: EqualizerMode;
  onModeChange?: (mode: EqualizerMode) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
}

export const SvgResponsiveEqualizer: React.FC<SvgResponsiveEqualizerProps> = ({
  isPlaying,
  isLoading = false,
  stationName,
  frequency = '101.5 FM',
  genre = 'Live Broadcast',
  mode: controlledMode,
  onModeChange,
}) => {
  const [internalMode, setInternalMode] = useState<EqualizerMode>('complete');
  const [colorTheme, setColorTheme] = useState<VisualizerColorTheme>('emerald');

  const activeMode = controlledMode || internalMode;

  const handleSetMode = (m: EqualizerMode) => {
    setInternalMode(m);
    onModeChange?.(m);
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const stateRef = useRef({
    isPlaying,
    isLoading,
    mode: activeMode,
    theme: colorTheme,
  });

  useEffect(() => {
    stateRef.current.isPlaying = isPlaying;
    stateRef.current.isLoading = isLoading;
    stateRef.current.mode = activeMode;
    stateRef.current.theme = colorTheme;
  }, [isPlaying, isLoading, activeMode, colorTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = 800;
    let height = 320;
    let dpr = 1;

    const resize = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      width = Math.max(rect.width, 280);
      height = Math.max(rect.height, 180);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const BAR_COUNT = 40;
    const bars = Array.from({ length: BAR_COUNT }, (_, i) => ({
      height: 10,
      targetHeight: 10,
      peakHeight: 12,
      peakTimer: 0,
      speed: 0.14 + (i % 6) * 0.015,
    }));

    const particles: Particle[] = [];
    const shockwaves: Shockwave[] = [];

    let phase = 0;
    let radarAngle = 0;
    let beatTimer = 0;

    const getPalette = (themeName: VisualizerColorTheme) => {
      switch (themeName) {
        case 'plasma':
          return {
            primary: '#00a896',
            secondary: '#38bdf8',
            accent: '#818cf8',
            peak: '#e0f2fe',
            grid: 'rgba(56, 189, 248, 0.05)',
            glow: 'rgba(0, 168, 150, 0.4)',
            bgGradTop: '#04131d',
            bgGradBottom: '#02090f',
          };
        case 'synthwave':
          return {
            primary: '#ec4899',
            secondary: '#a855f7',
            accent: '#06b6d4',
            peak: '#fef08a',
            grid: 'rgba(236, 72, 153, 0.05)',
            glow: 'rgba(236, 72, 153, 0.35)',
            bgGradTop: '#16041f',
            bgGradBottom: '#07020d',
          };
        case 'solar':
          return {
            primary: '#f59e0b',
            secondary: '#ef4444',
            accent: '#f97316',
            peak: '#fef08a',
            grid: 'rgba(245, 158, 11, 0.05)',
            glow: 'rgba(245, 158, 11, 0.35)',
            bgGradTop: '#1a0c02',
            bgGradBottom: '#070300',
          };
        case 'emerald':
        default:
          return {
            primary: '#00a896',
            secondary: '#02c39a',
            accent: '#004643',
            peak: '#6ee7b7',
            grid: 'rgba(0, 168, 150, 0.06)',
            glow: 'rgba(0, 168, 150, 0.4)',
            bgGradTop: '#051816',
            bgGradBottom: '#020b0a',
          };
      }
    };

    const render = () => {
      const { isPlaying: playing, isLoading: loading, mode, theme } = stateRef.current;
      const pal = getPalette(theme);

      const speed = playing ? 0.065 : 0.016;
      phase += speed;
      radarAngle = (radarAngle + (playing ? 0.035 : 0.008)) % (Math.PI * 2);

      // Studio background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, pal.bgGradTop);
      bgGrad.addColorStop(1, pal.bgGradBottom);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const baselineY = Math.min(height - 35, height * 0.84);
      const centerX = width / 2;
      const centerY = height * 0.48;

      // Studio frequency grid
      ctx.save();
      ctx.strokeStyle = pal.grid;
      ctx.lineWidth = 1;
      const gridRows = 6;
      for (let r = 1; r < gridRows; r++) {
        const y = (baselineY / gridRows) * r;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // Audio spectrum frequencies calculation
      const maxBarHeight = Math.min(height * 0.58, 170);
      let avgEnergy = 0;
      let bassEnergy = 0;

      for (let i = 0; i < BAR_COUNT; i++) {
        const b = bars[i];
        const normIdx = i / BAR_COUNT;

        if (playing) {
          const bass = Math.sin(phase * 1.5 + normIdx * 3.5) * 0.45 + 0.55;
          const mids = Math.cos(phase * 2.2 + normIdx * 6.5) * 0.35 + 0.5;
          const trebles = Math.sin(phase * 3.1 - normIdx * 8.5) * 0.25 + 0.45;
          const curve = Math.exp(-Math.pow((normIdx - 0.38) * 2.5, 2));

          const energy = (bass * 0.45 + mids * 0.35 + trebles * 0.2) * (0.35 + 0.65 * curve);
          b.targetHeight = Math.max(8, energy * maxBarHeight);
          avgEnergy += energy;
          if (i < 8) bassEnergy += energy;
        } else if (loading) {
          const ripple = Math.sin(phase * 3 + normIdx * Math.PI * 4) * 0.5 + 0.5;
          b.targetHeight = 8 + ripple * 30;
        } else {
          b.targetHeight = 4 + Math.sin(phase * 0.8 + normIdx * 3) * 3;
        }

        b.height += (b.targetHeight - b.height) * b.speed;

        if (b.height >= b.peakHeight) {
          b.peakHeight = b.height;
          b.peakTimer = 18;
        } else {
          if (b.peakTimer > 0) {
            b.peakTimer--;
          } else {
            b.peakHeight = Math.max(8, b.peakHeight - 1.2);
          }
        }
      }

      avgEnergy /= BAR_COUNT;
      bassEnergy /= 8;

      // Spawn beat shockwave & particles
      beatTimer++;
      if (playing && bassEnergy > 0.68 && beatTimer > 18) {
        beatTimer = 0;
        shockwaves.push({
          x: centerX,
          y: centerY,
          radius: 20,
          maxRadius: Math.min(width, height) * 0.65,
          alpha: 0.6,
          color: pal.primary,
        });

        for (let p = 0; p < 8; p++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 1.2 + Math.random() * 2.8;
          particles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            life: 0,
            maxLife: 40 + Math.random() * 30,
            size: 1.5 + Math.random() * 2,
            color: p % 2 === 0 ? pal.primary : pal.secondary,
          });
        }
      }

      // Draw shockwaves
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += 3.5;
        sw.alpha *= 0.94;

        if (sw.alpha < 0.02 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(s, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw particles
      for (let p = particles.length - 1; p >= 0; p--) {
        const pt = particles[p];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vx *= 0.98;
        pt.vy *= 0.98;
        pt.life++;

        if (pt.life >= pt.maxLife) {
          particles.splice(p, 1);
          continue;
        }

        const alpha = 1 - pt.life / pt.maxLife;
        ctx.save();
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Mode: Spectrum Bars ('cyber' or 'complete')
      if (mode === 'cyber' || mode === 'complete') {
        const usableWidth = width * 0.92;
        const startX = width * 0.04;
        const totalSpacing = usableWidth / BAR_COUNT;
        const barWidth = Math.max(3, Math.min(totalSpacing * 0.68, 12));

        for (let i = 0; i < BAR_COUNT; i++) {
          const b = bars[i];
          const x = startX + i * totalSpacing + (totalSpacing - barWidth) / 2;
          const y = baselineY - b.height;

          const barGrad = ctx.createLinearGradient(0, baselineY, 0, y);
          barGrad.addColorStop(0, pal.accent);
          barGrad.addColorStop(0.5, pal.primary);
          barGrad.addColorStop(1, pal.secondary);

          ctx.fillStyle = barGrad;
          ctx.beginPath();
          drawRoundRect(ctx, x, y, barWidth, b.height, Math.min(barWidth / 2, 2.5));
          ctx.fill();

          // Peak meter dot
          const peakY = baselineY - b.peakHeight - 3;
          ctx.fillStyle = pal.peak;
          ctx.fillRect(x, peakY, barWidth, 2);

          // Subtle reflection below baseline
          const reflHeight = b.height * 0.22;
          const reflGrad = ctx.createLinearGradient(0, baselineY, 0, baselineY + reflHeight);
          reflGrad.addColorStop(0, 'rgba(0, 168, 150, 0.2)');
          reflGrad.addColorStop(1, 'rgba(0, 168, 150, 0)');
          ctx.fillStyle = reflGrad;
          ctx.fillRect(x, baselineY + 2, barWidth, reflHeight);
        }
      }

      // Mode: Arc Reactor Core ('reactor' or 'complete')
      if (mode === 'reactor' || mode === 'complete') {
        const coreRadius = Math.min(width, height) * (mode === 'reactor' ? 0.26 : 0.18);
        const pulse = playing ? 1 + bassEnergy * 0.18 : 1 + Math.sin(phase) * 0.05;

        ctx.save();
        ctx.translate(centerX, centerY);

        // Core background glow
        const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius * 1.5 * pulse);
        glowGrad.addColorStop(0, pal.glow);
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, coreRadius * 1.5 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Outer circular rings with rotating segments
        ctx.strokeStyle = pal.primary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, coreRadius * pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = pal.secondary;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, coreRadius * 1.15 * pulse, radarAngle, radarAngle + Math.PI * 0.75);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, coreRadius * 1.15 * pulse, radarAngle + Math.PI, radarAngle + Math.PI * 1.75);
        ctx.stroke();

        // 24 radial energy ticks
        const ticks = 24;
        for (let t = 0; t < ticks; t++) {
          const angle = (t / ticks) * Math.PI * 2;
          const innerR = coreRadius * 0.82;
          const tickLen = 6 + (playing ? Math.sin(phase * 3 + t) * 6 : 2);
          const outerR = innerR + tickLen;

          ctx.strokeStyle = t % 2 === 0 ? pal.primary : pal.secondary;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
          ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
          ctx.stroke();
        }

        ctx.restore();
      }

      // Mode: Laser Audio Wave ('wave' or 'complete')
      if (mode === 'wave' || mode === 'complete') {
        const waveY = centerY;
        const wavePoints = 64;
        const step = width / (wavePoints - 1);

        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < wavePoints; i++) {
          const norm = i / wavePoints;
          let amp = 0;
          if (playing) {
            const env = Math.sin(norm * Math.PI);
            amp =
              (Math.sin(norm * 12 + phase * 2.2) * 22 +
                Math.cos(norm * 20 - phase * 3.1) * 14 +
                Math.sin(norm * 6 + phase) * 10) *
              env;
          } else if (loading) {
            amp = Math.sin(norm * 12 + phase * 4) * 12;
          } else {
            amp = Math.sin(norm * 8 + phase * 0.8) * 3;
          }

          const px = i * step;
          const py = waveY + amp;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        ctx.strokeStyle = pal.secondary;
        ctx.lineWidth = mode === 'wave' ? 3 : 2;
        ctx.shadowColor = pal.glow;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#050c0b]"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Top Right: Preset Modes & Color Palette Switcher */}
      <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
        {/* Preset Modes */}
        <div className="flex items-center bg-black/70 backdrop-blur-md p-0.5 border border-white/10 rounded-md text-[10px] sm:text-[11px]">
          <button
            type="button"
            onClick={() => handleSetMode('complete')}
            className={`px-2 py-0.5 font-medium rounded-xs transition-colors cursor-pointer ${
              activeMode === 'complete'
                ? 'bg-[#004643] text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Всесвіт: Реактор + Спектр + Хвиля"
          >
            Всесвіт
          </button>
          <button
            type="button"
            onClick={() => handleSetMode('reactor')}
            className={`px-2 py-0.5 font-medium rounded-xs transition-colors cursor-pointer ${
              activeMode === 'reactor'
                ? 'bg-[#004643] text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Кільцевий реактор"
          >
            Реактор
          </button>
          <button
            type="button"
            onClick={() => handleSetMode('cyber')}
            className={`px-2 py-0.5 font-medium rounded-xs transition-colors cursor-pointer ${
              activeMode === 'cyber'
                ? 'bg-[#004643] text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="LED-спектр частот"
          >
            Спектр
          </button>
          <button
            type="button"
            onClick={() => handleSetMode('wave')}
            className={`px-2 py-0.5 font-medium rounded-xs transition-colors cursor-pointer ${
              activeMode === 'wave'
                ? 'bg-[#004643] text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Лазерна аудіохвиля"
          >
            Хвиля
          </button>
        </div>

        {/* Color Palette Dots (desktop/tablet) */}
        <div className="hidden sm:flex items-center bg-black/70 backdrop-blur-md p-1 border border-white/10 rounded-md gap-1">
          <button
            type="button"
            onClick={() => setColorTheme('emerald')}
            className={`w-3.5 h-3.5 rounded-full border cursor-pointer transition-transform ${
              colorTheme === 'emerald' ? 'scale-125 border-white ring-1 ring-emerald-400' : 'border-transparent opacity-60'
            } bg-emerald-500`}
            title="Смарагд"
          />
          <button
            type="button"
            onClick={() => setColorTheme('plasma')}
            className={`w-3.5 h-3.5 rounded-full border cursor-pointer transition-transform ${
              colorTheme === 'plasma' ? 'scale-125 border-white ring-1 ring-cyan-400' : 'border-transparent opacity-60'
            } bg-cyan-400`}
            title="Плазма"
          />
          <button
            type="button"
            onClick={() => setColorTheme('synthwave')}
            className={`w-3.5 h-3.5 rounded-full border cursor-pointer transition-transform ${
              colorTheme === 'synthwave' ? 'scale-125 border-white ring-1 ring-pink-400' : 'border-transparent opacity-60'
            } bg-pink-500`}
            title="Синтвейв"
          />
          <button
            type="button"
            onClick={() => setColorTheme('solar')}
            className={`w-3.5 h-3.5 rounded-full border cursor-pointer transition-transform ${
              colorTheme === 'solar' ? 'scale-125 border-white ring-1 ring-amber-400' : 'border-transparent opacity-60'
            } bg-amber-500`}
            title="Сонячний"
          />
        </div>
      </div>

      {/* Bottom Left: Quiet Station & Live Indicator */}
      <div className="absolute bottom-2.5 left-3 z-10 pointer-events-none flex items-center gap-2 bg-black/60 backdrop-blur-sm px-2.5 py-1 border border-white/10 rounded-md text-xs text-white/90">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isPlaying ? 'bg-[#02c39a] animate-pulse' : 'bg-slate-400'
          }`}
        />
        <span className="font-semibold truncate max-w-[160px] sm:max-w-xs">{stationName}</span>
        {frequency && (
          <>
            <span className="text-white/40">·</span>
            <span className="font-mono text-white/70 text-[11px]">{frequency}</span>
          </>
        )}
        {genre && (
          <>
            <span className="text-white/40 hidden sm:inline">·</span>
            <span className="text-white/70 text-[11px] hidden sm:inline">{genre}</span>
          </>
        )}
      </div>
    </div>
  );
};
