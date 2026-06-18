// src/components/f1live/CircuitMap.jsx
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { TEAM_COLORS } from '../../constants/teamColors';

const rotatePoint = (x, y, angleDeg) => {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
  };
};

const CircuitMap = forwardRef(({ circuitLayout }, ref) => {
  const canvasRef = useRef(null);
  const positionsRef = useRef({});
  const animationFrameRef = useRef(null);
  const boundsRef = useRef(null);

  useEffect(() => {
    if (!circuitLayout?.trackPoints?.length) return;
    const rotation = circuitLayout.rotation || 0;
    const rotated = circuitLayout.trackPoints.map((p) => rotatePoint(p.x, p.y, rotation));
    const xs = rotated.map((p) => p.x);
    const ys = rotated.map((p) => p.y);
    boundsRef.current = {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
      rotatedTrack: rotated,
    };
  }, [circuitLayout]);

  const norm = (x, y, canvas) => {
    const b = boundsRef.current;
    if (!b) return { nx: 0, ny: 0 };
    const padding = 40;
    const scale = Math.min(
      (canvas.width - padding * 2) / (b.maxX - b.minX || 1),
      (canvas.height - padding * 2) / (b.maxY - b.minY || 1)
    );
    return {
      nx: padding + (x - b.minX) * scale,
      ny: canvas.height - padding - (y - b.minY) * scale,
    };
  };

  useImperativeHandle(ref, () => ({
    updatePositions: (newPositions) => {
      const now = performance.now();
      newPositions.forEach((pos) => {
        const existing = positionsRef.current[pos.driverNumber];
        positionsRef.current[pos.driverNumber] = {
          prevX: existing?.targetX ?? pos.x,
          prevY: existing?.targetY ?? pos.y,
          targetX: pos.x,
          targetY: pos.y,
          driverNumber: pos.driverNumber,
          teamName: pos.teamName,
          startTime: now,
          duration: 4000,
        };
      });
    },
  }));

  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas || !boundsRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      boundsRef.current.rotatedTrack.forEach((p, i) => {
        const { nx, ny } = norm(p.x, p.y, canvas);
        i === 0 ? ctx.moveTo(nx, ny) : ctx.lineTo(nx, ny);
      });
      ctx.closePath();
      ctx.stroke();

      circuitLayout?.corners?.forEach((corner) => {
        const rp = rotatePoint(corner.x, corner.y, circuitLayout.rotation || 0);
        const { nx, ny } = norm(rp.x, rp.y, canvas);
        ctx.fillStyle = '#444';
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(String(corner.number), nx, ny);
      });

      const now = performance.now();
      Object.values(positionsRef.current).forEach((p) => {
        const elapsed = now - p.startTime;
        const t = Math.min(elapsed / p.duration, 1);
        const easedT = t * (2 - t);

        const currentRaw = {
          x: p.prevX + (p.targetX - p.prevX) * easedT,
          y: p.prevY + (p.targetY - p.prevY) * easedT,
        };
        const rotated = rotatePoint(currentRaw.x, currentRaw.y, circuitLayout?.rotation || 0);
        const { nx, ny } = norm(rotated.x, rotated.y, canvas);

        const color = TEAM_COLORS[p.teamName] || '#E8002D';

        ctx.beginPath();
        ctx.arc(nx, ny, 8, 0, Math.PI * 2);
        ctx.fillStyle = color + '40';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(nx, ny, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(String(p.driverNumber), nx, ny - 10);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [circuitLayout]);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm">
          {circuitLayout?.circuitName || 'Circuit Map'}
        </h3>
        <span className="text-xs text-muted">Updates every 4s</span>
      </div>
      {!circuitLayout?.trackPoints?.length ? (
        <div className="flex items-center justify-center h-64 text-muted text-sm">
          No circuit data available
        </div>
      ) : (
        <canvas ref={canvasRef} width={500} height={400} className="w-full rounded-lg bg-surface" />
      )}
    </div>
  );
});

export default CircuitMap;