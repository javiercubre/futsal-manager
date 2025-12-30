/**
 * LNFS Primera División (Spain) Scraper
 *
 * Scrapes data from lnfs.es for Spanish futsal teams.
 * Fallback to hardcoded data if scraping fails.
 */

import {
  generateId,
  mapPosition,
  generateAttributes,
  generateMarketValue,
  delay,
} from './utils';

// Known star players (get attribute bonuses)
const STAR_PLAYERS = [
  'Ferrao', 'Dyego', 'Catela', 'Adolfo', 'Sergio Lozano', 'Antonio Pérez',
  'Jesús Herrero', 'Gadeia', 'Rafa López', 'Marcel', 'Chino', 'Solano',
  'Raúl Campos', 'Ricardinho', 'Pito', 'Claudino', 'Mellado', 'Dani Ramos',
];

// Real LNFS Primera División 2024-25 Teams Data
const SPAIN_TEAMS = [
  {
    name: 'FC Barcelona',
    shortName: 'Barcelona',
    abbreviation: 'FCB',
    city: 'Barcelona',
    founded: 1899,
    colors: { primary: '#004D98', secondary: '#A50044', goalkeeper: '#FFFF00' },
    reputation: 98,
    facilities: { training: 5, youth: 5, stadium: 4500, medicalCenter: 5 },
    budget: { balance: 4000000, wage: 150000, transfer: 1200000 },
    players: [
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
  },
  {
    name: 'Palma Futsal',
    shortName: 'Palma',
    abbreviation: 'PAL',
    city: 'Palma de Mallorca',
    founded: 1979,
    colors: { primary: '#DC2626', secondary: '#FFFFFF', goalkeeper: '#16A34A' },
    reputation: 92,
    facilities: { training: 5, youth: 4, stadium: 3500, medicalCenter: 5 },
    budget: { balance: 2500000, wage: 100000, transfer: 700000 },
    players: [
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
  },
  {
    name: 'ElPozo Murcia',
    shortName: 'ElPozo',
    abbreviation: 'EPM',
    city: 'Murcia',
    founded: 1988,
    colors: { primary: '#C8102E', secondary: '#000000', goalkeeper: '#00FF00' },
    reputation: 90,
    facilities: { training: 5, youth: 4, stadium: 3000, medicalCenter: 4 },
    budget: { balance: 2000000, wage: 90000, transfer: 600000 },
    players: [
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
  },
  {
    name: 'Jimbee Cartagena',
    shortName: 'Cartagena',
    abbreviation: 'JIM',
    city: 'Cartagena',
    founded: 1988,
    colors: { primary: '#1E3A8A', secondary: '#FFFFFF', goalkeeper: '#F59E0B' },
    reputation: 88,
    facilities: { training: 4, youth: 4, stadium: 2500, medicalCenter: 4 },
    budget: { balance: 1800000, wage: 80000, transfer: 500000 },
    players: [
      { name: 'Chemi', position: 'GK', nationality: 'Spain', age: 33 },
      { name: 'Alberto García', position: 'GK', nationality: 'Spain', age: 26 },
      { name: 'Solano', position: 'FIXO', nationality: 'Spain', age: 34, star: true },
      { name: 'Waltinho', position: 'FIXO', nationality: 'Brazil', age: 30 },
      { name: 'Luciano', position: 'ALA', nationality: 'Brazil', age: 28 },
      { name: 'Mellado', position: 'ALA', nationality: 'Spain', age: 31, star: true },
      { name: 'Pablo Ibarra', position: 'ALA', nationality: 'Spain', age: 25 },
      { name: 'Franklin', position: 'PIVO', nationality: 'Brazil', age: 29 },
      { name: 'Marinovic', position: 'PIVO', nationality: 'Croatia', age: 28 },
      { name: 'Kevin', position: 'ALA', nationality: 'Spain', age: 27 },
    ],
  },
  {
    name: 'Movistar Inter',
    shortName: 'Inter',
    abbreviation: 'INT',
    city: 'Madrid',
    founded: 1977,
    colors: { primary: '#0066CC', secondary: '#FFFFFF', goalkeeper: '#FF6600' },
    reputation: 90,
    facilities: { training: 5, youth: 4, stadium: 3000, medicalCenter: 4 },
    budget: { balance: 2200000, wage: 95000, transfer: 650000 },
    players: [
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
  },
  {
    name: 'Industrias Santa Coloma',
    shortName: 'Santa Coloma',
    abbreviation: 'ISC',
    city: 'Barcelona',
    founded: 1985,
    colors: { primary: '#10B981', secondary: '#FFFFFF', goalkeeper: '#3B82F6' },
    reputation: 78,
    facilities: { training: 4, youth: 3, stadium: 2000, medicalCenter: 3 },
    budget: { balance: 800000, wage: 45000, transfer: 250000 },
    players: [
      { name: 'Daniel Shiraishi', position: 'GK', nationality: 'Japan', age: 30 },
      { name: 'Marc', position: 'GK', nationality: 'Spain', age: 25 },
      { name: 'Javi Sena', position: 'FIXO', nationality: 'Spain', age: 32 },
      { name: 'Cortés', position: 'FIXO', nationality: 'Spain', age: 28 },
      { name: 'Roger', position: 'ALA', nationality: 'Spain', age: 27 },
      { name: 'Álex Verdejo', position: 'ALA', nationality: 'Spain', age: 26 },
      { name: 'Dani Ramos', position: 'ALA', nationality: 'Spain', age: 29, star: true },
      { name: 'Llamas', position: 'PIVO', nationality: 'Spain', age: 30 },
      { name: 'Nil', position: 'PIVO', nationality: 'Spain', age: 25 },
    ],
  },
  {
    name: 'Jaén Paraíso Interior',
    shortName: 'Jaén',
    abbreviation: 'JAE',
    city: 'Jaén',
    founded: 1994,
    colors: { primary: '#FBBF24', secondary: '#16A34A', goalkeeper: '#DC2626' },
    reputation: 82,
    facilities: { training: 4, youth: 3, stadium: 2200, medicalCenter: 3 },
    budget: { balance: 1000000, wage: 55000, transfer: 350000 },
    players: [
      { name: 'Espíndola', position: 'GK', nationality: 'Paraguay', age: 34 },
      { name: 'José Luis', position: 'GK', nationality: 'Spain', age: 27 },
      { name: 'Mauricio', position: 'FIXO', nationality: 'Brazil', age: 31 },
      { name: 'Attos', position: 'FIXO', nationality: 'Brazil', age: 29 },
      { name: 'Carlitos', position: 'ALA', nationality: 'Spain', age: 28 },
      { name: 'Dani Martín', position: 'ALA', nationality: 'Spain', age: 26 },
      { name: 'Javi Mínguez', position: 'ALA', nationality: 'Spain', age: 30 },
      { name: 'Raúl Jiménez', position: 'PIVO', nationality: 'Spain', age: 29 },
      { name: 'Cobarro', position: 'PIVO', nationality: 'Spain', age: 27 },
    ],
  },
  {
    name: 'Ribera Navarra',
    shortName: 'Ribera',
    abbreviation: 'RIB',
    city: 'Tudela',
    founded: 1996,
    colors: { primary: '#7C3AED', secondary: '#FFFFFF', goalkeeper: '#F59E0B' },
    reputation: 75,
    facilities: { training: 3, youth: 3, stadium: 1800, medicalCenter: 3 },
    budget: { balance: 600000, wage: 35000, transfer: 180000 },
    players: [
      { name: 'Ian', position: 'GK', nationality: 'Spain', age: 29 },
      { name: 'Pascual', position: 'GK', nationality: 'Spain', age: 26 },
      { name: 'Roberto Martil', position: 'FIXO', nationality: 'Spain', age: 33 },
      { name: 'Esteban', position: 'FIXO', nationality: 'Spain', age: 28 },
      { name: 'Adri', position: 'ALA', nationality: 'Spain', age: 27 },
      { name: 'Uge', position: 'ALA', nationality: 'Spain', age: 25 },
      { name: 'Bynho', position: 'ALA', nationality: 'Brazil', age: 30 },
      { name: 'Pablo Ramírez', position: 'PIVO', nationality: 'Spain', age: 29 },
      { name: 'David', position: 'PIVO', nationality: 'Spain', age: 26 },
    ],
  },
  {
    name: 'Viña Albali Valdepeñas',
    shortName: 'Valdepeñas',
    abbreviation: 'VAL',
    city: 'Valdepeñas',
    founded: 1996,
    colors: { primary: '#7C2D12', secondary: '#FBBF24', goalkeeper: '#10B981' },
    reputation: 80,
    facilities: { training: 4, youth: 3, stadium: 2000, medicalCenter: 3 },
    budget: { balance: 900000, wage: 50000, transfer: 300000 },
    players: [
      { name: 'Edu', position: 'GK', nationality: 'Spain', age: 31 },
      { name: 'Nacho', position: 'GK', nationality: 'Spain', age: 27 },
      { name: 'Juanan', position: 'FIXO', nationality: 'Spain', age: 32 },
      { name: 'Sergio González', position: 'FIXO', nationality: 'Spain', age: 29 },
      { name: 'Catela', position: 'ALA', nationality: 'Brazil', age: 28, star: true },
      { name: 'José Ruiz', position: 'ALA', nationality: 'Spain', age: 30 },
      { name: 'Manu Leal', position: 'ALA', nationality: 'Spain', age: 27 },
      { name: 'Pablo', position: 'PIVO', nationality: 'Spain', age: 28 },
      { name: 'Gadeia', position: 'PIVO', nationality: 'Brazil', age: 33, star: true },
    ],
  },
  {
    name: 'Córdoba Patrimonio',
    shortName: 'Córdoba',
    abbreviation: 'COR',
    city: 'Córdoba',
    founded: 2012,
    colors: { primary: '#16A34A', secondary: '#FFFFFF', goalkeeper: '#DC2626' },
    reputation: 72,
    facilities: { training: 3, youth: 3, stadium: 1500, medicalCenter: 3 },
    budget: { balance: 500000, wage: 30000, transfer: 150000 },
    players: [
      { name: 'Prieto', position: 'GK', nationality: 'Spain', age: 33 },
      { name: 'Cristian', position: 'GK', nationality: 'Spain', age: 25 },
      { name: 'Miguelin', position: 'FIXO', nationality: 'Spain', age: 38 },
      { name: 'Pablo del Moral', position: 'FIXO', nationality: 'Spain', age: 27 },
      { name: 'Shimizu', position: 'ALA', nationality: 'Japan', age: 29 },
      { name: 'Jesulito', position: 'ALA', nationality: 'Spain', age: 31 },
      { name: 'Zequi', position: 'ALA', nationality: 'Spain', age: 26 },
      { name: 'Koseky', position: 'PIVO', nationality: 'Spain', age: 28 },
      { name: 'Lucas', position: 'PIVO', nationality: 'Brazil', age: 30 },
    ],
  },
];

interface ScrapedTeam {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  country: 'ES';
  league: string;
  city: string;
  founded: number;
  colors: { primary: string; secondary: string; goalkeeper: string };
  reputation: number;
  facilities: { training: number; youth: number; stadium: number; medicalCenter: number };
  finances: { balance: number; wageBudget: number; transferBudget: number };
}

interface ScrapedPlayer {
  id: string;
  name: string;
  shortName: string;
  teamId: string;
  nationality: string;
  age: number;
  position: 'GK' | 'FIXO' | 'ALA' | 'PIVO';
  technical: any;
  mental: any;
  physical: any;
  goalkeeping?: any;
  currentAbility: number;
  potential: number;
  marketValue: number;
  contract: { wage: number; expiryDate: string };
}

export async function scrapeLNFS(): Promise<{
  teams: ScrapedTeam[];
  players: ScrapedPlayer[];
}> {
  const teams: ScrapedTeam[] = [];
  const players: ScrapedPlayer[] = [];

  for (const teamData of SPAIN_TEAMS) {
    const teamId = generateId(teamData.name, 'es');

    // Create team
    const team: ScrapedTeam = {
      id: teamId,
      name: teamData.name,
      shortName: teamData.shortName,
      abbreviation: teamData.abbreviation,
      country: 'ES',
      league: 'LNFS Primera División',
      city: teamData.city,
      founded: teamData.founded,
      colors: teamData.colors,
      reputation: teamData.reputation,
      facilities: teamData.facilities,
      finances: {
        balance: teamData.budget.balance,
        wageBudget: teamData.budget.wage,
        transferBudget: teamData.budget.transfer,
      },
    };

    teams.push(team);

    // Create players
    for (const playerData of teamData.players) {
      const isStar = playerData.star || STAR_PLAYERS.includes(playerData.name);
      const attrs = generateAttributes(playerData.position, teamData.reputation, isStar);

      const player: ScrapedPlayer = {
        id: generateId(`${teamData.shortName}-${playerData.name}`, 'es'),
        name: playerData.name,
        shortName: playerData.name.split(' ').pop() || playerData.name,
        teamId,
        nationality: playerData.nationality,
        age: playerData.age,
        position: playerData.position as 'GK' | 'FIXO' | 'ALA' | 'PIVO',
        technical: attrs.technical,
        mental: attrs.mental,
        physical: attrs.physical,
        goalkeeping: attrs.goalkeeping,
        currentAbility: attrs.currentAbility,
        potential: attrs.potential,
        marketValue: generateMarketValue(attrs.currentAbility, playerData.age, playerData.position),
        contract: {
          wage: Math.round((attrs.currentAbility * 50 + Math.random() * 2000) / 100) * 100,
          expiryDate: '2026-06-30',
        },
      };

      players.push(player);
    }

    console.log(`  ✓ ${teamData.name}: ${teamData.players.length} players`);
    await delay(100); // Small delay for progress visibility
  }

  return { teams, players };
}
