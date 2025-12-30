import { useTranslation } from 'react-i18next';
import { useGameStore } from '@/store/gameStore';

export default function Finances() {
  const { t } = useTranslation();
  const { playerTeam } = useGameStore();

  // Mock financial data
  const finances = {
    balance: playerTeam?.finances.balance || 2000000,
    transferBudget: playerTeam?.finances.transferBudget || 500000,
    wageBudget: playerTeam?.finances.wageBudget || 80000,
    weeklyWages: 45000,
    monthlyIncome: {
      tickets: 25000,
      sponsors: 50000,
      tvRights: 30000,
      merchandise: 15000,
    },
    monthlyExpenses: {
      wages: 180000,
      facilities: 20000,
      staff: 15000,
      other: 10000,
    },
  };

  const totalIncome = Object.values(finances.monthlyIncome).reduce((a, b) => a + b, 0);
  const totalExpenses = Object.values(finances.monthlyExpenses).reduce((a, b) => a + b, 0);
  const netMonthly = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">{t('finances.title')}</h1>
        <p className="text-slate-400">{playerTeam?.name} Financial Overview</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-slate-400 text-sm uppercase tracking-wide mb-2">
            {t('finances.balance')}
          </h3>
          <p className="text-4xl font-bold text-green-400">
            €{(finances.balance / 1000000).toFixed(2)}M
          </p>
        </div>

        <div className="card">
          <h3 className="text-slate-400 text-sm uppercase tracking-wide mb-2">
            Transfer {t('finances.budget')}
          </h3>
          <p className="text-4xl font-bold text-white">
            €{(finances.transferBudget / 1000).toFixed(0)}k
          </p>
        </div>

        <div className="card">
          <h3 className="text-slate-400 text-sm uppercase tracking-wide mb-2">
            Weekly {t('finances.wages')}
          </h3>
          <p className="text-4xl font-bold text-white">
            €{(finances.weeklyWages / 1000).toFixed(0)}k
          </p>
          <p className="text-slate-500 text-sm mt-1">
            of €{(finances.wageBudget / 1000).toFixed(0)}k budget
          </p>
          <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500"
              style={{ width: `${(finances.weeklyWages / finances.wageBudget) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Income & Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Income */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            📈 Monthly {t('finances.income')}
            <span className="text-green-400 text-sm">€{(totalIncome / 1000).toFixed(0)}k</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(finances.monthlyIncome).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-green-400">+€{(value / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            📉 Monthly {t('finances.expenses')}
            <span className="text-red-400 text-sm">€{(totalExpenses / 1000).toFixed(0)}k</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(finances.monthlyExpenses).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-slate-400 capitalize">{key}</span>
                <span className="text-red-400">-€{(value / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Net Balance */}
      <div className={`card border-2 ${netMonthly >= 0 ? 'border-green-500/30' : 'border-red-500/30'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-slate-400 text-sm uppercase tracking-wide">Monthly Net Balance</h3>
            <p className={`text-3xl font-bold ${netMonthly >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netMonthly >= 0 ? '+' : ''}€{(netMonthly / 1000).toFixed(0)}k
            </p>
          </div>
          <div className="text-6xl">
            {netMonthly >= 0 ? '📈' : '📉'}
          </div>
        </div>
      </div>

      {/* Sponsors */}
      <div className="card">
        <h3 className="text-white font-semibold mb-4">{t('finances.sponsors')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-400 text-sm">Main Sponsor</p>
            <p className="text-white font-semibold">SportBrand Co.</p>
            <p className="text-green-400 text-sm">€30k/month</p>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-400 text-sm">Kit Sponsor</p>
            <p className="text-white font-semibold">AtletikWear</p>
            <p className="text-green-400 text-sm">€15k/month</p>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-600">
            <p className="text-slate-400 text-sm">Stadium Naming Rights</p>
            <p className="text-slate-500">Available</p>
            <button className="btn btn-secondary text-sm mt-2">Find Sponsor</button>
          </div>
        </div>
      </div>
    </div>
  );
}
