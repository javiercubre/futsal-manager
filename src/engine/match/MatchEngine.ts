/**
 * Futsal Match Engine
 *
 * Simulates a complete futsal match with:
 * - Tick-based simulation (1 tick = 1 second of match time)
 * - Realistic event generation based on player stats and tactics
 * - Futsal-specific rules (accumulated fouls, flying goalkeeper, etc.)
 * - Commentary generation
 */

import type { Team, Tactic, Player, MatchEvent, MatchEventType } from '@/types';
import type {
  MatchSimulationState,
  TeamMatchState,
  PlayerMatchState,
  BallState,
  CourtPosition,
  TickResult,
  MatchPhase,
  CourtZone,
  ShotOutcome,
  MatchSimulationStats,
} from './types';
import { generateCommentary } from './commentary';
import { calculatePlayerRating, getRandomPlayer, weightedRandom } from './utils';

// Constants
const HALF_DURATION_MINUTES = 20;
const SECONDS_PER_MINUTE = 60;
const MAX_SUBSTITUTIONS = 999; // Unlimited in futsal
const ACCUMULATED_FOULS_PENALTY = 5; // 6th foul = penalty

export class MatchEngine {
  private state: MatchSimulationState;
  private tickCallbacks: ((state: MatchSimulationState, result: TickResult) => void)[] = [];

  constructor(
    homeTeam: Team,
    awayTeam: Team,
    homeTactic: Tactic,
    awayTactic: Tactic,
    homePlayers: Player[],
    awayPlayers: Player[]
  ) {
    this.state = this.initializeMatch(
      homeTeam,
      awayTeam,
      homeTactic,
      awayTactic,
      homePlayers,
      awayPlayers
    );
  }

  private initializeMatch(
    homeTeam: Team,
    awayTeam: Team,
    homeTactic: Tactic,
    awayTactic: Tactic,
    homePlayers: Player[],
    awayPlayers: Player[]
  ): MatchSimulationState {
    const createTeamState = (
      team: Team,
      tactic: Tactic,
      players: Player[],
      isHome: boolean
    ): TeamMatchState => {
      // Sort players by position for lineup selection
      const gks = players.filter(p => p.position === 'GK');
      const outfield = players.filter(p => p.position !== 'GK');

      // Select starting 5: 1 GK + 4 outfield
      const startingGK = gks[0];
      const startingOutfield = outfield.slice(0, 4);
      const starting = startingGK ? [startingGK, ...startingOutfield] : outfield.slice(0, 5);
      const bench = players.filter(p => !starting.includes(p));

      // Create a map of starting player IDs to their lineup position (0-4)
      const startingPositionMap = new Map<string, number>();
      starting.forEach((p, i) => startingPositionMap.set(p.id, i));

      const playerStates: PlayerMatchState[] = players.map((player) => {
        // Use lineup position for starters (0-4), bench players get position based on role
        const isStarting = starting.includes(player);
        const positionIndex = isStarting
          ? startingPositionMap.get(player.id) || 0
          : 0; // Bench players start at default position (doesn't matter, they're not displayed)

        return {
          playerId: player.id,
          player,
          position: this.getInitialPosition(player, positionIndex, tactic, isHome),
          targetPosition: this.getInitialPosition(player, positionIndex, tactic, isHome),
          stamina: player.fitness,
          form: player.form + (Math.random() * 2 - 1), // Slight variation
          hasYellowCard: false,
          isOnCourt: isStarting,
          minutesPlayed: 0,
          goals: 0,
          assists: 0,
          saves: 0,
          foulsCommitted: 0,
          rating: 6.0, // Starting rating
        };
      });

      return {
        team,
        tactic,
        players: playerStates,
        onCourt: starting.map(p => p.id),
        bench: bench.map(p => p.id),
        substitutionsUsed: 0,
        timeoutsUsed: 0,
        accumulatedFouls: 0,
        isUsingFlyingGK: false,
        powerPlaySecondsRemaining: 0,
        sentOffPlayerId: null,
      };
    };

    const initialStats: MatchSimulationStats = {
      possession: { home: 50, away: 50 },
      shots: { home: 0, away: 0 },
      shotsOnTarget: { home: 0, away: 0 },
      corners: { home: 0, away: 0 },
      fouls: { home: 0, away: 0 },
      yellowCards: { home: 0, away: 0 },
      redCards: { home: 0, away: 0 },
      saves: { home: 0, away: 0 },
      passes: { home: 0, away: 0 },
      passAccuracy: { home: 85, away: 85 },
    };

    return {
      matchId: crypto.randomUUID(),
      period: 0,
      minute: 0,
      second: 0,
      isHalfTime: false,
      isFullTime: false,
      isPaused: true,
      homeGoals: 0,
      awayGoals: 0,
      ball: {
        position: { x: 50, y: 50 },
        possessionTeam: null,
        possessionPlayer: null,
        isInPlay: false,
      },
      home: createTeamState(homeTeam, homeTactic, homePlayers, true),
      away: createTeamState(awayTeam, awayTactic, awayPlayers, false),
      events: [],
      phase: 'kickoff',
      stats: initialStats,
    };
  }

  private getInitialPosition(
    player: Player,
    index: number,
    tactic: Tactic,
    isHome: boolean
  ): CourtPosition {
    // Base positions based on formation
    const formationPositions: Record<string, CourtPosition[]> = {
      '4-0': [
        { x: 10, y: 50 },  // GK
        { x: 35, y: 50 },  // Fixo
        { x: 55, y: 25 },  // Ala L
        { x: 55, y: 75 },  // Ala R
        { x: 75, y: 50 },  // Pivot
      ],
      '3-1': [
        { x: 10, y: 50 },
        { x: 30, y: 30 },
        { x: 30, y: 70 },
        { x: 55, y: 50 },
        { x: 80, y: 50 },
      ],
      '2-2': [
        { x: 10, y: 50 },
        { x: 35, y: 35 },
        { x: 35, y: 65 },
        { x: 65, y: 35 },
        { x: 65, y: 65 },
      ],
      '1-2-1': [
        { x: 10, y: 50 },
        { x: 30, y: 50 },
        { x: 50, y: 25 },
        { x: 50, y: 75 },
        { x: 80, y: 50 },
      ],
    };

    const positions = formationPositions[tactic.formation] || formationPositions['3-1'];
    const pos = positions[index % 5] || { x: 50, y: 50 };

    // Mirror for away team
    if (!isHome) {
      return { x: 100 - pos.x, y: pos.y };
    }
    return pos;
  }

  // Start the match
  public kickoff(): void {
    this.state.period = 1;
    this.state.isPaused = false;
    this.state.phase = 'kickoff';

    // Home team kicks off first half
    this.state.ball = {
      position: { x: 50, y: 50 },
      possessionTeam: 'home',
      possessionPlayer: this.getRandomOutfieldPlayer('home'),
      isInPlay: true,
    };

    this.addEvent('period_end', 'home', undefined, 'First half begins!');
  }

  // Main simulation tick - call this every second of game time
  public tick(): TickResult {
    if (this.state.isPaused || this.state.isFullTime) {
      return { events: [], stateChanged: false };
    }

    const result: TickResult = { events: [], stateChanged: true };

    // Advance time
    this.advanceTime();

    // Check for half time / full time
    if (this.checkPeriodEnd()) {
      return result;
    }

    // Update player stamina
    this.updatePlayerStamina();

    // Update player positions (randomize movement)
    this.updatePlayerPositions();

    // Check power play countdown (red card 2-minute penalty)
    this.updatePowerPlay();

    // Check for automatic substitutions (every 30 seconds)
    if (this.state.second % 30 === 0) {
      this.checkAutoSubstitutions();
    }

    // Simulate the current phase of play
    const phaseResult = this.simulatePhase();
    result.events = phaseResult.events;
    result.commentary = phaseResult.commentary;

    // Update possession stats
    this.updatePossessionStats();

    // Notify callbacks
    this.tickCallbacks.forEach(cb => cb(this.state, result));

    return result;
  }

  private advanceTime(): void {
    this.state.second++;
    if (this.state.second >= SECONDS_PER_MINUTE) {
      this.state.second = 0;
      this.state.minute++;

      // Update minutes played for players on court
      ['home', 'away'].forEach(side => {
        const team = this.state[side as 'home' | 'away'];
        team.onCourt.forEach(playerId => {
          const player = team.players.find(p => p.playerId === playerId);
          if (player) player.minutesPlayed++;
        });
      });
    }
  }

  private checkPeriodEnd(): boolean {
    if (this.state.minute >= HALF_DURATION_MINUTES) {
      if (this.state.period === 1) {
        // Half time
        this.state.isHalfTime = true;
        this.state.isPaused = true;
        this.addEvent('period_end', 'home', undefined, 'Half time!');

        // Reset accumulated fouls
        this.state.home.accumulatedFouls = 0;
        this.state.away.accumulatedFouls = 0;

        return true;
      } else if (this.state.period === 2) {
        // Full time
        this.state.isFullTime = true;
        this.state.isPaused = true;
        this.addEvent('match_end', 'home', undefined, 'Full time!');
        return true;
      }
    }
    return false;
  }

  // Start second half
  public startSecondHalf(): void {
    this.state.period = 2;
    this.state.minute = 0;
    this.state.second = 0;
    this.state.isHalfTime = false;
    this.state.isPaused = false;
    this.state.phase = 'kickoff';

    // Away team kicks off second half
    this.state.ball = {
      position: { x: 50, y: 50 },
      possessionTeam: 'away',
      possessionPlayer: this.getRandomOutfieldPlayer('away'),
      isInPlay: true,
    };
  }

  private simulatePhase(): TickResult {
    const result: TickResult = { events: [], stateChanged: true };

    switch (this.state.phase) {
      case 'kickoff':
        this.state.phase = 'open_play';
        break;

      case 'open_play':
        result.events = this.simulateOpenPlay();
        break;

      case 'attack':
        result.events = this.simulateAttack();
        break;

      case 'shot':
        result.events = this.simulateShot();
        break;

      case 'goal_scored':
        this.state.phase = 'kickoff';
        // Opponent kicks off
        this.state.ball.possessionTeam =
          this.state.ball.possessionTeam === 'home' ? 'away' : 'home';
        break;

      case 'save':
      case 'goal_kick':
        this.state.phase = 'open_play';
        // GK has the ball
        const defendingTeam = this.state.ball.possessionTeam === 'home' ? 'away' : 'home';
        this.state.ball.possessionTeam = defendingTeam;
        this.state.ball.possessionPlayer = this.getGoalkeeper(defendingTeam);
        this.state.ball.position = { x: defendingTeam === 'home' ? 10 : 90, y: 50 };
        break;

      case 'corner':
        result.events = this.simulateCorner();
        break;

      case 'free_kick':
        result.events = this.simulateFreeKick();
        break;

      case 'penalty':
        result.events = this.simulatePenalty();
        break;

      case 'foul':
        this.handleFoulConsequence();
        break;

      default:
        this.state.phase = 'open_play';
    }

    // Generate commentary
    if (result.events.length > 0) {
      result.commentary = generateCommentary(result.events[0], this.state);
    }

    return result;
  }

  private simulateOpenPlay(): MatchEvent[] {
    const events: MatchEvent[] = [];
    const possessionTeam = this.state.ball.possessionTeam;
    if (!possessionTeam) return events;

    const team = this.state[possessionTeam];
    const opponent = this.state[possessionTeam === 'home' ? 'away' : 'home'];
    const playerWithBall = team.players.find(p => p.playerId === this.state.ball.possessionPlayer);

    if (!playerWithBall) {
      this.state.ball.possessionPlayer = this.getRandomOutfieldPlayer(possessionTeam);
      return events;
    }

    // Calculate action probabilities based on position, tactics, and player attributes
    const zone = this.getCourtZone(this.state.ball.position, possessionTeam);
    const actionWeights = this.calculateActionWeights(playerWithBall, team.tactic, zone);

    // Decide action
    const action = weightedRandom(actionWeights);

    switch (action) {
      case 'pass':
        events.push(...this.executePass(playerWithBall, team, opponent));
        break;

      case 'dribble':
        events.push(...this.executeDribble(playerWithBall, team, opponent));
        break;

      case 'shoot':
        this.state.phase = 'shot';
        break;

      case 'lose_possession':
        this.changePossession();
        break;
    }

    // Random chance of foul during play
    if (Math.random() < 0.02) { // 2% chance per tick
      events.push(...this.checkForFoul(playerWithBall, opponent));
    }

    return events;
  }

  private simulateAttack(): MatchEvent[] {
    // More aggressive play in attacking third
    const possessionTeam = this.state.ball.possessionTeam!;
    const team = this.state[possessionTeam];
    const playerWithBall = team.players.find(p => p.playerId === this.state.ball.possessionPlayer);

    if (!playerWithBall) return [];

    // Higher chance to shoot in attack phase
    const shootChance = this.calculateShootChance(playerWithBall, team.tactic);

    if (Math.random() < shootChance) {
      this.state.phase = 'shot';
    } else if (Math.random() < 0.3) {
      // Try to pass to better positioned player
      return this.executePass(playerWithBall, team, this.state[possessionTeam === 'home' ? 'away' : 'home']);
    }

    return [];
  }

  private simulateShot(): MatchEvent[] {
    const events: MatchEvent[] = [];
    const possessionTeam = this.state.ball.possessionTeam!;
    const team = this.state[possessionTeam];
    const opponent = this.state[possessionTeam === 'home' ? 'away' : 'home'];
    const shooter = team.players.find(p => p.playerId === this.state.ball.possessionPlayer);

    if (!shooter) {
      this.state.phase = 'open_play';
      return events;
    }

    // Calculate shot outcome
    const outcome = this.calculateShotOutcome(shooter, opponent);

    // Record shot
    this.state.stats.shots[possessionTeam]++;

    if (outcome.isOnTarget) {
      this.state.stats.shotsOnTarget[possessionTeam]++;
    }

    // Create shot event
    const shotEvent = this.createEvent('shot', possessionTeam, shooter.playerId);
    shotEvent.description = `${shooter.player.name} shoots!`;
    events.push(shotEvent);

    if (outcome.isGoal) {
      // GOAL!
      events.push(...this.scoreGoal(shooter, team, possessionTeam));
    } else if (outcome.isSaved) {
      // Save
      const gk = opponent.players.find(p => p.player.position === 'GK' && p.isOnCourt);
      if (gk) {
        gk.saves++;
        gk.rating = Math.min(10, gk.rating + 0.3);
        this.state.stats.saves[possessionTeam === 'home' ? 'away' : 'home']++;

        const saveEvent = this.createEvent('save', possessionTeam === 'home' ? 'away' : 'home', gk.playerId);
        saveEvent.description = `Great save by ${gk.player.name}!`;
        events.push(saveEvent);
      }
      this.state.phase = 'save';
    } else if (outcome.isBlocked) {
      // Blocked - loose ball
      if (Math.random() < 0.3) {
        this.changePossession();
      }
      this.state.phase = 'open_play';
    } else {
      // Wide or hit post
      if (outcome.isPost) {
        shotEvent.description = `${shooter.player.name} hits the post!`;
      }
      // Corner or goal kick
      if (Math.random() < 0.4) {
        this.state.phase = 'corner';
        this.state.stats.corners[possessionTeam]++;
      } else {
        this.state.phase = 'goal_kick';
      }
    }

    return events;
  }

  private scoreGoal(
    scorer: PlayerMatchState,
    team: TeamMatchState,
    side: 'home' | 'away'
  ): MatchEvent[] {
    const events: MatchEvent[] = [];

    // Update score
    if (side === 'home') {
      this.state.homeGoals++;
    } else {
      this.state.awayGoals++;
    }

    // Update scorer stats
    scorer.goals++;
    scorer.rating = Math.min(10, scorer.rating + 0.5);

    // Goal event
    const goalEvent = this.createEvent('goal', side, scorer.playerId);
    goalEvent.description = `GOAL! ${scorer.player.name} scores for ${team.team.name}!`;
    events.push(goalEvent);

    // Check for assist (last player to pass)
    // Simplified: random teammate gets assist
    const teammates = team.players.filter(p => p.playerId !== scorer.playerId && p.isOnCourt);
    if (teammates.length > 0 && Math.random() < 0.7) {
      const assister = teammates[Math.floor(Math.random() * teammates.length)];
      assister.assists++;
      assister.rating = Math.min(10, assister.rating + 0.2);

      const assistEvent = this.createEvent('assist', side, assister.playerId);
      assistEvent.description = `Assisted by ${assister.player.name}`;
      events.push(assistEvent);
    }

    this.state.phase = 'goal_scored';

    return events;
  }

  private simulateCorner(): MatchEvent[] {
    const events: MatchEvent[] = [];
    const possessionTeam = this.state.ball.possessionTeam!;
    const team = this.state[possessionTeam];

    // Corner taker - usually an ala
    const taker = team.players.find(p => p.player.position === 'ALA' && p.isOnCourt) ||
                  team.players.find(p => p.isOnCourt && p.player.position !== 'GK');

    if (!taker) {
      this.state.phase = 'open_play';
      return events;
    }

    this.state.ball.possessionPlayer = taker.playerId;

    // Corner outcomes
    const roll = Math.random();
    if (roll < 0.15) {
      // Direct shot opportunity
      this.state.phase = 'shot';
      const target = team.players.find(p => p.player.position === 'PIVO' && p.isOnCourt) || taker;
      this.state.ball.possessionPlayer = target.playerId;
    } else if (roll < 0.4) {
      // Headed/volleyed clearance or kept possession
      this.state.ball.position = { x: possessionTeam === 'home' ? 70 : 30, y: 50 };
      this.state.phase = 'open_play';
    } else {
      // Cleared by defense
      this.changePossession();
      this.state.phase = 'open_play';
    }

    return events;
  }

  private simulateFreeKick(): MatchEvent[] {
    const possessionTeam = this.state.ball.possessionTeam!;
    const team = this.state[possessionTeam];

    // Check if in shooting range
    const ballX = this.state.ball.position.x;
    const inRange = (possessionTeam === 'home' && ballX > 65) ||
                    (possessionTeam === 'away' && ballX < 35);

    if (inRange && Math.random() < 0.4) {
      // Take a shot
      this.state.phase = 'shot';
    } else {
      // Play short
      this.state.phase = 'open_play';
    }

    return [];
  }

  private simulatePenalty(): MatchEvent[] {
    const events: MatchEvent[] = [];
    const possessionTeam = this.state.ball.possessionTeam!;
    const team = this.state[possessionTeam];
    const opponent = this.state[possessionTeam === 'home' ? 'away' : 'home'];

    // Best shooter takes it
    const taker = team.players
      .filter(p => p.isOnCourt)
      .sort((a, b) => b.player.technical.shooting - a.player.technical.shooting)[0];

    const gk = opponent.players.find(p => p.player.position === 'GK' && p.isOnCourt);

    if (!taker || !gk) {
      this.state.phase = 'open_play';
      return events;
    }

    // Penalty calculation - higher success rate than normal shot
    const shooterSkill = (taker.player.technical.shooting + taker.player.mental.composure) / 2;
    const gkSkill = gk.player.goalkeeping
      ? (gk.player.goalkeeping.reflexes + gk.player.goalkeeping.oneOnOnes) / 2
      : 10;

    const baseChance = 0.75; // 75% base conversion rate
    const skillModifier = (shooterSkill - gkSkill) * 0.02;
    const successChance = Math.max(0.5, Math.min(0.95, baseChance + skillModifier));

    const penaltyEvent = this.createEvent('penalty', possessionTeam, taker.playerId);
    events.push(penaltyEvent);

    if (Math.random() < successChance) {
      // Goal!
      events.push(...this.scoreGoal(taker, team, possessionTeam));
    } else if (Math.random() < 0.6) {
      // Saved
      gk.saves++;
      gk.rating = Math.min(10, gk.rating + 0.5);

      const saveEvent = this.createEvent('penalty_saved', possessionTeam === 'home' ? 'away' : 'home', gk.playerId);
      saveEvent.description = `Penalty saved by ${gk.player.name}!`;
      events.push(saveEvent);
      this.state.phase = 'save';
    } else {
      // Missed
      const missEvent = this.createEvent('penalty_missed', possessionTeam, taker.playerId);
      missEvent.description = `${taker.player.name} misses the penalty!`;
      events.push(missEvent);
      this.state.phase = 'goal_kick';
    }

    return events;
  }

  private checkForFoul(player: PlayerMatchState, opponent: TeamMatchState): MatchEvent[] {
    const events: MatchEvent[] = [];

    // Random opponent player commits foul
    const fouler = opponent.players.filter(p => p.isOnCourt)[
      Math.floor(Math.random() * opponent.onCourt.length)
    ];

    if (!fouler) return events;

    const foulerSide = this.state.ball.possessionTeam === 'home' ? 'away' : 'home';

    // Increment fouls
    fouler.foulsCommitted++;
    fouler.rating = Math.max(1, fouler.rating - 0.1);
    this.state[foulerSide].accumulatedFouls++;
    this.state.stats.fouls[foulerSide]++;

    const foulEvent = this.createEvent('foul', foulerSide, fouler.playerId);
    foulEvent.description = `Foul by ${fouler.player.name}`;
    events.push(foulEvent);

    // Check for card - cards are rare events
    // Yellow card: ~5% base chance, increases slightly with fouls and aggression
    // Red card (direct): extremely rare, only for very aggressive players with multiple fouls
    const yellowCardChance = 0.03 + (fouler.foulsCommitted * 0.02) + (fouler.player.mental.aggression / 500);

    if (Math.random() < yellowCardChance) {
      if (fouler.hasYellowCard) {
        // Second yellow = red, but only if team has more than 4 players
        const team = this.state[foulerSide];
        if (team.onCourt.length > 4) {
          events.push(...this.issueCard(fouler, foulerSide, 'second_yellow'));
        }
        // If team already has 4 players, no second yellow (minimum 4 players rule)
      } else {
        events.push(...this.issueCard(fouler, foulerSide, 'yellow_card'));
      }
    }

    this.state.phase = 'foul';

    return events;
  }

  private handleFoulConsequence(): void {
    const foulingTeam = this.state.ball.possessionTeam === 'home' ? 'away' : 'home';
    const foulCount = this.state[foulingTeam].accumulatedFouls;

    // Check for accumulated foul penalty (6th foul = penalty from 10m)
    if (foulCount > ACCUMULATED_FOULS_PENALTY) {
      this.state.phase = 'penalty';

      const penaltyEvent = this.createEvent(
        'accumulated_foul_penalty',
        this.state.ball.possessionTeam!,
        undefined
      );
      penaltyEvent.description = `Accumulated foul penalty! ${foulCount} team fouls this half.`;
      this.state.events.push(penaltyEvent);
    } else {
      // Regular free kick
      this.state.phase = 'free_kick';
    }
  }

  private issueCard(
    player: PlayerMatchState,
    side: 'home' | 'away',
    type: 'yellow_card' | 'red_card' | 'second_yellow'
  ): MatchEvent[] {
    const events: MatchEvent[] = [];
    const team = this.state[side];

    if (type === 'yellow_card') {
      player.hasYellowCard = true;
      this.state.stats.yellowCards[side]++;

      const event = this.createEvent('yellow_card', side, player.playerId);
      event.description = `🟨 Yellow card for ${player.player.name}`;
      events.push(event);

      player.rating = Math.max(1, player.rating - 0.3);
    } else {
      // Red card or second yellow - minimum 4 players rule
      // In futsal, a team cannot have fewer than 4 players
      if (team.onCourt.length <= 4) {
        // Can't send off - team already at minimum, just give a warning
        return events;
      }

      this.state.stats.redCards[side]++;
      player.isOnCourt = false;

      // Remove from onCourt
      team.onCourt = team.onCourt.filter(id => id !== player.playerId);

      // Start 2-minute power play (120 seconds) - team plays with 4 players
      team.powerPlaySecondsRemaining = 120;
      team.sentOffPlayerId = player.playerId;

      const event = this.createEvent(type, side, player.playerId);
      event.description = type === 'second_yellow'
        ? `🟨🟥 Second yellow! ${player.player.name} is sent off! Team plays with 4 for 2 minutes.`
        : `🟥 Red card! ${player.player.name} is sent off! Team plays with 4 for 2 minutes.`;
      events.push(event);
    }

    return events;
  }

  // Handle power play countdown and auto-substitute when 2 minutes are up
  private updatePowerPlay(): void {
    (['home', 'away'] as const).forEach(side => {
      const team = this.state[side];

      if (team.powerPlaySecondsRemaining > 0) {
        team.powerPlaySecondsRemaining--;

        // When power play ends, bring on a substitute
        if (team.powerPlaySecondsRemaining === 0 && team.onCourt.length < 5) {
          // Find a suitable substitute from the bench
          const benchPlayer = team.players.find(p =>
            team.bench.includes(p.playerId) &&
            p.playerId !== team.sentOffPlayerId // Can't be the sent-off player
          );

          if (benchPlayer) {
            // Add player to court
            team.onCourt.push(benchPlayer.playerId);
            team.bench = team.bench.filter(id => id !== benchPlayer.playerId);
            benchPlayer.isOnCourt = true;

            // Give them a position (center of the court)
            const isHome = side === 'home';
            benchPlayer.position = { x: isHome ? 50 : 50, y: 50 };
            benchPlayer.targetPosition = { x: isHome ? 50 : 50, y: 50 };

            this.addEvent(
              'substitution',
              side,
              benchPlayer.playerId,
              `⬆️ ${benchPlayer.player.name} comes on - ${team.team.shortName} back to 5 players after power play`
            );
          }

          team.sentOffPlayerId = null;
        }
      }
    });
  }

  private executePass(
    passer: PlayerMatchState,
    team: TeamMatchState,
    opponent: TeamMatchState
  ): MatchEvent[] {
    const teammates = team.players.filter(p => p.playerId !== passer.playerId && p.isOnCourt);
    if (teammates.length === 0) return [];

    const receiver = teammates[Math.floor(Math.random() * teammates.length)];

    // Pass success calculation
    const passingSkill = passer.player.technical.passing;
    const opponentPressing = this.getTacticPressingValue(opponent.tactic);
    const successChance = 0.7 + (passingSkill / 100) - (opponentPressing * 0.1);

    this.state.stats.passes[this.state.ball.possessionTeam!]++;

    if (Math.random() < successChance) {
      // Successful pass
      this.state.ball.possessionPlayer = receiver.playerId;
      this.moveBallTowards(receiver);

      // Check if we're now in attacking position
      const zone = this.getCourtZone(this.state.ball.position, this.state.ball.possessionTeam!);
      if (zone === 'opp_goal_area' || zone === 'opp_half_attack') {
        this.state.phase = 'attack';
      }
    } else {
      // Intercepted
      this.changePossession();
    }

    return [];
  }

  private executeDribble(
    player: PlayerMatchState,
    team: TeamMatchState,
    opponent: TeamMatchState
  ): MatchEvent[] {
    const dribblingSkill = player.player.technical.dribbling;
    const defenderSkill = this.getAverageDefensiveSkill(opponent);

    const successChance = 0.5 + ((dribblingSkill - defenderSkill) / 50);

    if (Math.random() < successChance) {
      // Successful dribble - move forward
      this.advanceBall(player);

      const zone = this.getCourtZone(this.state.ball.position, this.state.ball.possessionTeam!);
      if (zone === 'opp_goal_area') {
        this.state.phase = 'attack';
      }
    } else {
      // Lost the ball
      if (Math.random() < 0.3) {
        // Foul
        return this.checkForFoul(player, opponent);
      }
      this.changePossession();
    }

    return [];
  }

  // Helper methods

  private calculateActionWeights(
    player: PlayerMatchState,
    tactic: Tactic,
    zone: CourtZone
  ): Record<string, number> {
    const weights: Record<string, number> = {
      pass: 70,
      dribble: 20,
      shoot: 1,
      lose_possession: 9,
    };

    // Adjust based on zone - only shoot in dangerous positions
    if (zone === 'opp_goal_area') {
      weights.shoot = 12;
      weights.pass = 50;
      weights.dribble = 25;
      weights.lose_possession = 13;
    } else if (zone === 'opp_half_attack') {
      weights.shoot = 3;
      weights.pass = 55;
      weights.dribble = 30;
      weights.lose_possession = 12;
    }

    // Adjust based on tactics
    if (tactic.mentality === 'attacking') {
      weights.shoot *= 1.2;
      weights.dribble *= 1.1;
    } else if (tactic.mentality === 'defensive') {
      weights.pass *= 1.2;
      weights.shoot *= 0.8;
    }

    if (tactic.tempo === 'fast') {
      weights.dribble *= 1.1;
    }

    // Adjust based on player skills
    if (player.player.technical.shooting > 15) {
      weights.shoot *= 1.15;
    }
    if (player.player.technical.dribbling > 15) {
      weights.dribble *= 1.15;
    }

    return weights;
  }

  private calculateShootChance(player: PlayerMatchState, tactic: Tactic): number {
    let chance = 0.10;

    // Better shooters shoot more
    chance += (player.player.technical.shooting - 10) * 0.008;

    // Attacking mentality increases shooting
    if (tactic.mentality === 'attacking') chance *= 1.2;

    return Math.min(0.25, Math.max(0.05, chance));
  }

  // Get average team strength for realistic scoring
  private getTeamStrength(side: 'home' | 'away'): number {
    const team = this.state[side];
    const onCourtPlayers = team.players.filter(p => p.isOnCourt);
    if (onCourtPlayers.length === 0) return 100;
    const total = onCourtPlayers.reduce((sum, p) => sum + p.player.currentAbility, 0);
    return total / onCourtPlayers.length;
  }

  private calculateShotOutcome(shooter: PlayerMatchState, opponent: TeamMatchState): ShotOutcome {
    const shootingSkill = shooter.player.technical.shooting;
    const composure = shooter.player.mental.composure;
    const gk = opponent.players.find(p => p.player.position === 'GK' && p.isOnCourt);
    const gkSkill = gk?.player.goalkeeping?.reflexes || 10;

    // Get team strengths for realistic scoring
    const attackingTeam = this.state.ball.possessionTeam!;
    const defendingTeam = attackingTeam === 'home' ? 'away' : 'home';
    const attackStrength = this.getTeamStrength(attackingTeam);
    const defendStrength = this.getTeamStrength(defendingTeam);
    const strengthRatio = attackStrength / (attackStrength + defendStrength);

    // Base on-target chance - adjusted by team strength
    const baseOnTarget = 0.25 + (strengthRatio - 0.5) * 0.2;
    const onTargetChance = baseOnTarget + (shootingSkill / 150) + (composure / 300);
    const isOnTarget = Math.random() < Math.min(0.55, Math.max(0.15, onTargetChance));

    if (!isOnTarget) {
      return {
        isOnTarget: false,
        isGoal: false,
        isSaved: false,
        isBlocked: Math.random() < 0.40,
        isWide: Math.random() < 0.45,
        isPost: Math.random() < 0.08,
        power: Math.random() * 100,
        placement: ['left', 'center', 'right'][Math.floor(Math.random() * 3)] as 'left' | 'center' | 'right',
        height: ['low', 'mid', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'mid' | 'high',
      };
    }

    // Calculate goal chance for on-target shots
    // Stronger teams convert more, weaker teams convert less
    const baseGoalChance = 0.12 + (strengthRatio - 0.5) * 0.15;
    const shooterModifier = (shootingSkill - 10) * 0.008;
    const gkModifier = (gkSkill - 10) * -0.015;
    const staminaModifier = (shooter.stamina - 50) * 0.001;

    const goalChance = Math.max(0.05, Math.min(0.35, baseGoalChance + shooterModifier + gkModifier + staminaModifier));

    const isGoal = Math.random() < goalChance;

    return {
      isOnTarget: true,
      isGoal,
      isSaved: !isGoal,
      isBlocked: false,
      isWide: false,
      isPost: false,
      power: 50 + Math.random() * 50,
      placement: ['left', 'center', 'right'][Math.floor(Math.random() * 3)] as 'left' | 'center' | 'right',
      height: ['low', 'mid', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'mid' | 'high',
    };
  }

  private getCourtZone(pos: CourtPosition, team: 'home' | 'away'): CourtZone {
    const x = team === 'home' ? pos.x : 100 - pos.x;

    if (x < 15) return 'own_goal_area';
    if (x < 30) return 'own_half_defense';
    if (x < 45) return 'own_half_midfield';
    if (x < 55) return 'center';
    if (x < 70) return 'opp_half_midfield';
    if (x < 85) return 'opp_half_attack';
    return 'opp_goal_area';
  }

  private getTacticPressingValue(tactic: Tactic): number {
    switch (tactic.pressing) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 2;
    }
  }

  private getAverageDefensiveSkill(team: TeamMatchState): number {
    const players = team.players.filter(p => p.isOnCourt);
    if (players.length === 0) return 10;

    const total = players.reduce((sum, p) => {
      return sum + p.player.mental.positioning + p.player.physical.pace;
    }, 0);

    return total / (players.length * 2);
  }

  private changePossession(): void {
    const newTeam = this.state.ball.possessionTeam === 'home' ? 'away' : 'home';
    this.state.ball.possessionTeam = newTeam;
    this.state.ball.possessionPlayer = this.getRandomOutfieldPlayer(newTeam);
  }

  private moveBallTowards(player: PlayerMatchState): void {
    this.state.ball.position = { ...player.position };
  }

  private advanceBall(player: PlayerMatchState): void {
    const direction = this.state.ball.possessionTeam === 'home' ? 1 : -1;
    this.state.ball.position.x = Math.max(0, Math.min(100,
      this.state.ball.position.x + (direction * (5 + Math.random() * 10))
    ));
  }

  private getRandomOutfieldPlayer(team: 'home' | 'away'): string {
    const teamState = this.state[team];
    const outfield = teamState.players.filter(p => p.isOnCourt && p.player.position !== 'GK');
    if (outfield.length === 0) {
      return teamState.onCourt[0] || '';
    }
    return outfield[Math.floor(Math.random() * outfield.length)].playerId;
  }

  private getGoalkeeper(team: 'home' | 'away'): string {
    const teamState = this.state[team];
    const gk = teamState.players.find(p => p.player.position === 'GK' && p.isOnCourt);
    return gk?.playerId || teamState.onCourt[0] || '';
  }

  private updatePlayerStamina(): void {
    ['home', 'away'].forEach(side => {
      const team = this.state[side as 'home' | 'away'];
      team.onCourt.forEach(playerId => {
        const player = team.players.find(p => p.playerId === playerId);
        if (player) {
          // Lose stamina over time
          const staminaLoss = 0.05 + (Math.random() * 0.05);
          player.stamina = Math.max(0, player.stamina - staminaLoss);
        }
      });
    });
  }

  // Update player positions - goalkeepers stay near goal, outfield players move around
  private updatePlayerPositions(): void {
    const ballX = this.state.ball.position.x;
    const possessionTeam = this.state.ball.possessionTeam;

    (['home', 'away'] as const).forEach(side => {
      const team = this.state[side];
      const isHome = side === 'home';
      const isAttacking = possessionTeam === side;

      team.players.forEach(player => {
        if (!player.isOnCourt) return;

        // Goalkeeper stays near their goal
        if (player.player.position === 'GK') {
          const goalX = isHome ? 5 : 95;
          // Small random movement for GK
          player.position.x = goalX + (Math.random() * 6 - 3);
          player.position.y = 50 + (Math.random() * 20 - 10);
          // Clamp GK position
          player.position.x = Math.max(2, Math.min(98, player.position.x));
          player.position.y = Math.max(20, Math.min(80, player.position.y));
          return;
        }

        // Outfield players move based on ball position and possession
        const baseX = isHome
          ? (isAttacking ? 30 + ballX * 0.5 : 20 + ballX * 0.4)
          : (isAttacking ? 70 - (100 - ballX) * 0.5 : 80 - (100 - ballX) * 0.4);

        // Add randomness to movement
        const randomX = (Math.random() - 0.5) * 25;
        const randomY = (Math.random() - 0.5) * 40;

        // Move towards target position gradually
        const targetX = Math.max(10, Math.min(90, baseX + randomX));
        const targetY = Math.max(10, Math.min(90, 50 + randomY));

        // Smooth movement - move 20% towards target each tick
        player.position.x += (targetX - player.position.x) * 0.2;
        player.position.y += (targetY - player.position.y) * 0.2;

        // Clamp final position
        player.position.x = Math.max(5, Math.min(95, player.position.x));
        player.position.y = Math.max(5, Math.min(95, player.position.y));
      });
    });
  }

  private updatePossessionStats(): void {
    if (this.state.ball.possessionTeam === 'home') {
      this.state.stats.possession.home += 0.1;
    } else if (this.state.ball.possessionTeam === 'away') {
      this.state.stats.possession.away += 0.1;
    }

    // Normalize to exactly 100% and clamp values
    const total = this.state.stats.possession.home + this.state.stats.possession.away;
    if (total > 0) {
      this.state.stats.possession.home = Math.max(0, Math.min(100, (this.state.stats.possession.home / total) * 100));
      this.state.stats.possession.away = Math.max(0, Math.min(100, 100 - this.state.stats.possession.home));
    }
  }

  // Automatic substitution logic for tired players
  private checkAutoSubstitutions(): void {
    ['home', 'away'].forEach(side => {
      const team = this.state[side as 'home' | 'away'];

      // Find tired players on court (stamina < 40)
      const tiredPlayers = team.players.filter(p =>
        p.isOnCourt && p.stamina < 40 && p.player.position !== 'GK'
      );

      // Find fresh players on bench
      const freshBench = team.players.filter(p =>
        !p.isOnCourt && p.stamina > 70 && p.player.position !== 'GK'
      );

      for (const tired of tiredPlayers) {
        // Find a fresh player of similar position
        const replacement = freshBench.find(p =>
          p.player.position === tired.player.position ||
          (p.player.position !== 'GK' && tired.player.position !== 'GK')
        );

        if (replacement) {
          this.makeSubstitution(side as 'home' | 'away', tired.playerId, replacement.playerId);
          // Remove from fresh bench to avoid double subs
          const idx = freshBench.indexOf(replacement);
          if (idx > -1) freshBench.splice(idx, 1);
          break; // One sub per tick max
        }
      }
    });
  }

  private createEvent(
    type: MatchEventType,
    team: 'home' | 'away',
    playerId?: string
  ): MatchEvent {
    return {
      id: crypto.randomUUID(),
      type,
      minute: this.state.minute,
      second: this.state.second,
      period: this.state.period as 1 | 2,
      teamId: this.state[team].team.id,
      playerId,
      description: '',
      position: { ...this.state.ball.position },
    };
  }

  private addEvent(
    type: MatchEventType,
    team: 'home' | 'away',
    playerId?: string,
    description?: string
  ): void {
    const event = this.createEvent(type, team, playerId);
    event.description = description || '';
    this.state.events.push(event);
  }

  // Public API

  public getState(): MatchSimulationState {
    return this.state;
  }

  public pause(): void {
    this.state.isPaused = true;
  }

  public resume(): void {
    this.state.isPaused = false;
  }

  public onTick(callback: (state: MatchSimulationState, result: TickResult) => void): void {
    this.tickCallbacks.push(callback);
  }

  public callTimeout(team: 'home' | 'away'): boolean {
    const teamState = this.state[team];
    if (teamState.timeoutsUsed >= 1) return false; // 1 timeout per half

    teamState.timeoutsUsed++;
    this.state.isPaused = true;

    this.addEvent('timeout', team, undefined, `${teamState.team.name} calls a timeout`);

    return true;
  }

  public makeSubstitution(
    team: 'home' | 'away',
    outPlayerId: string,
    inPlayerId: string
  ): boolean {
    const teamState = this.state[team];

    if (!teamState.onCourt.includes(outPlayerId)) return false;
    if (!teamState.bench.includes(inPlayerId)) return false;

    // Perform substitution
    teamState.onCourt = teamState.onCourt.filter(id => id !== outPlayerId);
    teamState.onCourt.push(inPlayerId);
    teamState.bench = teamState.bench.filter(id => id !== inPlayerId);
    teamState.bench.push(outPlayerId);

    const outPlayer = teamState.players.find(p => p.playerId === outPlayerId);
    const inPlayer = teamState.players.find(p => p.playerId === inPlayerId);

    if (outPlayer) outPlayer.isOnCourt = false;
    if (inPlayer) {
      inPlayer.isOnCourt = true;
      // Substitute takes the position of the player going off
      if (outPlayer) {
        inPlayer.position = { ...outPlayer.position };
        inPlayer.targetPosition = { ...outPlayer.targetPosition };
      }
    }

    teamState.substitutionsUsed++;

    this.addEvent(
      'substitution',
      team,
      inPlayerId,
      `Substitution: ${inPlayer?.player.name} comes on for ${outPlayer?.player.name}`
    );

    return true;
  }

  public activateFlyingGoalkeeper(team: 'home' | 'away'): boolean {
    const teamState = this.state[team];
    if (teamState.isUsingFlyingGK) return false;

    teamState.isUsingFlyingGK = true;
    // In real implementation, would adjust positions

    return true;
  }

  public getMatchTime(): string {
    const period = this.state.period === 1 ? '1H' : '2H';
    const min = this.state.minute.toString().padStart(2, '0');
    const sec = this.state.second.toString().padStart(2, '0');
    return `${period} ${min}:${sec}`;
  }

  public getScore(): { home: number; away: number } {
    return {
      home: this.state.homeGoals,
      away: this.state.awayGoals,
    };
  }
}

export default MatchEngine;
