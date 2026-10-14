import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  accentColor?: string;
  variant?: 'bars' | 'wave';
  barCount?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  accentColor = '#c5a880',
  variant = 'bars',
  barCount = 24,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const bars = Array.from({ length: barCount }, () => ({
      height: 10,
      targetHeight: 10,
      speed: 0.1 + Math.random() * 0.15,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      if (!isPlaying) {
        // Flat resting line
        ctx.fillStyle = 'rgba(100, 116, 139, 0.25)';
        const barWidth = (width / barCount) * 0.7;
        const gap = (width - barWidth * barCount) / (barCount + 1);
        for (let i = 0; i < barCount; i++) {
          const x = gap + i * (barWidth + gap);
          ctx.fillRect(x, height - 6, barWidth, 4);
        }
        return;
      }

      phase += 0.08;

      if (variant === 'wave') {
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        for (let x = 0; x < width; x += 2) {
          const y =
            height / 2 +
            Math.sin(x * 0.05 + phase) * 12 * Math.sin(phase * 0.5) +
            Math.sin(x * 0.02 - phase * 0.8) * 8;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Second subtle glow wave
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        for (let x = 0; x < width; x += 3) {
          const y =
            height / 2 +
            Math.sin(x * 0.04 - phase * 1.2) * 16 * Math.cos(phase * 0.3);
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `${accentColor}55`;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Bars
        const barWidth = (width / barCount) * 0.65;
        const gap = (width - barWidth * barCount) / (barCount + 1);

        for (let i = 0; i < barCount; i++) {
          const b = bars[i];
          if (Math.random() < 0.15) {
            // Harmonic wave formula with dynamic noise
            const wave = Math.sin(phase * 1.5 + (i / barCount) * Math.PI * 2);
            const secondary = Math.cos(phase * 2.8 + i * 0.4);
            const factor = Math.max(0.15, Math.abs(wave * 0.7 + secondary * 0.3));
            b.targetHeight = factor * (height - 8);
          }
          b.height += (b.targetHeight - b.height) * b.speed;

          const x = gap + i * (barWidth + gap);
          const currentH = Math.max(4, Math.min(height - 4, b.height));
          const y = height - currentH;

          // Gradient fill
          const grad = ctx.createLinearGradient(0, height, 0, y);
          grad.addColorStop(0, `${accentColor}99`);
          grad.addColorStop(1, accentColor);

          ctx.fillStyle = grad;
          ctx.fillRect(x, y, barWidth, currentH);
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, accentColor, variant, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={variant === 'wave' ? 240 : barCount * 8 + 16}
      height={48}
      className="w-full h-full block"
    />
  );
};
