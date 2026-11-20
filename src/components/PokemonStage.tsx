import { AnimatePresence, motion } from 'motion/react';
import { Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { HintKey, PokemonRoundData, RoundOutcome } from '../types/pokemon';
import { formatDexNumber } from '../utils/pokemonNames';
import { TypeBadge } from './TypeIcon';

interface PokemonStageProps {
  roundData: PokemonRoundData | null;
  loading: boolean;
  unlockedHints: HintKey[];
  outcome: RoundOutcome;
  isCryPlaying: boolean;
  onPlayCry: () => void;
}

export function PokemonStage({
  roundData,
  loading,
  unlockedHints,
  outcome,
  isCryPlaying,
  onPlayCry,
}: PokemonStageProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [roundData?.roster.id]);

  const isRevealed = outcome !== 'active';
  const showSilhouette = !isRevealed && unlockedHints.includes('silhouette');
  const canHearCry = unlockedHints.includes('cry') || isRevealed;

  const activeImgSrc =
    roundData && !imgError
      ? roundData.artworkUrl
      : roundData?.fallbackSpriteUrl || '';

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-[#1E40AF]/25 bg-gradient-to-br from-[#0B1E42] via-[#13326B] to-[#1D4ED8] text-white shadow-lg">
      {/* Classic stadium sunburst backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255, 203, 5, 0.25) 0deg 12deg, transparent 12deg 24deg)',
        }}
      />

      {/* Subtle Pokéball ring */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-64 w-64 rounded-full border border-white/10" />
        <div className="absolute h-44 w-44 rounded-full border border-[#FFCB05]/20" />
      </div>

      {/* Top accent bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-5 py-3 text-xs font-medium text-blue-100">
        <span>
          {isRevealed
            ? 'Identidade Revelada'
            : showSilhouette
            ? 'Silhueta Ativada'
            : `${unlockedHints.length} de 5 dicas abertas · Identidade Oculta`}
        </span>
        <span className="font-mono-tabular text-[#FFCB05]">
          {isRevealed && roundData
            ? `${formatDexNumber(roundData.roster.dexNumber)} · ${roundData.roster.regionName}`
            : '???'}
        </span>
      </div>

      {/* Main arena visual */}
      <div className="relative z-10 flex min-h-[300px] sm:min-h-[340px] flex-col items-center justify-center p-6">
        {loading || !roundData ? (
          <div className="flex flex-col items-center gap-3 text-blue-100">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#FFCB05]/30 border-t-[#FFCB05]" />
            <p className="text-sm font-medium">Buscando Pokémon na PokéAPI...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {isRevealed ? (
              <motion.div
                key={`revealed-${roundData.roster.id}`}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-3 flex items-center justify-center">
                  {outcome === 'won' && (
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0.8 }}
                      animate={{ scale: 1.25, opacity: 0 }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="absolute h-52 w-52 rounded-full border-4 border-[#FFCB05]"
                    />
                  )}
                  <div className="rounded-full bg-white/10 p-4 backdrop-blur-xs">
                    <img
                      src={activeImgSrc}
                      alt={roundData.roster.displayName}
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      className="h-48 w-48 sm:h-56 sm:w-56 object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.45)]"
                    />
                  </div>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {roundData.roster.displayName}
                </h2>
                {roundData.roster.englishName !== roundData.roster.displayName && (
                  <p className="mt-0.5 text-xs font-medium text-blue-200">
                    {roundData.roster.englishName}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  {roundData.types.map((t) => (
                    <TypeBadge key={t} type={t} size="sm" />
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-blue-100 font-mono-tabular">
                  <span>{roundData.roster.regionName}</span>
                  <span aria-hidden="true">·</span>
                  <span>Altura: {roundData.heightMeters} m</span>
                  <span aria-hidden="true">·</span>
                  <span>Peso: {roundData.weightKg} kg</span>
                </div>

                <button
                  type="button"
                  onClick={onPlayCry}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#FFCB05] px-4 py-2 text-xs font-bold text-[#0F172A] shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>{isCryPlaying ? 'Reproduzindo Som...' : 'Ouvir Som Novamente'}</span>
                </button>
              </motion.div>
            ) : showSilhouette ? (
              <motion.div
                key={`silhouette-${roundData.roster.id}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative rounded-full bg-white/85 p-5 shadow-[0_0_50px_rgba(255,203,5,0.28)]">
                  {roundData.silhouetteDataUrl ? (
                    <img
                      src={roundData.silhouetteDataUrl}
                      alt="Silhueta do Pokémon misterioso"
                      className="h-48 w-48 sm:h-56 sm:w-56 object-contain select-none pointer-events-none"
                      draggable={false}
                    />
                  ) : (
                    <img
                      src={activeImgSrc}
                      alt="Silhueta do Pokémon misterioso"
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      className="h-48 w-48 sm:h-56 sm:w-56 object-contain brightness-0 select-none pointer-events-none"
                      draggable={false}
                    />
                  )}
                </div>
                <p className="mt-4 text-sm font-semibold text-[#FFCB05]">
                  Quem é esse Pokémon?
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`mystery-${roundData.roster.id}`}
                initial={{ opacity: 0.6, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center text-center"
              >
                <button
                  type="button"
                  onClick={canHearCry ? onPlayCry : undefined}
                  disabled={!canHearCry}
                  aria-label={
                    canHearCry
                      ? 'Reproduzir som do Pokémon'
                      : 'Som bloqueado'
                  }
                  className={`group relative flex h-40 w-40 items-center justify-center rounded-full border-2 border-[#FFCB05]/45 bg-[#0A1A38]/80 shadow-inner transition-transform ${
                    canHearCry
                      ? 'hover:scale-105 active:scale-95 cursor-pointer'
                      : 'opacity-80 cursor-default'
                  }`}
                >
                  {isCryPlaying && (
                    <span className="absolute inset-0 animate-ping rounded-full border-2 border-[#FFCB05]/50" />
                  )}
                  <span className="font-display text-6xl font-extrabold text-[#FFCB05] select-none">
                    ?
                  </span>
                </button>
                <p className="mt-5 font-display text-xl font-bold text-white">
                  Quem é esse Pokémon?
                </p>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-blue-200">
                  Use as dicas desbloqueadas ao lado ou escolha liberar uma dica específica gastando 1 tentativa.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
