import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '@/store/gameStore';
import { calculateStandings } from '@/engine/league/LeagueEngine';
import type { LeagueTable, Competition } from '@/types';

export default function Table() {
  const { t } = useTranslation();
  const { playerTeamId, competitions, teams } = useGameStore();

  // Get available league competitions
  const leagueCompetitions = useMemo(() => {
    return competitions.filter(c => c.type === 'league');
  }, [competitions]);

  // Default to player's league
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>(() => {
    const playerLeague = leagueCompetitions.find(c =>
      c.teams.some(t => t.id === playerTeamId)
    );
    return playerLeague?.id || leagueCompetitions[0]?.id || '';
  });

  // Get selected competition
  const selectedLeague = useMemo(() => {
    return competitions.find(c => c.id === selectedLeagueId);
  }, [competitions, selectedLeagueId]);

  // Calculate standings
  const standings: LeagueTable[] = useMemo(() => {
    if (!selectedLeague) return [];
    return calculateStandings(selectedLeague.teams, selectedLeague.fixtures);
  }, [selectedLeague]);

  // Helper functions
  const getTeamAbbr = (teamId: string): string => {
    const team = teams.find(t => t.id === teamId);
    return team?.abbreviation || '???';
  };

  const getTeamColor = (teamId: string): string => {
    const team = teams.find(t => t.id === teamId);
    return team?.colors.primary || '#6366f1';
  };

  // Determine position zone colors
  const getPositionStyle = (position: number, totalTeams: number): string => {
    // Top 4 - Champions League / Playoffs
    if (position <= 4) return 'border-l-4 border-green-500';
    // 5-8 - Europa / Playoffs
    if (position <= 8) return 'border-l-4 border-blue-500';
    // Bottom 2 - Relegation
    if (position > totalTeams - 2) return 'border-l-4 border-red-500';
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('table.title')}</h1>
          <p className="text-slate-400">Season 2024-25</p>
        </div>

        {/* League selector */}
        <div className="flex gap-2">
          {leagueCompetitions.map(league => (
            <button
              key={league.id}
              onClick={() => setSelectedLeagueId(league.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                selectedLeagueId === league.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span>{league.country === 'PT' ? '🇵🇹' : '🇪🇸'}</span>
              <span>{league.shortName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* League info */}
      {selectedLeague && (
        <div className="card bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{selectedLeague.name}</h2>
              <p className="text-slate-400">{selectedLeague.teams.length} teams</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Round</p>
              <p className="text-2xl font-bold text-white">{selectedLeague.currentRound}</p>
            </div>
          </div>
        </div>
      )}

      {/* Standings table */}
      <div className="card overflow-hidden p-0">
        {standings.length > 0 ? (
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr className="text-slate-400 text-sm">
                <th className="text-left px-4 py-3 w-12">#</th>
                <th className="text-left px-4 py-3">Team</th>
                <th className="text-center px-3 py-3 w-10">P</th>
                <th className="text-center px-3 py-3 w-10">W</th>
                <th className="text-center px-3 py-3 w-10">D</th>
                <th className="text-center px-3 py-3 w-10">L</th>
                <th className="text-center px-3 py-3 w-12">GF</th>
                <th className="text-center px-3 py-3 w-12">GA</th>
                <th className="text-center px-3 py-3 w-12">GD</th>
                <th className="text-center px-3 py-3 w-14">Pts</th>
                <th className="text-center px-4 py-3 w-32">Form</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row) => (
                <tr
                  key={row.teamId}
                  className={`border-t border-slate-700 transition-colors ${
                    row.teamId === playerTeamId
                      ? 'bg-primary-600/20'
                      : 'hover:bg-slate-700/30'
                  } ${getPositionStyle(row.position, standings.length)}`}
                >
                  <td className="px-4 py-3">
                    <span className={`font-bold ${
                      row.position <= 4 ? 'text-green-400' :
                      row.position <= 8 ? 'text-blue-400' :
                      row.position > standings.length - 2 ? 'text-red-400' :
                      'text-slate-400'
                    }`}>
                      {row.position}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: getTeamColor(row.teamId) }}
                      >
                        {getTeamAbbr(row.teamId)}
                      </div>
                      <span className={`font-medium ${
                        row.teamId === playerTeamId ? 'text-white' : 'text-slate-300'
                      }`}>
                        {row.team.name}
                      </span>
                      {row.teamId === playerTeamId && (
                        <span className="text-xs bg-primary-600 text-white px-1.5 py-0.5 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center text-slate-300">{row.played}</td>
                  <td className="px-3 py-3 text-center text-green-400">{row.won}</td>
                  <td className="px-3 py-3 text-center text-yellow-400">{row.drawn}</td>
                  <td className="px-3 py-3 text-center text-red-400">{row.lost}</td>
                  <td className="px-3 py-3 text-center text-slate-300">{row.goalsFor}</td>
                  <td className="px-3 py-3 text-center text-slate-300">{row.goalsAgainst}</td>
                  <td className={`px-3 py-3 text-center font-medium ${
                    row.goalDifference > 0 ? 'text-green-400' :
                    row.goalDifference < 0 ? 'text-red-400' :
                    'text-slate-400'
                  }`}>
                    {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-white font-bold text-lg">{row.points}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      {row.form.slice(-5).map((result, i) => (
                        <span
                          key={i}
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${
                            result === 'W' ? 'bg-green-600' :
                            result === 'D' ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}
                        >
                          {result}
                        </span>
                      ))}
                      {row.form.length === 0 && (
                        <span className="text-slate-500 text-sm">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-slate-400">
            No standings available
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="card">
        <h3 className="text-white font-semibold mb-4">Legend</h3>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-slate-400">Playoffs / Champions League</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span className="text-slate-400">Playoffs / Europa League</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-slate-400">Relegation Zone</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">P</span>
            <span className="text-slate-500">= Played</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">W</span>
            <span className="text-slate-500">= Won</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">D</span>
            <span className="text-slate-500">= Drawn</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">L</span>
            <span className="text-slate-500">= Lost</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">GF</span>
            <span className="text-slate-500">= Goals For</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">GA</span>
            <span className="text-slate-500">= Goals Against</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">GD</span>
            <span className="text-slate-500">= Goal Difference</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Pts</span>
            <span className="text-slate-500">= Points</span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {standings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-slate-400 text-sm">Total Matches</p>
            <p className="text-3xl font-bold text-white">
              {standings.reduce((sum, s) => sum + s.played, 0) / 2}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-slate-400 text-sm">Total Goals</p>
            <p className="text-3xl font-bold text-white">
              {standings.reduce((sum, s) => sum + s.goalsFor, 0)}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-slate-400 text-sm">Top Scorer Team</p>
            <p className="text-xl font-bold text-white">
              {standings[0]?.team.shortName || '-'}
            </p>
            <p className="text-green-400">
              {standings[0]?.goalsFor || 0} goals
            </p>
          </div>
          <div className="card text-center">
            <p className="text-slate-400 text-sm">Best Defense</p>
            <p className="text-xl font-bold text-white">
              {[...standings].sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0]?.team.shortName || '-'}
            </p>
            <p className="text-blue-400">
              {[...standings].sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0]?.goalsAgainst || 0} conceded
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
