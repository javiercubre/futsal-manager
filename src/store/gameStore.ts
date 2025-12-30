import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Team, Player, Competition, NewsItem, Match } from '@/types';

// Transfer offer type
interface TransferOffer {
  id: string;
  playerId: string;
  playerName: string;
  fromTeamId: string;
  fromTeamName: string;
  toTeamId: string;
  toTeamName: string;
  fee: number;
  status: 'pending' | 'accepted' | 'rejected';
  date: Date;
  isIncoming: boolean; // true = offer for player's team player, false = offer made by player
}

interface GameState {
  // Game meta
  isGameStarted: boolean;
  saveId: string | null;
  managerName: string;
  currentDate: Date;
  season: string;
  language: 'en' | 'pt' | 'es';

  // Player's team
  playerTeamId: string | null;
  playerTeam: Team | null;

  // Game data
  teams: Team[];
  players: Player[];
  competitions: Competition[];
  currentMatch: Match | null;

  // UI state
  selectedPlayerId: string | null;
  inbox: NewsItem[];

  // Transfers
  transferOffers: TransferOffer[];

  // Simulation
  simulationSpeed: number;
  isPaused: boolean;

  // Actions
  startNewGame: (managerName: string, teamId: string, language: 'en' | 'pt' | 'es') => void;
  setPlayerTeam: (team: Team) => void;
  setLanguage: (language: 'en' | 'pt' | 'es') => void;
  advanceDay: () => void;
  setCurrentMatch: (match: Match | null) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  addNewsItem: (item: Omit<NewsItem, 'id' | 'read'>) => void;
  markNewsAsRead: (itemId: string) => void;
  setSimulationSpeed: (speed: number) => void;
  togglePause: () => void;
  selectPlayer: (playerId: string | null) => void;
  loadTeams: (teams: Team[]) => void;
  loadPlayers: (players: Player[]) => void;
  loadCompetitions: (competitions: Competition[]) => void;
  updateFixtureResult: (competitionId: string, matchId: string, homeGoals: number, awayGoals: number) => void;
  makeTransferOffer: (playerId: string, targetTeamId: string, fee: number) => void;
  acceptTransferOffer: (offerId: string) => void;
  rejectTransferOffer: (offerId: string) => void;
  resetGame: () => void;
}

const initialState = {
  isGameStarted: false,
  saveId: null,
  managerName: '',
  currentDate: new Date(),
  season: '2024-25',
  language: 'en' as const,
  playerTeamId: null,
  playerTeam: null,
  teams: [],
  players: [],
  competitions: [],
  currentMatch: null,
  selectedPlayerId: null,
  inbox: [],
  transferOffers: [] as TransferOffer[],
  simulationSpeed: 1,
  isPaused: false,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,

      startNewGame: (managerName, teamId, language) => {
        const team = get().teams.find(t => t.id === teamId);
        set({
          isGameStarted: true,
          saveId: crypto.randomUUID(),
          managerName,
          playerTeamId: teamId,
          playerTeam: team || null,
          language,
          currentDate: new Date(2024, 7, 1), // August 1, 2024 - season start
          inbox: [{
            id: crypto.randomUUID(),
            date: new Date(2024, 7, 1),
            title: `Welcome to ${team?.name || 'your new club'}!`,
            content: `Congratulations on your appointment as manager. The board expects a strong performance this season.`,
            type: 'general',
            read: false,
          }],
        });
      },

      setPlayerTeam: (team) => set({ playerTeam: team, playerTeamId: team.id }),

      setLanguage: (language) => set({ language }),

      advanceDay: () => set((state) => {
        const newDate = new Date(state.currentDate);
        newDate.setDate(newDate.getDate() + 1);

        // Simulate CPU vs CPU matches for today
        const updatedCompetitions = state.competitions.map(comp => {
          const updatedFixtures = comp.fixtures.map(fixture => {
            // Skip if already played
            if (fixture.played) return fixture;

            // Check if fixture is today
            const fixtureDate = new Date(fixture.date);
            fixtureDate.setHours(0, 0, 0, 0);
            const today = new Date(state.currentDate);
            today.setHours(0, 0, 0, 0);

            if (fixtureDate.getTime() !== today.getTime()) return fixture;

            // Skip if player's team is involved (they play manually)
            if (fixture.homeTeamId === state.playerTeamId || fixture.awayTeamId === state.playerTeamId) {
              return fixture;
            }

            // Simulate the match
            const homeTeam = state.teams.find(t => t.id === fixture.homeTeamId);
            const awayTeam = state.teams.find(t => t.id === fixture.awayTeamId);

            if (!homeTeam || !awayTeam) return fixture;

            // Calculate team strengths (average of squad abilities)
            const getTeamStrength = (team: Team): number => {
              if (!team.squad || team.squad.length === 0) return 50;
              const total = team.squad.reduce((sum, p) => sum + p.currentAbility, 0);
              return total / team.squad.length;
            };

            const homeStrength = getTeamStrength(homeTeam);
            const awayStrength = getTeamStrength(awayTeam);

            // Home advantage factor
            const homeAdvantage = 1.15;
            const adjustedHomeStrength = homeStrength * homeAdvantage;

            // Calculate expected goals based on strength difference
            // Futsal typically has 4-8 total goals per match
            const strengthRatio = adjustedHomeStrength / (adjustedHomeStrength + awayStrength);

            // Random goals with poisson-like distribution
            const baseGoals = 2 + Math.random() * 3; // 2-5 base goals per team
            const homeExpected = baseGoals * (0.5 + strengthRatio * 0.5);
            const awayExpected = baseGoals * (0.5 + (1 - strengthRatio) * 0.5);

            // Add randomness
            const homeGoals = Math.max(0, Math.round(homeExpected + (Math.random() - 0.5) * 3));
            const awayGoals = Math.max(0, Math.round(awayExpected + (Math.random() - 0.5) * 3));

            return {
              ...fixture,
              played: true,
              homeGoals,
              awayGoals,
            };
          });

          return { ...comp, fixtures: updatedFixtures };
        });

        return {
          currentDate: newDate,
          competitions: updatedCompetitions,
        };
      }),

      setCurrentMatch: (match) => set({ currentMatch: match }),

      updateTeam: (teamId, updates) => set((state) => ({
        teams: state.teams.map(t =>
          t.id === teamId ? { ...t, ...updates } : t
        ),
        playerTeam: state.playerTeamId === teamId && state.playerTeam
          ? { ...state.playerTeam, ...updates }
          : state.playerTeam,
      })),

      updatePlayer: (playerId, updates) => set((state) => ({
        players: state.players.map(p =>
          p.id === playerId ? { ...p, ...updates } : p
        ),
      })),

      addNewsItem: (item) => set((state) => ({
        inbox: [
          {
            id: crypto.randomUUID(),
            read: false,
            ...item,
          },
          ...state.inbox,
        ],
      })),

      markNewsAsRead: (itemId) => set((state) => ({
        inbox: state.inbox.map(item =>
          item.id === itemId ? { ...item, read: true } : item
        ),
      })),

      setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),

      togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

      selectPlayer: (playerId) => set({ selectedPlayerId: playerId }),

      loadTeams: (teams) => set({ teams }),

      loadPlayers: (players) => set({ players }),

      loadCompetitions: (competitions) => set({ competitions }),

      updateFixtureResult: (competitionId, matchId, homeGoals, awayGoals) => set((state) => ({
        competitions: state.competitions.map(comp => {
          if (comp.id !== competitionId) return comp;
          return {
            ...comp,
            fixtures: comp.fixtures.map(fixture => {
              if (fixture.matchId !== matchId) return fixture;
              return {
                ...fixture,
                played: true,
                homeGoals,
                awayGoals,
              };
            }),
          };
        }),
      })),

      makeTransferOffer: (playerId, targetTeamId, fee) => {
        const state = get();
        const player = state.players.find(p => p.id === playerId);
        const targetTeam = state.teams.find(t => t.id === targetTeamId);
        const playerTeam = state.teams.find(t => t.squad?.some(p => p.id === playerId));

        if (!player || !targetTeam || !playerTeam || !state.playerTeamId) return;

        const isIncoming = targetTeamId !== state.playerTeamId;

        const offer: TransferOffer = {
          id: crypto.randomUUID(),
          playerId,
          playerName: player.name,
          fromTeamId: playerTeam.id,
          fromTeamName: playerTeam.name,
          toTeamId: targetTeamId,
          toTeamName: targetTeam.name,
          fee,
          status: 'pending',
          date: state.currentDate,
          isIncoming,
        };

        set((s) => ({
          transferOffers: [...s.transferOffers, offer],
        }));

        // If player is making an offer to another team, AI decides
        if (!isIncoming) {
          // Simple AI: accept if offer is >= 90% of market value
          setTimeout(() => {
            const currentState = get();
            const currentOffer = currentState.transferOffers.find(o => o.id === offer.id);
            if (currentOffer && currentOffer.status === 'pending') {
              if (fee >= player.marketValue * 0.9) {
                get().acceptTransferOffer(offer.id);
              } else if (fee < player.marketValue * 0.7) {
                get().rejectTransferOffer(offer.id);
              }
              // Otherwise stays pending for negotiation
            }
          }, 1000);
        }
      },

      acceptTransferOffer: (offerId) => set((state) => {
        const offer = state.transferOffers.find(o => o.id === offerId);
        if (!offer || offer.status !== 'pending') return state;

        const player = state.players.find(p => p.id === offer.playerId);
        if (!player) return state;

        // Update teams - remove player from old team, add to new team
        const updatedTeams = state.teams.map(team => {
          if (team.id === offer.fromTeamId) {
            // Remove player and add transfer fee
            return {
              ...team,
              squad: team.squad?.filter(p => p.id !== offer.playerId) || [],
              finances: {
                ...team.finances,
                balance: team.finances.balance + offer.fee,
                transferBudget: team.finances.transferBudget + offer.fee,
              },
            };
          }
          if (team.id === offer.toTeamId) {
            // Add player and deduct transfer fee
            return {
              ...team,
              squad: [...(team.squad || []), player],
              finances: {
                ...team.finances,
                balance: team.finances.balance - offer.fee,
                transferBudget: team.finances.transferBudget - offer.fee,
              },
            };
          }
          return team;
        });

        // Update player team if it's the player's team
        const updatedPlayerTeam = state.playerTeamId
          ? updatedTeams.find(t => t.id === state.playerTeamId) || state.playerTeam
          : state.playerTeam;

        return {
          teams: updatedTeams,
          playerTeam: updatedPlayerTeam,
          transferOffers: state.transferOffers.map(o =>
            o.id === offerId ? { ...o, status: 'accepted' as const } : o
          ),
          inbox: [
            {
              id: crypto.randomUUID(),
              date: state.currentDate,
              title: 'Transfer Completed',
              content: `${offer.playerName} has joined ${offer.toTeamName} from ${offer.fromTeamName} for €${(offer.fee / 1000).toFixed(0)}k.`,
              type: 'transfer' as const,
              read: false,
            },
            ...state.inbox,
          ],
        };
      }),

      rejectTransferOffer: (offerId) => set((state) => ({
        transferOffers: state.transferOffers.map(o =>
          o.id === offerId ? { ...o, status: 'rejected' as const } : o
        ),
      })),

      resetGame: () => set(initialState),
    }),
    {
      name: 'futsal-manager-storage',
      partialize: (state) => ({
        isGameStarted: state.isGameStarted,
        saveId: state.saveId,
        managerName: state.managerName,
        currentDate: state.currentDate,
        season: state.season,
        language: state.language,
        playerTeamId: state.playerTeamId,
        playerTeam: state.playerTeam,
        teams: state.teams,
        players: state.players,
        competitions: state.competitions,
        transferOffers: state.transferOffers,
        simulationSpeed: state.simulationSpeed,
      }),
      onRehydrateStorage: () => (state) => {
        // Convert date strings back to Date objects after rehydration
        if (state && typeof state.currentDate === 'string') {
          state.currentDate = new Date(state.currentDate);
        }
        // Convert fixture dates back to Date objects
        if (state?.competitions) {
          for (const comp of state.competitions) {
            for (const fixture of comp.fixtures) {
              if (typeof fixture.date === 'string') {
                fixture.date = new Date(fixture.date);
              }
            }
          }
        }
      },
    }
  )
);

export default useGameStore;
