# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Futsal Manager - A browser-based futsal (5-a-side football) management simulation game built with React and TypeScript. Features real-time match simulation with futsal-specific rules, tactical management, and league competitions.

## Development Commands

```bash
npm run dev          # Start development server with hot reload
npm run build        # TypeScript check + production build
npm run preview      # Preview production build locally
npm run scrape       # Run web scraper to collect team/player data
npm run db:push      # Sync Prisma schema to SQLite database
npm run db:studio    # Open Prisma Studio GUI for database management
```

## Web Deployment (GitHub Pages)

The game auto-deploys to GitHub Pages on every push to `main`.

**Your game URL:** `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

### Enable GitHub Pages (one-time setup)
1. Go to your repo on GitHub
2. Settings → Pages
3. Source: **GitHub Actions**
4. Push to `main` - the game deploys automatically

## Desktop App (Tauri)

The game is packaged as a standalone desktop application using Tauri.

### Automated Builds (Recommended)

GitHub Actions automatically builds installers for all platforms. No local setup required.

**To create a release:**
1. Push code to GitHub
2. Create a new tag: `git tag v1.0.0 && git push origin v1.0.0`
3. GitHub Actions builds Windows (.msi/.exe), macOS (.dmg), and Linux (.deb/.AppImage)
4. Download installers from the GitHub Releases page

**Test builds:** Every push to `main` triggers builds. Download from Actions → workflow run → Artifacts.

### Local Development (Optional)

If you want to build locally, install prerequisites first:
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
- **Desktop**: Tauri 2 (Rust-based, produces small native apps)
- **State**: Zustand 5 with localStorage persistence
- **Styling**: Tailwind CSS
- **Graphics**: Pixi.js 8 for match visualization
- **Database**: Prisma with SQLite
- **i18n**: i18next (EN, PT, ES)

## Architecture

### State Management
- `src/store/gameStore.ts` - Global game state (teams, players, competitions, current date, language). Persisted to localStorage.
- `src/store/matchStore.ts` - Match-specific state with engine integration

### Game Engines (src/engine/)
- **MatchEngine** (`match/MatchEngine.ts`) - Tick-based match simulator (1 tick = 1 second, 1200 ticks per half = 20 minutes). Handles goals, fouls, cards, substitutions based on player attributes and tactics.
- **LeagueEngine** (`league/LeagueEngine.ts`) - Fixture generation (circle method), standings calculation

### Futsal-Specific Rules Implemented
- Accumulated fouls system (6th foul = penalty)
- Flying goalkeeper option
- Unlimited substitutions
- Timeouts (1 per half)
- Two 20-minute halves

### Data Layer
- All team/player data embedded in `src/data/` (no external API required)
- Players generated procedurally from templates with attribute variation
- Supports Portuguese (Liga Placard) and Spanish (LNFS) leagues
- Web scrapers in `scripts/scraper/` using Puppeteer + Cheerio

### Type System
Comprehensive types in `src/types/index.ts` covering:
- Player attributes (technical, mental, physical, goalkeeper-specific)
- Tactical formations and instructions
- Match events and statistics
- Competition structures

### Path Alias
Use `@/` to import from `src/` directory (configured in vite.config.ts and tsconfig.json).

## Key Patterns

- **Page-based routing**: Each game section (Squad, Tactics, Match, Calendar, etc.) is a page in `src/pages/`
- **GameLayout wrapper**: All in-game pages wrapped with `src/components/common/GameLayout.tsx`
- **Route protection**: Game routes require `isGameStarted` flag in store
- **Engine-UI decoupling**: Match/League engines are standalone, UI subscribes to state changes
