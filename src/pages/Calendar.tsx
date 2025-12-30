import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import type { Fixture } from '@/types';
import {
  getTeamFixtures,
  getUpcomingFixtures,
  getRecentResults,
} from '@/engine/league/LeagueEngine';

type ViewMode = 'list' | 'calendar';
type FilterMode = 'all' | 'home' | 'away';

export default function Calendar() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentDate, playerTeam, playerTeamId, competitions, teams } = useGameStore();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const date = new Date(currentDate);
    return { month: date.getMonth(), year: date.getFullYear() };
  });

  // Get all fixtures for player's team
  const allFixtures = useMemo(() => {
    if (!playerTeamId || competitions.length === 0) return [];

    const fixtures: (Fixture & { competitionName: string })[] = [];

    for (const comp of competitions) {
      const teamFixtures = getTeamFixtures(comp.fixtures, playerTeamId);
      fixtures.push(...teamFixtures.map(f => ({ ...f, competitionName: comp.shortName })));
    }

    return fixtures.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [playerTeamId, competitions]);

  // Filter fixtures based on selected filter
  const filteredFixtures = useMemo(() => {
    if (filterMode === 'all') return allFixtures;
    if (filterMode === 'home') return allFixtures.filter(f => f.homeTeamId === playerTeamId);
    return allFixtures.filter(f => f.awayTeamId === playerTeamId);
  }, [allFixtures, filterMode, playerTeamId]);

  // Get upcoming and recent fixtures
  const upcomingFixtures = useMemo(() => {
    if (!playerTeamId || competitions.length === 0) return [];

    const upcoming: (Fixture & { competitionName: string })[] = [];
    for (const comp of competitions) {
      const fixtures = getUpcomingFixtures(comp.fixtures, new Date(currentDate), 30)
        .filter(f => f.homeTeamId === playerTeamId || f.awayTeamId === playerTeamId);
      upcoming.push(...fixtures.map(f => ({ ...f, competitionName: comp.shortName })));
    }
    return upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [playerTeamId, competitions, currentDate]);

  const recentResults = useMemo(() => {
    if (!playerTeamId || competitions.length === 0) return [];

    const recent: (Fixture & { competitionName: string })[] = [];
    for (const comp of competitions) {
      const fixtures = getRecentResults(comp.fixtures, new Date(currentDate), 30)
        .filter(f => f.homeTeamId === playerTeamId || f.awayTeamId === playerTeamId);
      recent.push(...fixtures.map(f => ({ ...f, competitionName: comp.shortName })));
    }
    return recent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [playerTeamId, competitions, currentDate]);

  // Get team name by ID
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

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatShortDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  };

  const isMatchDay = (date: Date | string): boolean => {
    const d = new Date(date);
    const today = new Date(currentDate);
    return d.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date | string): boolean => {
    const d = new Date(date);
    const today = new Date(currentDate);
    return d < today;
  };

  const getResultStyle = (fixture: Fixture): { class: string; result: string } => {
    if (!fixture.played || fixture.homeGoals === undefined || fixture.awayGoals === undefined) {
      return { class: '', result: '' };
    }

    const isHome = fixture.homeTeamId === playerTeamId;
    const playerGoals = isHome ? fixture.homeGoals : fixture.awayGoals;
    const opponentGoals = isHome ? fixture.awayGoals : fixture.homeGoals;

    if (playerGoals > opponentGoals) {
      return { class: 'bg-green-600/20 text-green-400 border-green-500/30', result: 'W' };
    } else if (playerGoals < opponentGoals) {
      return { class: 'bg-red-600/20 text-red-400 border-red-500/30', result: 'L' };
    }
    return { class: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30', result: 'D' };
  };

  // Calendar view helpers
  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction: number) => {
    setSelectedMonth(prev => {
      let newMonth = prev.month + direction;
      let newYear = prev.year;

      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }

      return { month: newMonth, year: newYear };
    });
  };

  const getFixturesForDay = (day: number): (Fixture & { competitionName: string })[] => {
    const targetDate = new Date(selectedMonth.year, selectedMonth.month, day);
    return filteredFixtures.filter(f => {
      const fixtureDate = new Date(f.date);
      return fixtureDate.toDateString() === targetDate.toDateString();
    });
  };

  const handlePlayMatch = (fixture: Fixture) => {
    navigate('/game/match', { state: { fixture } });
  };

  // Next match
  const nextMatch = upcomingFixtures[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('calendar.title')}</h1>
          <p className="text-slate-400">Season 2024-25</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'calendar'
                ? 'bg-primary-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Current date indicator */}
      <div className="card bg-primary-600/20 border border-primary-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">📅</span>
            <div>
              <p className="text-primary-400 text-sm">{t('calendar.today')}</p>
              <p className="text-white text-xl font-semibold">
                {formatDate(new Date(currentDate))}
              </p>
            </div>
          </div>
          {nextMatch && (
            <div className="text-right">
              <p className="text-slate-400 text-sm">Next Match</p>
              <p className="text-white font-medium">
                {nextMatch.homeTeamId === playerTeamId ? 'vs ' : '@ '}
                {getTeamName(
                  nextMatch.homeTeamId === playerTeamId ? nextMatch.awayTeamId : nextMatch.homeTeamId
                )}
              </p>
              <p className="text-primary-400 text-sm">{formatShortDate(nextMatch.date)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'home', 'away'] as FilterMode[]).map(filter => (
          <button
            key={filter}
            onClick={() => setFilterMode(filter)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterMode === filter
                ? 'bg-primary-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {filter === 'all' ? 'All Matches' : filter === 'home' ? 'Home' : 'Away'}
          </button>
        ))}
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming fixtures */}
          <div className="card">
            <h3 className="text-white font-semibold mb-4">Upcoming Fixtures</h3>
            {upcomingFixtures.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No upcoming fixtures</p>
            ) : (
              <div className="space-y-3">
                {upcomingFixtures.slice(0, 8).map((fixture) => {
                  const isHome = fixture.homeTeamId === playerTeamId;
                  const opponentId = isHome ? fixture.awayTeamId : fixture.homeTeamId;

                  return (
                    <div
                      key={fixture.matchId}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer ${
                        isMatchDay(fixture.date)
                          ? 'bg-primary-600/30 border border-primary-500/50'
                          : 'bg-slate-700/50 hover:bg-slate-700'
                      }`}
                      onClick={() => handlePlayMatch(fixture)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center w-16">
                          <p className="text-slate-400 text-sm">{formatShortDate(fixture.date)}</p>
                          {isMatchDay(fixture.date) && (
                            <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded">TODAY</span>
                          )}
                        </div>
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
                            <p className="text-slate-500 text-sm">{fixture.competitionName}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          isHome ? 'bg-green-600/20 text-green-400' : 'bg-slate-600 text-slate-300'
                        }`}>
                          {isHome ? 'HOME' : 'AWAY'}
                        </span>
                        {isMatchDay(fixture.date) && (
                          <button
                            className="btn btn-primary text-sm px-3 py-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayMatch(fixture);
                            }}
                          >
                            Play
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent results */}
          <div className="card">
            <h3 className="text-white font-semibold mb-4">Recent Results</h3>
            {recentResults.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No results yet</p>
            ) : (
              <div className="space-y-3">
                {recentResults.slice(0, 8).map((fixture) => {
                  const isHome = fixture.homeTeamId === playerTeamId;
                  const opponentId = isHome ? fixture.awayTeamId : fixture.homeTeamId;
                  const resultStyle = getResultStyle(fixture);

                  return (
                    <div
                      key={fixture.matchId}
                      className={`flex items-center justify-between p-4 rounded-lg border ${resultStyle.class}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center w-16">
                          <p className="text-slate-400 text-sm">{formatShortDate(fixture.date)}</p>
                        </div>
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
                            <p className="text-slate-500 text-sm">{fixture.competitionName}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-white font-bold text-lg">
                            {fixture.homeGoals} - {fixture.awayGoals}
                          </p>
                          <span className={`text-xs font-medium ${
                            resultStyle.result === 'W' ? 'text-green-400' :
                            resultStyle.result === 'L' ? 'text-red-400' :
                            'text-yellow-400'
                          }`}>
                            {resultStyle.result === 'W' ? 'WIN' : resultStyle.result === 'L' ? 'LOSS' : 'DRAW'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Calendar view */
        <div className="card">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth(-1)}
              className="btn btn-secondary"
            >
              ← Previous
            </button>
            <h3 className="text-white font-bold text-xl">
              {monthNames[selectedMonth.month]} {selectedMonth.year}
            </h3>
            <button
              onClick={() => navigateMonth(1)}
              className="btn btn-secondary"
            >
              Next →
            </button>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-slate-400 font-medium text-sm">
                {day}
              </div>
            ))}

            {/* Empty cells before first day */}
            {Array.from({ length: getFirstDayOfMonth(selectedMonth.month, selectedMonth.year) }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2 min-h-[80px]" />
            ))}

            {/* Calendar days */}
            {Array.from({ length: getDaysInMonth(selectedMonth.month, selectedMonth.year) }).map((_, i) => {
              const day = i + 1;
              const dayFixtures = getFixturesForDay(day);
              const isToday = new Date(currentDate).toDateString() ===
                new Date(selectedMonth.year, selectedMonth.month, day).toDateString();

              return (
                <div
                  key={day}
                  className={`p-2 min-h-[80px] rounded-lg border ${
                    isToday
                      ? 'border-primary-500 bg-primary-600/20'
                      : 'border-slate-700 bg-slate-800/50'
                  }`}
                >
                  <p className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-primary-400' : 'text-slate-400'
                  }`}>
                    {day}
                  </p>
                  {dayFixtures.map(fixture => {
                    const isHome = fixture.homeTeamId === playerTeamId;
                    const opponentId = isHome ? fixture.awayTeamId : fixture.homeTeamId;

                    return (
                      <div
                        key={fixture.matchId}
                        onClick={() => handlePlayMatch(fixture)}
                        className={`text-xs p-1 rounded mb-1 cursor-pointer truncate ${
                          fixture.played
                            ? getResultStyle(fixture).class
                            : isHome
                              ? 'bg-green-600/30 text-green-400'
                              : 'bg-slate-600/50 text-slate-300'
                        }`}
                        title={`${isHome ? 'vs' : '@'} ${getTeamName(opponentId)}`}
                      >
                        {isHome ? 'H' : 'A'}: {getTeamAbbr(opponentId)}
                        {fixture.played && ` ${fixture.homeGoals}-${fixture.awayGoals}`}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Season overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-slate-400 text-sm">Total Matches</p>
          <p className="text-3xl font-bold text-white">{allFixtures.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-slate-400 text-sm">Played</p>
          <p className="text-3xl font-bold text-white">{allFixtures.filter(f => f.played).length}</p>
        </div>
        <div className="card text-center">
          <p className="text-slate-400 text-sm">Remaining</p>
          <p className="text-3xl font-bold text-white">{allFixtures.filter(f => !f.played).length}</p>
        </div>
        <div className="card text-center">
          <p className="text-slate-400 text-sm">Home Matches</p>
          <p className="text-3xl font-bold text-green-400">
            {allFixtures.filter(f => f.homeTeamId === playerTeamId).length}
          </p>
        </div>
      </div>
    </div>
  );
}
