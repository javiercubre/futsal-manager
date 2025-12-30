import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMatchStore } from '@/store/matchStore';
import { useGameStore } from '@/store/gameStore';
import type { Player, Tactic, Fixture } from '@/types';

// Default tactic for demo
const defaultTactic: Tactic = {
  id: 'default',
  name: 'Default',
  formation: '3-1',
  mentality: 'balanced',
  tempo: 'normal',
  pressing: 'medium',
  passingStyle: 'mixed',
  width: 10,
  defenseLine: 10,
  corners: { name: 'Default', description: '', positions: [] },
  freeKicks: { name: 'Default', description: '', positions: [] },
  kickoffs: { name: 'Default', description: '', positions: [] },
  playerInstructions: [],
  useFlyingGoalkeeper: true,
  flyingGkTrigger: 'whenLosing',
  timeoutStrategy: 'tactical',
  rotationFrequency: 'medium',
};

// Mock players for demo
const createMockPlayers = (teamName: string, color: string): Player[] => {
  const positions = ['GK', 'FIXO', 'ALA', 'ALA', 'PIVO', 'GK', 'FIXO', 'ALA', 'PIVO'] as const;
  const names = [
    ['Diego', 'André', 'Bruno', 'Tiago', 'Ricardinho', 'João', 'Pedro', 'Carlos', 'Miguel'],
    ['Jesús', 'Ortiz', 'Dyego', 'Ferrao', 'Sergio', 'Marc', 'Pablo', 'Dani', 'Rafa'],
  ];

  const nameSet = teamName.includes('Benfica') || teamName.includes('Sporting') ? names[0] : names[1];

  return nameSet.map((name, i) => ({
    id: `${teamName}-${i}`,
    name,
    shortName: name,
    nationality: 'PT',
    dateOfBirth: new Date(1990, 1, 1),
    age: 30 + Math.floor(Math.random() * 5) - 2,
    position: positions[i],
    secondaryPositions: [],
    preferredFoot: 'right',
    shirtNumber: i + 1,
    technical: {
      shooting: 10 + Math.floor(Math.random() * 8),
      passing: 10 + Math.floor(Math.random() * 8),
      dribbling: 10 + Math.floor(Math.random() * 8),
      firstTouch: 10 + Math.floor(Math.random() * 8),
      technique: 10 + Math.floor(Math.random() * 8),
    },
    mental: {
      decisions: 10 + Math.floor(Math.random() * 8),
      positioning: 10 + Math.floor(Math.random() * 8),
      workRate: 10 + Math.floor(Math.random() * 8),
      composure: 10 + Math.floor(Math.random() * 8),
      teamwork: 10 + Math.floor(Math.random() * 8),
      aggression: 5 + Math.floor(Math.random() * 10),
    },
    physical: {
      pace: 10 + Math.floor(Math.random() * 8),
      acceleration: 10 + Math.floor(Math.random() * 8),
      stamina: 12 + Math.floor(Math.random() * 6),
      strength: 10 + Math.floor(Math.random() * 8),
      agility: 10 + Math.floor(Math.random() * 8),
    },
    goalkeeping: positions[i] === 'GK' ? {
      reflexes: 12 + Math.floor(Math.random() * 6),
      handling: 12 + Math.floor(Math.random() * 6),
      oneOnOnes: 12 + Math.floor(Math.random() * 6),
      distribution: 10 + Math.floor(Math.random() * 6),
      aerialAbility: 10 + Math.floor(Math.random() * 6),
    } : undefined,
    currentAbility: 120 + Math.floor(Math.random() * 40),
    potential: 150 + Math.floor(Math.random() * 30),
    form: 5 + Math.floor(Math.random() * 4),
    morale: 60 + Math.floor(Math.random() * 30),
    fitness: 80 + Math.floor(Math.random() * 20),
    sharpness: 70 + Math.floor(Math.random() * 20),
    suspended: false,
    suspensionMatches: 0,
    contract: {
      wage: 5000 + Math.floor(Math.random() * 10000),
      startDate: new Date(2023, 6, 1),
      expiryDate: new Date(2026, 5, 30),
    },
    marketValue: 200000 + Math.floor(Math.random() * 500000),
    seasonStats: {
      appearances: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      minutesPlayed: 0,
      averageRating: 0,
    },
    careerStats: {
      totalAppearances: 100 + Math.floor(Math.random() * 200),
      totalGoals: 20 + Math.floor(Math.random() * 80),
      totalAssists: 10 + Math.floor(Math.random() * 50),
      seasonsPlayed: 5 + Math.floor(Math.random() * 10),
    },
  }));
};

export default function MatchView() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { playerTeam, teams, competitions, updateFixtureResult, advanceDay } = useGameStore();

  // Get fixture from route state if navigating from calendar
  const routeFixture = location.state?.fixture as Fixture | undefined;
  const {
    matchState,
    isMatchActive,
    isPlaying,
    commentary,
    simulationSpeed,
    initializeMatch,
    startMatch,
    pauseMatch,
    resumeMatch,
    startSecondHalf,
    setSimulationSpeed,
    tick,
    callTimeout,
    clearMatch,
  } = useMatchStore();

  const tickInterval = useRef<number | null>(null);
  const [showPreMatch, setShowPreMatch] = useState(true);
  const [resultSaved, setResultSaved] = useState(false);
  const [currentFixture, setCurrentFixture] = useState<Fixture | null>(routeFixture || null);

  // Save match result when match ends
  useEffect(() => {
    if (matchState?.isFullTime && !resultSaved && currentFixture) {
      // Find the competition this fixture belongs to
      const competition = competitions.find(c =>
        c.fixtures.some(f => f.matchId === currentFixture.matchId)
      );

      if (competition) {
        updateFixtureResult(
          competition.id,
          currentFixture.matchId,
          matchState.homeGoals,
          matchState.awayGoals
        );
        setResultSaved(true);
      }
    }
  }, [matchState?.isFullTime, resultSaved, currentFixture, competitions, updateFixtureResult, matchState?.homeGoals, matchState?.awayGoals]);

  // Simulation loop
  useEffect(() => {
    if (isPlaying) {
      const interval = 1000 / simulationSpeed;
      tickInterval.current = window.setInterval(() => {
        tick();
      }, interval);
    } else if (tickInterval.current) {
      clearInterval(tickInterval.current);
      tickInterval.current = null;
    }

    return () => {
      if (tickInterval.current) {
        clearInterval(tickInterval.current);
      }
    };
  }, [isPlaying, simulationSpeed, tick]);

  // Start match (using fixture data if available)
  const handleStartMatch = () => {
    if (!playerTeam) return;

    let homeTeam = playerTeam;
    let awayTeam = teams.find(t => t.id !== playerTeam.id) || {
      ...playerTeam,
      id: 'opponent',
      name: 'Opponent FC',
      shortName: 'OPP',
      abbreviation: 'OPP',
      colors: { primary: '#2563eb', secondary: '#ffffff', goalkeeper: '#10b981' },
    };

    // Use fixture data if navigating from calendar
    if (currentFixture) {
      const fixtureHome = teams.find(t => t.id === currentFixture.homeTeamId);
      const fixtureAway = teams.find(t => t.id === currentFixture.awayTeamId);
      if (fixtureHome) homeTeam = fixtureHome;
      if (fixtureAway) awayTeam = fixtureAway;
    }

    // Use actual squad or fall back to mock players
    const homePlayers = homeTeam.squad?.length > 0
      ? homeTeam.squad
      : createMockPlayers(homeTeam.name, homeTeam.colors.primary);
    const awayPlayers = awayTeam.squad?.length > 0
      ? awayTeam.squad
      : createMockPlayers(awayTeam.name, awayTeam.colors.primary);

    initializeMatch(
      homeTeam,
      awayTeam,
      defaultTactic,
      defaultTactic,
      homePlayers,
      awayPlayers
    );

    setShowPreMatch(false);
    setResultSaved(false);
    setTimeout(() => startMatch(), 500);
  };

  const handleResetMatch = () => {
    clearMatch();
    setShowPreMatch(true);
    setResultSaved(false);
    setCurrentFixture(null);
    // Advance day after match
    advanceDay();
    navigate('/game/calendar');
  };

  // Pre-match screen
  if (showPreMatch || !isMatchActive) {
    // Determine home and away teams for display
    const homeTeam = currentFixture
      ? teams.find(t => t.id === currentFixture.homeTeamId) || playerTeam
      : playerTeam;
    const awayTeam = currentFixture
      ? teams.find(t => t.id === currentFixture.awayTeamId)
      : teams.find(t => t.id !== playerTeam?.id);

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">{t('menu.matches')}</h1>

        <div className="card">
          <h3 className="text-white font-semibold mb-4">
            {currentFixture ? `Round ${currentFixture.round}` : 'Next Match'}
          </h3>
          <div className="flex items-center justify-center gap-8 py-8">
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-2"
                style={{ backgroundColor: homeTeam?.colors.primary || '#e53935' }}
              >
                {homeTeam?.abbreviation || 'HOM'}
              </div>
              <p className="text-white font-medium">{homeTeam?.name || 'Home Team'}</p>
              <p className="text-slate-400 text-sm">Home</p>
            </div>
            <div className="text-4xl font-bold text-slate-400">VS</div>
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-2"
                style={{ backgroundColor: awayTeam?.colors.primary || '#2563eb' }}
              >
                {awayTeam?.abbreviation || 'AWY'}
              </div>
              <p className="text-white font-medium">{awayTeam?.name || 'Away Team'}</p>
              <p className="text-slate-400 text-sm">Away</p>
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={handleStartMatch}
              className="btn btn-primary text-lg px-8"
              disabled={!homeTeam || !awayTeam}
            >
              {t('match.kickoff')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active match view
  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className="card bg-slate-800/80">
        <div className="flex items-center justify-between">
          {/* Home team */}
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: matchState?.home.team.colors.primary }}
            >
              {matchState?.home.team.abbreviation}
            </div>
            <div>
              <p className="text-white font-semibold">{matchState?.home.team.name}</p>
              <p className="text-slate-400 text-sm">Home</p>
            </div>
          </div>

          {/* Score */}
          <div className="text-center px-8">
            <div className="text-5xl font-bold text-white">
              {matchState?.homeGoals} - {matchState?.awayGoals}
            </div>
            <div className="text-primary-400 text-lg mt-1">
              {matchState?.period === 1 ? '1st Half' : matchState?.period === 2 ? '2nd Half' : ''}
              {' '}
              {matchState?.minute.toString().padStart(2, '0')}:{matchState?.second.toString().padStart(2, '0')}
            </div>
            {matchState?.isHalfTime && (
              <div className="text-yellow-400 text-sm mt-1">HALF TIME</div>
            )}
            {matchState?.isFullTime && (
              <div className="text-green-400 text-sm mt-1">FULL TIME</div>
            )}
          </div>

          {/* Away team */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-white font-semibold text-right">{matchState?.away.team.name}</p>
              <p className="text-slate-400 text-sm text-right">Away</p>
            </div>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: matchState?.away.team.colors.primary }}
            >
              {matchState?.away.team.abbreviation}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Court visualization */}
        <div className="lg:col-span-2 card">
          <div className="relative w-full aspect-[2/1] bg-court-wood rounded-xl overflow-hidden border-4 border-white/20">
            {/* Court lines */}
            <div className="absolute inset-0">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/60" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white/60 rounded-full" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-24 border-2 border-l-0 border-white/60 rounded-r-lg" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-24 border-2 border-r-0 border-white/60 rounded-l-lg" />
            </div>

            {/* Ball position */}
            {matchState?.ball.isInPlay && (
              <div
                className="absolute w-4 h-4 bg-white rounded-full shadow-lg ball transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{
                  left: `${matchState.ball.position.x}%`,
                  top: `${matchState.ball.position.y}%`,
                }}
              />
            )}

            {/* Home players */}
            {matchState?.home.players.filter(p => p.isOnCourt).map((player, i) => (
              <div
                key={player.playerId}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                style={{
                  left: `${player.position.x}%`,
                  top: `${player.position.y}%`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                  style={{ backgroundColor: matchState.home.team.colors.primary }}
                >
                  {i + 1}
                </div>
              </div>
            ))}

            {/* Away players */}
            {matchState?.away.players.filter(p => p.isOnCourt).map((player, i) => (
              <div
                key={player.playerId}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                style={{
                  left: `${player.position.x}%`,
                  top: `${player.position.y}%`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                  style={{ backgroundColor: matchState.away.team.colors.primary }}
                >
                  {i + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Match controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {matchState?.isHalfTime && !matchState?.isFullTime && (
                <button onClick={startSecondHalf} className="btn btn-primary">
                  Start 2nd Half
                </button>
              )}

              {!matchState?.isHalfTime && !matchState?.isFullTime && (
                <>
                  {isPlaying ? (
                    <button onClick={pauseMatch} className="btn btn-secondary">
                      ⏸️ Pause
                    </button>
                  ) : (
                    <button onClick={resumeMatch} className="btn btn-primary">
                      ▶️ Play
                    </button>
                  )}
                </>
              )}

              {matchState?.isFullTime && (
                <button onClick={handleResetMatch} className="btn btn-primary">
                  New Match
                </button>
              )}

              <button
                onClick={() => callTimeout('home')}
                className="btn btn-secondary text-sm"
                disabled={isPlaying || (matchState?.home.timeoutsUsed || 0) >= 1}
              >
                Timeout
              </button>
            </div>

            {/* Speed controls */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Speed:</span>
              {[1, 2, 4, 8, 16].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSimulationSpeed(speed)}
                  className={`px-2 py-1 rounded text-sm ${
                    simulationSpeed === speed
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Commentary & Stats */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="card">
            <h3 className="text-white font-semibold mb-3">Match Stats</h3>
            <div className="space-y-2">
              {[
                { label: t('match.possession'), home: matchState?.stats.possession.home || 50, away: matchState?.stats.possession.away || 50, isPercent: true },
                { label: t('match.shots'), home: matchState?.stats.shots.home || 0, away: matchState?.stats.shots.away || 0 },
                { label: t('match.shotsOnTarget'), home: matchState?.stats.shotsOnTarget.home || 0, away: matchState?.stats.shotsOnTarget.away || 0 },
                { label: t('match.fouls'), home: matchState?.stats.fouls.home || 0, away: matchState?.stats.fouls.away || 0 },
                { label: t('match.accumulatedFouls'), home: matchState?.home.accumulatedFouls || 0, away: matchState?.away.accumulatedFouls || 0 },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center text-sm">
                  <span className="w-8 text-right text-white font-medium">
                    {stat.isPercent ? `${stat.home.toFixed(0)}%` : stat.home}
                  </span>
                  <div className="flex-1 mx-3">
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${stat.isPercent ? stat.home : (stat.home / (stat.home + stat.away + 0.01)) * 100}%` }}
                      />
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${stat.isPercent ? stat.away : (stat.away / (stat.home + stat.away + 0.01)) * 100}%` }}
                      />
                    </div>
                    <p className="text-center text-slate-400 text-xs mt-1">{stat.label}</p>
                  </div>
                  <span className="w-8 text-white font-medium">
                    {stat.isPercent ? `${stat.away.toFixed(0)}%` : stat.away}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Commentary */}
          <div className="card">
            <h3 className="text-white font-semibold mb-3">Commentary</h3>
            <div className="h-64 overflow-y-auto space-y-2 text-sm">
              {commentary.map((line, i) => (
                <p
                  key={i}
                  className={`${i === 0 ? 'text-white' : 'text-slate-400'}`}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
