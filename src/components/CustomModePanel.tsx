import { SlidersHorizontal } from 'lucide-react';
import type {
  CustomGameConfig,
  HintKey,
  StepUnlockOption,
} from '../types/pokemon';

interface CustomModePanelProps {
  config: CustomGameConfig;
  onChange: (next: CustomGameConfig) => void;
}

export const HINT_META: Array<{ key: HintKey; label: string; shortLabel: string }> = [
  { key: 'cry', label: 'Som (Cry oficial)', shortLabel: 'Som' },
  { key: 'info', label: 'Região, Forma, Altura e Peso', shortLabel: 'Características' },
  { key: 'moves', label: '2 Ataques Compatíveis', shortLabel: 'Ataques' },
  { key: 'types', label: 'Tipagens Oficiais', shortLabel: 'Tipagens' },
  { key: 'silhouette', label: 'Silhueta Preta', shortLabel: 'Silhueta' },
];

const ROUND_OPTIONS: Array<{ value: number | null; label: string }> = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 15, label: '15' },
  { value: 20, label: '20' },
  { value: null, label: 'Infinito' },
];

const ALL_GENS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const PRESETS: Array<{ name: string; patch: Partial<CustomGameConfig> }> = [
  {
    name: 'Padrão',
    patch: {
      totalRounds: 10,
      maxAttempts: 4,
      initialHints: ['cry', 'info'],
      stepUnlocks: ['moves', 'types', 'silhouette'],
      allowHintChoice: true,
    },
  },
  {
    name: 'Só Silhueta',
    patch: {
      totalRounds: 10,
      maxAttempts: 3,
      initialHints: ['silhouette'],
      stepUnlocks: ['types', 'cry'],
      allowHintChoice: true,
    },
  },
  {
    name: 'Áudio Puro',
    patch: {
      totalRounds: 10,
      maxAttempts: 4,
      initialHints: ['cry'],
      stepUnlocks: ['info', 'moves', 'types'],
      allowHintChoice: true,
    },
  },
  {
    name: 'Tiro Único',
    patch: {
      totalRounds: 10,
      maxAttempts: 1,
      initialHints: ['cry', 'info', 'types'],
      stepUnlocks: [],
      allowHintChoice: false,
    },
  },
];

export function CustomModePanel({ config, onChange }: CustomModePanelProps) {
  const toggleInitialHint = (key: HintKey) => {
    const exists = config.initialHints.includes(key);
    const nextHints = exists
      ? config.initialHints.filter((h) => h !== key)
      : [...config.initialHints, key];
    onChange({ ...config, initialHints: nextHints });
  };

  const setMaxAttempts = (attempts: number) => {
    const needed = Math.max(0, attempts - 1);
    const nextSteps: StepUnlockOption[] = [];
    for (let i = 0; i < needed; i++) {
      nextSteps.push(config.stepUnlocks[i] ?? 'auto');
    }
    onChange({
      ...config,
      maxAttempts: attempts,
      stepUnlocks: nextSteps,
    });
  };

  const setStepUnlock = (index: number, value: StepUnlockOption) => {
    const nextSteps = [...config.stepUnlocks];
    nextSteps[index] = value;
    onChange({ ...config, stepUnlocks: nextSteps });
  };

  const toggleGeneration = (gen: number) => {
    const exists = config.generations.includes(gen);
    if (exists && config.generations.length === 1) return; // keep at least 1 gen
    const nextGens = exists
      ? config.generations.filter((g) => g !== gen)
      : [...config.generations, gen].sort((a, b) => a - b);
    onChange({ ...config, generations: nextGens });
  };

  return (
    <div className="mt-4 rounded-2xl border border-[#1D4ED8]/20 bg-[#F8FAFF] p-4 sm:p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#1D4ED8]" />
          <h3 className="font-display text-sm font-bold text-slate-900">
            Regras Personalizadas
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange({ ...config, ...preset.patch })}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Rodadas & Chances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span className="block text-xs font-bold text-slate-600">
            Quantidade de Rodadas
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ROUND_OPTIONS.map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => onChange({ ...config, totalRounds: opt.value })}
                className={`rounded-lg border px-3 py-1.5 font-mono-tabular text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  config.totalRounds === opt.value
                    ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-xs font-bold text-slate-600">
            Chances por Pokémon
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setMaxAttempts(num)}
                className={`h-8 w-9 rounded-lg border font-mono-tabular text-xs font-bold transition-colors cursor-pointer ${
                  config.maxAttempts === num
                    ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dicas iniciais */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600">
            Dicas liberadas desde o início
          </span>
          <span className="text-xs text-slate-500">
            {config.initialHints.length === 0
              ? 'Nenhuma (modo extremo)'
              : `${config.initialHints.length} selecionada(s)`}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {HINT_META.map((h) => {
            const active = config.initialHints.includes(h.key);
            return (
              <button
                key={h.key}
                type="button"
                onClick={() => toggleInitialHint(h.key)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#1E3A8A] ring-1 ring-[#1D4ED8]/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {active ? '✓ ' : '+ '}
                {h.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* O que libera em cada chance errada */}
      {config.maxAttempts > 1 && (
        <div>
          <span className="block text-xs font-bold text-slate-600">
            O que é liberado após cada erro
          </span>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Array.from({ length: config.maxAttempts - 1 }).map((_, idx) => (
              <label
                key={idx}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
              >
                <span className="font-semibold text-slate-700 whitespace-nowrap shrink-0">
                  Após {idx + 1}º erro:
                </span>
                <select
                  value={config.stepUnlocks[idx] ?? 'auto'}
                  onChange={(e) =>
                    setStepUnlock(idx, e.target.value as StepUnlockOption)
                  }
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-800 focus:border-[#1D4ED8] focus:outline-none"
                >
                  <option value="auto">Próxima dica disponível</option>
                  {HINT_META.map((h) => (
                    <option key={h.key} value={h.key}>
                      {h.label}
                    </option>
                  ))}
                  <option value="none">Não liberar dica</option>
                </select>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Gerações + Trocar tentativa por dica */}
      <div className="space-y-3 border-t border-slate-200 pt-3">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">
              Gerações incluídas
            </span>
            <button
              type="button"
              onClick={() => onChange({ ...config, generations: ALL_GENS })}
              className="text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
            >
              Selecionar todas
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ALL_GENS.map((gen) => {
              const active = config.generations.includes(gen);
              return (
                <button
                  key={gen}
                  type="button"
                  onClick={() => toggleGeneration(gen)}
                  className={`rounded-lg border px-2.5 py-1 font-mono-tabular text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#1E3A8A]'
                      : 'border-slate-200 bg-white text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Gen {gen}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={config.includeRegional}
              onChange={(e) =>
                onChange({ ...config, includeRegional: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300 text-[#1D4ED8] focus:ring-[#1D4ED8]"
            />
            <span>Incluir formas regionais (Alola, Galar, Hisui, Paldea)</span>
          </label>

          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={config.allowHintChoice}
              onChange={(e) =>
                onChange({ ...config, allowHintChoice: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300 text-[#1D4ED8] focus:ring-[#1D4ED8]"
            />
            <span>Permitir escolher dica gastando 1 tentativa</span>
          </label>
        </div>
      </div>
    </div>
  );
}
