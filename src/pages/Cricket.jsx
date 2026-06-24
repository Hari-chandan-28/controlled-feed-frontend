import { useState, useEffect } from 'react';
import { getLiveMatches, getUpcomingMatches, getScorecard } from '../services/api';
import { useSearchParams } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

const isLiveMatch = (match) =>
  match.status?.toLowerCase().includes('live') ||
  match.status?.toLowerCase().includes('progress');
// Add this helper at the top of Cricket.jsx
const extractPlayerName = (playerStr) => {
  if (!playerStr) return 'Unknown';
  // Handle the "{id=..., name=Musaddiq Ahmed, cricbuzz_id=...}" format
  if (playerStr.includes('name=')) {
    const match = playerStr.match(/name=([^,}]+)/);
    return match ? match[1].trim() : playerStr;
  }
  return playerStr;
};

// Split batting/bowling into two innings based on team count
// First half = 1st innings, second half = 2nd innings
const splitInnings = (scorecard) => {
  if (!scorecard) return [];
  const { batting, bowling, name } = scorecard;
  if (!batting?.length) return [];

  // Try to split by halfway point (equal teams in a match)
  // CricAPI returns both teams' batting concatenated
  const mid = Math.ceil(batting.length / 2);
  const teams = name?.split(' vs ') || ['Team 1', 'Team 2'];

  return [
    {
      team: teams[0]?.split(',')[0]?.trim() || '1st Innings',
      batting: batting.slice(0, mid),
      bowling: bowling?.slice(0, Math.ceil((bowling?.length || 0) / 2)) || [],
    },
    {
      team: teams[1]?.split(',')[0]?.trim() || '2nd Innings',
      batting: batting.slice(mid),
      bowling: bowling?.slice(Math.ceil((bowling?.length || 0) / 2)) || [],
    },
  ].filter(inn => inn.batting.length > 0);
};
// ── Match Card ────────────────────────────────────────────
const MatchCard = ({ match, onClick }) => (
  <div
    onClick={onClick}
    className="glass rounded-2xl p-5 cursor-pointer transition-all duration-200
               hover:-translate-y-1 hover:border-white/20 hover:shadow-lg
               hover:shadow-black/30 active:scale-98"
  >
    <div className="flex items-center justify-between mb-3">
      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
        isLiveMatch(match)
          ? 'bg-live/15 text-live'
          : 'bg-white/5 text-white/40'
      }`}>
        {isLiveMatch(match) ? (
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse inline-block" />
            LIVE
          </span>
        ) : match.status?.slice(0, 20)}
      </span>
      <span className="text-white/30 text-xs font-bold uppercase tracking-widest">
        {match.matchType}
      </span>
    </div>

    <h3 className="text-white font-bold text-sm mb-4 leading-snug">{match.name}</h3>

    {match.scores?.length > 0 && (
      <div className="space-y-2 mb-3">
        {match.scores.map((score, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-white/40 text-xs truncate max-w-[140px]">{score.inning}</span>
            <span className="text-white font-bold text-sm">
              {score.runs}/{score.wickets}
              <span className="text-white/40 text-xs ml-1 font-normal">({score.overs})</span>
            </span>
          </div>
        ))}
      </div>
    )}

    <div className="flex items-center justify-between pt-3 border-t border-white/5">
      <span className="text-white/30 text-xs truncate">📍 {match.venue}</span>
      <span className="text-primary text-xs font-semibold">Tap for scorecard →</span>
    </div>
  </div>
);

// Remove splitInnings helper entirely — no longer needed

// Update ScorecardModal to use scorecard.innings directly
const ScorecardModal = ({ scorecard, loading, onClose }) => {
  const [activeInnings, setActiveInnings] = useState(0);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Use real innings from backend
  const innings = scorecard?.innings || [];

  return (
    <div
      className="fixed inset-0 z-50 pt-16"
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'rgba(8,9,12,0.75)',
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mx-auto mt-4 mb-8 rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(12,14,20,0.98)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
          maxHeight: 'calc(100vh - 96px)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mac chrome */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-6 py-4
                     border-b border-white/8"
          style={{ background: 'rgba(0,0,0,0.4)' }}
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
          <span className="text-white/50 text-xs font-semibold tracking-widest">
            SCORECARD
          </span>
          <button onClick={onClose}
                  className="text-white/30 hover:text-white text-xs font-semibold">
            ESC
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent
                              rounded-full animate-spin" />
            </div>
          )}

          {scorecard && !loading && (
            <div className="p-6">

              {/* Match info */}
              <div className="mb-5">
                <h2 className="text-white font-black text-base leading-snug mb-2">
                  {scorecard.name}
                </h2>
                <p className={`text-xs font-semibold mb-1 ${
                  isLiveMatch({ status: scorecard.status }) ? 'text-live' : 'text-white/50'
                }`}>
                  {scorecard.status}
                </p>
                <p className="text-white/30 text-xs">📍 {scorecard.venue}</p>
              </div>

              {/* Innings tabs — only show if multiple innings */}
              {innings.length > 1 && (
                <div className="flex gap-2 mb-5 flex-wrap">
                  {innings.map((inn, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveInnings(i)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeInnings === i
                          ? 'bg-primary text-white'
                          : 'glass text-white/40 hover:text-white'
                      }`}
                    >
                      {inn.inningsName || `Innings ${i + 1}`}
                    </button>
                  ))}
                </div>
              )}

              {/* No innings data */}
              {innings.length === 0 && (
                <div className="text-center py-10 text-white/30 text-sm">
                  No scorecard data available yet
                </div>
              )}

              {/* Active innings */}
              {innings[activeInnings] && (
                <>
                  {/* Batting */}
                  {innings[activeInnings].batting?.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-5 bg-primary rounded-full" />
                        <h3 className="text-white font-black text-sm tracking-widest">
                          BATTING
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-white/8">
                              {['Batter', 'Out', 'R', 'B', '4s', '6s', 'SR'].map((h, i) => (
                                <th key={h}
                                    className={`py-2 px-2 text-white/30 font-bold uppercase
                                               tracking-widest ${i < 2 ? 'text-left' : 'text-right'}`}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {innings[activeInnings].batting.map((b, i) => (
                              <tr key={i}
                                  className="border-b border-white/5 hover:bg-white/3 transition-colors">
                                <td className="py-2.5 px-2 text-white font-semibold">
                                  {b.player}
                                </td>
                                <td className="py-2.5 px-2 text-white/40 text-xs capitalize">
                                  {b.dismissal || '—'}
                                </td>
                                <td className="py-2.5 px-2 text-right text-white font-black">
                                  {b.runs}
                                </td>
                                <td className="py-2.5 px-2 text-right text-white/50">{b.balls}</td>
                                <td className="py-2.5 px-2 text-right text-white/50">{b.fours}</td>
                                <td className="py-2.5 px-2 text-right text-white/50">{b.sixes}</td>
                                <td className="py-2.5 px-2 text-right text-white/50">
                                  {b.strikeRate?.toFixed(1)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Bowling */}
                  {innings[activeInnings].bowling?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-5 bg-live rounded-full" />
                        <h3 className="text-white font-black text-sm tracking-widest">
                          BOWLING
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-white/8">
                              {['Bowler', 'O', 'M', 'R', 'W', 'Eco'].map((h, i) => (
                                <th key={h}
                                    className={`py-2 px-2 text-white/30 font-bold uppercase
                                               tracking-widest ${i === 0 ? 'text-left' : 'text-right'}`}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {innings[activeInnings].bowling.map((b, i) => (
                              <tr key={i}
                                  className="border-b border-white/5 hover:bg-white/3 transition-colors">
                                <td className="py-2.5 px-2 text-white font-semibold">
                                  {b.player}
                                </td>
                                <td className="py-2.5 px-2 text-right text-white/50">{b.overs}</td>
                                <td className="py-2.5 px-2 text-right text-white/50">{b.maidens}</td>
                                <td className="py-2.5 px-2 text-right text-white/50">{b.runs}</td>
                                <td className="py-2.5 px-2 text-right text-white font-black">
                                  {b.wickets}
                                </td>
                                <td className="py-2.5 px-2 text-right text-white/50">
                                  {b.economy?.toFixed(1)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Cricket Page ─────────────────────────────────────
const Cricket = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'live';
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [scorecard, setScorecard] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scorecardLoading, setScorecardLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [live, upcoming] = await Promise.all([
          getLiveMatches(), getUpcomingMatches()
        ]);
        setLiveMatches(live.data);
        setUpcomingMatches(upcoming.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loadScorecard = async (match) => {
    setSelectedMatch(match);
    setScorecard(null);
    setModalOpen(true);
    setScorecardLoading(true);
    try {
      const res = await getScorecard(match.id);
      setScorecard(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setScorecardLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setScorecard(null);
    setSelectedMatch(null);
  };

  const currentMatches = tab === 'live' ? liveMatches : upcomingMatches;

  if (loading) return (
    <PageWrapper beam="cricket">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent
                        rounded-full animate-spin" />
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper beam="cricket">
      {/* Scorecard modal */}
      {modalOpen && (
        <ScorecardModal
          scorecard={scorecard}
          loading={scorecardLoading}
          match={selectedMatch}
          onClose={closeModal}
        />
      )}

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h1 className="text-3xl font-black tracking-tight text-white">Cricket</h1>
          </div>
          <p className="text-white/40 text-sm font-medium ml-4">
            Live scores, scorecards and upcoming matches
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { key: 'live',     label: 'Live',     count: liveMatches.length },
            { key: 'upcoming', label: 'Upcoming', count: upcomingMatches.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setSearchParams({ tab: t.key })}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
                         flex items-center gap-2 ${
                tab === t.key
                  ? 'bg-primary text-white'
                  : 'glass text-white/50 hover:text-white'
              }`}
            >
              {t.key === 'live' && (
                <span className={`w-1.5 h-1.5 rounded-full ${
                  tab === 'live' ? 'bg-white animate-pulse' : 'bg-white/30'
                }`} />
              )}
              {t.label}
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                tab === t.key ? 'bg-white/20 text-white' : 'bg-white/5 text-white/30'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Match grid */}
        {currentMatches.length === 0 ? (
          <div className="glass rounded-2xl py-20 text-center">
            <p className="text-4xl mb-3">🏏</p>
            <p className="text-white/40 text-sm font-medium">
              {tab === 'live' ? 'No live matches right now' : 'No upcoming matches'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onClick={() => loadScorecard(match)}
              />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Cricket;