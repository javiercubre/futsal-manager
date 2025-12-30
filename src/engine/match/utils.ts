/**
 * Match Engine Utility Functions
 */

import type { Player } from '@/types';
import type { PlayerMatchState } from './types';

/**
 * Weighted random selection
 * Returns the key with probability proportional to its weight
 */
export function weightedRandom(weights: Record<string, number>): string {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);

  let random = Math.random() * total;

  for (const [key, weight] of entries) {
    random -= weight;
    if (random <= 0) {
      return key;
    }
  }

  return entries[0][0];
}

/**
 * Calculate a player's match rating based on their performance
 */
export function calculatePlayerRating(player: PlayerMatchState): number {
  let rating = 6.0; // Base rating

  // Goals contribution
  rating += player.goals * 0.5;
  rating += player.assists * 0.3;

  // Goalkeeper saves
  rating += player.saves * 0.2;

  // Negative factors
  rating -= player.foulsCommitted * 0.1;
  if (player.hasYellowCard) rating -= 0.2;

  // Stamina factor (tired players perform worse)
  if (player.stamina < 30) rating -= 0.3;

  // Cap between 1 and 10
  return Math.max(1, Math.min(10, rating));
}

/**
 * Get a random player from a team (weighted by ability)
 */
export function getRandomPlayer(players: PlayerMatchState[], excludeGK = true): PlayerMatchState | null {
  const eligible = players.filter(p =>
    p.isOnCourt && (!excludeGK || p.player.position !== 'GK')
  );

  if (eligible.length === 0) return null;

  // Weight by current ability
  const weights = eligible.map(p => p.player.currentAbility);
  const total = weights.reduce((a, b) => a + b, 0);

  let random = Math.random() * total;
  for (let i = 0; i < eligible.length; i++) {
    random -= weights[i];
    if (random <= 0) return eligible[i];
  }

  return eligible[0];
}

/**
 * Calculate the distance between two court positions
 */
export function distanceBetween(
  pos1: { x: number; y: number },
  pos2: { x: number; y: number }
): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a position is in the shooting zone
 */
export function isInShootingZone(
  x: number,
  y: number,
  isHome: boolean
): boolean {
  const attackingX = isHome ? x : 100 - x;
  return attackingX > 70 && y > 20 && y < 80;
}

/**
 * Calculate overall player ability for a specific action
 */
export function getPlayerAbilityFor(
  player: Player,
  action: 'shooting' | 'passing' | 'dribbling' | 'defending' | 'goalkeeping'
): number {
  switch (action) {
    case 'shooting':
      return (
        player.technical.shooting * 0.5 +
        player.mental.composure * 0.3 +
        player.physical.strength * 0.2
      );

    case 'passing':
      return (
        player.technical.passing * 0.5 +
        player.mental.decisions * 0.3 +
        player.technical.technique * 0.2
      );

    case 'dribbling':
      return (
        player.technical.dribbling * 0.4 +
        player.physical.agility * 0.3 +
        player.physical.pace * 0.3
      );

    case 'defending':
      return (
        player.mental.positioning * 0.4 +
        player.physical.strength * 0.3 +
        player.mental.workRate * 0.3
      );

    case 'goalkeeping':
      if (!player.goalkeeping) return 5;
      return (
        player.goalkeeping.reflexes * 0.4 +
        player.goalkeeping.handling * 0.3 +
        player.goalkeeping.oneOnOnes * 0.3
      );

    default:
      return player.currentAbility / 10;
  }
}

/**
 * Format time for display
 */
export function formatMatchTime(
  period: number,
  minute: number,
  second: number
): string {
  const periodStr = period === 1 ? '1H' : period === 2 ? '2H' : '';
  const minStr = minute.toString().padStart(2, '0');
  const secStr = second.toString().padStart(2, '0');
  return `${periodStr} ${minStr}:${secStr}`;
}

/**
 * Get color for rating display
 */
export function getRatingColor(rating: number): string {
  if (rating >= 8) return 'text-green-400';
  if (rating >= 7) return 'text-lime-400';
  if (rating >= 6) return 'text-yellow-400';
  if (rating >= 5) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Calculate team strength based on players on court
 */
export function calculateTeamStrength(players: PlayerMatchState[]): number {
  const onCourt = players.filter(p => p.isOnCourt);
  if (onCourt.length === 0) return 0;

  const totalAbility = onCourt.reduce((sum, p) => sum + p.player.currentAbility, 0);
  const avgAbility = totalAbility / onCourt.length;

  // Factor in stamina
  const avgStamina = onCourt.reduce((sum, p) => sum + p.stamina, 0) / onCourt.length;
  const staminaFactor = avgStamina / 100;

  return avgAbility * staminaFactor;
}

/**
 * Determine if a player should be substituted (tired/injured)
 */
export function shouldSubstitute(player: PlayerMatchState): boolean {
  // Very tired
  if (player.stamina < 20) return true;

  // On yellow card and aggressive player
  if (player.hasYellowCard && player.foulsCommitted >= 2) return true;

  return false;
}

/**
 * Get the best substitute for a position
 */
export function getBestSubstitute(
  bench: PlayerMatchState[],
  position: string
): PlayerMatchState | null {
  // First try exact position match
  const samePosition = bench.filter(p => p.player.position === position);
  if (samePosition.length > 0) {
    return samePosition.sort((a, b) => b.player.currentAbility - a.player.currentAbility)[0];
  }

  // Otherwise get best available
  const available = bench.filter(p => p.player.position !== 'GK');
  if (available.length > 0) {
    return available.sort((a, b) => b.player.currentAbility - a.player.currentAbility)[0];
  }

  return null;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Random number between min and max
 */
export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Check if an event should trigger based on probability
 */
export function rollChance(probability: number): boolean {
  return Math.random() < probability;
}
