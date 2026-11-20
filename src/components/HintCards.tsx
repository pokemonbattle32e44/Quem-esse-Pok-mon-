import { motion } from 'motion/react';
import {
  Eye,
  GitBranch,
  Lock,
  MapPin,
  Ruler,
  Swords,
  Unlock,
  Volume2,
  Weight,
} from 'lucide-react';
import type { HintKey, PokemonRoundData, RoundOutcome } from '../types/pokemon';
import { TypeBadge } from './TypeIcon';

interface HintCardsProps {
  roundData: PokemonRoundData | null;
  unlockedHints: HintKey[];
  outcome: RoundOutcome;
  isCryPlaying: boolean;
  canChooseHint: boolean;
  onPlayCry: () => void;
  onChooseHint: (hint: HintKey) => void;
}

const DAMAGE_CLASS_PT: Record<string, string> = {
  physical: 'Físico',
  special: 'Especial',
  status: 'Estado',
};

interface LockedHintRowProps {
  title: string;
  subtitle: string;
  canChoose: boolean;
  onUnlock: () => void;
}

function LockedHintRow({ title, subtitle, canChoose, onUnlock }: LockedHintRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-100/75 px-4 py-3 text-slate-600">
      <div className="flex items-center gap-2.5 min-w-0">
        <Lock className="h-4 w-4 shrink-0 text-slate-400" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-700 truncate">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      {canChoose ? (
        <button
          type="button"
          onClick={onUnlock}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#1D4ED8]/30 bg-white px-3 py-1.5 text-xs font-bold text-[#1D4ED8] shadow-2xs transition-colors hover:bg-[#EFF6FF] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Unlock className="h-3.5 w-3.5" />
          <span>Revelar (-1 tentativa)</span>
        </button>
      ) : (
        <span className="text-xs font-medium text-slate-400 whitespace-nowrap shrink-0">
          Bloqueada
        </span>
      )}
    </div>
  );
}

export function HintCards({
  roundData,
  unlockedHints,
  outcome,
  isCryPlaying,
  canChooseHint,
  onPlayCry,
  onChooseHint,
}: HintCardsProps) {
  const isActive = outcome === 'active';
  const showCry = unlockedHints.includes('cry') || !isActive;
  const showInfo = unlockedHints.includes('info') || !isActive;
  const showMoves = unlockedHints.includes('moves') || !isActive;
  const showTypes = unlockedHints.includes('types') || !isActive;
  const showSilhouette = unlockedHints.includes('silhouette') || !isActive;

  const canBuyNow = isActive && canChooseHint && Boolean(roundData);

  const regionalText = !roundData
    ? '--'
    : roundData.roster.isRegional
    ? 'Sim (Forma Regional)'
    : roundData.roster.hasRegionalVariant
    ? 'Não (espécie possui variante)'
    : 'Não';

  return (
    <div className="space-y-3">
      {/* Dica: Som (Cry) */}
      {showCry ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#1D4ED8]">Dica de Áudio</p>
              <h3 className="font-display text-base font-bold text-slate-900">
                Som Característico (Cry)
              </h3>
            </div>

            <button
              type="button"
              onClick={onPlayCry}
              disabled={!roundData?.cryUrl}
              className={`inline-flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isCryPlaying
                  ? 'bg-[#FFCB05] text-[#0F172A] ring-2 ring-[#FFCB05]/40'
                  : 'bg-[#1D4ED8] text-white hover:bg-[#1E40AF]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isCryPlaying ? (
                <span className="flex h-4 items-end gap-0.5" aria-hidden="true">
                  <span className="w-1 h-full rounded-full bg-[#0F172A] animate-eq-1 origin-bottom" />
                  <span className="w-1 h-full rounded-full bg-[#0F172A] animate-eq-2 origin-bottom" />
                  <span className="w-1 h-full rounded-full bg-[#0F172A] animate-eq-3 origin-bottom" />
                  <span className="w-1 h-full rounded-full bg-[#0F172A] animate-eq-4 origin-bottom" />
                </span>
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              <span>{isCryPlaying ? 'Tocando Cry...' : 'Reproduzir Som'}</span>
            </button>
          </div>
        </motion.div>
      ) : (
        <LockedHintRow
          title="Som Característico (Cry)"
          subtitle="Ouça o som oficial do Pokémon"
          canChoose={canBuyNow}
          onUnlock={() => onChooseHint('cry')}
        />
      )}

      {/* Dica: Região, Forma Regional, Altura e Peso */}
      {showInfo ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
        >
          <div>
            <p className="text-xs font-semibold text-[#1D4ED8]">
              Dica de Origem e Medidas
            </p>
            <h3 className="font-display text-base font-bold text-slate-900">
              Região e Características
            </h3>
          </div>

          <div className="mt-3.5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Região</p>
                <p className="truncate text-sm font-bold text-slate-900">
                  {roundData ? roundData.roster.regionName : '--'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <GitBranch className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Forma Regional</p>
                <p
                  className="truncate text-sm font-bold text-slate-900"
                  title={regionalText}
                >
                  {regionalText}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Ruler className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Altura</p>
                <p className="font-mono-tabular text-sm font-bold text-slate-900">
                  {roundData ? `${roundData.heightMeters} m` : '--'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Weight className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Peso</p>
                <p className="font-mono-tabular text-sm font-bold text-slate-900">
                  {roundData ? `${roundData.weightKg} kg` : '--'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <LockedHintRow
          title="Região, Forma Regional e Medidas"
          subtitle="Região de origem, forma regional, altura e peso"
          canChoose={canBuyNow}
          onUnlock={() => onChooseHint('info')}
        />
      )}

      {/* Dica: Ataques compatíveis */}
      {showMoves && roundData ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-[#1D4ED8]">
                Dica de Golpes
              </p>
              <h3 className="font-display text-base font-bold text-slate-900">
                Ataques Compatíveis
              </h3>
            </div>
            <Swords className="h-4 w-4 text-slate-400" />
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {roundData.moves.map((move) => (
              <div
                key={move.slug}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5"
              >
                <p className="text-sm font-bold text-slate-900">{move.name}</p>
                <p className="mt-0.5 text-xs text-slate-500 font-mono-tabular">
                  {DAMAGE_CLASS_PT[move.damageClass] ?? 'Ataque'}
                  {move.power ? ` · Poder ${move.power}` : ''}
                  {move.pp ? ` · ${move.pp} PP` : ''}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        <LockedHintRow
          title="2 Ataques Compatíveis"
          subtitle="Dois golpes oficiais que este Pokémon aprende"
          canChoose={canBuyNow}
          onUnlock={() => onChooseHint('moves')}
        />
      )}

      {/* Dica: Tipagens */}
      {showTypes && roundData ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
        >
          <div>
            <p className="text-xs font-semibold text-[#1D4ED8]">
              Dica Elemental
            </p>
            <h3 className="font-display text-base font-bold text-slate-900">
              Tipagem Oficial
            </h3>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            {roundData.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        </motion.div>
      ) : (
        <LockedHintRow
          title="Tipagens Oficiais"
          subtitle="Tipos elementais do Pokémon com ícones"
          canChoose={canBuyNow}
          onUnlock={() => onChooseHint('types')}
        />
      )}

      {/* Dica: Silhueta (só aparece botão de desbloqueio quando bloqueada, ou confirmação quando já visível) */}
      {!showSilhouette ? (
        <LockedHintRow
          title="Silhueta do Pokémon"
          subtitle="Exibe o contorno preto oficial na arena"
          canChoose={canBuyNow}
          onUnlock={() => onChooseHint('silhouette')}
        />
      ) : isActive ? (
        <div className="flex items-center justify-between rounded-2xl border border-[#1D4ED8]/25 bg-[#EFF6FF] px-4 py-3 text-xs font-semibold text-[#1E3A8A]">
          <span className="inline-flex items-center gap-2">
            <Eye className="h-4 w-4 text-[#1D4ED8]" />
            Silhueta revelada na arena ao lado
          </span>
        </div>
      ) : null}
    </div>
  );
}
