import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '@/store/gameStore';
import type { Player } from '@/types';

type SortKey = 'name' | 'position' | 'age' | 'overall' | 'value';
type SortDir = 'asc' | 'desc';

export default function Squad() {
  const { t } = useTranslation();
  const { playerTeam, players } = useGameStore();

  const [sortKey, setSortKey] = useState<SortKey>('overall');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Show message if no team selected
  if (!playerTeam) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">{t('squad.title')}</h1>
        <div className="card text-center py-12">
          <p className="text-slate-400">No team selected. Please start a new game.</p>
        </div>
      </div>
    );
  }

  // Get players for this team - use squad if available, otherwise filter by ID prefix
  const teamPlayers = playerTeam?.squad && playerTeam.squad.length > 0
    ? playerTeam.squad
    : players.filter(p => playerTeam && p.id.startsWith(playerTeam.id));

  // Sort and filter
  const sortedPlayers = [...teamPlayers]
    .filter(p => filterPosition === 'all' || p.position === filterPosition)
    .sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortKey) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'position':
          aVal = a.position;
          bVal = b.position;
          break;
        case 'age':
          aVal = a.age;
          bVal = b.age;
          break;
        case 'overall':
          aVal = a.currentAbility;
          bVal = b.currentAbility;
          break;
        case 'value':
          aVal = a.marketValue;
          bVal = b.marketValue;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const positionColors: Record<string, string> = {
    GK: 'bg-amber-500',
    FIXO: 'bg-blue-500',
    ALA: 'bg-green-500',
    PIVO: 'bg-red-500',
  };

  const getOverallColor = (ability: number) => {
    if (ability >= 160) return 'text-green-400';
    if (ability >= 140) return 'text-lime-400';
    if (ability >= 120) return 'text-yellow-400';
    if (ability >= 100) return 'text-orange-400';
    return 'text-slate-400';
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    return `€${(value / 1000).toFixed(0)}k`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('squad.title')}</h1>
          <p className="text-slate-400">{playerTeam?.name} - {teamPlayers.length} players</p>
        </div>
      </div>

      {/* Position filter */}
      <div className="flex gap-2">
        {['all', 'GK', 'FIXO', 'ALA', 'PIVO'].map((pos) => (
          <button
            key={pos}
            onClick={() => setFilterPosition(pos)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterPosition === pos
                ? 'bg-primary-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {pos === 'all' ? 'All' : t(`positions.${pos}`)}
            <span className="ml-1 text-xs opacity-70">
              ({pos === 'all' ? teamPlayers.length : teamPlayers.filter(p => p.position === pos).length})
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Squad table */}
        <div className="lg:col-span-2 card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th
                  className="text-left px-4 py-3 text-slate-400 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort('position')}
                >
                  Pos {sortKey === 'position' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="text-left px-4 py-3 text-slate-400 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort('name')}
                >
                  Name {sortKey === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="text-center px-4 py-3 text-slate-400 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort('age')}
                >
                  {t('squad.age')} {sortKey === 'age' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="text-center px-4 py-3 text-slate-400 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort('overall')}
                >
                  OVR {sortKey === 'overall' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="text-right px-4 py-3 text-slate-400 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort('value')}
                >
                  {t('squad.value')} {sortKey === 'value' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player) => (
                <tr
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className={`border-t border-slate-700 cursor-pointer transition-colors ${
                    selectedPlayer?.id === player.id
                      ? 'bg-primary-600/20'
                      : 'hover:bg-slate-700/30'
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className={`${positionColors[player.position]} px-2 py-1 rounded text-white text-sm font-medium`}>
                      {player.position}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-white font-medium">{player.name}</span>
                      <span className="text-slate-500 text-sm ml-2">{player.nationality}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-300">{player.age}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${getOverallColor(player.currentAbility)}`}>
                      {Math.floor(player.currentAbility / 2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {formatValue(player.marketValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Player details */}
        <div className="card">
          {selectedPlayer ? (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-lg ${positionColors[selectedPlayer.position]} flex items-center justify-center text-white font-bold text-xl`}>
                  {selectedPlayer.shirtNumber || '?'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedPlayer.name}</h3>
                  <p className="text-slate-400">{t(`positions.${selectedPlayer.position}`)} • {selectedPlayer.nationality}</p>
                </div>
              </div>

              {/* Key stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-slate-400 text-sm">Overall</p>
                  <p className={`text-2xl font-bold ${getOverallColor(selectedPlayer.currentAbility)}`}>
                    {Math.floor(selectedPlayer.currentAbility / 2)}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-slate-400 text-sm">Potential</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.floor(selectedPlayer.potential / 2)}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-slate-400 text-sm">Age</p>
                  <p className="text-2xl font-bold text-white">{selectedPlayer.age}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-slate-400 text-sm">Value</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatValue(selectedPlayer.marketValue)}
                  </p>
                </div>
              </div>

              {/* Attributes */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Technical</h4>
                  <div className="space-y-1">
                    {Object.entries(selectedPlayer.technical).map(([key, value]) => (
                      <div key={key} className="flex items-center text-sm">
                        <span className="w-24 text-slate-400 capitalize">{key}</span>
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500"
                            style={{ width: `${(value / 20) * 100}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Physical</h4>
                  <div className="space-y-1">
                    {Object.entries(selectedPlayer.physical).map(([key, value]) => (
                      <div key={key} className="flex items-center text-sm">
                        <span className="w-24 text-slate-400 capitalize">{key}</span>
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${(value / 20) * 100}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedPlayer.goalkeeping && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Goalkeeping</h4>
                    <div className="space-y-1">
                      {Object.entries(selectedPlayer.goalkeeping).map(([key, value]) => (
                        <div key={key} className="flex items-center text-sm">
                          <span className="w-24 text-slate-400 capitalize">{key}</span>
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500"
                              style={{ width: `${(value / 20) * 100}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Contract info */}
              <div className="mt-6 p-3 bg-slate-700/50 rounded-lg">
                <p className="text-slate-400 text-sm">Contract</p>
                <p className="text-white">
                  €{(selectedPlayer.contract.wage / 1000).toFixed(1)}k/week until {new Date(selectedPlayer.contract.expiryDate).getFullYear()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p>Select a player to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Position breakdown */}
      <div className="grid grid-cols-4 gap-4">
        {(['GK', 'FIXO', 'ALA', 'PIVO'] as const).map((pos) => {
          const count = teamPlayers.filter(p => p.position === pos).length;
          const avgAbility = teamPlayers
            .filter(p => p.position === pos)
            .reduce((sum, p) => sum + p.currentAbility, 0) / (count || 1);

          return (
            <div key={pos} className="card text-center">
              <div className={`w-12 h-12 mx-auto rounded-lg ${positionColors[pos]} flex items-center justify-center text-white font-bold text-lg mb-2`}>
                {count}
              </div>
              <p className="text-white font-medium">{t(`positions.${pos}`)}</p>
              <p className="text-slate-400 text-sm">
                Avg: {Math.floor(avgAbility / 2)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
