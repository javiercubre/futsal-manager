# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Futsal Manager - A browser-based futsal (5-a-side football) management simulation game built with React and TypeScript. Features real-time match simulation with futsal-specific rules, tactical management, league competitions, transfers, and financial management.

The game runs both in the browser (via GitHub Pages) and as a native desktop application (via Tauri).

## Development Commands

```bash
npm run dev          # Start development server with hot reload (Vite on port 5173)
npm run build        # TypeScript check + production build
npm run preview      # Preview production build locally
npm run scrape       # Run web scraper to collect team/player data
npm run db:push      # Sync Prisma schema to SQLite database
npm run db:studio    # Open Prisma Studio GUI for database management
npm run tauri:dev    # Run desktop app in development mode
npm run tauri:build  # Build production desktop app
```

## Web Deployment (GitHub Pages)

The game auto-deploys to GitHub Pages on every push to `main` via `.github/workflows/deploy-web.yml`.

**Live URL:** `https://USERNAME.github.io/REPO_NAME/`

### Setup (one-time)
1. Go to your repo on GitHub
2. Settings → Pages
3. Source: **GitHub Actions**
4. Push to `main` - deployment triggers automatically

### Deployment Workflow
- **Trigger**: Push to `main` or manual workflow dispatch
- **Build**: Node.js 20, `npm ci`, `npm run build`
- **Deploy**: Uploads `./dist` folder to GitHub Pages
- **Result**: Static site available at Pages URL

## Desktop App (Tauri)

The game is packaged as a standalone desktop application using Tauri 2.

### Automated Builds (Recommended)

GitHub Actions automatically builds installers for all platforms via `.github/workflows/build.yml`.

**To create a release:**
1. Push code to GitHub
2. Create a new tag: `git tag v1.0.0 && git push origin v1.0.0`
3. GitHub Actions builds:
   - **Windows**: `.msi` and `.exe` installers
   - **macOS**: `.dmg` (ARM64 and Intel x86_64)
   - **Linux**: `.deb` and `.AppImage`
4. Download installers from GitHub Releases page (draft release created)

**Test builds:**
- Every `workflow_dispatch` trigger creates test builds
- Download from Actions → workflow run → Artifacts
- Artifacts retained for 7 days

### Build Matrix
The build workflow uses a matrix strategy:
- `macos-latest` (ARM64 and Intel targets)
- `ubuntu-22.04` (Linux)
- `windows-latest` (Windows)

### Local Development (Optional)

Prerequisites:
- **Rust**: Install from https://rustup.rs/
- **Windows**: Visual Studio Build Tools with C++ workload
- **macOS**: Xcode Command Line Tools (`xcode-select --install`)
- **Linux**: `sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`

```bash
npm run tauri:dev    # Run desktop app in development mode
npm run tauri:build  # Build production desktop app
```

## Tech Stack

- **Frontend**: React 18 + TypeScript 5.6 (strict mode)
- **Build**: Vite 6
- **Desktop**: Tauri 2 (Rust-based, produces small native apps ~5MB)
- **State**: Zustand 5 with localStorage persistence
- **Styling**: Tailwind CSS 3.4
- **Graphics**: Pixi.js 8 for match visualization
- **Routing**: React Router 6.28
- **Database**: Prisma with SQLite (currently unused in production)
- **i18n**: i18next + react-i18next (EN, PT, ES)
- **Web Scraping**: Puppeteer + Cheerio

## Directory Structure

```
futsal-manager/
├── .claude/                    # Claude Code settings
│   └── settings.local.json     # Auto-approval permissions
├── .github/                    # GitHub Actions workflows
│   └── workflows/
│       ├── deploy-web.yml      # GitHub Pages deployment
│       ├── build.yml           # Tauri desktop app builds
│       └── test-build.yml      # Test builds
├── prisma/                     # Prisma database schema
│   └── schema.prisma
├── scripts/                    # Utility scripts
│   └── scraper/                # Web scrapers for team/player data
│       ├── index.ts            # Scraper entry point
│       ├── ligaplacard.ts      # Portuguese league scraper
│       ├── lnfs.ts             # Spanish league scraper
│       └── utils.ts            # Scraper utilities
├── src/                        # Main application source
│   ├── components/
│   │   └── common/
│   │       └── GameLayout.tsx  # Main game layout wrapper
│   ├── data/
│   │   └── index.ts            # Embedded team/player data (~33K lines)
│   ├── engine/                 # Game simulation engines
│   │   ├── match/
│   │   │   ├── MatchEngine.ts  # Match simulation engine
│   │   │   ├── types.ts        # Match-specific types
│   │   │   ├── commentary.ts   # Match commentary generator
│   │   │   ├── utils.ts        # Match utilities
│   │   │   └── index.ts
│   │   └── league/
│   │       └── LeagueEngine.ts # League fixture/standings engine
│   ├── i18n/                   # Internationalization
│   │   ├── index.ts            # i18n configuration
│   │   ├── en.json             # English translations
│   │   ├── pt.json             # Portuguese translations
│   │   └── es.json             # Spanish translations
│   ├── pages/                  # React Router pages
│   │   ├── MainMenu.tsx        # Pre-game main menu
│   │   ├── NewGame.tsx         # New game setup
│   │   ├── Dashboard.tsx       # Game home/overview
│   │   ├── Squad.tsx           # Squad management
│   │   ├── Tactics.tsx         # Tactical setup
│   │   ├── Match.tsx           # Match simulation view
│   │   ├── Calendar.tsx        # Fixture calendar
│   │   ├── Transfers.tsx       # Transfer market
│   │   ├── Finances.tsx        # Financial management
│   │   └── Table.tsx           # League standings
│   ├── store/                  # Zustand state management
│   │   ├── gameStore.ts        # Global game state
│   │   └── matchStore.ts       # Match-specific state
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── App.tsx                 # Root component with routing
│   ├── main.tsx                # Application entry point
│   └── vite-env.d.ts           # Vite environment types
├── src-tauri/                  # Tauri desktop app configuration
│   └── tauri.conf.json         # Tauri app settings
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── package.json                # Dependencies and scripts
```

**Total codebase size**: ~5,200 lines of TypeScript/TSX code in `src/`

## Architecture

### State Management

#### Game Store (`src/store/gameStore.ts`)
Global game state persisted to localStorage via Zustand middleware.

**State includes:**
- Game meta: `isGameStarted`, `saveId`, `managerName`, `currentDate`, `season`, `language`
- Player team: `playerTeamId`, `playerTeam`
- Game data: `teams[]`, `players[]`, `competitions[]`, `currentMatch`
- UI state: `selectedPlayerId`, `inbox[]`
- Transfers: `transferOffers[]`
- Simulation: `simulationSpeed`, `isPaused`

**Key actions:**
- `startNewGame()`: Initialize game with selected team
- `advanceDate()`: Progress game calendar
- `updateTeam()`, `updatePlayer()`: Modify game entities
- `setLanguage()`: Change UI language
- `clearGame()`: Reset all game state

#### Match Store (`src/store/matchStore.ts`)
Match-specific state with engine integration. Used during live match simulation.

### Game Engines (`src/engine/`)

#### MatchEngine (`match/MatchEngine.ts`)
Tick-based match simulator (1 tick = 1 second real-time).

**Key features:**
- 1200 ticks per half = 20 minutes (futsal duration)
- Simulates goals, fouls, cards, substitutions, timeouts
- Event-driven architecture (emits match events)
- Probability calculations based on player attributes and tactics
- Flying goalkeeper support
- Accumulated fouls tracking (6th foul = penalty)

**Match phases:**
- Pre-match → First Half → Half Time → Second Half → Full Time

#### LeagueEngine (`league/LeagueEngine.ts`)
League management engine.

**Key features:**
- Fixture generation using circle method (balanced home/away)
- Standings calculation (points, GD, goals)
- Season progression
- Multi-competition support

### Futsal-Specific Rules Implemented

- ✅ Accumulated fouls system (6th foul = penalty)
- ✅ Flying goalkeeper option (outfield player as GK)
- ✅ Unlimited substitutions (rolling subs)
- ✅ Timeouts (1 per team per half)
- ✅ Two 20-minute halves
- ✅ 5v5 format (1 GK + 4 outfield)
- ✅ Smaller pitch dimensions

### Data Layer

**Embedded data** (`src/data/index.ts`):
- ~33K lines of team and player data
- No external API required
- Players generated procedurally from real team templates
- Attribute variation for realism

**Supported leagues:**
- **Portugal**: Liga Placard (Portuguese futsal league)
- **Spain**: LNFS (Spanish futsal league)

**Web scrapers** (`scripts/scraper/`):
- Puppeteer-based scrapers for Liga Placard and LNFS
- Cheerio for HTML parsing
- Generates TypeScript data files
- Run with `npm run scrape`

### Type System

Comprehensive types in `src/types/index.ts` (~400+ lines):

**Core types:**
- `Player`: Full player model with attributes, contract, injury, stats
- `Team`: Team model with tactics, finances, players
- `Competition`: League/cup structures
- `Match`: Match data and events
- `Position`: Futsal positions (GK, FIXO, ALA, PIVO)

**Attribute types:**
- `TechnicalAttributes`: shooting, passing, dribbling, firstTouch, technique
- `MentalAttributes`: decisions, positioning, workRate, composure, teamwork, aggression
- `PhysicalAttributes`: pace, acceleration, stamina, strength, agility
- `GoalkeeperAttributes`: reflexes, handling, oneOnOnes, distribution, aerialAbility

**Scale**: All attributes use 1-20 scale (like Football Manager)

### Routing Structure

Routes defined in `src/App.tsx` using React Router 6.

**Pre-game routes** (no authentication):
- `/` → Main Menu
- `/new-game` → New Game Setup

**In-game routes** (require `isGameStarted` flag):
- `/game/dashboard` → Dashboard
- `/game/squad` → Squad Management
- `/game/tactics` → Tactical Setup
- `/game/match` → Match Simulation
- `/game/calendar` → Fixture Calendar
- `/game/transfers` → Transfer Market
- `/game/finances` → Financial Management
- `/game/table` → League Standings

All in-game routes wrapped in `GameLayout` component.

### Path Alias

Use `@/` to import from `src/` directory:

```typescript
import { useGameStore } from '@/store/gameStore';
import type { Player, Team } from '@/types';
import { MatchEngine } from '@/engine/match';
```

Configured in:
- `vite.config.ts`: `resolve.alias['@'] = './src'`
- `tsconfig.json`: `paths['@/*'] = ['src/*']`

## Key Patterns & Conventions

### Component Patterns

1. **Page-based routing**: Each game section is a page in `src/pages/`
2. **GameLayout wrapper**: All in-game pages wrapped with `GameLayout.tsx`
3. **Route protection**: Game routes require `isGameStarted` flag
4. **Engine-UI decoupling**: Match/League engines are standalone, UI subscribes to state

### State Management Patterns

1. **Zustand stores**: Use `create()` from Zustand
2. **Persistence**: Game state persisted to localStorage via `persist` middleware
3. **Store hooks**: Access state with `useGameStore()`, `useMatchStore()`
4. **Immutable updates**: Use spread operators for state updates

Example:
```typescript
const { teams, updateTeam } = useGameStore();

// Update team immutably
updateTeam(teamId, { ...team, name: 'New Name' });
```

### Styling Patterns

1. **Tailwind CSS**: All styling via Tailwind utility classes
2. **Dark theme**: Default dark theme (`bg-slate-900`, `text-white`)
3. **Responsive**: Mobile-first responsive design
4. **clsx**: Use `clsx()` for conditional classes

Example:
```typescript
<div className={clsx(
  'px-4 py-2 rounded',
  isActive ? 'bg-blue-600' : 'bg-gray-600'
)}>
```

### TypeScript Conventions

1. **Strict mode**: `strict: true` in tsconfig.json
2. **Type imports**: Use `import type` for type-only imports
3. **Interface over type**: Prefer `interface` for object shapes
4. **No unused warnings**: `noUnusedLocals` and `noUnusedParameters` disabled

### Internationalization (i18n)

1. **useTranslation hook**: Access translations via `useTranslation()`
2. **Translation keys**: Nested JSON structure in language files
3. **Language switching**: Set via `useGameStore().setLanguage()`
4. **Supported languages**: English (en), Portuguese (pt), Spanish (es)

Example:
```typescript
const { t } = useTranslation();

return <h1>{t('dashboard.title')}</h1>;
```

### File Organization

1. **Flat pages**: All pages in single `src/pages/` directory
2. **Common components**: Shared components in `src/components/common/`
3. **Engine isolation**: Game engines in `src/engine/` with no UI dependencies
4. **Type centralization**: All types in `src/types/index.ts`

## Configuration Files

### Vite (`vite.config.ts`)
- React plugin
- Base path: `'./'` (for GitHub Pages compatibility)
- Path alias: `@` → `./src`

### TypeScript (`tsconfig.json`)
- Target: ES2020
- Strict mode enabled
- JSX: `react-jsx` (new JSX transform)
- Module resolution: bundler
- Path alias: `@/*` → `src/*`

### Tailwind (`tailwind.config.js`)
- Content: `['./index.html', './src/**/*.{js,ts,jsx,tsx}']`
- Default theme with custom extensions

### Tauri (`src-tauri/tauri.conf.json`)
- Product name: "Futsal Manager"
- Version: 0.1.0
- Identifier: com.futsalmanager.app
- Window: 1280x800, min 1024x720
- Build targets: all (Windows, macOS, Linux)

## Claude Code Settings

Permissions configured in `.claude/settings.local.json`:

**Auto-approved commands:**
- npm package management
- Tauri initialization
- Git operations (init, add, commit, push)
- Build commands
- GitHub CLI
- Web fetch (github.com, javiercubre.github.io)

These commands run without user confirmation in Claude Code sessions.

## Testing

**Current state**: No testing framework configured.

**Recommended additions** (if needed):
- Vitest (Vite-native test runner)
- React Testing Library
- Playwright (E2E tests)

## Common Development Workflows

### Adding a New Page

1. Create page component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx` under in-game routes
3. Wrap in `GameLayout` if in-game page
4. Add navigation link in `GameLayout.tsx`
5. Add translations to `src/i18n/*.json`

### Modifying Game Data

1. Update scrapers in `scripts/scraper/` (if scraping)
2. Run `npm run scrape` to regenerate data
3. Or manually edit `src/data/index.ts`
4. Update types in `src/types/index.ts` if schema changed

### Adding New Player Attributes

1. Add attribute to type in `src/types/index.ts`
2. Update match engine calculations in `src/engine/match/MatchEngine.ts`
3. Update UI displays in squad/player pages
4. Update data generation in scrapers

### Adding Translation Keys

1. Add key to `src/i18n/en.json` (English - base)
2. Add same key to `pt.json` (Portuguese)
3. Add same key to `es.json` (Spanish)
4. Use in component: `const { t } = useTranslation(); t('your.key')`

## Performance Considerations

1. **Match engine**: Runs on ticks (1/second), can be CPU-intensive
2. **State persistence**: localStorage writes on every state change
3. **Data size**: 33K lines of data loaded on app start
4. **Pixi.js rendering**: GPU-accelerated but can struggle on older hardware

**Optimization tips:**
- Debounce frequent state updates
- Lazy load data/components where possible
- Use React.memo for expensive components
- Consider Web Workers for match simulation

## Known Limitations

1. **No database**: Game state stored in localStorage only (no cloud saves)
2. **No multiplayer**: Single-player only
3. **Limited leagues**: Only Portuguese and Spanish leagues
4. **No moddability**: Hard-coded game data (no mod support)
5. **Browser storage limits**: localStorage ~5-10MB limit may constrain save size

## Troubleshooting

### Build fails with TypeScript errors
- Run `npm run build` to see full error output
- Check type definitions in `src/types/index.ts`
- Ensure all imports use correct paths

### Tauri build fails
- Verify Rust installed: `cargo --version`
- Check platform-specific dependencies
- Review `src-tauri/tauri.conf.json` configuration

### GitHub Pages 404
- Verify base path in `vite.config.ts` is `'./'`
- Check GitHub Pages source is set to GitHub Actions
- Ensure workflow has write permissions

### Match simulation freezes
- Check browser console for errors
- Verify MatchEngine tick loop not stuck
- Consider reducing simulation speed

## Future Enhancement Ideas

- [ ] Add testing framework (Vitest + RTL)
- [ ] Implement cloud saves (backend required)
- [ ] Add more leagues (Italy, France, etc.)
- [ ] Multiplayer support
- [ ] Mod/editor support for custom teams/leagues
- [ ] 3D match visualization
- [ ] Mobile app (React Native or Capacitor)
- [ ] Steam release

## Resources

- **Vite Docs**: https://vite.dev/
- **React Docs**: https://react.dev/
- **Tauri Docs**: https://v2.tauri.app/
- **Zustand Docs**: https://zustand.docs.pmnd.rs/
- **Pixi.js Docs**: https://pixijs.com/
- **i18next Docs**: https://www.i18next.com/

## License

Check repository for license information.
