/**
 * Futsal Data Scraper
 *
 * Scrapes real team and player data from:
 * - zerozero.pt (Liga Placard - Portugal)
 * - lnfs.es (Primera División - Spain)
 *
 * Usage: npm run scrape
 */

import { scrapeLigaPlacard } from './ligaplacard';
import { scrapeLNFS } from './lnfs';
import { saveData, loadExistingData } from './utils';

async function main() {
  console.log('🏟️  Futsal Manager Data Scraper\n');
  console.log('================================\n');

  const args = process.argv.slice(2);
  const scrapePortugal = args.length === 0 || args.includes('--portugal') || args.includes('-pt');
  const scrapeSpain = args.length === 0 || args.includes('--spain') || args.includes('-es');

  const allTeams: any[] = [];
  const allPlayers: any[] = [];

  try {
    if (scrapePortugal) {
      console.log('🇵🇹 Scraping Liga Placard (Portugal)...\n');
      const { teams, players } = await scrapeLigaPlacard();
      allTeams.push(...teams);
      allPlayers.push(...players);
      console.log(`✅ Portugal: ${teams.length} teams, ${players.length} players\n`);
    }

    if (scrapeSpain) {
      console.log('🇪🇸 Scraping LNFS Primera División (Spain)...\n');
      const { teams, players } = await scrapeLNFS();
      allTeams.push(...teams);
      allPlayers.push(...players);
      console.log(`✅ Spain: ${teams.length} teams, ${players.length} players\n`);
    }

    // Save to JSON files
    await saveData('teams', allTeams);
    await saveData('players', allPlayers);

    console.log('================================');
    console.log(`\n✅ Scraping complete!`);
    console.log(`   Total: ${allTeams.length} teams, ${allPlayers.length} players`);
    console.log(`   Data saved to src/data/`);

  } catch (error) {
    console.error('❌ Scraping failed:', error);
    process.exit(1);
  }
}

main();
