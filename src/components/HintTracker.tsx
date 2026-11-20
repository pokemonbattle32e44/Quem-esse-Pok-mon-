import { Check, Eye, Lock, MapPin, Shield, Sparkles, Volume2 } from 'lucide-react';
import type { HintKey, RoundOutcome } from '../types/pokemon';

interface HintTrackerProps {
  unlockedHints: HintKey[];
  attemptsUsed: number;
  maxAttempts: number;
  potentialPoints: number;
  outcome: RoundOutcome;
}

const TRACKED_HINTS: Array<{
  key: HintKey;
  label: string;
  icon: typeof Volume2;
}> = [
  { key: 'cry', label: 'Som', icon: Volume2 },
  { key: 'info', label: 'Região & Medidas', icon: MapPin },
  { key: 'moves', label: 'Ataques', icon: Sparkles },
  { key: 'types', label: 'Tipagens', icon: Shield },
  { key: 'silhouette', label: 'Silhueta', icon: Eye },
];

export function HintTracker({
  unlockedHints,
  attemptsUsed,
  maxAttempts,
  potentialPoints,
  outcome,
}: HintTrackerProps) {
  const remainingAttempts = Math.max(0, maxAttempts - attemptsUsed);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-600 px-1">
        <div className="flex items-center gap-3">
          <span>
            Chances restantes:{' '}
            <span className="font-mono-tabular font-extrabold text-slate-900">
              {outcome === 'active' ? remainingAttempts : 0} / {maxAttempts}
            </span>
          </span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span>
            Dicas abertas:{' '}
            <span className="font-mono-tabular font-extrabold text-[#1D4ED8]">
              {outcome === 'active' ? unlockedHints.length : 5} / 5
            </span>
          </span>
        </div>

        {outcome === 'active' && (
          <span className="font-mono-tabular font-bold text-[#E3350D]">
            Acerto agora vale {potentialPoints} pts
          </span>
        )}
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-5 gap-2"
        aria-label="Status das dicas"
      >
        {TRACKED_HINTS.map(({ key, label, icon: Icon }) => {
          const isUnlocked = unlockedHints.includes(key) || outcome !== 'active';

          return (
            <div
              key={key}
              className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 transition-colors ${
                isUnlocked
                  ? 'border-[#1D4ED8]/35 bg-white text-slate-900 shadow-2xs'
                  : 'border-slate-200/80 bg-slate-100/70 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon
                  className={`h-3.5 w-3.5 shrink-0 ${
                    isUnlocked ? 'text-[#1D4ED8]' : 'text-slate-400'
                  }`}
                />
                <span className="truncate text-xs font-semibold whitespace-nowrap">
                  {label}
                </span>
              </div>
              {isUnlocked ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              ) : (
                <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
