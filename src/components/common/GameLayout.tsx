import { ReactNode, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '@/store/gameStore';
import clsx from 'clsx';
import type { Fixture } from '@/types';

interface GameLayoutProps {
  children: ReactNode;
}

// Simple icon components (replace with proper icons later)
const Icons = {
  Dashboard: () => <span className="text-lg">🏠</span>,
  Squad: () => <span className="text-lg">👥</span>,
  Tactics: () => <span className="text-lg">📋</span>,
  Calendar: () => <span className="text-lg">📅</span>,
  Table: () => <span className="text-lg">🏆</span>,
  Transfers: () => <span className="text-lg">💰</span>,
  Finances: () => <span className="text-lg">📊</span>,
  Settings: () => <span className="text-lg">⚙️</span>,
  Play: () => <span className="text-lg">▶️</span>,
  Pause: () => <span className="text-lg">⏸️</span>,
};

export default function GameLayout({ children }: GameLayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { playerTeam, playerTeamId, currentDate, managerName, competitions, advanceDay } = useGameStore();

  // Check if there's a match today that hasn't been played
  const todaysMatch = useMemo((): (Fixture & { competitionId: string }) | null => {
    if (!playerTeamId || competitions.length === 0) return null;

    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);

    for (const comp of competitions) {
      for (const fixture of comp.fixtures) {
        const fixtureDate = new Date(fixture.date);
        fixtureDate.setHours(0, 0, 0, 0);

        if (fixtureDate.getTime() === today.getTime() &&
            (fixture.homeTeamId === playerTeamId || fixture.awayTeamId === playerTeamId) &&
            !fixture.played) {
          return { ...fixture, competitionId: comp.id };
        }
      }
    }
    return null;
  }, [playerTeamId, competitions, currentDate]);

  const handleContinue = () => {
    if (todaysMatch) {
      // Navigate to match page with the fixture
      navigate('/game/match', { state: { fixture: todaysMatch } });
    } else {
      // No match today, advance to next day
      advanceDay();
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const navItems = [
    { path: '/game/dashboard', label: t('menu.dashboard'), Icon: Icons.Dashboard },
    { path: '/game/squad', label: t('menu.squad'), Icon: Icons.Squad },
    { path: '/game/tactics', label: t('menu.tactics'), Icon: Icons.Tactics },
    { path: '/game/calendar', label: t('menu.calendar'), Icon: Icons.Calendar },
    { path: '/game/table', label: t('menu.table'), Icon: Icons.Table },
    { path: '/game/transfers', label: t('menu.transfers'), Icon: Icons.Transfers },
    { path: '/game/finances', label: t('menu.finances'), Icon: Icons.Finances },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 flex flex-col">
        {/* Team header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: playerTeam?.colors.primary || '#3b82f6' }}
            >
              {playerTeam?.abbreviation || 'FM'}
            </div>
            <div>
              <h2 className="font-semibold text-white">{playerTeam?.name || 'No Team'}</h2>
              <p className="text-sm text-slate-400">{managerName}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ path, label, Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                clsx('sidebar-item', isActive && 'active')
              }
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Settings at bottom */}
        <div className="p-2 border-t border-slate-700">
          <button
            className="sidebar-item w-full"
            onClick={() => navigate('/')}
          >
            <Icons.Settings />
            <span>{t('menu.settings')}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="text-slate-300">{formatDate(currentDate)}</span>
            {playerTeam && (
              <span className="text-slate-400">
                {t('competition.position')}: {playerTeam.leaguePosition || '-'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {todaysMatch && (
              <span className="text-yellow-400 text-sm mr-2">Match day!</span>
            )}
            <button
              onClick={handleContinue}
              className={`btn flex items-center gap-2 ${todaysMatch ? 'btn-primary bg-green-600 hover:bg-green-700' : 'btn-primary'}`}
            >
              <Icons.Play />
              {todaysMatch ? 'Play Match' : 'Continue'}
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
