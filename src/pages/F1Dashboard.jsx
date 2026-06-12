import  { useState, useEffect } from 'react';
import {
  getDriverStandings,
  getConstructorStandings,
  getRaceResults,
  getRaceSchedule
} from '../services/api';

const F1Dashboard = () => {
  const [tab, setTab] = useState('standings');
  const [drivers, setDrivers] = useState([]);
  const [constructors, setConstructors] = useState([]);
  const [results, setResults] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all F1 data at once
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [d, c, r, s] = await Promise.all([
          getDriverStandings(),
          getConstructorStandings(),
          getRaceResults(),
          getRaceSchedule(),
        ]);
        setDrivers(d.data);
        setConstructors(c.data);
        setResults(r.data);
        setSchedule(s.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Color based on position
  const positionColor = (pos) => {
    if (pos === '1') return 'text-yellow-400';
    if (pos === '2') return 'text-gray-300';
    if (pos === '3') return 'text-amber-600';
    return 'text-muted';
  };

  const tabs = [
    { key: 'standings', label: 'Driver Standings' },
    { key: 'constructors', label: 'Constructors' },
    { key: 'results', label: 'Last Race' },
    { key: 'schedule', label: 'Schedule' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center pt-16">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-5xl">🏎️</span>
          <div>
            <h1 className="text-3xl font-display tracking-wider text-white">F1 DASHBOARD</h1>
            <p className="text-muted text-sm">2025 Formula 1 World Championship</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.key
                  ? 'bg-primary text-white'
                  : 'bg-surface text-muted hover:text-white border border-border'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* DRIVER STANDINGS TAB */}
        {tab === 'standings' && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-white">Driver Championship Standings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-muted text-xs uppercase">Pos</th>
                    <th className="text-left p-4 text-muted text-xs uppercase">Driver</th>
                    <th className="text-left p-4 text-muted text-xs uppercase">Team</th>
                    <th className="text-left p-4 text-muted text-xs uppercase">Nationality</th>
                    <th className="text-right p-4 text-muted text-xs uppercase">Wins</th>
                    <th className="text-right p-4 text-muted text-xs uppercase">Podiums</th>
                    <th className="text-right p-4 text-muted text-xs uppercase">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((d, i) => (
                    <tr
                      key={i}
                      className={`border-b border-border/50 hover:bg-surface/50 transition-colors ${
                        d.position === '1' ? 'bg-yellow-400/5' : ''
                      }`}
                    >
                      <td className={`p-4 font-bold text-lg ${positionColor(d.position)}`}>
                        {d.position}
                      </td>
                      <td className="p-4 text-white font-medium">{d.driverName}</td>
                      <td className="p-4 text-muted text-sm">{d.team}</td>
                      <td className="p-4 text-muted text-sm">{d.nationality}</td>
                      <td className="p-4 text-right text-white text-sm">{d.wins}</td>
                      <td className="p-4 text-right text-white text-sm">{d.podiums}</td>
                      <td className="p-4 text-right font-bold text-primary">{d.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONSTRUCTOR STANDINGS TAB */}
        {tab === 'constructors' && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-white">Constructor Championship Standings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-muted text-xs uppercase">Pos</th>
                    <th className="text-left p-4 text-muted text-xs uppercase">Team</th>
                    <th className="text-left p-4 text-muted text-xs uppercase">Nationality</th>
                    <th className="text-right p-4 text-muted text-xs uppercase">Wins</th>
                    <th className="text-right p-4 text-muted text-xs uppercase">Podiums</th>
                    <th className="text-right p-4 text-muted text-xs uppercase">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {constructors.map((c, i) => (
                    <tr
                      key={i}
                      className={`border-b border-border/50 hover:bg-surface/50 transition-colors ${
                        c.position === '1' ? 'bg-yellow-400/5' : ''
                      }`}
                    >
                      <td className={`p-4 font-bold text-lg ${positionColor(c.position)}`}>
                        {c.position}
                      </td>
                      <td className="p-4 text-white font-medium">{c.teamName}</td>
                      <td className="p-4 text-muted text-sm">{c.nationality}</td>
                      <td className="p-4 text-right text-white text-sm">{c.wins}</td>
                      <td className="p-4 text-right text-white text-sm">{c.podiums}</td>
                      <td className="p-4 text-right font-bold text-primary">{c.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LAST RACE RESULTS TAB */}
        {tab === 'results' && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-white">Latest Race Results</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-muted text-xs uppercase">Pos</th>
                    <th className="text-left p-4 text-muted text-xs uppercase">Driver</th>
                    <th className="text-left p-4 text-muted text-xs uppercase">Team</th>
                    <th className="text-left p-4 text-muted text-xs uppercase">Time</th>
                    <th className="text-left p-4 text-muted text-xs uppercase">Fastest Lap</th>
                    <th className="text-right p-4 text-muted text-xs uppercase">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr
                      key={i}
                      className={`border-b border-border/50 hover:bg-surface/50 transition-colors ${
                        r.position === '1' ? 'bg-yellow-400/5' : ''
                      }`}
                    >
                      <td className={`p-4 font-bold text-lg ${positionColor(r.position)}`}>
                        {r.position}
                      </td>
                      <td className="p-4 text-white font-medium">{r.driverName}</td>
                      <td className="p-4 text-muted text-sm">{r.team}</td>
                      <td className="p-4 text-muted text-sm font-mono">{r.time || 'DNF'}</td>
                      <td className="p-4 text-muted text-sm font-mono">{r.fastestLap || '-'}</td>
                      <td className="p-4 text-right font-bold text-primary">{r.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SCHEDULE TAB */}
        {tab === 'schedule' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedule.map((race, i) => {
              const isPast = new Date(race.date) < new Date();
              return (
                <div
                  key={i}
                  className={`card-hover bg-card border rounded-xl p-5 ${
                    isPast ? 'border-border opacity-60' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl font-display text-primary">R{i + 1}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isPast
                        ? 'bg-surface text-muted'
                        : 'bg-primary/20 text-primary'
                    }`}>
                      {isPast ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold mb-1 text-sm">{race.raceName}</h3>
                  <p className="text-muted text-xs mb-3">{race.circuit}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">📍 {race.country}</span>
                    <span className="text-white font-medium">{race.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default F1Dashboard;