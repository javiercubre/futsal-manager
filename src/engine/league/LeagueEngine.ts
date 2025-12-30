/**
 * League Engine - Handles fixture generation and standings for futsal leagues
 *
 * Supports:
 * - Round-robin fixture generation (double round-robin for full season)
 * - League standings calculation
 * - Playoff bracket generation
 */

import type { Team, Fixture, LeagueTable, Competition } from '@/types';

// Generate a unique match ID
function generateMatchId(homeId: string, awayId: string, round: number): string {
  return `match-${homeId}-${awayId}-r${round}`;
}

/**
 * Generate round-robin fixtures for a league
 * Uses the circle method to ensure fair scheduling
 */
export function generateRoundRobinFixtures(
  teams: Team[],
  startDate: Date,
  doubleRoundRobin: boolean = true
): Fixture[] {
  const fixtures: Fixture[] = [];
  const numTeams = teams.length;

  // If odd number of teams, add a "bye" placeholder
  const teamIds = teams.map(t => t.id);
  if (numTeams % 2 !== 0) {
    teamIds.push('BYE');
  }

  const n = teamIds.length;
  const rounds = n - 1;
  const matchesPerRound = n / 2;

  // Circle method for round-robin
  let rotatingTeams = [...teamIds];
  const fixedTeam = rotatingTeams.shift()!;

  for (let round = 0; round < rounds; round++) {
    const roundTeams = [fixedTeam, ...rotatingTeams];

    for (let match = 0; match < matchesPerRound; match++) {
      const homeIdx = match;
      const awayIdx = n - 1 - match;

      const homeTeamId = roundTeams[homeIdx];
      const awayTeamId = roundTeams[awayIdx];

      // Skip bye matches
      if (homeTeamId === 'BYE' || awayTeamId === 'BYE') continue;

      // Alternate home/away based on round to balance
      const isHomeFirst = (round + match) % 2 === 0;

      // Create a new Date for each fixture to avoid shared references
      const matchDate = new Date(startDate);
      matchDate.setDate(matchDate.getDate() + (round * 7)); // One round per week

      fixtures.push({
        matchId: generateMatchId(
          isHomeFirst ? homeTeamId : awayTeamId,
          isHomeFirst ? awayTeamId : homeTeamId,
          round + 1
        ),
        homeTeamId: isHomeFirst ? homeTeamId : awayTeamId,
        awayTeamId: isHomeFirst ? awayTeamId : homeTeamId,
        date: matchDate,
        round: round + 1,
        played: false,
      });
    }

    // Rotate teams (keep first team fixed)
    const lastTeam = rotatingTeams.pop()!;
    rotatingTeams.unshift(lastTeam);
  }

  // Second leg (reverse fixtures)
  if (doubleRoundRobin) {
    const firstLegCount = fixtures.length;
    const secondLegStart = new Date(startDate);
    secondLegStart.setDate(secondLegStart.getDate() + (rounds * 7) + 14); // 2 week break

    for (let i = 0; i < firstLegCount; i++) {
      const original = fixtures[i];
      const roundDate = new Date(secondLegStart);
      const originalRound = original.round;
      roundDate.setDate(roundDate.getDate() + ((originalRound - 1) * 7));

      fixtures.push({
        matchId: generateMatchId(original.awayTeamId, original.homeTeamId, rounds + originalRound),
        homeTeamId: original.awayTeamId,
        awayTeamId: original.homeTeamId,
        date: roundDate,
        round: rounds + originalRound,
        played: false,
      });
    }
  }

  return fixtures;
}

/**
 * Calculate league standings from fixtures
 */
export function calculateStandings(
  teams: Team[],
  fixtures: Fixture[]
): LeagueTable[] {
  // Initialize standings for all teams
  const standings: Map<string, LeagueTable> = new Map();

  for (const team of teams) {
    standings.set(team.id, {
      teamId: team.id,
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [],
      position: 0,
    });
  }

  // Process played fixtures
  for (const fixture of fixtures) {
    if (!fixture.played || fixture.homeGoals === undefined || fixture.awayGoals === undefined) {
      continue;
    }

    const homeStanding = standings.get(fixture.homeTeamId);
    const awayStanding = standings.get(fixture.awayTeamId);

    if (!homeStanding || !awayStanding) continue;

    // Update games played
    homeStanding.played++;
    awayStanding.played++;

    // Update goals
    homeStanding.goalsFor += fixture.homeGoals;
    homeStanding.goalsAgainst += fixture.awayGoals;
    awayStanding.goalsFor += fixture.awayGoals;
    awayStanding.goalsAgainst += fixture.homeGoals;

    // Determine winner and update points/form
    if (fixture.homeGoals > fixture.awayGoals) {
      // Home win
      homeStanding.won++;
      homeStanding.points += 3;
      homeStanding.form.push('W');

      awayStanding.lost++;
      awayStanding.form.push('L');
    } else if (fixture.homeGoals < fixture.awayGoals) {
      // Away win
      awayStanding.won++;
      awayStanding.points += 3;
      awayStanding.form.push('W');

      homeStanding.lost++;
      homeStanding.form.push('L');
    } else {
      // Draw
      homeStanding.drawn++;
      homeStanding.points += 1;
      homeStanding.form.push('D');

      awayStanding.drawn++;
      awayStanding.points += 1;
      awayStanding.form.push('D');
    }

    // Keep only last 5 form results
    if (homeStanding.form.length > 5) homeStanding.form.shift();
    if (awayStanding.form.length > 5) awayStanding.form.shift();
  }

  // Calculate goal difference and sort
  const sortedStandings = Array.from(standings.values())
    .map(s => ({
      ...s,
      goalDifference: s.goalsFor - s.goalsAgainst,
    }))
    .sort((a, b) => {
      // Sort by: Points > Goal Difference > Goals For > Head-to-head (simplified)
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.team.name.localeCompare(b.team.name);
    });

  // Assign positions
  return sortedStandings.map((s, idx) => ({
    ...s,
    position: idx + 1,
  }));
}

/**
 * Get fixtures for a specific round
 */
export function getFixturesByRound(fixtures: Fixture[], round: number): Fixture[] {
  return fixtures.filter(f => f.round === round);
}

/**
 * Get all fixtures for a specific team
 */
export function getTeamFixtures(fixtures: Fixture[], teamId: string): Fixture[] {
  return fixtures.filter(f => f.homeTeamId === teamId || f.awayTeamId === teamId);
}

/**
 * Get next fixture for a team
 */
export function getNextFixture(fixtures: Fixture[], teamId: string): Fixture | null {
  const teamFixtures = getTeamFixtures(fixtures, teamId)
    .filter(f => !f.played)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return teamFixtures[0] || null;
}

/**
 * Get fixtures on a specific date
 */
export function getFixturesByDate(fixtures: Fixture[], date: Date): Fixture[] {
  const targetDate = date.toDateString();
  return fixtures.filter(f => new Date(f.date).toDateString() === targetDate);
}

/**
 * Get fixtures within a date range
 */
export function getFixturesInRange(
  fixtures: Fixture[],
  startDate: Date,
  endDate: Date
): Fixture[] {
  const start = startDate.getTime();
  const end = endDate.getTime();

  return fixtures
    .filter(f => {
      const fixtureDate = new Date(f.date).getTime();
      return fixtureDate >= start && fixtureDate <= end;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Update a fixture with match result
 */
export function updateFixtureResult(
  fixtures: Fixture[],
  matchId: string,
  homeGoals: number,
  awayGoals: number
): Fixture[] {
  return fixtures.map(f => {
    if (f.matchId === matchId) {
      return {
        ...f,
        played: true,
        homeGoals,
        awayGoals,
      };
    }
    return f;
  });
}

/**
 * Get upcoming fixtures (next N days)
 */
export function getUpcomingFixtures(
  fixtures: Fixture[],
  currentDate: Date,
  days: number = 7
): Fixture[] {
  const endDate = new Date(currentDate);
  endDate.setDate(endDate.getDate() + days);

  return fixtures
    .filter(f => {
      if (f.played) return false;
      const fixtureDate = new Date(f.date);
      return fixtureDate >= currentDate && fixtureDate <= endDate;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get recent results (last N days)
 */
export function getRecentResults(
  fixtures: Fixture[],
  currentDate: Date,
  days: number = 7
): Fixture[] {
  const startDate = new Date(currentDate);
  startDate.setDate(startDate.getDate() - days);

  return fixtures
    .filter(f => {
      if (!f.played) return false;
      const fixtureDate = new Date(f.date);
      return fixtureDate >= startDate && fixtureDate <= currentDate;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Create a competition with generated fixtures
 */
export function createLeagueCompetition(
  id: string,
  name: string,
  shortName: string,
  country: 'PT' | 'ES',
  season: string,
  teams: Team[],
  startDate: Date
): Competition {
  const fixtures = generateRoundRobinFixtures(teams, startDate, true);

  return {
    id,
    name,
    shortName,
    country,
    type: 'league',
    season,
    teams,
    fixtures,
    table: calculateStandings(teams, fixtures),
    currentRound: 1,
    prizes: {
      winner: country === 'PT' ? 100000 : 150000,
      runnerUp: country === 'PT' ? 50000 : 75000,
      perMatch: 5000,
    },
  };
}
