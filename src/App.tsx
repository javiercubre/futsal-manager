import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameStore } from './store/gameStore';

// Pages
import MainMenu from './pages/MainMenu';
import NewGame from './pages/NewGame';
import Dashboard from './pages/Dashboard';
import Squad from './pages/Squad';
import Tactics from './pages/Tactics';
import MatchView from './pages/Match';
import Calendar from './pages/Calendar';
import Transfers from './pages/Transfers';
import Finances from './pages/Finances';
import Table from './pages/Table';

// Layout
import GameLayout from './components/common/GameLayout';

function App() {
  const { i18n } = useTranslation();
  const { isGameStarted, language } = useGameStore();

  // Sync language with store
  if (i18n.language !== language) {
    i18n.changeLanguage(language);
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Routes>
        {/* Pre-game routes */}
        <Route path="/" element={<MainMenu />} />
        <Route path="/new-game" element={<NewGame />} />

        {/* In-game routes - wrapped in GameLayout */}
        <Route
          path="/game/*"
          element={
            isGameStarted ? (
              <GameLayout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="squad" element={<Squad />} />
                  <Route path="tactics" element={<Tactics />} />
                  <Route path="match" element={<MatchView />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="transfers" element={<Transfers />} />
                  <Route path="finances" element={<Finances />} />
                  <Route path="table" element={<Table />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </GameLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
