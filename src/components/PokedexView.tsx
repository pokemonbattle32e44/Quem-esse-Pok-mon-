import { Search, Volume2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DiscoveredPokemonEntry } from '../types/pokemon';
import { formatDexNumber, normalizeGuess } from '../utils/pokemonNames';
import { TypeBadge } from './TypeIcon';

interface PokedexViewProps {
  discovered: Record<number, DiscoveredPokemonEntry>;
  onPlayCry: (cryUrl: string | null) => void;
}

const GENERATIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function PokedexView({ discovered, onPlayCry }: PokedexViewProps) {
  const [query, setQuery] = useState('');
  const [genFilter, setGenFilter] = useState(0);

  const entries = useMemo(() => {
    const list = Object.values(discovered).sort((a, b) => a.dexNumber - b.dexNumber || a.id - b.id);
    const normQuery = normalizeGuess(query);

    return list.filter((entry) => {
      if (genFilter !== 0 && entry.generation !== genFilter) return false;
      if (!normQuery) return true;
      return (
        normalizeGuess(entry.displayName).includes(normQuery) ||
        normalizeGuess(entry.englishName).includes(normQuery) ||
        String(entry.dexNumber).includes(normQuery)
      );
    });
  }, [discovered, query, genFilter]);

  const totalCount = Object.keys(discovered).length;

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Pokédex Descoberta
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Histórico completo dos Pokémon encontrados durante suas partidas.{' '}
            <span className="font-mono-tabular font-semibold text-[#1D4ED8]">
              {totalCount} {totalCount === 1 ? 'registro' : 'registros'}
            </span>
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar nome ou nº..."
            aria-label="Buscar na Pokédex"
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
          />
        </div>
      </div>

      {/* Generation Filter */}
      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        {GENERATIONS.map((gen) => (
          <button
            key={gen}
            type="button"
            onClick={() => setGenFilter(gen)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              genFilter === gen
                ? 'bg-[#1D4ED8] text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {gen === 0 ? 'Todas as Gerações' : `Gen ${gen}`}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-display text-lg font-bold text-slate-800">
            {totalCount === 0
              ? 'Nenhum Pokémon registrado ainda'
              : 'Nenhum resultado para esse filtro'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {totalCount === 0
              ? 'Jogue uma rodada para começar a preencher sua Pokédex.'
              : 'Tente buscar outro nome ou selecionar outra geração.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 p-2">
                  <img
                    src={entry.artworkUrl}
                    alt={entry.displayName}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 font-mono-tabular">
                    <span>{formatDexNumber(entry.dexNumber)}</span>
                    <span>Gen {entry.generation}</span>
                  </div>
                  <h2 className="mt-0.5 truncate font-display text-lg font-bold text-slate-900">
                    {entry.displayName}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {entry.types.map((t) => (
                      <TypeBadge key={t} type={t} size="sm" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
                <div className="font-mono-tabular">
                  <span className="font-semibold text-emerald-700">
                    {entry.wins} {entry.wins === 1 ? 'acerto' : 'acertos'}
                  </span>
                  <span className="mx-1.5 text-slate-300">·</span>
                  <span className="font-semibold text-rose-700">
                    {entry.losses} {entry.losses === 1 ? 'erro' : 'erros'}
                  </span>
                </div>

                {entry.cryUrl && (
                  <button
                    type="button"
                    onClick={() => onPlayCry(entry.cryUrl)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 font-semibold text-slate-700 transition-colors hover:bg-[#EFF6FF] hover:text-[#1D4ED8] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Cry</span>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
