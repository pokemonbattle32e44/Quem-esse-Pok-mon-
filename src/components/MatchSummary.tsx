import { motion } from 'motion/react';
import { CheckCircle2, Home, RotateCcw, Trophy, XCircle } from 'lucide-react';
import type { GameMode, MatchRoundRecord } from '../types/pokemon';
import { formatDexNumber } from '../utils/pokemonNames';
import { TypeBadge } from './TypeIcon';

interface MatchSummaryProps {
  gameMode: GameMode;
  records: MatchRoundRecord[];
  totalScore: number;
  bestStreakInMatch: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export function MatchSummary({
  gameMode,
  records,
  totalScore,
  bestStreakInMatch,
  onPlayAgain,
  onBackToMenu,
}: MatchSummaryProps) {
  const wins = records.filter((r) => r.outcome === 'won').length;
  const accuracy =
    records.length > 0 ? Math.round((wins / records.length) * 100) : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-4xl px-4 sm:px-6 py-8"
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#0F294A] via-[#1D4ED8] to-[#1E40AF] p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#FFCB05]">
                {gameMode === 'classic'
                  ? 'Modo Clássico Concluído'
                  : gameMode === 'custom'
                  ? 'Partida Personalizada Concluída'
                  : 'Resumo da Sessão Infinita'}
              </p>
              <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold">
                Resultado da Partida
              </h1>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-5 py-3 backdrop-blur-xs">
              <Trophy className="h-7 w-7 text-[#FFCB05]" />
              <div>
                <p className="text-xs text-blue-100">Pontuação Final</p>
                <p className="font-mono-tabular text-2xl font-extrabold text-white">
                  {totalScore} pts
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/15 pt-4 text-center sm:text-left">
            <div>
              <p className="text-xs text-blue-200">Acertos</p>
              <p className="font-mono-tabular text-lg font-bold">
                {wins} / {records.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-200">Precisão</p>
              <p className="font-mono-tabular text-lg font-bold">{accuracy}%</p>
            </div>
            <div>
              <p className="text-xs text-blue-200">Maior Sequência</p>
              <p className="font-mono-tabular text-lg font-bold">
                {bestStreakInMatch}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="font-display text-base font-bold text-slate-900">
            Pokémon da Partida
          </h2>

          <div className="mt-4 divide-y divide-slate-100">
            {records.map((rec, index) => (
              <div
                key={`${rec.roster.id}-${index}`}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono-tabular text-xs font-bold text-slate-400 w-5">
                    {index + 1}.
                  </span>
                  <img
                    src={rec.artworkUrl}
                    alt={rec.roster.displayName}
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 shrink-0 rounded-lg bg-slate-50 object-contain p-1"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold text-slate-900">
                      {rec.roster.displayName}{' '}
                      <span className="font-mono-tabular text-xs font-normal text-slate-400">
                        {formatDexNumber(rec.roster.dexNumber)}
                      </span>
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {rec.types.map((t) => (
                        <TypeBadge key={t} type={t} size="sm" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {rec.outcome === 'won' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      {rec.attemptsUsed + 1}ª tent.
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                      <XCircle className="h-4 w-4" />
                      Não acertou
                    </span>
                  )}
                  <span className="font-mono-tabular w-16 text-right text-sm font-bold text-slate-900">
                    +{rec.pointsEarned}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onPlayAgain}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#E3350D] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#C82D09] cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Jogar Novamente</span>
            </button>
            <button
              type="button"
              onClick={onBackToMenu}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
            >
              <Home className="h-4 w-4" />
              <span>Configurar Partida</span>
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
