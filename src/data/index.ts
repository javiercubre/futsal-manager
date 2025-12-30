/**
 * Game Data Module
 *
 * Provides access to all team and player data.
 * Data is embedded directly for offline use.
 */

import type { Team, Player, Competition } from '@/types';

// ============================================
// PORTUGAL - LIGA PLACARD
// ============================================

const PORTUGAL_TEAMS: Omit<Team, 'squad'>[] = [
  {
    id: 'pt-sl-benfica',
    name: 'SL Benfica',
    shortName: 'Benfica',
    abbreviation: 'SLB',
    country: 'PT',
    league: 'Liga Placard',
    city: 'Lisbon',
    founded: 1904,
    colors: { primary: '#E31B23', secondary: '#FFFFFF', goalkeeper: '#00FF00' },
    reputation: 95,
    fanBase: 50000,
    facilities: { training: 5, youth: 5, stadium: 3000, medicalCenter: 5 },
    finances: { balance: 2500000, wageBudget: 100000, transferBudget: 800000, weeklyWages: 0, seasonIncome: 0, seasonExpenses: 0 },
    leaguePosition: 1,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  },
  {
    id: 'pt-sporting-cp',
    name: 'Sporting CP',
    shortName: 'Sporting',
    abbreviation: 'SCP',
    country: 'PT',
    league: 'Liga Placard',
    city: 'Lisbon',
    founded: 1906,
    colors: { primary: '#008B47', secondary: '#FFFFFF', goalkeeper: '#FFD700' },
    reputation: 95,
    fanBase: 45000,
    facilities: { training: 5, youth: 5, stadium: 2500, medicalCenter: 5 },
    finances: { balance: 2500000, wageBudget: 100000, transferBudget: 800000, weeklyWages: 0, seasonIncome: 0, seasonExpenses: 0 },
    leaguePosition: 2,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  },
  {
    id: 'pt-sc-braga',
    name: 'SC Braga',
    shortName: 'Braga',
    abbreviation: 'SCB',
    country: 'PT',
    league: 'Liga Placard',
    city: 'Braga',
    founded: 1921,
    colors: { primary: '#C41E3A', secondary: '#FFFFFF', goalkeeper: '#000000' },
    reputation: 80,
    fanBase: 15000,
    facilities: { training: 4, youth: 4, stadium: 1500, medicalCenter: 4 },
    finances: { balance: 800000, wageBudget: 45000, transferBudget: 300000, weeklyWages: 0, seasonIncome: 0, seasonExpenses: 0 },
    leaguePosition: 3,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  },
  {
    id: 'pt-ad-fundao',
    name: 'AD Fundão',
    shortName: 'Fundão',
    abbreviation: 'FUN',
    country: 'PT',
    league: 'Liga Placard',
    city: 'Fundão',
    founded: 1932,
    colors: { primary: '#1E3A8A', secondary: '#FFFFFF', goalkeeper: '#F59E0B' },
    reputation: 72,
    fanBase: 5000,
    facilities: { training: 3, youth: 3, stadium: 1200, medicalCenter: 3 },
    finances: { balance: 500000, wageBudget: 30000, transferBudget: 150000, weeklyWages: 0, seasonIncome: 0, seasonExpenses: 0 },
    leaguePosition: 4,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  },
  {
    id: 'pt-electrico-fc',
    name: 'Eléctrico FC',
    shortName: 'Eléctrico',
    abbreviation: 'EFC',
    country: 'PT',
    league: 'Liga Placard',
    city: 'Ponte de Sor',
    founded: 1932,
    colors: { primary: '#FBBF24', secondary: '#000000', goalkeeper: '#10B981' },
    reputation: 68,
    fanBase: 3000,
    facilities: { training: 3, youth: 3, stadium: 1000, medicalCenter: 3 },
    finances: { balance: 400000, wageBudget: 25000, transferBudget: 120000, weeklyWages: 0, seasonIncome: 0, seasonExpenses: 0 },
    leaguePosition: 5,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  },
  {
    id: 'pt-leoes-porto-salvo',
    name: 'Leões de Porto Salvo',
    shortName: 'Porto Salvo',
    abbreviation: 'LPS',
    country: 'PT',
    league: 'Liga Placard',
    city: 'Oeiras',
    founded: 1952,
    colors: { primary: '#16A34A', secondary: '#FBBF24', goalkeeper: '#DC2626' },
    reputation: 70,
    fanBase: 4000,
    facilities: { training: 3, youth: 3, stadium: 1000, medicalCenter: 3 },
    finances: { balance: 450000, wageBudget: 28000, transferBudget: 130000, weeklyWages: 0, seasonIncome: 0, seasonExpenses: 0 },
    leaguePosition: 6,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  },
];

// ============================================
// SPAIN - LNFS PRIMERA DIVISIÓN
// ============================================

const SPAIN_TEAMS: Omit<Team, 'squad'>[] = [
  {
    id: 'es-fc-barcelona',
    name: 'FC Barcelona',
    shortName: 'Barcelona',
    abbreviation: 'FCB',
    country: 'ES',
    league: 'LNFS Primera División',
    city: 'Barcelona',
    founded: 1899,
    colors: { primary: '#004D98', secondary: '#A50044', goalkeeper: '#FFFF00' },
    reputation: 98,
    fanBase: 80000,
    facilities: { training: 5, youth: 5, stadium: 4500, medicalCenter: 5 },
    finances: { balance: 4000000, wageBudget: 150000, transferBudget: 1200000, weeklyWages: 0, seasonIncome: 0, seasonExpenses: 0 },
    leaguePosition: 1,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  },
  {
    id: 'es-palma-futsal',
    name: 'Palma Futsal',
    shortName: 'Palma',
    abbreviation: 'PAL',
    country: 'ES',
    league: 'LNFS Primera División',
    city: 'Palma de Mallorca',
    founded: 1979,
    colors: { primary: '#DC2626', secondary: '#FFFFFF', goalkeeper: '#16A34A' },
    reputation: 92,
    fanBase: 25000,
    facilities: { training: 5, youth: 4, stadium: 3500, medicalCenter: 5 },
    finances: { balance: 2500000, wageBudget: 100000, transferBudget: 700000, weeklyWages: 0, seasonIncome: 0, seasonExpenses: 0 },
    leaguePosition: 2,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  },
  {
    id: 'es-elpozo-murcia',
    name: 'ElPozo Murcia',
    shortName: 'ElPozo',
    abbreviation: 'EPM',
    country: 'ES',
    league: 'LNFS Primera División',
    city: 'Murcia',
    founded: 1988,
    colors: { primary: '#C8102E', secondary: '#000000', goalkeeper: '#00FF00' },
    reputation: 90,
    fanBase: 20000,
    facilities: { training: 5, youth: 4, stadium: 3000, medicalCenter: 4 },
    finances: { balance: 2000000, wageBudget: 90000, transferBudget: 600000, weeklyWages: 0, seasonIncome: 0, seasonExpenses: 0 },
    leaguePosition: 3,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  },
  {
    id: 'es-movistar-inter',
    name: 'Movistar Inter',
    shortName: 'Inter',
    abbreviation: 'INT',
    country: 'ES',
    league: 'LNFS Primera División',
    city: 'Madrid',
    founded: 1977,
    colors: { primary: '#0066CC', secondary: '#FFFFFF', goalkeeper: '#FF6600' },
    reputation: 90,
    fanBase: 30000,
    facilities: { training: 5, youth: 4, stadium: 3000, medicalCenter: 4 },
    finances: { balance: 2200000, wageBudget: 95000, transferBudget: 650000, weeklyWages: 0, seasonIncome: 0, seasonExpenses: 0 },
    leaguePosition: 4,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  },
  {
    id: 'es-jimbee-cartagena',
    name: 'Jimbee Cartagena',
    shortName: 'Cartagena',
    abbreviation: 'JIM',
    country: 'ES',
    league: 'LNFS Primera División',
    city: 'Cartagena',
    founded: 1988,
    colors: { primary: '#1E3A8A', secondary: '#FFFFFF', goalkeeper: '#F59E0B' },
    reputation: 88,
    fanBase: 15000,
    facilities: { training: 4, youth: 4, stadium: 2500, medicalCenter: 4 },
    finances: { balance: 1800000, wageBudget: 80000, transferBudget: 500000, weeklyWages: 0, seasonIncome: 0, seasonExpenses: 0 },
    leaguePosition: 5,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  },
  {
    id: 'es-jaen-paraiso',
    name: 'Jaén Paraíso Interior',
    shortName: 'Jaén',
    abbreviation: 'JAE',
    country: 'ES',
    league: 'LNFS Primera División',
    city: 'Jaén',
    founded: 1994,
    colors: { primary: '#FBBF24', secondary: '#16A34A', goalkeeper: '#DC2626' },
    reputation: 82,
    fanBase: 10000,
    facilities: { training: 4, youth: 3, stadium: 2200, medicalCenter: 3 },
    finances: { balance: 1000000, wageBudget: 55000, transferBudget: 350000, weeklyWages: 0, seasonIncome: 0, seasonExpenses: 0 },
    leaguePosition: 6,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  },
  {
    id: 'es-vina-albali-valdepenas',
    name: 'Viña Albali Valdepeñas',
    shortName: 'Valdepeñas',
    abbreviation: 'VAL',
    country: 'ES',
    league: 'LNFS Primera División',
    city: 'Valdepeñas',
    founded: 1996,
    colors: { primary: '#7C2D12', secondary: '#FBBF24', goalkeeper: '#10B981' },
    reputation: 80,
    fanBase: 8000,
    facilities: { training: 4, youth: 3, stadium: 2000, medicalCenter: 3 },
    finances: { balance: 900000, wageBudget: 50000, transferBudget: 300000, weeklyWages: 0, seasonIncome: 0, seasonExpenses: 0 },
    leaguePosition: 7,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  },
  {
    id: 'es-industrias-santa-coloma',
    name: 'Industrias Santa Coloma',
    shortName: 'Santa Coloma',
    abbreviation: 'ISC',
    country: 'ES',
    league: 'LNFS Primera División',
    city: 'Barcelona',
    founded: 1985,
    colors: { primary: '#10B981', secondary: '#FFFFFF', goalkeeper: '#3B82F6' },
    reputation: 78,
    fanBase: 6000,
    facilities: { training: 4, youth: 3, stadium: 2000, medicalCenter: 3 },
    finances: { balance: 800000, wageBudget: 45000, transferBudget: 250000, weeklyWages: 0, seasonIncome: 0, seasonExpenses: 0 },
    leaguePosition: 8,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  },
];

// ============================================
// ALL TEAMS
// ============================================

export const ALL_TEAMS: Omit<Team, 'squad'>[] = [
  ...PORTUGAL_TEAMS,
  ...SPAIN_TEAMS,
];

// ============================================
// PLAYER GENERATION
// ============================================

// Player templates with real names
const PLAYER_DATA: Record<string, { name: string; position: string; nationality: string; age: number; star?: boolean }[]> = {
  'pt-sl-benfica': [
    { name: 'Diego Roncaglio', position: 'GK', nationality: 'Argentina', age: 33 },
    { name: 'Léo Jaraguá', position: 'GK', nationality: 'Brazil', age: 28 },
    { name: 'André Coelho', position: 'FIXO', nationality: 'Portugal', age: 32, star: true },
    { name: 'Afonso Jesus', position: 'FIXO', nationality: 'Portugal', age: 29 },
    { name: 'Chishkala', position: 'ALA', nationality: 'Ukraine', age: 33, star: true },
    { name: 'Arthur', position: 'ALA', nationality: 'Brazil', age: 27 },
    { name: 'Tiago Brito', position: 'ALA', nationality: 'Portugal', age: 28, star: true },
    { name: 'Jacaré', position: 'ALA', nationality: 'Brazil', age: 30 },
    { name: 'Silvestre Ferreira', position: 'PIVO', nationality: 'Portugal', age: 28, star: true },
    { name: 'Nilson Miguel', position: 'PIVO', nationality: 'Portugal', age: 26 },
    { name: 'Robinho', position: 'ALA', nationality: 'Brazil', age: 34 },
    { name: 'Diego Nunes', position: 'FIXO', nationality: 'Portugal', age: 24 },
  ],
  'pt-sporting-cp': [
    { name: 'Guitta', position: 'GK', nationality: 'Brazil', age: 35, star: true },
    { name: 'Bernardo Paçó', position: 'GK', nationality: 'Portugal', age: 25 },
    { name: 'João Matos', position: 'FIXO', nationality: 'Portugal', age: 35 },
    { name: 'Pauleta', position: 'FIXO', nationality: 'Portugal', age: 30, star: true },
    { name: 'Zicky Té', position: 'ALA', nationality: 'Portugal', age: 25, star: true },
    { name: 'Pany Varela', position: 'ALA', nationality: 'Portugal', age: 30, star: true },
    { name: 'Alex Merlim', position: 'ALA', nationality: 'Brazil', age: 34, star: true },
    { name: 'Taynan', position: 'PIVO', nationality: 'Brazil', age: 33 },
    { name: 'Tomás Paçó', position: 'PIVO', nationality: 'Portugal', age: 27, star: true },
    { name: 'Erick Mendonça', position: 'ALA', nationality: 'Brazil', age: 28 },
    { name: 'Waltinho', position: 'FIXO', nationality: 'Brazil', age: 32 },
    { name: 'Diego Cavinato', position: 'GK', nationality: 'Brazil', age: 35 },
  ],
  'es-fc-barcelona': [
    { name: 'Miquel Feixas', position: 'GK', nationality: 'Spain', age: 32 },
    { name: 'Dídac Plana', position: 'GK', nationality: 'Spain', age: 29 },
    { name: 'Matheus', position: 'FIXO', nationality: 'Brazil', age: 30 },
    { name: 'Carlos Ortiz', position: 'FIXO', nationality: 'Spain', age: 32, star: true },
    { name: 'Marcenio', position: 'ALA', nationality: 'Brazil', age: 30 },
    { name: 'Dyego', position: 'ALA', nationality: 'Brazil', age: 29, star: true },
    { name: 'Ferrao', position: 'PIVO', nationality: 'Brazil', age: 33, star: true },
    { name: 'Sergio Lozano', position: 'ALA', nationality: 'Spain', age: 36, star: true },
    { name: 'Pito', position: 'PIVO', nationality: 'Brazil', age: 28, star: true },
    { name: 'Adolfo', position: 'ALA', nationality: 'Spain', age: 32, star: true },
    { name: 'Joselito', position: 'FIXO', nationality: 'Brazil', age: 31 },
    { name: 'André Coelho', position: 'FIXO', nationality: 'Brazil', age: 28 },
  ],
  'es-palma-futsal': [
    { name: 'Carlos Barrón', position: 'GK', nationality: 'Spain', age: 34, star: true },
    { name: 'Bruno Gomes', position: 'GK', nationality: 'Brazil', age: 27 },
    { name: 'Marlon', position: 'FIXO', nationality: 'Brazil', age: 32 },
    { name: 'Bruno Taffy', position: 'FIXO', nationality: 'Brazil', age: 29 },
    { name: 'Rafa López', position: 'ALA', nationality: 'Spain', age: 31, star: true },
    { name: 'Claudino', position: 'ALA', nationality: 'Brazil', age: 33, star: true },
    { name: 'Diego Nunes', position: 'ALA', nationality: 'Brazil', age: 28 },
    { name: 'Marlon Velasco', position: 'PIVO', nationality: 'Colombia', age: 26 },
    { name: 'Gordillo', position: 'PIVO', nationality: 'Spain', age: 33 },
    { name: 'Chaguinha', position: 'ALA', nationality: 'Brazil', age: 27 },
  ],
  'es-elpozo-murcia': [
    { name: 'Juanjo', position: 'GK', nationality: 'Spain', age: 35, star: true },
    { name: 'Molina', position: 'GK', nationality: 'Spain', age: 28 },
    { name: 'Andresito', position: 'FIXO', nationality: 'Brazil', age: 32 },
    { name: 'Felipe Valerio', position: 'FIXO', nationality: 'Brazil', age: 29 },
    { name: 'Fernando', position: 'ALA', nationality: 'Brazil', age: 30, star: true },
    { name: 'Marcel', position: 'ALA', nationality: 'Brazil', age: 27, star: true },
    { name: 'Matteus', position: 'ALA', nationality: 'Brazil', age: 26 },
    { name: 'Paradynski', position: 'PIVO', nationality: 'Poland', age: 29 },
    { name: 'Rafa Santos', position: 'PIVO', nationality: 'Brazil', age: 28 },
    { name: 'Lucão', position: 'FIXO', nationality: 'Brazil', age: 31 },
  ],
  'es-movistar-inter': [
    { name: 'Jesús Herrero', position: 'GK', nationality: 'Spain', age: 28, star: true },
    { name: 'Rafa Usín', position: 'GK', nationality: 'Spain', age: 26 },
    { name: 'Boyis', position: 'FIXO', nationality: 'Brazil', age: 33 },
    { name: 'Eric Martel', position: 'FIXO', nationality: 'Spain', age: 27 },
    { name: 'Cecilio', position: 'ALA', nationality: 'Brazil', age: 30 },
    { name: 'Dani Saldise', position: 'ALA', nationality: 'Spain', age: 29 },
    { name: 'Pol Pacheco', position: 'ALA', nationality: 'Spain', age: 26 },
    { name: 'Raya', position: 'PIVO', nationality: 'Spain', age: 33 },
    { name: 'Borja', position: 'PIVO', nationality: 'Spain', age: 31 },
    { name: 'Bruno Dias', position: 'FIXO', nationality: 'Portugal', age: 28 },
  ],
};

// Generate attributes based on team reputation and star status
function generatePlayerAttributes(teamRep: number, isStar: boolean, position: string) {
  const baseMin = Math.floor(teamRep / 10) + 5;
  const baseMax = baseMin + 6;
  const starBonus = isStar ? 3 : 0;

  const randAttr = () => baseMin + Math.floor(Math.random() * (baseMax - baseMin + 1)) + starBonus;

  return {
    technical: {
      shooting: randAttr() + (position === 'PIVO' ? 2 : 0),
      passing: randAttr(),
      dribbling: randAttr() + (position === 'ALA' ? 2 : 0),
      firstTouch: randAttr(),
      technique: randAttr(),
    },
    mental: {
      decisions: randAttr(),
      positioning: randAttr() + (position === 'FIXO' ? 2 : 0),
      workRate: randAttr() - starBonus,
      composure: randAttr(),
      teamwork: randAttr() - starBonus,
      aggression: 5 + Math.floor(Math.random() * 10),
    },
    physical: {
      pace: randAttr() + (position === 'ALA' ? 2 : 0),
      acceleration: randAttr(),
      stamina: randAttr(),
      strength: randAttr() + (position === 'PIVO' ? 2 : 0),
      agility: randAttr(),
    },
    goalkeeping: position === 'GK' ? {
      reflexes: randAttr() + 2,
      handling: randAttr() + 2,
      oneOnOnes: randAttr() + 2,
      distribution: randAttr(),
      aerialAbility: randAttr(),
    } : undefined,
  };
}

/**
 * Generate all players for all teams
 */
export function generateAllPlayers(): Player[] {
  const players: Player[] = [];

  for (const team of ALL_TEAMS) {
    const teamPlayers = PLAYER_DATA[team.id];
    if (!teamPlayers) continue;

    for (let i = 0; i < teamPlayers.length; i++) {
      const p = teamPlayers[i];
      const attrs = generatePlayerAttributes(team.reputation, p.star || false, p.position);

      const avgAttr = (
        Object.values(attrs.technical).reduce((a, b) => a + b, 0) +
        Object.values(attrs.mental).reduce((a, b) => a + b, 0) +
        Object.values(attrs.physical).reduce((a, b) => a + b, 0)
      ) / 16;

      const currentAbility = Math.min(200, Math.floor(avgAttr * 10) + (p.star ? 20 : 0));
      const potential = Math.min(200, currentAbility + Math.floor(Math.random() * 20) + 10);

      const player: Player = {
        id: `${team.id}-${i}`,
        name: p.name,
        shortName: p.name.split(' ').pop() || p.name,
        nationality: p.nationality,
        dateOfBirth: new Date(2024 - p.age, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        age: p.age,
        position: p.position as 'GK' | 'FIXO' | 'ALA' | 'PIVO',
        secondaryPositions: [],
        preferredFoot: Math.random() > 0.3 ? 'right' : Math.random() > 0.5 ? 'left' : 'both',
        shirtNumber: i + 1,
        ...attrs,
        currentAbility,
        potential,
        form: 5 + Math.floor(Math.random() * 4),
        morale: 60 + Math.floor(Math.random() * 30),
        fitness: 80 + Math.floor(Math.random() * 20),
        sharpness: 70 + Math.floor(Math.random() * 20),
        suspended: false,
        suspensionMatches: 0,
        contract: {
          wage: Math.round((currentAbility * 50 + Math.random() * 2000) / 100) * 100,
          startDate: new Date(2023, 6, 1),
          expiryDate: new Date(2026, 5, 30),
        },
        marketValue: Math.round((currentAbility * 5000 * (p.age < 30 ? 1.2 : 0.8)) / 10000) * 10000,
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
          totalAppearances: 50 + Math.floor(Math.random() * 150),
          totalGoals: p.position === 'GK' ? 0 : 10 + Math.floor(Math.random() * 50),
          totalAssists: p.position === 'GK' ? 0 : 5 + Math.floor(Math.random() * 30),
          seasonsPlayed: 3 + Math.floor(Math.random() * 8),
        },
      };

      players.push(player);
    }
  }

  return players;
}

/**
 * Get teams with their squads populated
 */
export function getTeamsWithSquads(): Team[] {
  const allPlayers = generateAllPlayers();

  return ALL_TEAMS.map(team => ({
    ...team,
    squad: allPlayers.filter(p => p.id.startsWith(team.id)),
  }));
}

/**
 * Get teams for a specific country
 */
export function getTeamsByCountry(country: 'PT' | 'ES'): Omit<Team, 'squad'>[] {
  return ALL_TEAMS.filter(t => t.country === country);
}

/**
 * Generate competitions with fixtures for a new season
 */
export function generateCompetitions(teams: Team[], seasonStartDate: Date = new Date(2024, 7, 1)): Competition[] {
  const competitions: Competition[] = [];

  // Separate teams by country
  const portugalTeams = teams.filter(t => t.country === 'PT');
  const spainTeams = teams.filter(t => t.country === 'ES');

  // Generate Liga Placard (Portugal)
  if (portugalTeams.length >= 4) {
    const ptFixtures = generateLeagueFixtures(portugalTeams, seasonStartDate);
    competitions.push({
      id: 'liga-placard-2024',
      name: 'Liga Placard',
      shortName: 'Liga Placard',
      country: 'PT',
      type: 'league',
      season: '2024-25',
      teams: portugalTeams,
      fixtures: ptFixtures,
      table: initializeTable(portugalTeams),
      currentRound: 1,
      prizes: {
        winner: 100000,
        runnerUp: 50000,
        perMatch: 5000,
      },
    });
  }

  // Generate LNFS Primera División (Spain)
  if (spainTeams.length >= 4) {
    const esStartDate = new Date(seasonStartDate);
    esStartDate.setDate(esStartDate.getDate() + 3); // Spain starts 3 days later

    const esFixtures = generateLeagueFixtures(spainTeams, esStartDate);
    competitions.push({
      id: 'lnfs-primera-2024',
      name: 'LNFS Primera División',
      shortName: 'LNFS',
      country: 'ES',
      type: 'league',
      season: '2024-25',
      teams: spainTeams,
      fixtures: esFixtures,
      table: initializeTable(spainTeams),
      currentRound: 1,
      prizes: {
        winner: 150000,
        runnerUp: 75000,
        perMatch: 7500,
      },
    });
  }

  return competitions;
}

/**
 * Generate round-robin fixtures for a league
 */
function generateLeagueFixtures(teams: Team[], startDate: Date): import('@/types').Fixture[] {
  const fixtures: import('@/types').Fixture[] = [];
  const numTeams = teams.length;

  // If odd number of teams, we'll handle bye weeks
  const teamIds = teams.map(t => t.id);
  const hasBye = numTeams % 2 !== 0;
  if (hasBye) {
    teamIds.push('BYE');
  }

  const n = teamIds.length;
  const rounds = n - 1;
  const matchesPerRound = n / 2;

  // Circle method for round-robin scheduling
  let rotatingTeams = [...teamIds];
  const fixedTeam = rotatingTeams.shift()!;

  // First half of season
  for (let round = 0; round < rounds; round++) {
    const roundTeams = [fixedTeam, ...rotatingTeams];

    for (let match = 0; match < matchesPerRound; match++) {
      const homeIdx = match;
      const awayIdx = n - 1 - match;

      const homeTeamId = roundTeams[homeIdx];
      const awayTeamId = roundTeams[awayIdx];

      // Skip bye matches
      if (homeTeamId === 'BYE' || awayTeamId === 'BYE') continue;

      // Alternate home/away based on round to balance schedule
      const isHomeFirst = (round + match) % 2 === 0;

      // Create a new Date for each fixture to avoid shared references
      const matchDate = new Date(startDate);
      matchDate.setDate(matchDate.getDate() + (round * 7)); // One round per week

      fixtures.push({
        matchId: `match-r${round + 1}-${isHomeFirst ? homeTeamId : awayTeamId}-vs-${isHomeFirst ? awayTeamId : homeTeamId}`,
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

  // Second half of season (reverse fixtures)
  const firstLegCount = fixtures.length;
  const secondHalfStart = new Date(startDate);
  secondHalfStart.setDate(secondHalfStart.getDate() + (rounds * 7) + 14); // 2 week break

  for (let i = 0; i < firstLegCount; i++) {
    const original = fixtures[i];
    const roundDate = new Date(secondHalfStart);
    roundDate.setDate(roundDate.getDate() + ((original.round - 1) * 7));

    fixtures.push({
      matchId: `match-r${rounds + original.round}-${original.awayTeamId}-vs-${original.homeTeamId}`,
      homeTeamId: original.awayTeamId,
      awayTeamId: original.homeTeamId,
      date: roundDate,
      round: rounds + original.round,
      played: false,
    });
  }

  return fixtures;
}

/**
 * Initialize league table for teams
 */
function initializeTable(teams: Team[]): import('@/types').LeagueTable[] {
  return teams.map((team, idx) => ({
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
    position: idx + 1,
  }));
}

export default {
  ALL_TEAMS,
  generateAllPlayers,
  getTeamsWithSquads,
  getTeamsByCountry,
  generateCompetitions,
};
