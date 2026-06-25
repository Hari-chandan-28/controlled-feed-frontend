import { useState, useEffect } from 'react';
import {
  getDriverStandings, getConstructorStandings,
  getRaceResults, getRaceSchedule
} from '../services/api';
import { useSearchParams } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { getRaceDetail } from '../services/api';

// IST conversion: UTC → India Standard Time (UTC+5:30)
const toIST = (dateStr, timeStr) => {
  if (!dateStr) return '—';
  try {
    const utcString = timeStr
      ? `${dateStr}T${timeStr.replace('Z', '')}Z`
      : `${dateStr}T00:00:00Z`;
    const date = new Date(utcString);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
};

const positionEmoji = (pos) => {
  if (pos === 1) return '🥇';
  if (pos === 2) return '🥈';
  if (pos === 3) return '🥉';
  return `${pos}.`;
};

const sessionColor = (name) => {
  switch (name) {
    case 'Race':       return '#FF1E3C';
    case 'Qualifying': return '#F2994A';
    case 'Sprint Qualifying': return '#F2994A';
    case 'Sprint':     return '#00E5A0';
    default:           return 'rgba(255,255,255,0.3)';
  }
};

const RaceDetailModal = ({ race, isPast, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';

    // Extract round number from race object
    // Your schedule has round index from the map — pass it in
    getRaceDetail(new Date(race.date).getFullYear(), race.round)
      .then(res => setDetail(res.data))
      .catch(err => console.error('Race detail error:', err))
      .finally(() => setLoading(false));

    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    // Backdrop — pure gradient, no solid background components
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-20"
      style={{
        background: 'rgba(8,9,12,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
      onClick={onClose}
    >
      {/* Modal — transparent, only gradient border + blur */}
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
          maxHeight: 'calc(100vh - 100px)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex gap-2 group">
            <div onClick={onClose}
                 className="relative w-3 h-3 rounded-full bg-[#FF5F57] cursor-pointer
                            flex items-center justify-center">
              <span className="absolute opacity-0 group-hover:opacity-100 text-[#800000]
                               text-[8px] font-black transition-opacity">✕</span>
            </div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="text-center">
            <div className="text-white font-black text-sm">
              {detail?.raceName || race.raceName}
            </div>
            <div className="text-white/30 text-xs mt-0.5">
              📍 {detail?.circuit || race.circuit} · {detail?.country || race.country}
            </div>
          </div>
          <button onClick={onClose}
                  className="text-white/25 hover:text-white text-xs transition-colors">
            ESC
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent
                              rounded-full animate-spin" />
            </div>
          )}

          {detail && !loading && isPast && (
            <>
              {/* Podium */}
              {detail.podium?.length > 0 && (
                <div>
                  <div className="text-xs font-black text-white/30 tracking-widest mb-3">
                    PODIUM
                  </div>
                  <div className="space-y-2">
                    {detail.podium.slice(0, 3).map((p) => (
                      <div
                        key={p.position}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.04)',
                                 border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <span className="text-xl w-8">{positionEmoji(p.position)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-bold text-sm">{p.driverName}</div>
                          <div className="text-white/40 text-xs">{p.team}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-xs font-mono">{p.time}</div>
                          <div className="text-primary text-xs font-bold">{p.points} pts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fastest lap */}
              {detail.fastestLap && (
                <div>
                  <div className="text-xs font-black text-white/30 tracking-widest mb-3">
                    FASTEST LAP
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                       style={{ background: 'rgba(242,153,74,0.08)',
                                border: '1px solid rgba(242,153,74,0.2)' }}>
                    <span className="text-xl">⚡</span>
                    <div className="flex-1">
                      <div className="text-white font-bold text-sm">
                        {detail.fastestLap.driverName}
                      </div>
                      <div className="text-white/40 text-xs">{detail.fastestLap.team}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-orange font-black text-sm font-mono">
                        {detail.fastestLap.lapTime}
                      </div>
                      <div className="text-white/30 text-xs">
                        Lap {detail.fastestLap.lapNumber}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Fastest pit stop */}
              {detail.fastestPitStop && (
                <div>
                  <div className="text-xs font-black text-white/30 tracking-widest mb-3">
                    FASTEST PIT STOP
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                       style={{ background: 'rgba(0,229,160,0.06)',
                                border: '1px solid rgba(0,229,160,0.2)' }}>
                    <span className="text-xl">🔧</span>
                    <div className="flex-1">
                      <div className="text-white font-bold text-sm">
                        {detail.fastestPitStop.driverName}
                      </div>
                      <div className="text-white/40 text-xs">
                        Stop #{detail.fastestPitStop.stop} · Lap {detail.fastestPitStop.lap}
                      </div>
                    </div>
                    <div className="text-live font-black text-sm font-mono">
                      {detail.fastestPitStop.duration}s
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Session times — shown for both past and upcoming */}
          {detail && !loading && detail.sessions?.length > 0 && (
            <div>
              <div className="text-xs font-black text-white/30 tracking-widest mb-3">
                {isPast ? 'SESSION TIMES' : 'UPCOMING SESSIONS · IST'}
              </div>
              <div className="space-y-2">
                {detail.sessions.map((session) => (
                  <div
                    key={session.name}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.03)',
                             border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-1.5 h-6 rounded-full"
                        style={{ background: sessionColor(session.name) }}
                      />
                      <span className="text-white font-semibold text-sm">
                        {session.name}
                      </span>
                      {session.name === 'Sprint' && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold
                                         bg-live/15 text-live">
                          SPRINT
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-white text-xs font-semibold">
                        {toIST(session.date, session.time)}
                      </div>
                      <div className="text-white/25 text-xs">IST</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export const TEAM_COLORS = {
  'Mercedes':         '#00D2BE',
  'Ferrari':          '#DC0000',
  'McLaren':          '#FF8700',
  'Red Bull':         '#1E41FF',
  'Aston Martin':     '#006F62',
  'Alpine F1 Team':   '#FF5F9E',
  'Williams':         '#005AFF',
  'RB F1 Team':       '#4E7CFF',
  'Haas F1 Team':     '#9C9FA2',
  'Audi':             '#F50537',
  'Cadillac F1 Team': '#FFD100',
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
  const [selectedRace, setSelectedRace] = useState(null);

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
<div className="w-1 h-8 bg-violet-700 rounded-full" />
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
                        style={{ background: i === '0' ? 'rgba(250,204,21,0.04)' : '' }}>
                      <td className={`py-4 px-4 font-black text-lg ${positionColor(String(i + 1))}`}>
                        {i+1}
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
    <>
      {selectedRace && (
        <RaceDetailModal
          race={selectedRace}
          isPast={new Date(selectedRace.date) < new Date()}
          onClose={() => setSelectedRace(null)}
        />
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedule.map((race, i) => {
          const isPast = new Date(race.date) < new Date();
          return (
            <div
              key={i}
              onClick={() => setSelectedRace({ ...race, round: i + 1 })}
              className={`glass rounded-2xl p-5 cursor-pointer transition-all
                        hover:-translate-y-0.5 duration-200
                        ${isPast ? 'opacity-60 hover:opacity-80' : 'hover:border-white/20'}`}
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
              <div className="flex items-center justify-between text-xs border-t
                              border-white/5 pt-3">
                <span className="text-white/40">📍 {race.country}</span>
                <span className="text-white font-bold">{race.date}</span>
              </div>
              <div className="mt-3 text-white/25 text-xs text-right">
                {isPast ? 'Tap for results →' : 'Tap for schedule →'}
              </div>
            </div>
          );
        })}
      </div>
    </>
  )}
      </div>
    </PageWrapper>
  );
};

export default F1Dashboard;