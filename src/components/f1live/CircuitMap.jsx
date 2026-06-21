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
      minX: Math.min(...xs), maxX: Math.max(...xs),
      minY: Math.min(...ys), maxY: Math.max(...ys),
      rotatedTrack: rotated,
    };
  }, [circuitLayout]);

  const norm = (x, y, canvas) => {
    const b = boundsRef.current;
    if (!b) return { nx: 0, ny: 0 };
    const padding = 52;
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

      // Track shadow/glow
      ctx.shadowColor = 'rgba(255,255,255,0.08)';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      boundsRef.current.rotatedTrack.forEach((p, i) => {
        const { nx, ny } = norm(p.x, p.y, canvas);
        i === 0 ? ctx.moveTo(nx, ny) : ctx.lineTo(nx, ny);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Track surface
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      boundsRef.current.rotatedTrack.forEach((p, i) => {
        const { nx, ny } = norm(p.x, p.y, canvas);
        i === 0 ? ctx.moveTo(nx, ny) : ctx.lineTo(nx, ny);
      });
      ctx.closePath();
      ctx.stroke();

      // Track center line (dashed)
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      boundsRef.current.rotatedTrack.forEach((p, i) => {
        const { nx, ny } = norm(p.x, p.y, canvas);
        i === 0 ? ctx.moveTo(nx, ny) : ctx.lineTo(nx, ny);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      // Corner numbers
      circuitLayout?.corners?.forEach((corner) => {
        const rp = rotatePoint(corner.x, corner.y, circuitLayout.rotation || 0);
        const { nx, ny } = norm(rp.x, rp.y, canvas);
        ctx.fillStyle = 'rgba(255,255,255,0.20)';
        ctx.font = 'bold 9px Montserrat, Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(corner.number), nx, ny);
      });

      // Driver dots — interpolated with glow
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
        const color = TEAM_COLORS[p.teamName] || '#FF1E3C';

        // Outer glow ring
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(nx, ny, 7, 0, Math.PI * 2);
        ctx.fillStyle = color + '30';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Solid dot
        ctx.beginPath();
        ctx.arc(nx, ny, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // White center
        ctx.beginPath();
        ctx.arc(nx, ny, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Driver number — pill background
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        const label = String(p.driverNumber);
        ctx.font = 'bold 9px Montserrat, Inter, sans-serif';
        const w = ctx.measureText(label).width + 6;
        ctx.beginPath();
        ctx.roundRect(nx - w / 2, ny - 24, w, 13, 3);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(label, nx, ny - 14);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [circuitLayout]);

  return (
    <div className="rounded-2xl overflow-hidden"
         style={{
           background: 'linear-gradient(160deg, #0D0F14 0%, #080A0D 100%)',
           border: '1px solid rgba(255,255,255,0.10)',
           boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
         }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
           style={{ borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(0,229,160,0.04)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 rounded-full bg-live" />
          <h3 className="text-white font-black text-sm tracking-widest">
            {circuitLayout?.circuitName
              ? circuitLayout.circuitName.toUpperCase()
              : 'CIRCUIT MAP'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="dot-live" />
          <span className="text-white/25 text-xs font-semibold">4s REFRESH</span>
        </div>
      </div>

      {/* Canvas */}
      {!circuitLayout?.trackPoints?.length ? (
        <div className="flex flex-col items-center justify-center h-80 text-center px-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center
                          text-3xl mb-4"
               style={{ background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)' }}>
            🗺️
          </div>
          <p className="text-white/35 text-sm font-semibold mb-1">
            Waiting for circuit data
          </p>
          <p className="text-white/15 text-xs">
            Track layout loads when a session is detected
          </p>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          width={600}
          height={450}
          className="w-full block"
          style={{ background: 'transparent' }}
        />
      )}
    </div>
  );
});

export default CircuitMap;