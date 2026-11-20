import { Award, CheckCircle2, Flame, RotateCcw, Target, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { PlayerStats } from '../types/pokemon';

interface StatsViewProps {
  stats: PlayerStats;
  discoveredCount: number;
  onResetStats: () => void;
}

export function StatsView({
  stats,
  discoveredCount,
  onResetStats,
}: StatsViewProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  const accuracy =
    stats.totalRounds > 0
      ? Math.round((stats.totalWins / stats.totalRounds) * 100)
      : 0;

  const maxStageWin = Math.max(
    1,
    stats.stageWins[1],
    stats.stageWins[2],
    stats.stageWins[3],
    stats.stageWins[4]
  );

  const stageRows = [
    { label: 'Dica 1 · Som (100 pts)', count: stats.stageWins[1], color: 'bg-[#1D4ED8]' },
    { label: 'Dica 2 · Ataques (75 pts)', count: stats.stageWins[2], color: 'bg-[#2563EB]' },
    { label: 'Dica 3 · Tipagens (50 pts)', count: stats.stageWins[3], color: 'bg-[#EAB308]' },
    { label: 'Dica 4 · Silhueta (25 pts)', count: stats.stageWins[4], color: 'bg-[#E3350D]' },
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Estatísticas de Treinador
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Desempenho acumulado de acertos, erros e etapas de descoberta.
          </p>
        </div>

        <div>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Zerar Estatísticas</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetStats();
                  setConfirmReset(false);
                }}
                className="rounded-xl bg-[#E3350D] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#C82D09] whitespace-nowrap shrink-0 cursor-pointer"
              >
                Confirmar Limpeza
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Pontuação Total</span>
            <Award className="h-4 w-4 text-[#FFCB05]" />
          </div>
          <p className="mt-2 font-mono-tabular text-3xl font-extrabold text-slate-900">
            {stats.totalPoints.toLocaleString('pt-BR')}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-mono-tabular">
            Recorde Clássico: {stats.bestClassicScore} pts
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Taxa de Acerto</span>
            <Target className="h-4 w-4 text-[#1D4ED8]" />
          </div>
          <p className="mt-2 font-mono-tabular text-3xl font-extrabold text-slate-900">
            {accuracy}%
          </p>
          <p className="mt-1 text-xs text-slate-500 font-mono-tabular">
            {stats.totalRounds} rodadas jogadas
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Melhor Sequência</span>
            <Flame className="h-4 w-4 text-[#E3350D]" />
          </div>
          <p className="mt-2 font-mono-tabular text-3xl font-extrabold text-slate-900">
            {stats.bestStreak}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-mono-tabular">
            Sequência atual: {stats.currentStreak}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Acertos / Erros</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-3 font-mono-tabular">
            <span className="text-2xl font-extrabold text-emerald-700">
              {stats.totalWins}
            </span>
            <span className="text-slate-300">/</span>
            <span className="inline-flex items-center gap-1 text-2xl font-extrabold text-rose-700">
              <XCircle className="h-4 w-4" />
              {stats.totalLosses}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-mono-tabular">
            {discoveredCount} Pokémon únicos vistos
          </p>
        </div>
      </div>

      {/* Stage Distribution */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Acertos por Etapa de Dica
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Quanto mais cedo você identifica o Pokémon, maior a pontuação da rodada.
        </p>

        <div className="mt-5 space-y-4">
          {stageRows.map((row) => {
            const pct = Math.round((row.count / maxStageWin) * 100);
            return (
              <div key={row.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-800">{row.label}</span>
                  <span className="font-mono-tabular font-bold text-slate-900">
                    {row.count}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${row.color}`}
                    style={{ width: `${row.count === 0 ? 0 : Math.max(pct, 4)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
