import React, { useEffect, useRef } from 'react';

interface ThreatRadarProps {
  size?: number;
  threatCount?: number;
}

export const ThreatRadar: React.FC<ThreatRadarProps> = ({ size = 260, threatCount = 5 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;
    let animationFrameId: number;

    // Generate fixed blips with distance and angle
    const blips = Array.from({ length: threatCount }).map((_, i) => ({
      dist: 0.25 + Math.random() * 0.65,
      angle: (i * (2 * Math.PI / threatCount)) + Math.random() * 0.5,
      severity: i % 3 === 0 ? 'critical' : i % 2 === 0 ? 'warning' : 'info',
      size: 3 + Math.random() * 2,
    }));

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(cx, cy) - 8;

      ctx.clearRect(0, 0, w, h);

      // Draw radar background circles
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.lineWidth = 1;

      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (r / 4) * i, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.stroke();

      // Draw angle markers
      ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
      ctx.font = '9px monospace';
      ctx.fillText('000°', cx - 10, cy - r + 12);
      ctx.fillText('090°', cx + r - 25, cy + 3);
      ctx.fillText('180°', cx - 10, cy + r - 4);
      ctx.fillText('270°', cx - r + 4, cy + 3);

      // Draw sweep gradient cone
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const sweepGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      sweepGrad.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
      sweepGrad.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, -0.4, 0);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 240, 255, 0.18)';
      ctx.fill();

      // Sweep leading beam
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r, 0);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.stroke();

      ctx.restore();

      // Draw blips
      blips.forEach((blip) => {
        const bx = cx + Math.cos(blip.angle) * (r * blip.dist);
        const by = cy + Math.sin(blip.angle) * (r * blip.dist);

        // Check difference between sweep angle and blip angle
        let diff = angle - blip.angle;
        while (diff < 0) diff += 2 * Math.PI;
        while (diff > 2 * Math.PI) diff -= 2 * Math.PI;

        const intensity = Math.max(0.2, 1 - diff / (Math.PI * 0.8));

        ctx.beginPath();
        ctx.arc(bx, by, blip.size, 0, 2 * Math.PI);

        if (blip.severity === 'critical') {
          ctx.fillStyle = `rgba(239, 68, 68, ${intensity})`;
          ctx.shadowColor = '#ef4444';
        } else if (blip.severity === 'warning') {
          ctx.fillStyle = `rgba(245, 158, 11, ${intensity})`;
          ctx.shadowColor = '#f59e0b';
        } else {
          ctx.fillStyle = `rgba(0, 240, 255, ${intensity})`;
          ctx.shadowColor = '#00f0ff';
        }

        ctx.shadowBlur = 6 * intensity;
        ctx.fill();
      });

      angle = (angle + 0.02) % (2 * Math.PI);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [threatCount]);

  return (
    <div className="relative flex items-center justify-center p-2">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full bg-[#050a18] border border-cyan-500/30 shadow-[0_0_20px_rgba(0,240,255,0.15)]"
      />
      <div className="absolute top-3 left-4 text-[10px] font-mono text-cyan-400/70 tracking-widest">
        ACTIVE RADAR: SEC-SWEEP
      </div>
    </div>
  );
};
