import { TEAM_COLORS } from '../../constants/teamColors';

const TimingTower = ({ positions, intervals }) => {
  const merged = positions.map((pos) => {
    const interval = intervals.find((i) => i.driverNumber === pos.driverNumber) || {};
    return { ...pos, gapToLeader: interval.gapToLeader };
  });

  return (
    <div className="rounded-2xl overflow-hidden"
         style={{
           background: 'linear-gradient(180deg, #0F1117 0%, #0A0B0F 100%)',
           border: '1px solid rgba(255,255,255,0.10)',
           boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
         }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
           style={{ borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,30,60,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 rounded-full bg-primary" />
          <h3 className="text-white font-black text-sm tracking-widest">LIVE TIMING</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-white/25 text-xs font-semibold">{merged.length} CARS</span>
        </div>
      </div>

      {/* Column headers */}
      {merged.length > 0 && (
        <div className="grid grid-cols-[28px_4px_1fr_72px] gap-3 px-5 py-2"
             style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-white/20 text-xs font-bold text-center">P</div>
          <div />
          <div className="text-white/20 text-xs font-bold">DRIVER</div>
          <div className="text-white/20 text-xs font-bold text-right">GAP</div>
        </div>
      )}

      {/* Rows */}
      {merged.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-3">🏎️</div>
          <p className="text-white/30 text-sm font-semibold">No live session data</p>
          <p className="text-white/15 text-xs mt-1">Timing appears when session starts</p>
        </div>
      ) : (
        merged.map((driver, idx) => {
          const isFirst = driver.position === 1 || idx === 0;
          const isSecond = driver.position === 2 || idx === 1;
          const isThird = driver.position === 3 || idx === 2;
          return (
            <div
              key={driver.driverNumber}
              className="grid grid-cols-[28px_4px_1fr_72px] items-center gap-3 px-5 py-3
                         transition-colors"
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: isFirst
                  ? 'rgba(250,204,21,0.05)'
                  : 'transparent',
              }}
            >
              {/* Position */}
              <div className={`text-center text-sm font-black ${
                isFirst ? 'text-yellow-400' :
                isSecond ? 'text-gray-300' :
                isThird ? 'text-amber-600' : 'text-white/25'
              }`}>
                {driver.position || idx + 1}
              </div>

              {/* Team bar */}
              <div
                className="h-7 rounded-full"
                style={{
                  width: '4px',
                  background: TEAM_COLORS[driver.teamName] || '#666',
                  boxShadow: `0 0 8px ${TEAM_COLORS[driver.teamName] || '#666'}60`,
                }}
              />

              {/* Driver */}
              <div className="min-w-0">
                <div className="text-white font-bold text-sm truncate leading-tight">
                  {driver.driverName || `#${driver.driverNumber}`}
                </div>
                <div className="text-white/30 text-xs truncate">{driver.teamName}</div>
              </div>

              {/* Gap */}
              <div className={`text-right text-xs font-black ${
                isFirst ? 'text-live' : 'text-white/50'
              }`}>
                {isFirst
                  ? 'LEADER'
                  : driver.gapToLeader
                    ? `+${driver.gapToLeader}`
                    : '—'}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TimingTower;