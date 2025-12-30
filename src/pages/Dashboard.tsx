import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { getTeamFixtures, getUpcomingFixtures, calculateStandings } from '@/engine/league/LeagueEngine';
import type { Fixture, LeagueTable } from '@/types';

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { playerTeam, playerTeamId, managerName, currentDate, inbox, competitions, teams } = useGameStore();

  const unreadNews = inbox.filter(item => !item.read).length;

  // Get player's league competition
  const playerLeague = useMemo(() => {
    if (!playerTeam) return null;
    return competitions.find(c =>
      c.type === 'league' && c.teams.some(t => t.id === playerTeamId)
    );
  }, [competitions, playerTeamId, playerTeam]);

  // Calculate current standings
  const standings: LeagueTable[] = useMemo(() => {
    if (!playerLeague) return [];
    return calculateStandings(playerLeague.teams, playerLeague.fixtures);
  }, [playerLeague]);

  // Get player team's position and form
  const playerStanding = useMemo(() => {
    return standings.find(s => s.teamId === playerTeamId);
  }, [standings, playerTeamId]);

  // Get upcoming fixtures for player's team
  const upcomingFixtures = useMemo(() => {
    if (!playerLeague || !playerTeamId) return [];
    return getUpcomingFixtures(playerLeague.fixtures, new Date(currentDate), 30)
      .filter(f => f.homeTeamId === playerTeamId || f.awayTeamId === playerTeamId)
      .slice(0, 3);
  }, [playerLeague, playerTeamId, currentDate]);

  // Get next match
  const nextMatch = upcomingFixtures[0];

  // Helper functions
  const getTeamName = (teamId: string): string => {
    const team = teams.find(t => t.id === teamId);
    return team?.shortName || team?.name || 'Unknown';
  };

  const getTeamAbbr = (teamId: string): string => {
    const team = teams.find(t => t.id === teamId);
    return team?.abbreviation || '???';
  };

  const getTeamColor = (teamId: string): string => {
    const team = teams.find(t => t.id === teamId);
    return team?.colors.primary || '#6366f1';
  };

  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // Top scorers from squad (placeholder - in real implementation this would track goals)
  const topScorers = useMemo(() => {
    if (!playerTeam) return [];
    return playerTeam.squad
      .filter(p => p.position !== 'GK')
      .sort((a, b) => b.currentAbility - a.currentAbility)
      .slice(0, 3)
      .map((p, i) => ({
        name: p.name,
        goals: Math.floor(Math.random() * 5) + (3 - i), // Placeholder
        team: playerTeam.shortName,
      }));
  }, [playerTeam]);

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          {t('dashboard.welcome', { manager: managerName })}
        </h1>
        <p className="text-slate-400 mt-1">
          {playerTeam?.name} - {playerTeam?.league}
        </p>
        <p className="text-slate-500 text-sm mt-1">
          {formatDate(currentDate)}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* League Position */}
        <div className="card">
          <h3 className="text-slate-400 text-sm uppercase tracking-wide mb-2">
            {t('dashboard.leaguePosition')}
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-white">
              {playerStanding?.position || '-'}
            </span>
            <span className="text-slate-400 text-lg mb-2">/ {standings.length || '-'}</span>
          </div>
          <div className="mt-2 text-sm text-slate-400">
            <span className="text-white font-semibold">{playerStanding?.points || 0}</span> pts
            <span className="mx-2">|</span>
            <span className="text-white">{playerStanding?.played || 0}</span> played
          </div>
          {playerStanding && playerStanding.form.length > 0 && (
            <div className="flex gap-1 mt-3">
              {playerStanding.form.slice(-5).map((result, i) => (
                <span
                  key={i}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${
                    result === 'W' ? 'form-w' : result === 'D' ? 'form-d' : 'form-l'
                  }`}
                >
                  {result}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Next Match */}
        <div
          className="card cursor-pointer hover:ring-2 hover:ring-primary-500/50 transition-all"
          onClick={() => navigate('/game/calendar')}
        >
          <h3 className="text-slate-400 text-sm uppercase tracking-wide mb-2">
            {t('dashboard.nextMatch')}
          </h3>
          {nextMatch ? (
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{
                  backgroundColor: getTeamColor(
                    nextMatch.homeTeamId === playerTeamId ? nextMatch.awayTeamId : nextMatch.homeTeamId
                  )
                }}
              >
                {getTeamAbbr(
                  nextMatch.homeTeamId === playerTeamId ? nextMatch.awayTeamId : nextMatch.homeTeamId
                )}
              </div>
              <div>
                <p className="text-white font-semibold">
                  {nextMatch.homeTeamId === playerTeamId ? 'vs ' : '@ '}
                  {getTeamName(
                    nextMatch.homeTeamId === playerTeamId ? nextMatch.awayTeamId : nextMatch.homeTeamId
                  )}
                </p>
                <p className="text-slate-400 text-sm">
                  {formatDate(nextMatch.date)}
                </p>
                <p className="text-slate-500 text-xs">
                  {playerLeague?.shortName} - Round {nextMatch.round}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">No upcoming matches</p>
          )}
        </div>

        {/* Club Finances */}
        <div
          className="card cursor-pointer hover:ring-2 hover:ring-primary-500/50 transition-all"
          onClick={() => navigate('/game/finances')}
        >
          <h3 className="text-slate-400 text-sm uppercase tracking-wide mb-2">
            {t('finances.balance')}
          </h3>
          <div className="text-3xl font-bold text-green-400">
            €{((playerTeam?.finances.balance || 0) / 1000000).toFixed(1)}M
          </div>
          <div className="mt-2 text-sm">
            <span className="text-slate-400">Transfer Budget: </span>
            <span className="text-white">
              €{((playerTeam?.finances.transferBudget || 0) / 1000).toFixed(0)}k
            </span>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* League Table */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4 flex items-center justify-between">
            <span>{playerLeague?.shortName || 'League'} Standings</span>
            <button
              className="text-sm text-primary-400 hover:text-primary-300"
              onClick={() => navigate('/game/table')}
            >
              Full Table →
            </button>
          </h3>
          {standings.length > 0 ? (
            <div className="overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-xs">
                    <th className="text-left py-2 w-8">#</th>
                    <th className="text-left py-2">Team</th>
                    <th className="text-center py-2 w-8">P</th>
                    <th className="text-center py-2 w-8">GD</th>
                    <th className="text-center py-2 w-10">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.slice(0, 6).map((row) => (
                    <tr
                      key={row.teamId}
                      className={`border-t border-slate-700/50 ${
                        row.teamId === playerTeamId ? 'bg-primary-600/20' : ''
                      }`}
                    >
                      <td className="py-2 text-slate-400">{row.position}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-[10px]"
                            style={{ backgroundColor: getTeamColor(row.teamId) }}
                          >
                            {getTeamAbbr(row.teamId)}
                          </div>
                          <span className={row.teamId === playerTeamId ? 'text-white font-semibold' : 'text-slate-300'}>
                            {row.team.shortName}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 text-center text-slate-400">{row.played}</td>
                      <td className={`py-2 text-center ${
                        row.goalDifference > 0 ? 'text-green-400' :
                        row.goalDifference < 0 ? 'text-red-400' :
                        'text-slate-400'
                      }`}>
                        {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
                      </td>
                      <td className="py-2 text-center text-white font-semibold">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No standings available</p>
          )}
        </div>

        {/* Upcoming Fixtures */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4 flex items-center justify-between">
            <span>Upcoming Fixtures</span>
            <button
              className="text-sm text-primary-400 hover:text-primary-300"
              onClick={() => navigate('/game/calendar')}
            >
              Full Schedule →
            </button>
          </h3>
          {upcomingFixtures.length > 0 ? (
            <div className="space-y-3">
              {upcomingFixtures.map((fixture) => {
                const isHome = fixture.homeTeamId === playerTeamId;
                const opponentId = isHome ? fixture.awayTeamId : fixture.homeTeamId;

                return (
                  <div
                    key={fixture.matchId}
                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                    onClick={() => navigate('/game/match', { state: { fixture } })}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: getTeamColor(opponentId) }}
                      >
                        {getTeamAbbr(opponentId)}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {isHome ? 'vs ' : '@ '}{getTeamName(opponentId)}
                        </p>
                        <p className="text-slate-500 text-sm">
                          {formatDate(fixture.date)} - Round {fixture.round}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      isHome ? 'bg-green-600/20 text-green-400' : 'bg-slate-600 text-slate-300'
                    }`}>
                      {isHome ? 'HOME' : 'AWAY'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No upcoming fixtures</p>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Scorers (placeholder) */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            {t('dashboard.topScorers')}
          </h3>
          <div className="space-y-3">
            {topScorers.map((player, i) => (
              <div
                key={player.name}
                className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-white">{player.name}</p>
                    <p className="text-slate-500 text-sm">{player.team}</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-white">{player.goals}</span>
              </div>
            ))}
          </div>
        </div>

        {/* News/Inbox */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            {t('dashboard.news')}
            {unreadNews > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadNews}
              </span>
            )}
          </h3>
          <div className="space-y-3">
            {inbox.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg ${
                  item.read ? 'bg-slate-700/50' : 'bg-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`font-medium ${item.read ? 'text-slate-400' : 'text-white'}`}>
                      {item.title}
                    </p>
                    <p className="text-slate-500 text-sm mt-1 line-clamp-1">
                      {item.content}
                    </p>
                  </div>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
                  )}
                </div>
              </div>
            ))}
            {inbox.length === 0 && (
              <p className="text-slate-500 text-center py-4">No news yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={() => navigate('/game/squad')}>
            View Squad
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/game/tactics')}>
            Set Tactics
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/game/transfers')}>
            Transfer Market
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/game/calendar')}>
            Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
