// Match Engine Types
// Specific types for the match simulation engine

import type { Player, Team, Tactic, MatchEvent } from '@/types';

// Position on the court (0-100 for both x and y)
export interface CourtPosition {
  x: number;  // 0 = own goal, 100 = opponent goal
  y: number;  // 0 = left sideline, 100 = right sideline
}

// Ball state during simulation
export interface BallState {
  position: CourtPosition;
  possessionTeam: 'home' | 'away' | null;
  possessionPlayer: string | null;  // Player ID
  isInPlay: boolean;
}

// Player state during match
export interface PlayerMatchState {
  playerId: string;
  player: Player;
  position: CourtPosition;
  targetPosition: CourtPosition;
  stamina: number;         // 0-100, decreases during match
  form: number;            // Match form, can fluctuate
  hasYellowCard: boolean;
  isOnCourt: boolean;      // false if on bench or sent off
  minutesPlayed: number;
  goals: number;
  assists: number;
  saves: number;
  foulsCommitted: number;
  rating: number;          // 1-10 match rating
}

// Team state during match
export interface TeamMatchState {
  team: Team;
  tactic: Tactic;
  players: PlayerMatchState[];
  onCourt: string[];       // 5 player IDs currently on court
  bench: string[];         // Bench player IDs
  substitutionsUsed: number;
  timeoutsUsed: number;
  accumulatedFouls: number; // Resets each half
  isUsingFlyingGK: boolean;
  // Red card power play: seconds remaining until team can sub back to 5 players
  powerPlaySecondsRemaining: number;
  // Player sent off who triggered current power play (for tracking)
  sentOffPlayerId: string | null;
}

// Match simulation state
export interface MatchSimulationState {
  matchId: string;

  // Time
  period: 0 | 1 | 2;       // 0 = not started, 1 = first half, 2 = second half
  minute: number;          // 0-20 for each half
  second: number;          // 0-59
  isHalfTime: boolean;
  isFullTime: boolean;
  isPaused: boolean;

  // Score
  homeGoals: number;
  awayGoals: number;

  // Ball
  ball: BallState;

  // Teams
  home: TeamMatchState;
  away: TeamMatchState;

  // Match events
  events: MatchEvent[];

  // Current phase of play
  phase: MatchPhase;

  // Statistics
  stats: MatchSimulationStats;
}

export type MatchPhase =
  | 'kickoff'
  | 'open_play'
  | 'attack'
  | 'shot'
  | 'goal_scored'
  | 'save'
  | 'corner'
  | 'free_kick'
  | 'penalty'
  | 'goal_kick'
  | 'throw_in'
  | 'timeout'
  | 'substitution'
  | 'foul'
  | 'card';

export interface MatchSimulationStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
  saves: { home: number; away: number };
  passes: { home: number; away: number };
  passAccuracy: { home: number; away: number };
}

// Action result from simulation tick
export interface TickResult {
  events: MatchEvent[];
  stateChanged: boolean;
  commentary?: string;
}

// Probability weights for different actions
export interface ActionProbabilities {
  pass: number;
  dribble: number;
  shoot: number;
  cross: number;
  tackle: number;
  foul: number;
  loseBalance: number;
}

// Zone on the futsal court
export type CourtZone =
  | 'own_goal_area'
  | 'own_half_defense'
  | 'own_half_midfield'
  | 'center'
  | 'opp_half_midfield'
  | 'opp_half_attack'
  | 'opp_goal_area';

// Shot outcome
export interface ShotOutcome {
  isOnTarget: boolean;
  isGoal: boolean;
  isSaved: boolean;
  isBlocked: boolean;
  isWide: boolean;
  isPost: boolean;
  power: number;
  placement: 'left' | 'center' | 'right';
  height: 'low' | 'mid' | 'high';
}
