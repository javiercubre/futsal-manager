import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '@/store/gameStore';

export default function MainMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isGameStarted, language, setLanguage } = useGameStore();

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'pt', label: 'Português', flag: '🇵🇹' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 futsal-court" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Logo/Title */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-white mb-2">
            FUTSAL
            <span className="text-primary-500"> MANAGER</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Lead your team to glory
          </p>
        </div>

        {/* Menu buttons */}
        <div className="space-y-4 w-80">
          <button
            onClick={() => navigate('/new-game')}
            className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 text-white text-xl font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            New Game
          </button>

          {isGameStarted && (
            <button
              onClick={() => navigate('/game/dashboard')}
              className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white text-xl font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Continue Game
            </button>
          )}

          <button
            className="w-full py-4 px-6 bg-slate-700 hover:bg-slate-600 text-white text-xl font-semibold rounded-xl transition-all duration-200"
            onClick={() => {/* TODO: Load game modal */}}
          >
            Load Game
          </button>

          <button
            className="w-full py-4 px-6 bg-slate-700 hover:bg-slate-600 text-white text-xl font-semibold rounded-xl transition-all duration-200"
            onClick={() => {/* TODO: Settings modal */}}
          >
            Settings
          </button>
        </div>

        {/* Language selector */}
        <div className="mt-12 flex justify-center gap-4">
          {languages.map(({ code, label, flag }) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                language === code
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span>{flag}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Version */}
        <p className="mt-8 text-slate-500 text-sm">
          v0.1.0 - Early Development
        </p>
      </div>
    </div>
  );
}
