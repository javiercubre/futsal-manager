import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '@/store/gameStore';
import type { Player } from '@/types';

export default function Transfers() {
  const { t } = useTranslation();
  const {
    playerTeam,
    playerTeamId,
    teams,
    players,
    transferOffers,
    makeTransferOffer,
    acceptTransferOffer,
    rejectTransferOffer,
  } = useGameStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [offerAmount, setOfferAmount] = useState<number>(0);

  // Get players from other teams available for transfer
  const availablePlayers = useMemo(() => {
    return players.filter(player => {
      // Exclude players from player's team
      const playerTeam = teams.find(t => t.squad?.some(p => p.id === player.id));
      if (playerTeam?.id === playerTeamId) return false;

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!player.name.toLowerCase().includes(query) &&
            !player.position.toLowerCase().includes(query) &&
            !player.nationality.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Apply position filter
      if (positionFilter && player.position !== positionFilter) {
        return false;
      }

      return true;
    });
  }, [players, teams, playerTeamId, searchQuery, positionFilter]);

  // Get pending incoming offers (other teams want our players)
  const incomingOffers = useMemo(() => {
    return transferOffers.filter(o => o.isIncoming && o.status === 'pending');
  }, [transferOffers]);

  // Get pending outgoing offers (we want other teams' players)
  const outgoingOffers = useMemo(() => {
    return transferOffers.filter(o => !o.isIncoming && o.status === 'pending');
  }, [transferOffers]);

  const getPlayerTeam = (playerId: string): string => {
    const team = teams.find(t => t.squad?.some(p => p.id === playerId));
    return team?.shortName || team?.name || 'Unknown';
  };

  const handleMakeOffer = () => {
    if (!selectedPlayer || offerAmount <= 0 || !playerTeamId) return;

    makeTransferOffer(selectedPlayer.id, playerTeamId, offerAmount);
    setSelectedPlayer(null);
    setOfferAmount(0);
  };

  const positionColors: Record<string, string> = {
    GK: 'bg-yellow-600',
    FIXO: 'bg-blue-600',
    ALA: 'bg-green-600',
    PIVO: 'bg-red-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('transfers.title')}</h1>
          <p className="text-slate-400">
            Budget: €{((playerTeam?.finances.transferBudget || 0) / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      {/* Incoming Offers */}
      {incomingOffers.length > 0 && (
        <div className="card border-2 border-yellow-500/30">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            {t('transfers.incoming')}
            <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">
              {incomingOffers.length}
            </span>
          </h3>
          <div className="space-y-3">
            {incomingOffers.map((offer) => (
              <div key={offer.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{offer.playerName}</p>
                  <p className="text-slate-400 text-sm">
                    From: {offer.toTeamName} - €{(offer.fee / 1000).toFixed(0)}k
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptTransferOffer(offer.id)}
                    className="btn bg-green-600 hover:bg-green-700 text-white text-sm py-1"
                  >
                    {t('transfers.accept')}
                  </button>
                  <button
                    onClick={() => rejectTransferOffer(offer.id)}
                    className="btn bg-red-600 hover:bg-red-700 text-white text-sm py-1"
                  >
                    {t('transfers.reject')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outgoing Offers */}
      {outgoingOffers.length > 0 && (
        <div className="card border-2 border-blue-500/30">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            Your Pending Offers
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              {outgoingOffers.length}
            </span>
          </h3>
          <div className="space-y-3">
            {outgoingOffers.map((offer) => (
              <div key={offer.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{offer.playerName}</p>
                  <p className="text-slate-400 text-sm">
                    From: {offer.fromTeamName} - €{(offer.fee / 1000).toFixed(0)}k offered
                  </p>
                </div>
                <span className="text-yellow-400 text-sm">Awaiting response...</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Make Offer Modal */}
      {selectedPlayer && (
        <div className="card border-2 border-primary-500/50">
          <h3 className="text-white font-semibold mb-4">Make Offer for {selectedPlayer.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Current Team</p>
              <p className="text-white">{getPlayerTeam(selectedPlayer.id)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Market Value</p>
              <p className="text-white">€{(selectedPlayer.marketValue / 1000).toFixed(0)}k</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Position</p>
              <p className="text-white">{selectedPlayer.position}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Age</p>
              <p className="text-white">{selectedPlayer.age}</p>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-slate-400 text-sm mb-2">Your Offer (€)</label>
            <div className="flex gap-4">
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(Number(e.target.value))}
                placeholder="Enter amount..."
                className="input flex-1"
                min={0}
                step={10000}
              />
              <button
                onClick={() => setOfferAmount(Math.floor(selectedPlayer.marketValue * 0.9))}
                className="btn btn-secondary text-sm"
              >
                90% Value
              </button>
              <button
                onClick={() => setOfferAmount(selectedPlayer.marketValue)}
                className="btn btn-secondary text-sm"
              >
                Full Value
              </button>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Your budget: €{((playerTeam?.finances.transferBudget || 0) / 1000).toFixed(0)}k
            </p>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleMakeOffer}
              disabled={offerAmount <= 0 || offerAmount > (playerTeam?.finances.transferBudget || 0)}
              className="btn btn-primary disabled:opacity-50"
            >
              Submit Offer
            </button>
            <button
              onClick={() => { setSelectedPlayer(null); setOfferAmount(0); }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card">
        <h3 className="text-white font-semibold mb-4">{t('transfers.searchPlayers')}</h3>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, position, or nationality..."
            className="input flex-1"
          />
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="input w-32"
          >
            <option value="">All Positions</option>
            <option value="GK">GK</option>
            <option value="FIXO">Fixo</option>
            <option value="ALA">Ala</option>
            <option value="PIVO">Pivot</option>
          </select>
        </div>

        {/* Results */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Player</th>
                <th className="text-center px-4 py-3 text-slate-400 font-medium">Pos</th>
                <th className="text-center px-4 py-3 text-slate-400 font-medium">Age</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Team</th>
                <th className="text-center px-4 py-3 text-slate-400 font-medium">Ability</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Value</th>
                <th className="text-center px-4 py-3 text-slate-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {availablePlayers.slice(0, 20).map((player) => (
                <tr key={player.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <span className="text-white font-medium">{player.name}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`${positionColors[player.position] || 'bg-slate-600'} px-2 py-1 rounded text-white text-sm font-medium`}>
                      {player.position}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-300">{player.age}</td>
                  <td className="px-4 py-3 text-slate-300">{getPlayerTeam(player.id)}</td>
                  <td className="px-4 py-3 text-center text-slate-300">{player.currentAbility}</td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    €{(player.marketValue / 1000).toFixed(0)}k
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => { setSelectedPlayer(player); setOfferAmount(Math.floor(player.marketValue * 0.9)); }}
                      className="btn btn-primary text-sm py-1"
                    >
                      {t('transfers.makeOffer')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {availablePlayers.length === 0 && (
            <p className="text-slate-400 text-center py-8">No players found matching your criteria</p>
          )}
          {availablePlayers.length > 20 && (
            <p className="text-slate-400 text-center py-4 text-sm">
              Showing 20 of {availablePlayers.length} players. Refine your search to see more.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
