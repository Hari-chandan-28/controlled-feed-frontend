import { useState, useEffect } from 'react';
import { getLiveMatches, getUpcomingMatches, getScorecard } from '../services/api';
import { useSearchParams } from 'react-router-dom';
// Match score card component
const MatchCard = ({ match, isSelected, onClick }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer bg-card border rounded-xl p-4 transition-all ${
      isSelected ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-border hover:border-white'
    }`}
  >
    {/* Status badge */}
    <div className="flex items-center justify-between mb-3">
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
        match.status?.toLowerCase().includes('live') ||
        match.status?.toLowerCase().includes('progress')
          ? 'bg-green-500/20 text-green-400'
          : 'bg-surface text-muted'
      }`}>
        {match.status?.toLowerCase().includes('live') ||
         match.status?.toLowerCase().includes('progress')
          ? '🔴 LIVE'
          : match.status?.slice(0, 25)}
      </span>
      <span className="text-muted text-xs uppercase">{match.matchType}</span>
    </div>

    {/* Match name */}
    <h3 className="text-white font-semibold text-sm mb-3">{match.name}</h3>

    {/* Scores */}
    {match.scores?.length > 0 && (
      <div className="space-y-2">
        {match.scores.map((score, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-muted text-xs truncate max-w-[140px]">
              {score.inning}
            </span>
            <span className="text-white font-mono text-sm font-semibold">
              {score.runs}/{score.wickets}
              <span className="text-muted text-xs ml-1">({score.overs} ov)</span>
            </span>
          </div>
        ))}
      </div>
    )}

    <p className="text-muted text-xs mt-3 truncate">📍 {match.venue}</p>
  </div>
);

const Cricket = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'live';
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [scorecard, setScorecard] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scorecardLoading, setScorecardLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [live, upcoming] = await Promise.all([
          getLiveMatches(),
          getUpcomingMatches()
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

  // Load scorecard when match is clicked
  const loadScorecard = async (match) => {
    setSelectedMatch(match);
    setScorecard(null);
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

  const currentMatches = tab === 'live' ? liveMatches : upcomingMatches;

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center pt-16">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-5xl">🏏</span>
          <div>
            <h1 className="text-3xl font-display tracking-wider text-white">CRICKET</h1>
            <p className="text-muted text-sm">Live scores, scorecards and upcoming matches</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { key: 'live', label: '🔴 Live', count: liveMatches.length },
            { key: 'upcoming', label: '📅 Upcoming', count: upcomingMatches.length },
          ].map((t) => (
              <button
                  key={t.key}
                  onClick={() => setSearchParams({ tab: t.key })}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      tab === t.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-surface text-muted hover:text-white border border-border'
                  }`}
              >
                {t.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    tab === t.key ? 'bg-white/20' : 'bg-border'
                }`}>
                {t.count}
                 </span>
              </button>
          ))}
        </div>

        {/* Two column layout - matches list + scorecard */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* LEFT - Match list */}
          <div className="lg:col-span-2 space-y-3">
            {currentMatches.length === 0 ? (
              <div className="text-center py-16 text-muted">
                <p className="text-4xl mb-3">🏏</p>
                <p>{tab === 'live' ? 'No live matches right now.' : 'No upcoming matches.'}</p>
              </div>
            ) : (
              currentMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  isSelected={selectedMatch?.id === match.id}
                  onClick={() => loadScorecard(match)}
                />
              ))
            )}
          </div>

          {/* RIGHT - Scorecard */}
          <div className="lg:col-span-3">

            {/* No match selected */}
            {!selectedMatch && (
              <div className="bg-card border border-border rounded-xl flex items-center justify-center h-64">
                <div className="text-center text-muted">
                  <p className="text-4xl mb-3">👆</p>
                  <p className="text-sm">Select a match to view scorecard</p>
                </div>
              </div>
            )}

            {/* Loading scorecard */}
            {scorecardLoading && (
              <div className="bg-card border border-border rounded-xl flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Scorecard loaded */}
            {scorecard && !scorecardLoading && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">

                {/* Match info */}
                <div className="p-4 border-b border-border">
                  <h2 className="text-white font-semibold">{scorecard.name}</h2>
                  <p className="text-muted text-xs mt-1">{scorecard.status}</p>
                  <p className="text-muted text-xs">📍 {scorecard.venue}</p>
                </div>

                {/* Batting table */}
                {scorecard.batting?.length > 0 && (
                  <div className="p-4">
                    <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-blue-500 rounded" />
                      Batting
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 text-muted">Batter</th>
                            <th className="text-right py-2 text-muted">R</th>
                            <th className="text-right py-2 text-muted">B</th>
                            <th className="text-right py-2 text-muted">4s</th>
                            <th className="text-right py-2 text-muted">6s</th>
                            <th className="text-right py-2 text-muted">SR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scorecard.batting.map((b, i) => (
                            <tr key={i} className="border-b border-border/30">
                              <td className="py-2 text-white">{b.player}</td>
                              <td className="py-2 text-right text-white font-bold">{b.runs}</td>
                              <td className="py-2 text-right text-muted">{b.balls}</td>
                              <td className="py-2 text-right text-muted">{b.fours}</td>
                              <td className="py-2 text-right text-muted">{b.sixes}</td>
                              <td className="py-2 text-right text-muted">{b.strikeRate?.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Bowling table */}
                {scorecard.bowling?.length > 0 && (
                  <div className="p-4 border-t border-border">
                    <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-green-500 rounded" />
                      Bowling
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 text-muted">Bowler</th>
                            <th className="text-right py-2 text-muted">O</th>
                            <th className="text-right py-2 text-muted">M</th>
                            <th className="text-right py-2 text-muted">R</th>
                            <th className="text-right py-2 text-muted">W</th>
                            <th className="text-right py-2 text-muted">Eco</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scorecard.bowling.map((b, i) => (
                            <tr key={i} className="border-b border-border/30">
                              <td className="py-2 text-white">{b.player}</td>
                              <td className="py-2 text-right text-muted">{b.overs}</td>
                              <td className="py-2 text-right text-muted">{b.maidens}</td>
                              <td className="py-2 text-right text-muted">{b.runs}</td>
                              <td className="py-2 text-right text-white font-bold">{b.wickets}</td>
                              <td className="py-2 text-right text-muted">{b.economy?.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cricket;