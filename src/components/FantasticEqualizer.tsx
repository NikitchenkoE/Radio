import React, { useEffect, useRef } from 'react';

interface FantasticEqualizerProps {
  isPlaying: boolean;
  stationName: string;
  frequency?: string;
  genre?: string;
  accentColor?: string;
}

export const FantasticEqualizer: React.FC<FantasticEqualizerProps> = ({
  isPlaying,
  stationName,
  frequency = '101.5 FM',
  genre = 'Radio Live',
  accentColor = '#10b981',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays smoothly
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = (rect.width || 800) * dpr;
    canvas.height = (rect.height || 360) * dpr;
    ctx.scale(dpr, dpr);

    const BAR_COUNT = 44;
    const bars = Array.from({ length: BAR_COUNT }, (_, i) => ({
      height: 12,
      targetHeight: 12,
      peakHeight: 14,
      peakTimer: 0,
      speed: 0.12 + (i % 5) * 0.02,
    }));

    let phase = 0;

    const render = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);

      // 1. Futuristic Sci-Fi Cybernetic Background Grid
      ctx.fillStyle = '#060a0f';
      ctx.fillRect(0, 0, w, h);

      // Subtle horizontal grid lines
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.07)';
      ctx.lineWidth = 1;
      const gridRows = 8;
      for (let r = 1; r < gridRows; r++) {
        const y = (h / gridRows) * r;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Vertical subtle grid dividers
      const gridCols = 12;
      for (let c = 1; c < gridCols; c++) {
        const x = (w / gridCols) * c;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // 2. Cosmic Ambient Radial Glow behind the center
      const centerX = w / 2;
      const centerY = h * 0.65;
      const radialGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        Math.min(w, h) * 0.6
      );
      if (isPlaying) {
        radialGrad.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
        radialGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
        radialGrad.addColorStop(1, 'rgba(6, 10, 15, 0)');
      } else {
        radialGrad.addColorStop(0, 'rgba(71, 85, 105, 0.1)');
        radialGrad.addColorStop(1, 'rgba(6, 10, 15, 0)');
      }
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, w, h);

      phase += isPlaying ? 0.07 : 0.015;

      // 3. Central Oscilloscope Sinusoidal Wave
      if (isPlaying) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, h * 0.42);
        for (let x = 0; x < w; x += 4) {
          const wave1 = Math.sin(x * 0.015 + phase * 1.6) * 22;
          const wave2 = Math.cos(x * 0.035 - phase * 0.9) * 12;
          const wave3 = Math.sin(x * 0.007 + phase) * 16;
          const y = h * 0.42 + wave1 + wave2 + wave3;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Secondary laser wave
        ctx.beginPath();
        ctx.moveTo(0, h * 0.42);
        for (let x = 0; x < w; x += 3) {
          const y =
            h * 0.42 +
            Math.sin(x * 0.02 - phase * 1.8) * 18 * Math.cos(phase * 0.4);
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // 4. Equalizer Spectrum Bars with Peaks
      const barBottom = h - 28;
      const barTopLimit = 40;
      const usableHeight = barBottom - barTopLimit;
      const barTotalWidth = w - 40;
      const barWidth = Math.max(3, (barTotalWidth / BAR_COUNT) * 0.68);
      const barGap = (barTotalWidth - barWidth * BAR_COUNT) / (BAR_COUNT - 1);

      for (let i = 0; i < BAR_COUNT; i++) {
        const b = bars[i];
        if (isPlaying) {
          // Dynamic musical frequency model: Bass on left, mids center, treble right
          const centerDist = Math.abs(i - BAR_COUNT * 0.35) / BAR_COUNT;
          const bassBoost = i < BAR_COUNT * 0.3 ? 1.3 : 1.0;
          const sinHarmonic1 = Math.sin(phase * 1.4 + i * 0.32);
          const sinHarmonic2 = Math.cos(phase * 2.1 + i * 0.55);
          const sinHarmonic3 = Math.sin(phase * 3.4 - i * 0.2);

          const rawFactor =
            Math.abs(sinHarmonic1 * 0.55 + sinHarmonic2 * 0.3 + sinHarmonic3 * 0.15) *
            bassBoost *
            (1.15 - centerDist * 0.4);

          // Occasional energetic spikes
          const spike = Math.random() < 0.08 ? 1.25 : 1.0;
          b.targetHeight = Math.min(usableHeight, Math.max(8, rawFactor * usableHeight * spike));
        } else {
          // Idle ambient resting wave
          b.targetHeight = 8 + Math.sin(phase + i * 0.3) * 5;
        }

        b.height += (b.targetHeight - b.height) * b.speed;

        // Peak drop logic
        if (b.height >= b.peakHeight) {
          b.peakHeight = b.height;
          b.peakTimer = 18; // frames before dropping
        } else {
          if (b.peakTimer > 0) {
            b.peakTimer--;
          } else {
            b.peakHeight = Math.max(b.height, b.peakHeight - 1.8);
          }
        }

        const x = 20 + i * (barWidth + barGap);
        const y = barBottom - b.height;

        // Bar Gradient: Futuristic Cyberpunk Palette (Emerald -> Cyan -> Electric Amber at top)
        const barGrad = ctx.createLinearGradient(0, barBottom, 0, barBottom - usableHeight);
        if (isPlaying) {
          barGrad.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
          barGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.85)');
          barGrad.addColorStop(0.8, 'rgba(6, 182, 212, 0.95)');
          barGrad.addColorStop(1, 'rgba(251, 191, 36, 1)'); // peak warning color
        } else {
          barGrad.addColorStop(0, 'rgba(71, 85, 105, 0.25)');
          barGrad.addColorStop(1, 'rgba(148, 163, 184, 0.4)');
        }

        ctx.fillStyle = barGrad;
        ctx.fillRect(x, y, barWidth, b.height);

        // Peak indicator line
        const peakY = barBottom - b.peakHeight;
        ctx.fillStyle = isPlaying ? '#38bdf8' : 'rgba(148, 163, 184, 0.5)';
        ctx.fillRect(x, Math.max(barTopLimit - 4, peakY - 2), barWidth, 2);

        // Subtle mirror reflection below baseline
        ctx.fillStyle = isPlaying ? 'rgba(16, 185, 129, 0.12)' : 'rgba(71, 85, 105, 0.05)';
        ctx.fillRect(x, barBottom + 3, barWidth, Math.min(18, b.height * 0.22));
      }

      // Baseline separator line
      ctx.strokeStyle = isPlaying ? 'rgba(16, 185, 129, 0.5)' : 'rgba(71, 85, 105, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(16, barBottom);
      ctx.lineTo(w - 16, barBottom);
      ctx.stroke();

      // 5. Sci-Fi Frequency Labels at bottom
      ctx.fillStyle = isPlaying ? 'rgba(148, 163, 184, 0.7)' : 'rgba(100, 116, 139, 0.5)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      const freqLabels = ['32Hz', '64Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'];
      freqLabels.forEach((label, idx) => {
        const xPos = 20 + (idx / (freqLabels.length - 1)) * barTotalWidth;
        ctx.fillText(label, xPos, h - 8);
      });

      // 6. Stereo VU Level Meters in Top Corners (LEFT & RIGHT)
      const vuWidth = 72;
      const vuHeight = 5;

      // Left VU
      const leftLevel = isPlaying
        ? Math.min(1, Math.max(0.15, Math.abs(Math.sin(phase * 2.2)) * 0.75 + 0.2))
        : 0.08;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(20, 22, vuWidth, vuHeight);
      ctx.fillStyle = isPlaying ? '#10b981' : '#475569';
      ctx.fillRect(20, 22, vuWidth * leftLevel, vuHeight);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`CH-L ${Math.round(leftLevel * 100)}%`, 20, 16);

      // Right VU
      const rightLevel = isPlaying
        ? Math.min(1, Math.max(0.15, Math.abs(Math.cos(phase * 1.9)) * 0.8 + 0.15))
        : 0.08;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(w - 20 - vuWidth, 22, vuWidth, vuHeight);
      ctx.fillStyle = isPlaying ? '#06b6d4' : '#475569';
      ctx.fillRect(w - 20 - vuWidth, 22, vuWidth * rightLevel, vuHeight);
      ctx.textAlign = 'right';
      ctx.fillText(`CH-R ${Math.round(rightLevel * 100)}%`, w - 20, 16);

      animRef.current = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      canvas.width = (r.width || 800) * dpr;
      canvas.height = (r.height || 360) * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying, accentColor]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#060a0f] flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-pointer"
        title={isPlaying ? 'Натисніть для паузи' : 'Натисніть для відтворення'}
      />
    </div>
  );
};
