import { useState, useEffect } from 'react';
import {
  getDriverStandings, getConstructorStandings,
  getRaceResults, getRaceSchedule
} from '../services/api';
import { useSearchParams } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

export const TEAM_COLORS = {
  'Mercedes':       '#00D2BE',
  'Ferrari':        '#DC0000',
  'McLaren':        '#FF8700',
  'Red Bull Racing':'#1E41FF',
  'Aston Martin':   '#006F62',
  'Alpine':         '#FF5F9E',
  'Williams':       '#005AFF',
  'Racing Bulls':   '#4E7CFF',
  'Haas':           '#9C9FA2',
  'Audi':           '#F50537',
  'Cadillac':       '#FFD100',
};

const positionColor = (pos) => {
  if (pos === '1') return 'text-yellow-400';
  if (pos === '2') return 'text-gray-300';
  if (pos === '3') return 'text-amber-600';
  return 'text-white/40';
};

const Skeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="h-14 glass rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }} />
    ))}
  </div>
);

const F1Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'standings';
  const [drivers, setDrivers] = useState([]);
  const [constructors, setConstructors] = useState([]);
  const [results, setResults] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [d, c, r, s] = await Promise.all([
          getDriverStandings(), getConstructorStandings(),
          getRaceResults(), getRaceSchedule(),
        ]);
        setDrivers(d.data); setConstructors(c.data);
        setResults(r.data); setSchedule(s.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const tabs = [
    { key: 'standings',    label: 'Drivers' },
    { key: 'constructors', label: 'Constructors' },
    { key: 'results',      label: 'Last Race' },
    { key: 'schedule',     label: 'Schedule' },
  ];

  if (loading) return (
    <PageWrapper beam="f1">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="h-10 glass rounded-xl w-64 mb-8 animate-pulse" />
        <Skeleton />
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper beam="f1">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h1 className="text-3xl font-black tracking-tight text-white">
              F1 Dashboard
            </h1>
          </div>
          <p className="text-white/40 text-sm font-medium ml-4">
            2026 Formula 1 World Championship
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setSearchParams({ tab: t.key })}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap
                         transition-all ${
                tab === t.key
                  ? 'bg-primary text-white'
                  : 'glass text-white/50 hover:text-white hover:border-white/20'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── DRIVER STANDINGS ── */}
        {tab === 'standings' && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-black text-white text-sm tracking-tight">
                DRIVER CHAMPIONSHIP
              </h2>
              <span className="text-white/30 text-xs font-semibold">
                {drivers.length} drivers
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Pos', 'Driver', 'Team', 'Nat', 'Wins', 'Podiums', 'Pts'].map((h, i) => (
                      <th key={h}
                          className={`py-3 px-4 text-white/30 text-xs font-bold uppercase
                                     tracking-widest ${i > 3 ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((d, i) => (
                    <tr key={i}
                        className="border-b border-white/5 hover:bg-white/3 transition-colors"
                        style={{ background: d.position === '1' ? 'rgba(250,204,21,0.04)' : '' }}>
                      <td className={`py-4 px-4 font-black text-lg ${positionColor(d.position)}`}>
                        {d.position}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-1 h-6 rounded-full flex-shrink-0"
                            style={{ background: TEAM_COLORS[d.team] || '#666' }}
                          />
                          <span className="text-white font-semibold text-sm">{d.driverName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white/50 text-sm">{d.team}</td>
                      <td className="py-4 px-4 text-white/50 text-sm">{d.nationality}</td>
                      <td className="py-4 px-4 text-right text-white text-sm font-semibold">{d.wins}</td>
                      <td className="py-4 px-4 text-right text-white text-sm font-semibold">{d.podiums}</td>
                      <td className="py-4 px-4 text-right font-black text-primary">{d.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CONSTRUCTOR STANDINGS ── */}
        {tab === 'constructors' && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-black text-white text-sm tracking-tight">
                CONSTRUCTOR CHAMPIONSHIP
              </h2>
              <span className="text-white/30 text-xs font-semibold">
                {constructors.length} teams
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Pos', 'Team', 'Nationality', 'Wins', 'Podiums', 'Pts'].map((h, i) => (
                      <th key={h}
                          className={`py-3 px-4 text-white/30 text-xs font-bold uppercase
                                     tracking-widest ${i > 2 ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {constructors.map((c, i) => (
                    <tr key={i}
                        className="border-b border-white/5 hover:bg-white/3 transition-colors"
                        style={{ background: c.position === '1' ? 'rgba(250,204,21,0.04)' : '' }}>
                      <td className={`py-4 px-4 font-black text-lg ${positionColor(c.position)}`}>
                        {c.position}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ background: TEAM_COLORS[c.teamName] || '#666' }}
                          />
                          <span className="text-white font-semibold text-sm">{c.teamName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white/50 text-sm">{c.nationality}</td>
                      <td className="py-4 px-4 text-right text-white text-sm font-semibold">{c.wins}</td>
                      <td className="py-4 px-4 text-right text-white text-sm font-semibold">{c.podiums}</td>
                      <td className="py-4 px-4 text-right font-black text-primary">{c.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── LAST RACE RESULTS ── */}
        {tab === 'results' && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="font-black text-white text-sm tracking-tight">LATEST RACE RESULTS</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Pos', 'Driver', 'Team', 'Time', 'Fastest Lap', 'Pts'].map((h, i) => (
                      <th key={h}
                          className={`py-3 px-4 text-white/30 text-xs font-bold uppercase
                                     tracking-widest ${i > 2 ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i}
                        className="border-b border-white/5 hover:bg-white/3 transition-colors"
                        style={{ background: r.position === '1' ? 'rgba(250,204,21,0.04)' : '' }}>
                      <td className={`py-4 px-4 font-black text-lg ${positionColor(r.position)}`}>
                        {r.position}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-1 h-6 rounded-full flex-shrink-0"
                            style={{ background: TEAM_COLORS[r.team] || '#666' }}
                          />
                          <span className="text-white font-semibold text-sm">{r.driverName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white/50 text-sm">{r.team}</td>
                      <td className="py-4 px-4 text-right text-white/60 text-sm font-mono">
                        {r.time || 'DNF'}
                      </td>
                      <td className="py-4 px-4 text-right text-white/60 text-sm font-mono">
                        {r.fastestLap || '—'}
                      </td>
                      <td className="py-4 px-4 text-right font-black text-primary">{r.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SCHEDULE ── */}
        {tab === 'schedule' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedule.map((race, i) => {
              const isPast = new Date(race.date) < new Date();
              return (
                <div
                  key={i}
                  className={`glass rounded-2xl p-5 transition-all hover:-translate-y-0.5
                             duration-200 ${isPast ? 'opacity-50' : 'hover:border-white/20'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-2xl font-black text-primary">R{i + 1}</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                      isPast
                        ? 'bg-white/5 text-white/30'
                        : 'bg-primary/15 text-primary'
                    }`}>
                      {isPast ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-sm mb-1 leading-snug">
                    {race.raceName}
                  </h3>
                  <p className="text-white/40 text-xs mb-4">{race.circuit}</p>
                  <div className="flex items-center justify-between text-xs border-t border-white/5 pt-3">
                    <span className="text-white/40 font-medium">📍 {race.country}</span>
                    <span className="text-white font-bold">{race.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </PageWrapper>
  );
};

export default F1Dashboard;