import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '@/store/gameStore';
import { getTeamsWithSquads, generateAllPlayers, generateCompetitions } from '@/data';
import type { Team, Country } from '@/types';

export default function NewGame() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { startNewGame, loadTeams, loadPlayers, loadCompetitions, language } = useGameStore();

  const [step, setStep] = useState<'manager' | 'team'>('manager');
  const [managerName, setManagerName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | 'all'>('all');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load teams on mount
  useEffect(() => {
    setIsLoading(true);
    // Simulate async load (data is actually synchronous but we want to show loading state)
    setTimeout(() => {
      const teams = getTeamsWithSquads();
      setAllTeams(teams);
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredTeams = selectedCountry === 'all'
    ? allTeams
    : allTeams.filter(t => t.country === selectedCountry);

  const handleStartGame = () => {
    if (!selectedTeamId || !managerName.trim()) return;

    // Load all teams and players into store
    const players = generateAllPlayers();
    loadTeams(allTeams);
    loadPlayers(players);

    // Generate competitions with fixtures
    const seasonStart = new Date(2024, 7, 10); // August 10, 2024 - first match day
    const competitions = generateCompetitions(allTeams, seasonStart);
    loadCompetitions(competitions);

    // Start the game
    startNewGame(managerName.trim(), selectedTeamId, language);

    // Navigate to dashboard
    navigate('/game/dashboard');
  };

  const selectedTeam = allTeams.find(t => t.id === selectedTeamId);

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => step === 'team' ? setStep('manager') : navigate('/')}
            className="text-slate-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← {t('common.back')}
          </button>
          <h1 className="text-4xl font-bold text-white">
            {step === 'manager' ? 'Create Your Manager' : 'Select Your Team'}
          </h1>
          <p className="text-slate-400 mt-2">
            {step === 'manager'
              ? 'Enter your name to begin your career'
              : 'Choose a team from Portugal or Spain'}
          </p>
        </div>

        {/* Step 1: Manager Name */}
        {step === 'manager' && (
          <div className="card max-w-md">
            <label className="block text-slate-300 mb-2">Manager Name</label>
            <input
              type="text"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              placeholder="Enter your name..."
              className="input w-full text-lg"
              autoFocus
            />
            <button
              onClick={() => setStep('team')}
              disabled={!managerName.trim()}
              className="btn btn-primary w-full mt-4 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.next')} →
            </button>
          </div>
        )}

        {/* Step 2: Team Selection */}
        {step === 'team' && (
          <div>
            {/* Country filter */}
            <div className="flex gap-3 mb-6">
              {[
                { code: 'all', label: 'All Teams', flag: '🌍', count: allTeams.length },
                { code: 'PT', label: 'Portugal', flag: '🇵🇹', count: allTeams.filter(t => t.country === 'PT').length },
                { code: 'ES', label: 'Spain', flag: '🇪🇸', count: allTeams.filter(t => t.country === 'ES').length },
              ].map(({ code, label, flag, count }) => (
                <button
                  key={code}
                  onClick={() => setSelectedCountry(code as Country | 'all')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    selectedCountry === code
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span>{flag}</span>
                  <span>{label}</span>
                  <span className="text-xs opacity-70">({count})</span>
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">⚽</div>
                <p className="text-slate-400">Loading teams...</p>
              </div>
            ) : (
              <>
                {/* Team grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {filteredTeams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeamId(team.id)}
                      className={`p-4 rounded-xl text-left transition-all duration-200 ${
                        selectedTeamId === team.id
                          ? 'bg-primary-600 ring-2 ring-primary-400 scale-[1.02]'
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg"
                          style={{ backgroundColor: team.colors.primary }}
                        >
                          {team.abbreviation}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-lg truncate">{team.name}</h3>
                          <p className="text-slate-400 text-sm">{team.city}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              {team.reputation}
                            </span>
                            <span>€{(team.finances.transferBudget / 1000).toFixed(0)}k</span>
                            <span>{team.squad.length} players</span>
                          </div>
                        </div>
                        <div className="text-2xl">
                          {team.country === 'PT' ? '🇵🇹' : '🇪🇸'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Selected team info */}
                {selectedTeam && (
                  <div className="card mb-6 border-2 border-primary-500/30">
                    <div className="flex items-start gap-6">
                      <div
                        className="w-24 h-24 rounded-xl flex items-center justify-center text-white font-bold text-3xl shadow-lg"
                        style={{ backgroundColor: selectedTeam.colors.primary }}
                      >
                        {selectedTeam.abbreviation}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white">{selectedTeam.name}</h2>
                        <p className="text-slate-400">{selectedTeam.league} • Founded {selectedTeam.founded}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-slate-500 text-sm">Reputation</p>
                            <p className="text-white font-semibold">{selectedTeam.reputation}/100</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-sm">Transfer Budget</p>
                            <p className="text-white font-semibold">€{(selectedTeam.finances.transferBudget / 1000000).toFixed(1)}M</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-sm">Squad Size</p>
                            <p className="text-white font-semibold">{selectedTeam.squad.length} players</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-sm">Facilities</p>
                            <p className="text-white font-semibold">{'★'.repeat(selectedTeam.facilities.training)}</p>
                          </div>
                        </div>

                        {/* Key players */}
                        <div className="mt-4">
                          <p className="text-slate-500 text-sm mb-2">Key Players</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedTeam.squad
                              .sort((a, b) => b.currentAbility - a.currentAbility)
                              .slice(0, 5)
                              .map((player) => (
                                <span
                                  key={player.id}
                                  className="px-2 py-1 bg-slate-700 rounded text-sm text-white"
                                >
                                  {player.name}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Start button */}
                <button
                  onClick={handleStartGame}
                  disabled={!selectedTeamId}
                  className="btn btn-primary w-full py-4 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Career as {selectedTeam?.shortName || 'Team'} Manager
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
