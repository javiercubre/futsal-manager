import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Formation, Mentality, Tempo, PressingIntensity } from '@/types';

// Formation position mappings (x, y in percentage of court)
const formationPositions: Record<Formation, { label: string; positions: { x: number; y: number }[] }> = {
  '4-0': {
    label: '4-0 (Diamond)',
    positions: [
      { x: 10, y: 50 },   // GK
      { x: 35, y: 50 },   // Fixo
      { x: 55, y: 25 },   // Ala Left
      { x: 55, y: 75 },   // Ala Right
      { x: 75, y: 50 },   // Pivot
    ],
  },
  '3-1': {
    label: '3-1',
    positions: [
      { x: 10, y: 50 },   // GK
      { x: 30, y: 30 },   // Fixo Left
      { x: 30, y: 70 },   // Fixo Right
      { x: 55, y: 50 },   // Ala Center
      { x: 80, y: 50 },   // Pivot
    ],
  },
  '2-2': {
    label: '2-2',
    positions: [
      { x: 10, y: 50 },   // GK
      { x: 35, y: 35 },   // Fixo Left
      { x: 35, y: 65 },   // Fixo Right
      { x: 65, y: 35 },   // Pivot Left
      { x: 65, y: 65 },   // Pivot Right
    ],
  },
  '1-2-1': {
    label: '1-2-1',
    positions: [
      { x: 10, y: 50 },   // GK
      { x: 30, y: 50 },   // Fixo
      { x: 50, y: 25 },   // Ala Left
      { x: 50, y: 75 },   // Ala Right
      { x: 80, y: 50 },   // Pivot
    ],
  },
  '4-0-power': {
    label: 'Power Play',
    positions: [
      { x: 25, y: 50 },   // No GK - extra outfield
      { x: 40, y: 25 },
      { x: 40, y: 75 },
      { x: 60, y: 35 },
      { x: 60, y: 65 },
    ],
  },
  '5-0-gk': {
    label: 'Flying GK',
    positions: [
      { x: 30, y: 50 },   // GK playing outfield
      { x: 45, y: 25 },
      { x: 45, y: 75 },
      { x: 70, y: 35 },
      { x: 70, y: 65 },
    ],
  },
};

export default function Tactics() {
  const { t } = useTranslation();

  const [formation, setFormation] = useState<Formation>('3-1');
  const [mentality, setMentality] = useState<Mentality>('balanced');
  const [tempo, setTempo] = useState<Tempo>('normal');
  const [pressing, setPressing] = useState<PressingIntensity>('medium');
  const [flyingGk, setFlyingGk] = useState(false);

  const currentFormation = formationPositions[formation];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('tactics.title')}</h1>
          <p className="text-slate-400">Configure your team's playing style</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary">{t('tactics.loadTactic')}</button>
          <button className="btn btn-primary">{t('tactics.saveTactic')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tactics Board */}
        <div className="lg:col-span-2 card">
          <h3 className="text-white font-semibold mb-4">{t('tactics.formation')}: {currentFormation.label}</h3>

          {/* Futsal Court */}
          <div className="relative w-full aspect-[2/1] bg-court-wood rounded-xl overflow-hidden border-4 border-white/20">
            {/* Court lines */}
            <div className="absolute inset-0">
              {/* Center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/60" />
              {/* Center circle */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white/60 rounded-full" />
              {/* Goal areas */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-24 border-2 border-l-0 border-white/60 rounded-r-lg" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-24 border-2 border-r-0 border-white/60 rounded-l-lg" />
              {/* Penalty spots */}
              <div className="absolute left-[15%] top-1/2 -translate-y-1/2 w-2 h-2 bg-white/60 rounded-full" />
              <div className="absolute right-[15%] top-1/2 -translate-y-1/2 w-2 h-2 bg-white/60 rounded-full" />
            </div>

            {/* Player positions */}
            {currentFormation.positions.map((pos, i) => (
              <div
                key={i}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div className={`player-dot ${i === 0 ? 'bg-amber-500' : 'bg-blue-500'}`}>
                  {i + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Formation selector */}
          <div className="mt-6">
            <label className="text-slate-400 text-sm mb-2 block">{t('tactics.formation')}</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(formationPositions) as Formation[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormation(f)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    formation === f
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {formationPositions[f].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tactics Settings */}
        <div className="space-y-4">
          {/* Mentality */}
          <div className="card">
            <label className="text-slate-400 text-sm mb-2 block">{t('tactics.mentality')}</label>
            <div className="space-y-2">
              {(['defensive', 'balanced', 'attacking'] as Mentality[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMentality(m)}
                  className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                    mentality === m
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {t(`tactics.${m}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Tempo */}
          <div className="card">
            <label className="text-slate-400 text-sm mb-2 block">{t('tactics.tempo')}</label>
            <div className="space-y-2">
              {(['slow', 'normal', 'fast'] as Tempo[]).map((te) => (
                <button
                  key={te}
                  onClick={() => setTempo(te)}
                  className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                    tempo === te
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {t(`tactics.${te}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Pressing */}
          <div className="card">
            <label className="text-slate-400 text-sm mb-2 block">{t('tactics.pressing')}</label>
            <div className="space-y-2">
              {(['low', 'medium', 'high'] as PressingIntensity[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPressing(p)}
                  className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                    pressing === p
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {t(`tactics.${p}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Flying Goalkeeper */}
          <div className="card">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">{t('tactics.flyingGoalkeeper')}</span>
              <button
                onClick={() => setFlyingGk(!flyingGk)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  flyingGk ? 'bg-primary-600' : 'bg-slate-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                  flyingGk ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </label>
            <p className="text-slate-500 text-sm mt-2">
              Use goalkeeper as outfield player in final minutes when losing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
