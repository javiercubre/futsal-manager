// ============================================
// FUTSAL MANAGER - TYPE DEFINITIONS
// ============================================

// Player position in futsal (5v5)
export type Position = 'GK' | 'FIXO' | 'ALA' | 'PIVO';

// Preferred foot
export type Foot = 'left' | 'right' | 'both';

// Country codes for leagues
export type Country = 'PT' | 'ES';

// Competition types
export type CompetitionType = 'league' | 'cup' | 'european';

// ============================================
// PLAYER ATTRIBUTES
// ============================================

export interface TechnicalAttributes {
  shooting: number;      // Finishing ability
  passing: number;       // Pass accuracy and vision
  dribbling: number;     // Ball control while moving
  firstTouch: number;    // Receiving the ball
  technique: number;     // Overall technical ability
}

export interface MentalAttributes {
  decisions: number;     // Decision making speed
  positioning: number;   // Positioning awareness
  workRate: number;      // Effort and running
  composure: number;     // Calm under pressure
  teamwork: number;      // Team play ability
  aggression: number;    // Physical aggression
}

export interface PhysicalAttributes {
  pace: number;          // Top speed
  acceleration: number;  // Speed to reach top pace
  stamina: number;       // Endurance
  strength: number;      // Physical power
  agility: number;       // Change of direction
}

export interface GoalkeeperAttributes {
  reflexes: number;      // Shot stopping
  handling: number;      // Catching ability
  oneOnOnes: number;     // 1v1 situations
  distribution: number;  // Throwing/kicking
  aerialAbility: number; // Dealing with high balls
}

// ============================================
// INJURY & CONTRACT
// ============================================

export interface Injury {
  type: string;          // "muscle", "ankle", etc.
  severity: 'minor' | 'moderate' | 'severe';
  daysRemaining: number;
  returnDate: Date;
}

export interface Contract {
  wage: number;          // Weekly wage in euros
  startDate: Date;
  expiryDate: Date;
  releaseClause?: number;
  bonuses?: {
    goalBonus?: number;
    cleanSheetBonus?: number;
    appearanceBonus?: number;
  };
}

// ============================================
// PLAYER
// ============================================

export interface Player {
  id: string;
  name: string;
  shortName: string;
  nationality: string;
  dateOfBirth: Date;
  age: number;

  position: Position;
  secondaryPositions: Position[];
  preferredFoot: Foot;
  shirtNumber?: number;

  // Attributes (1-20 scale like FM)
  technical: TechnicalAttributes;
  mental: MentalAttributes;
  physical: PhysicalAttributes;
  goalkeeping?: GoalkeeperAttributes;

  // Dynamic stats
  currentAbility: number;  // 1-200 overall rating
  potential: number;       // Max potential ability
  form: number;            // 1-10 recent form
  morale: number;          // 0-100
  fitness: number;         // 0-100
  sharpness: number;       // 0-100 match sharpness

  injury?: Injury;
  suspended: boolean;
  suspensionMatches: number;

  contract: Contract;
  marketValue: number;

  // Stats
  seasonStats: PlayerSeasonStats;
  careerStats: PlayerCareerStats;
}

export interface PlayerSeasonStats {
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  averageRating: number;
  cleanSheets?: number;    // For GK
  saves?: number;          // For GK
}

export interface PlayerCareerStats {
  totalAppearances: number;
  totalGoals: number;
  totalAssists: number;
  seasonsPlayed: number;
}

// ============================================
// TEAM
// ============================================

export interface TeamColors {
  primary: string;
  secondary: string;
  goalkeeper: string;
}

export interface TeamFacilities {
  training: number;        // 1-5 stars
  youth: number;           // 1-5 stars
  stadium: number;         // Capacity
  medicalCenter: number;   // 1-5 stars
}

export interface TeamFinances {
  balance: number;
  wageBudget: number;
  transferBudget: number;
  weeklyWages: number;
  seasonIncome: number;
  seasonExpenses: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;    // 3-letter code
  country: Country;
  league: string;
  city: string;
  founded: number;

  squad: Player[];

  finances: TeamFinances;
  facilities: TeamFacilities;
  colors: TeamColors;

  reputation: number;      // 1-100 (affects transfers, player interest)
  fanBase: number;         // Affects income

  manager?: string;        // AI manager name if not player's team

  // Current season
  leaguePosition: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

// ============================================
// TACTICS
// ============================================

export type Formation =
  | '4-0'      // Diamond (1 fixo, 2 alas, 1 pivot) - no pivot
  | '3-1'      // 1 fixo, 2 alas, 1 pivot
  | '2-2'      // 2 fixos, 2 pivots (balanced)
  | '1-2-1'    // 1 fixo, 2 wings, 1 pivot
  | '4-0-power' // Power play formation (5 outfield)
  | '5-0-gk';   // Flying goalkeeper

export type Mentality = 'defensive' | 'balanced' | 'attacking';
export type Tempo = 'slow' | 'normal' | 'fast';
export type PressingIntensity = 'low' | 'medium' | 'high';
export type PassingStyle = 'short' | 'mixed' | 'direct';

export interface PlayerInstruction {
  playerId: string;
  role: string;
  duty: 'defend' | 'support' | 'attack';
  specificInstructions: string[];
}

export interface SetPieceRoutine {
  name: string;
  description: string;
  positions: { playerId: string; x: number; y: number }[];
}

export interface Tactic {
  id: string;
  name: string;
  formation: Formation;

  mentality: Mentality;
  tempo: Tempo;
  pressing: PressingIntensity;
  passingStyle: PassingStyle;

  // Width and defense line
  width: number;           // 1-20
  defenseLine: number;     // 1-20 (higher = more aggressive)

  // Set pieces
  corners: SetPieceRoutine;
  freeKicks: SetPieceRoutine;
  kickoffs: SetPieceRoutine;

  // Player-specific
  playerInstructions: PlayerInstruction[];

  // Futsal-specific
  useFlyingGoalkeeper: boolean;      // Use GK as outfield in final minutes
  flyingGkTrigger: 'never' | 'lastMinutes' | 'whenLosing';
  timeoutStrategy: 'early' | 'late' | 'tactical';
  rotationFrequency: 'low' | 'medium' | 'high';
}

// ============================================
// MATCH
// ============================================

export type MatchEventType =
  | 'goal'
  | 'assist'
  | 'shot'
  | 'shot_on_target'
  | 'save'
  | 'foul'
  | 'yellow_card'
  | 'red_card'
  | 'second_yellow'
  | 'substitution'
  | 'timeout'
  | 'penalty'
  | 'penalty_saved'
  | 'penalty_missed'
  | 'accumulated_foul_penalty'  // 6th foul
  | 'period_end'
  | 'match_end';

export interface MatchEvent {
  id: string;
  type: MatchEventType;
  minute: number;
  second: number;
  period: 1 | 2;
  teamId: string;
  playerId?: string;
  assistPlayerId?: string;
  description: string;

  // For visualization
  position?: { x: number; y: number };
}

export interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
  saves: { home: number; away: number };
  passAccuracy: { home: number; away: number };
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  competition: string;
  competitionType: CompetitionType;
  round?: number;
  leg?: 1 | 2;
  date: Date;
  venue: string;

  // Match state
  status: 'scheduled' | 'live' | 'finished';
  currentMinute: number;
  currentSecond: number;
  period: 0 | 1 | 2;       // 0 = not started

  // Score
  homeGoals: number;
  awayGoals: number;

  // Futsal-specific
  homeAccumulatedFouls: number;  // Reset each half
  awayAccumulatedFouls: number;
  homeTimeoutsUsed: number;      // 1 per half
  awayTimeoutsUsed: number;

  // Events and stats
  events: MatchEvent[];
  stats: MatchStats;

  // Lineups
  homeLineup: string[];    // Player IDs (5 on court)
  awayLineup: string[];
  homeBench: string[];
  awayBench: string[];

  // Tactics used
  homeTactic: Tactic;
  awayTactic: Tactic;

  // Player ratings (calculated during/after match)
  playerRatings: Map<string, number>;
}

// ============================================
// COMPETITION
// ============================================

export interface LeagueTable {
  teamId: string;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];  // Last 5 matches
  position: number;
}

export interface Fixture {
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  date: Date;
  round: number;
  played: boolean;
  homeGoals?: number;
  awayGoals?: number;
}

export interface Competition {
  id: string;
  name: string;
  shortName: string;
  country: Country | 'EU';
  type: CompetitionType;
  season: string;          // "2024-25"

  teams: Team[];
  fixtures: Fixture[];
  table?: LeagueTable[];   // For leagues
  currentRound: number;

  // Prize money
  prizes: {
    winner: number;
    runnerUp: number;
    perMatch?: number;
  };
}

// ============================================
// GAME STATE
// ============================================

export interface SaveGame {
  id: string;
  name: string;
  createdAt: Date;
  lastSaved: Date;
  gameDate: Date;
  managerName: string;
  teamId: string;
  teamName: string;
  season: string;
}

export interface GameState {
  // Meta
  saveId: string;
  managerName: string;
  currentDate: Date;
  season: string;

  // Player's team
  playerTeamId: string;
  playerTeam: Team;

  // All data
  teams: Team[];
  players: Player[];
  competitions: Competition[];

  // News & Events
  inbox: NewsItem[];

  // Settings
  language: 'en' | 'pt' | 'es';
  simulationSpeed: number;
}

export interface NewsItem {
  id: string;
  date: Date;
  title: string;
  content: string;
  type: 'match' | 'transfer' | 'injury' | 'general';
  read: boolean;
}

// ============================================
// TRANSFER
// ============================================

export interface TransferOffer {
  id: string;
  playerId: string;
  fromTeamId: string;
  toTeamId: string;
  fee: number;
  wageOffer: number;
  contractLength: number;  // years
  status: 'pending' | 'accepted' | 'rejected' | 'negotiating';
  expiryDate: Date;
}

export interface LoanOffer {
  id: string;
  playerId: string;
  fromTeamId: string;
  toTeamId: string;
  loanFee: number;
  wageContribution: number;  // Percentage paid by loaning club
  duration: number;          // months
  buyOption?: number;        // Optional buy clause
  status: 'pending' | 'accepted' | 'rejected';
}
