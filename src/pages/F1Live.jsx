// src/pages/F1Live.jsx
import { useEffect, useRef, useState } from 'react';
import {
  createLiveF1Stream,
  getCircuitLayout,
  getCurrentDrivers,
} from '../services/api';
import CircuitMap from '../components/f1live/CircuitMap';
import TimingTower from '../components/f1live/TimingTower';

const F1Live = () => {
  const [positions, setPositions] = useState([]);
  const [intervals, setIntervals] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [circuitLayout, setCircuitLayout] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const mapRef = useRef(null);
  const lastCircuitKeyRef = useRef(null);
  const eventSourceRef = useRef(null);

  // Load current driver grid once on mount — doesn't need to be live-updated
  useEffect(() => {
    getCurrentDrivers()
      .then((res) => setDrivers(res.data))
      .catch((err) => console.error('Failed to load drivers:', err));
  }, []);

  // Open the SSE connection
  useEffect(() => {
    const es = createLiveF1Stream(
      async (data) => {
        setConnected(true);
        setPositions(data.positions || []);
        setIntervals(data.intervals || []);
        setIsLive(data.isLive || false);
        setLastUpdate(new Date(data.timestamp).toLocaleTimeString());

        if (mapRef.current && data.positions?.length) {
          mapRef.current.updatePositions(data.positions);
        }

        // Only refetch circuit layout when the circuit actually changes
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
    eventSourceRef.current = es;

    return () => es.close();
  }, []);

  return (
    <div className="min-h-screen bg-dark px-6 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-bold">F1 Live</h1>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-500'}`} />
          {connected ? 'Connected' : 'Disconnected'}
          {lastUpdate && <span>· Last update {lastUpdate}</span>}
        </div>
      </div>

      {!isLive && (
        <div className="bg-card border border-border rounded-xl p-4 mb-6 text-sm text-muted">
          No live session is currently running. You're connected — this page will
          populate automatically once a session goes live. Track shape and driver
          grid below are real, pulled from the most recent session.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <CircuitMap ref={mapRef} circuitLayout={circuitLayout} drivers={drivers} />
        <TimingTower positions={positions} intervals={intervals} drivers={drivers} />
      </div>
    </div>
  );
};

export default F1Live;