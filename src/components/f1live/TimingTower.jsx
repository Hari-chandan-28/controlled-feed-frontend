// src/components/f1live/TimingTower.jsx
import { TEAM_COLORS } from '../../constants/teamColors';

const TimingTower = ({ positions, intervals }) => {
  const merged = positions.map((pos) => {
    const interval = intervals.find((i) => i.driverNumber === pos.driverNumber) || {};
    return { ...pos, gapToLeader: interval.gapToLeader };
  });

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-white font-semibold text-sm">LIVE TIMING</h3>
        <span className="text-xs text-muted">{merged.length} cars</span>
      </div>

      {merged.length === 0 ? (
        <div className="p-8 text-center text-muted text-sm">
          No live session data right now
        </div>
      ) : (
        merged.map((driver) => (
          <div
            key={driver.driverNumber}
            className="grid grid-cols-[32px_3px_1fr_80px] items-center gap-3 px-5 py-3 border-b border-border/40 hover:bg-white/5 transition"
          >
            <div className="text-center font-mono text-sm text-muted">{driver.position}</div>
            <div
              className="w-[3px] h-6 rounded-sm"
              style={{ background: TEAM_COLORS[driver.teamName] || '#666' }}
            />
            <div>
              <div className="text-white text-sm font-medium">{driver.driverName}</div>
              <div className="text-muted text-xs">{driver.teamName}</div>
            </div>
            <div className="text-right font-mono text-xs text-white">
              {driver.gapToLeader ? `+${driver.gapToLeader}` : driver.position === 1 ? 'LEADER' : '—'}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TimingTower;