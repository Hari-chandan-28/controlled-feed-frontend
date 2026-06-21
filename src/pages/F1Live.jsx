import { useEffect, useRef, useState } from 'react';
import { createLiveF1Stream, getCircuitLayout } from '../services/api';
import CircuitMap from '../components/f1live/CircuitMap';
import TimingTower from '../components/f1live/TimingTower';
import PageWrapper from '../components/PageWrapper';

const F1Live = () => {
  const [positions, setPositions] = useState([]);
  const [intervals, setIntervals] = useState([]);
  const [circuitLayout, setCircuitLayout] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const mapRef = useRef(null);
  const lastCircuitKeyRef = useRef(null);

  useEffect(() => {
    let es = null;
    es = createLiveF1Stream(
      async (data) => {
        setConnected(true);
        setPositions(data.positions || []);
        setIntervals(data.intervals || []);
        setIsLive(data.isLive || false);
        setLastUpdate(new Date(data.timestamp).toLocaleTimeString());

        if (mapRef.current && data.positions?.length) {
          mapRef.current.updatePositions(data.positions);
        }

        if (data.circuitKey && data.circuitKey !== lastCircuitKeyRef.current) {
          lastCircuitKeyRef.current = data.circuitKey;
          try {
            const layoutRes = await getCircuitLayout(data.circuitKey, data.year);
            setCircuitLayout(layoutRes.data);
          } catch (err) {
            console.error('Circuit layout fetch failed:', err);
          }
        }
      },
      () => setConnected(false)
    );
    return () => { if (es) { es.close(); es = null; } };
  }, []);

  return (
    <PageWrapper beam="live">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 bg-primary rounded-full" />
              <h1 className="text-3xl font-black tracking-tight text-white">F1 Live</h1>
            </div>
            <p className="text-white/40 text-sm font-medium ml-4">
              Real-time race timing and driver positions
            </p>
          </div>

          {/* Connection status */}
          <div className="glass px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <div className="relative">
              <span className={`w-2.5 h-2.5 rounded-full block ${
                connected ? 'bg-live' : 'bg-primary'
              }`} />
              {connected && (
                <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-live
                                 animate-ping opacity-60" />
              )}
            </div>
            <span className={`text-xs font-bold ${
              connected ? 'text-live' : 'text-primary'
            }`}>
              {connected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
            {lastUpdate && (
              <span className="text-white/30 text-xs border-l border-white/10 pl-3">
                {lastUpdate}
              </span>
            )}
          </div>
        </div>

        {/* Not live banner */}
        {!isLive && (
          <div className="glass rounded-2xl px-6 py-5 mb-8 flex items-center gap-4
                          border border-white/8">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center
                            justify-center flex-shrink-0 text-lg">
              🏁
            </div>
            <div>
              <div className="text-white font-bold text-sm mb-0.5">
                No session currently running
              </div>
              <div className="text-white/40 text-xs">
                The page will populate automatically once a live session begins.
                Circuit shape and team data below are from the most recent session.
              </div>
            </div>
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <CircuitMap ref={mapRef} circuitLayout={circuitLayout} />
          <TimingTower positions={positions} intervals={intervals} />
        </div>

      </div>
    </PageWrapper>
  );
};

export default F1Live;