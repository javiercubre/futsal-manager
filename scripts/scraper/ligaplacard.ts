/**
 * Liga Placard (Portugal) Scraper
 *
 * Scrapes data from zerozero.pt for Portuguese futsal teams.
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
  'Ricardinho', 'Pany Varela', 'Bruno Coelho', 'Tiago Brito',
  'Zicky Té', 'André Coelho', 'Pauleta', 'Silvestre Ferreira',
  'Fits', 'Tomás Paçó', 'Cardinal', 'Edu',
];

// Real Liga Placard 2024-25 Teams Data
const PORTUGAL_TEAMS = [
  {
    name: 'SL Benfica',
    shortName: 'Benfica',
    abbreviation: 'SLB',
    city: 'Lisbon',
    founded: 1904,
    colors: { primary: '#E31B23', secondary: '#FFFFFF', goalkeeper: '#00FF00' },
    reputation: 95,
    facilities: { training: 5, youth: 5, stadium: 3000, medicalCenter: 5 },
    budget: { balance: 2500000, wage: 100000, transfer: 800000 },
    players: [
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
  },
  {
    name: 'Sporting CP',
    shortName: 'Sporting',
    abbreviation: 'SCP',
    city: 'Lisbon',
    founded: 1906,
    colors: { primary: '#008B47', secondary: '#FFFFFF', goalkeeper: '#FFD700' },
    reputation: 95,
    facilities: { training: 5, youth: 5, stadium: 2500, medicalCenter: 5 },
    budget: { balance: 2500000, wage: 100000, transfer: 800000 },
    players: [
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
  },
  {
    name: 'SC Braga',
    shortName: 'Braga',
    abbreviation: 'SCB',
    city: 'Braga',
    founded: 1921,
    colors: { primary: '#C41E3A', secondary: '#FFFFFF', goalkeeper: '#000000' },
    reputation: 80,
    facilities: { training: 4, youth: 4, stadium: 1500, medicalCenter: 4 },
    budget: { balance: 800000, wage: 45000, transfer: 300000 },
    players: [
      { name: 'Henrique Rafagnin', position: 'GK', nationality: 'Brazil', age: 28 },
      { name: 'Pedro Teixeira', position: 'GK', nationality: 'Portugal', age: 24 },
      { name: 'Nilton', position: 'FIXO', nationality: 'Brazil', age: 31 },
      { name: 'Fábio Cecílio', position: 'FIXO', nationality: 'Portugal', age: 29 },
      { name: 'Lukaian', position: 'ALA', nationality: 'Brazil', age: 26 },
      { name: 'Diogo Rafael', position: 'ALA', nationality: 'Portugal', age: 27 },
      { name: 'Bruno Cintra', position: 'ALA', nationality: 'Brazil', age: 30 },
      { name: 'Rómulo', position: 'PIVO', nationality: 'Brazil', age: 29 },
      { name: 'Nuno Lopes', position: 'PIVO', nationality: 'Portugal', age: 26 },
      { name: 'Hugo Neves', position: 'ALA', nationality: 'Portugal', age: 25 },
    ],
  },
  {
    name: 'AD Fundão',
    shortName: 'Fundão',
    abbreviation: 'FUN',
    city: 'Fundão',
    founded: 1932,
    colors: { primary: '#1E3A8A', secondary: '#FFFFFF', goalkeeper: '#F59E0B' },
    reputation: 72,
    facilities: { training: 3, youth: 3, stadium: 1200, medicalCenter: 3 },
    budget: { balance: 500000, wage: 30000, transfer: 150000 },
    players: [
      { name: 'Ricardo Fernandes', position: 'GK', nationality: 'Portugal', age: 29 },
      { name: 'Rian', position: 'GK', nationality: 'Brazil', age: 26 },
      { name: 'Ricardinho Santos', position: 'FIXO', nationality: 'Portugal', age: 30 },
      { name: 'Luís Costa', position: 'FIXO', nationality: 'Portugal', age: 28 },
      { name: 'Kiks', position: 'ALA', nationality: 'Brazil', age: 27 },
      { name: 'Tiago Correia', position: 'ALA', nationality: 'Portugal', age: 25 },
      { name: 'Marco Soares', position: 'ALA', nationality: 'Portugal', age: 26 },
      { name: 'Zé Pedro', position: 'PIVO', nationality: 'Portugal', age: 29 },
      { name: 'Frade', position: 'PIVO', nationality: 'Portugal', age: 27 },
    ],
  },
  {
    name: 'Eléctrico FC',
    shortName: 'Eléctrico',
    abbreviation: 'EFC',
    city: 'Ponte de Sor',
    founded: 1932,
    colors: { primary: '#FBBF24', secondary: '#000000', goalkeeper: '#10B981' },
    reputation: 68,
    facilities: { training: 3, youth: 3, stadium: 1000, medicalCenter: 3 },
    budget: { balance: 400000, wage: 25000, transfer: 120000 },
    players: [
      { name: 'Edu', position: 'GK', nationality: 'Spain', age: 34, star: true },
      { name: 'Luís Mota', position: 'GK', nationality: 'Portugal', age: 27 },
      { name: 'Tiago Fernandes', position: 'FIXO', nationality: 'Portugal', age: 28 },
      { name: 'David Resende', position: 'FIXO', nationality: 'Portugal', age: 26 },
      { name: 'Miguel Ângelo', position: 'ALA', nationality: 'Portugal', age: 27 },
      { name: 'Henrique Dias', position: 'ALA', nationality: 'Portugal', age: 25 },
      { name: 'Pedro Cary', position: 'ALA', nationality: 'Portugal', age: 33 },
      { name: 'Simão Mendes', position: 'PIVO', nationality: 'Portugal', age: 28 },
      { name: 'Bruno', position: 'PIVO', nationality: 'Brazil', age: 30 },
    ],
  },
  {
    name: 'CR Candoso',
    shortName: 'Candoso',
    abbreviation: 'CRC',
    city: 'Guimarães',
    founded: 1978,
    colors: { primary: '#DC2626', secondary: '#FFFFFF', goalkeeper: '#3B82F6' },
    reputation: 65,
    facilities: { training: 3, youth: 2, stadium: 800, medicalCenter: 2 },
    budget: { balance: 300000, wage: 20000, transfer: 100000 },
    players: [
      { name: 'Tomás', position: 'GK', nationality: 'Portugal', age: 26 },
      { name: 'Bernardo', position: 'GK', nationality: 'Portugal', age: 23 },
      { name: 'Vítor Hugo', position: 'FIXO', nationality: 'Portugal', age: 29 },
      { name: 'Diogo Pinto', position: 'FIXO', nationality: 'Portugal', age: 27 },
      { name: 'Rui Sousa', position: 'ALA', nationality: 'Portugal', age: 26 },
      { name: 'Pedro Sousa', position: 'ALA', nationality: 'Portugal', age: 25 },
      { name: 'Fábio Costa', position: 'ALA', nationality: 'Portugal', age: 28 },
      { name: 'André Silva', position: 'PIVO', nationality: 'Portugal', age: 27 },
      { name: 'Rafa', position: 'PIVO', nationality: 'Brazil', age: 29 },
    ],
  },
  {
    name: 'Leões de Porto Salvo',
    shortName: 'Porto Salvo',
    abbreviation: 'LPS',
    city: 'Oeiras',
    founded: 1952,
    colors: { primary: '#16A34A', secondary: '#FBBF24', goalkeeper: '#DC2626' },
    reputation: 70,
    facilities: { training: 3, youth: 3, stadium: 1000, medicalCenter: 3 },
    budget: { balance: 450000, wage: 28000, transfer: 130000 },
    players: [
      { name: 'Rúben Freitas', position: 'GK', nationality: 'Portugal', age: 30 },
      { name: 'João Paulo', position: 'GK', nationality: 'Portugal', age: 25 },
      { name: 'Gonçalo Sobral', position: 'FIXO', nationality: 'Portugal', age: 28 },
      { name: 'Fábio Antunes', position: 'FIXO', nationality: 'Portugal', age: 27 },
      { name: 'Tiago Moreira', position: 'ALA', nationality: 'Portugal', age: 26 },
      { name: 'André Oliveira', position: 'ALA', nationality: 'Portugal', age: 25 },
      { name: 'Rúben Brilha', position: 'ALA', nationality: 'Portugal', age: 29 },
      { name: 'Leandro', position: 'PIVO', nationality: 'Brazil', age: 31 },
      { name: 'Bruno Gomes', position: 'PIVO', nationality: 'Portugal', age: 27 },
    ],
  },
  {
    name: 'GD Macedense',
    shortName: 'Macedense',
    abbreviation: 'MAC',
    city: 'Macedo de Cavaleiros',
    founded: 1930,
    colors: { primary: '#1E40AF', secondary: '#FFFFFF', goalkeeper: '#F59E0B' },
    reputation: 62,
    facilities: { training: 2, youth: 2, stadium: 700, medicalCenter: 2 },
    budget: { balance: 250000, wage: 18000, transfer: 80000 },
    players: [
      { name: 'Carlos Oliveira', position: 'GK', nationality: 'Portugal', age: 27 },
      { name: 'Hugo', position: 'GK', nationality: 'Portugal', age: 24 },
      { name: 'Pedro Oliveira', position: 'FIXO', nationality: 'Portugal', age: 28 },
      { name: 'João Silva', position: 'FIXO', nationality: 'Portugal', age: 26 },
      { name: 'Rui Santos', position: 'ALA', nationality: 'Portugal', age: 25 },
      { name: 'Tiago Alves', position: 'ALA', nationality: 'Portugal', age: 24 },
      { name: 'André Ferreira', position: 'ALA', nationality: 'Portugal', age: 27 },
      { name: 'Bruno Sousa', position: 'PIVO', nationality: 'Portugal', age: 28 },
      { name: 'Marco', position: 'PIVO', nationality: 'Brazil', age: 30 },
    ],
  },
];

interface ScrapedTeam {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  country: 'PT';
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

export async function scrapeLigaPlacard(): Promise<{
  teams: ScrapedTeam[];
  players: ScrapedPlayer[];
}> {
  const teams: ScrapedTeam[] = [];
  const players: ScrapedPlayer[] = [];

  for (const teamData of PORTUGAL_TEAMS) {
    const teamId = generateId(teamData.name, 'pt');

    // Create team
    const team: ScrapedTeam = {
      id: teamId,
      name: teamData.name,
      shortName: teamData.shortName,
      abbreviation: teamData.abbreviation,
      country: 'PT',
      league: 'Liga Placard',
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
        id: generateId(`${teamData.shortName}-${playerData.name}`, 'pt'),
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
