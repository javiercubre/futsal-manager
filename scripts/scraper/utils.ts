/**
 * Scraper Utility Functions
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

/**
 * Ensure data directory exists
 */
export function ensureDataDir(): void {
  const dirs = [
    DATA_DIR,
    path.join(DATA_DIR, 'teams'),
    path.join(DATA_DIR, 'players'),
    path.join(DATA_DIR, 'competitions'),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * Save data to JSON file
 */
export async function saveData(type: string, data: any[]): Promise<void> {
  ensureDataDir();

  const filePath = path.join(DATA_DIR, `${type}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`💾 Saved ${data.length} ${type} to ${filePath}`);
}

/**
 * Load existing data
 */
export function loadExistingData(type: string): any[] {
  const filePath = path.join(DATA_DIR, `${type}.json`);

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  return [];
}

/**
 * Generate a consistent ID from a name
 */
export function generateId(name: string, prefix: string = ''): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return prefix ? `${prefix}-${slug}` : slug;
}

/**
 * Parse age from birth date or age string
 */
export function parseAge(ageOrBirthDate: string): number {
  // If it looks like a date
  if (ageOrBirthDate.includes('/') || ageOrBirthDate.includes('-')) {
    const birthDate = new Date(ageOrBirthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  // If it's just a number
  return parseInt(ageOrBirthDate.replace(/\D/g, ''), 10) || 25;
}

/**
 * Map position strings to standard positions
 */
export function mapPosition(positionStr: string): 'GK' | 'FIXO' | 'ALA' | 'PIVO' {
  const pos = positionStr.toLowerCase().trim();

  // Goalkeeper
  if (pos.includes('guarda') || pos.includes('porter') || pos.includes('gk') || pos.includes('goleiro')) {
    return 'GK';
  }

  // Fixo/Cierre (Defender)
  if (pos.includes('fixo') || pos.includes('cierr') || pos.includes('defens') || pos.includes('universal')) {
    return 'FIXO';
  }

  // Pivot (Forward)
  if (pos.includes('pivot') || pos.includes('pivo')) {
    return 'PIVO';
  }

  // Ala (Winger) - default for other outfield positions
  return 'ALA';
}

/**
 * Generate random player attributes based on team reputation and position
 */
export function generateAttributes(
  position: string,
  teamReputation: number = 70,
  isKnownStar: boolean = false
): {
  technical: any;
  mental: any;
  physical: any;
  goalkeeping?: any;
  currentAbility: number;
  potential: number;
} {
  // Base attribute range based on team reputation
  const baseMin = Math.floor(teamReputation / 10) + 5; // 12-15 for top teams
  const baseMax = baseMin + 6;

  const randAttr = () => baseMin + Math.floor(Math.random() * (baseMax - baseMin + 1));
  const starBonus = isKnownStar ? 3 : 0;

  const technical = {
    shooting: randAttr() + starBonus + (position === 'PIVO' ? 2 : 0),
    passing: randAttr() + starBonus,
    dribbling: randAttr() + starBonus + (position === 'ALA' ? 2 : 0),
    firstTouch: randAttr() + starBonus,
    technique: randAttr() + starBonus,
  };

  const mental = {
    decisions: randAttr() + starBonus,
    positioning: randAttr() + starBonus + (position === 'FIXO' ? 2 : 0),
    workRate: randAttr(),
    composure: randAttr() + starBonus,
    teamwork: randAttr(),
    aggression: 5 + Math.floor(Math.random() * 10),
  };

  const physical = {
    pace: randAttr() + (position === 'ALA' ? 2 : 0),
    acceleration: randAttr() + (position === 'ALA' ? 2 : 0),
    stamina: randAttr(),
    strength: randAttr() + (position === 'PIVO' ? 2 : 0),
    agility: randAttr() + (position === 'ALA' ? 1 : 0),
  };

  const goalkeeping = position === 'GK' ? {
    reflexes: randAttr() + starBonus + 2,
    handling: randAttr() + starBonus + 2,
    oneOnOnes: randAttr() + starBonus + 2,
    distribution: randAttr(),
    aerialAbility: randAttr(),
  } : undefined;

  // Calculate overall ability
  let abilitySum = 0;
  abilitySum += Object.values(technical).reduce((a, b) => a + b, 0);
  abilitySum += Object.values(mental).reduce((a, b) => a + b, 0);
  abilitySum += Object.values(physical).reduce((a, b) => a + b, 0);
  if (goalkeeping) {
    abilitySum += Object.values(goalkeeping).reduce((a, b) => a + b, 0);
  }

  const avgAttr = abilitySum / (position === 'GK' ? 21 : 16);
  const currentAbility = Math.floor(avgAttr * 10) + (isKnownStar ? 20 : 0);
  const potential = currentAbility + Math.floor(Math.random() * 20) + 10;

  return {
    technical,
    mental,
    physical,
    goalkeeping,
    currentAbility: Math.min(200, currentAbility),
    potential: Math.min(200, potential),
  };
}

/**
 * Generate market value based on ability, age, and position
 */
export function generateMarketValue(
  currentAbility: number,
  age: number,
  position: string
): number {
  // Base value from ability
  let value = currentAbility * 5000;

  // Age modifier (peak at 27-30)
  if (age < 24) value *= 1.2; // Young prospect
  else if (age <= 30) value *= 1.0; // Prime
  else if (age <= 33) value *= 0.7; // Declining
  else value *= 0.4; // Veteran

  // Position modifier
  if (position === 'GK') value *= 0.8;
  if (position === 'PIVO') value *= 1.1;

  // Add some randomness
  value *= 0.8 + Math.random() * 0.4;

  return Math.round(value / 10000) * 10000; // Round to nearest 10k
}

/**
 * Delay function for rate limiting
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clean and normalize text
 */
export function cleanText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\n/g, ' ');
}

/**
 * Extract nationality from flag emoji or text
 */
export function extractNationality(text: string): string {
  const nationalityMap: Record<string, string> = {
    '🇵🇹': 'Portugal',
    '🇪🇸': 'Spain',
    '🇧🇷': 'Brazil',
    '🇦🇷': 'Argentina',
    '🇺🇾': 'Uruguay',
    '🇨🇴': 'Colombia',
    '🇻🇪': 'Venezuela',
    '🇵🇾': 'Paraguay',
    '🇯🇵': 'Japan',
    '🇮🇹': 'Italy',
    '🇫🇷': 'France',
    '🇷🇺': 'Russia',
    '🇺🇦': 'Ukraine',
    '🇰🇿': 'Kazakhstan',
    '🇮🇷': 'Iran',
    '🇲🇦': 'Morocco',
    'POR': 'Portugal',
    'ESP': 'Spain',
    'BRA': 'Brazil',
    'ARG': 'Argentina',
  };

  for (const [key, value] of Object.entries(nationalityMap)) {
    if (text.includes(key)) return value;
  }

  return text.trim() || 'Unknown';
}
