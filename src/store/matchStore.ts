/**
 * Match Store
 *
 * Zustand store for managing match state and engine interactions.
 * Provides the bridge between the MatchEngine and React UI.
 */

import { create } from 'zustand';
import type { Team, Player, Tactic, MatchEvent } from '@/types';
import { MatchEngine } from '@/engine/match';
import type { MatchSimulationState, MatchSimulationStats } from '@/engine/match/types';
import { generateCommentary, generateAmbientCommentary } from '@/engine/match/commentary';

interface MatchStore {
  // Engine
  engine: MatchEngine | null;
  isMatchActive: boolean;

  // Match state (from engine)
  matchState: MatchSimulationState | null;

  // UI state
  simulationSpeed: number;  // 1, 2, 4, 8, 16
  isPlaying: boolean;
  commentary: string[];
  maxCommentaryLines: number;

  // Actions
  initializeMatch: (
    homeTeam: Team,
    awayTeam: Team,
    homeTactic: Tactic,
    awayTactic: Tactic,
    homePlayers: Player[],
    awayPlayers: Player[]
  ) => void;

  startMatch: () => void;
  pauseMatch: () => void;
  resumeMatch: () => void;
  startSecondHalf: () => void;

  setSimulationSpeed: (speed: number) => void;
  tick: () => void;

  callTimeout: (team: 'home' | 'away') => boolean;
  makeSubstitution: (team: 'home' | 'away', outId: string, inId: string) => boolean;
  activateFlyingGK: (team: 'home' | 'away') => boolean;

  addCommentary: (text: string) => void;
  clearMatch: () => void;

  // Getters
  getScore: () => { home: number; away: number };
  getMatchTime: () => string;
  getStats: () => MatchSimulationStats | null;
  getEvents: () => MatchEvent[];
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  engine: null,
  isMatchActive: false,
  matchState: null,
  simulationSpeed: 1,
  isPlaying: false,
  commentary: [],
  maxCommentaryLines: 50,

  initializeMatch: (homeTeam, awayTeam, homeTactic, awayTactic, homePlayers, awayPlayers) => {
    const engine = new MatchEngine(
      homeTeam,
      awayTeam,
      homeTactic,
      awayTactic,
      homePlayers,
      awayPlayers
    );

    // Set up tick callback
    engine.onTick((state, result) => {
      // Deep clone state to ensure React detects changes to nested objects
      set({
        matchState: {
          ...state,
          home: {
            ...state.home,
            players: state.home.players.map(p => ({ ...p })),
            onCourt: [...state.home.onCourt],
            bench: [...state.home.bench],
          },
          away: {
            ...state.away,
            players: state.away.players.map(p => ({ ...p })),
            onCourt: [...state.away.onCourt],
            bench: [...state.away.bench],
          },
          events: [...state.events],
        },
      });

      // Add any commentary from events
      if (result.commentary) {
        get().addCommentary(result.commentary);
      }

      // Occasionally add ambient commentary
      const ambient = generateAmbientCommentary(state, 'en');
      if (ambient) {
        get().addCommentary(ambient);
      }
    });

    set({
      engine,
      matchState: engine.getState(),
      isMatchActive: true,
      isPlaying: false,
      commentary: ['Match is about to begin...'],
    });
  },

  startMatch: () => {
    const { engine } = get();
    if (!engine) return;

    engine.kickoff();
    set({
      isPlaying: true,
      matchState: engine.getState(),
    });
    get().addCommentary('Kick off! The match has started!');
  },

  pauseMatch: () => {
    const { engine } = get();
    if (engine) {
      engine.pause();
      set({ isPlaying: false, matchState: engine.getState() });
    }
  },

  resumeMatch: () => {
    const { engine } = get();
    if (engine) {
      engine.resume();
      set({ isPlaying: true, matchState: engine.getState() });
    }
  },

  startSecondHalf: () => {
    const { engine } = get();
    if (!engine) return;

    engine.startSecondHalf();
    set({
      isPlaying: true,
      matchState: engine.getState(),
    });
    get().addCommentary('Second half begins!');
  },

  setSimulationSpeed: (speed) => {
    set({ simulationSpeed: speed });
  },

  tick: () => {
    const { engine, isPlaying } = get();
    if (!engine || !isPlaying) return;

    const result = engine.tick();
    set({ matchState: engine.getState() });

    // Check for half time or full time
    const state = engine.getState();
    if (state.isHalfTime) {
      set({ isPlaying: false });
      get().addCommentary('Half time! The first half comes to an end.');
    }
    if (state.isFullTime) {
      set({ isPlaying: false });
      get().addCommentary(`Full time! Final score: ${state.home.team.shortName} ${state.homeGoals} - ${state.awayGoals} ${state.away.team.shortName}`);
    }
  },

  callTimeout: (team) => {
    const { engine } = get();
    if (!engine) return false;

    const success = engine.callTimeout(team);
    if (success) {
      set({ matchState: engine.getState(), isPlaying: false });
      get().addCommentary(`Timeout called by ${team === 'home' ? engine.getState().home.team.shortName : engine.getState().away.team.shortName}`);
    }
    return success;
  },

  makeSubstitution: (team, outId, inId) => {
    const { engine } = get();
    if (!engine) return false;

    const success = engine.makeSubstitution(team, outId, inId);
    if (success) {
      set({ matchState: engine.getState() });
    }
    return success;
  },

  activateFlyingGK: (team) => {
    const { engine } = get();
    if (!engine) return false;

    const success = engine.activateFlyingGoalkeeper(team);
    if (success) {
      set({ matchState: engine.getState() });
      const teamName = team === 'home'
        ? engine.getState().home.team.shortName
        : engine.getState().away.team.shortName;
      get().addCommentary(`${teamName} brings their goalkeeper forward!`);
    }
    return success;
  },

  addCommentary: (text) => {
    set((state) => ({
      commentary: [
        `[${get().getMatchTime()}] ${text}`,
        ...state.commentary,
      ].slice(0, state.maxCommentaryLines),
    }));
  },

  clearMatch: () => {
    set({
      engine: null,
      matchState: null,
      isMatchActive: false,
      isPlaying: false,
      commentary: [],
    });
  },

  getScore: () => {
    const { engine } = get();
    if (!engine) return { home: 0, away: 0 };
    return engine.getScore();
  },

  getMatchTime: () => {
    const { engine } = get();
    if (!engine) return '00:00';
    return engine.getMatchTime();
  },

  getStats: () => {
    const { matchState } = get();
    return matchState?.stats || null;
  },

  getEvents: () => {
    const { matchState } = get();
    return matchState?.events || [];
  },
}));

export default useMatchStore;
