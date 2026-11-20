import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Send,
  Trophy,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  Difficulty,
  GameMode,
  PokemonRosterItem,
  PokemonRoundData,
  RoundOutcome,
} from '../types/pokemon';
import { compactNormalized, normalizeGuess } from '../utils/pokemonNames';

interface GuessControlsProps {
  roster: PokemonRosterItem[];
  roundData: PokemonRoundData | null;
  loading: boolean;
  difficulty: Difficulty;
  gameMode: GameMode;
  roundNumber: number;
  totalRounds: number | null;
  attemptsUsed: number;
  maxAttempts: number;
  outcome: RoundOutcome;
  lastPointsEarned: number;
  currentStreak: number;
  wrongGuesses: string[];
  feedbackMessage: string | null;
  shakeTrigger: number;
  onSubmitGuess: (guess: string) => void;
  onNextRound: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export function GuessControls({
  roster,
  roundData,
  loading,
  difficulty,
  gameMode,
  roundNumber,
  totalRounds,
  attemptsUsed,
  maxAttempts,
  outcome,
  lastPointsEarned,
  currentStreak,
  wrongGuesses,
  feedbackMessage,
  shakeTrigger,
  onSubmitGuess,
  onNextRound,
}: GuessControlsProps) {
  const [inputValue, setInputValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clear input when round changes
  useEffect(() => {
    setInputValue('');
    setDropdownOpen(false);
    setHighlightIndex(0);
    if (!loading && outcome === 'active') {
      inputRef.current?.focus();
    }
  }, [roundData?.roster.id, loading, outcome]);

  const suggestions = useMemo(() => {
    if (difficulty !== 'normal') return [];
    const norm = normalizeGuess(inputValue);
    const compact = compactNormalized(inputValue);
    if (norm.length < 1) return [];

    const wrongSet = new Set(wrongGuesses.map((g) => normalizeGuess(g)));

    const startsWith: PokemonRosterItem[] = [];
    const includes: PokemonRosterItem[] = [];

    for (const item of roster) {
      if (wrongSet.has(normalizeGuess(item.displayName))) continue;
      const ptNorm = normalizeGuess(item.displayName);
      const enNorm = normalizeGuess(item.englishName);
      const ptCompact = compactNormalized(item.displayName);

      if (
        ptNorm.startsWith(norm) ||
        enNorm.startsWith(norm) ||
        ptCompact.startsWith(compact)
      ) {
        startsWith.push(item);
      } else if (ptNorm.includes(norm) || enNorm.includes(norm)) {
        includes.push(item);
      }
      if (startsWith.length + includes.length >= 16) break;
    }

    return [...startsWith, ...includes].slice(0, 8);
  }, [difficulty, inputValue, roster, wrongGuesses]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roundData || loading || outcome !== 'active') return;

    if (
      difficulty === 'normal' &&
      dropdownOpen &&
      suggestions.length > 0 &&
      suggestions[highlightIndex]
    ) {
      const chosen = suggestions[highlightIndex].displayName;
      setInputValue(chosen);
      setDropdownOpen(false);
      onSubmitGuess(chosen);
      return;
    }

    if (!inputValue.trim()) return;
    setDropdownOpen(false);
    onSubmitGuess(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (difficulty !== 'normal' || !dropdownOpen || suggestions.length === 0) {
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  };

  const isLastRound = totalRounds !== null && roundNumber >= totalRounds;

  if (outcome === 'won' && roundData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-xl font-extrabold text-emerald-950">
              Acertou! É {roundData.roster.displayName}!
            </h3>
            <p className="mt-1 text-sm text-emerald-800">
              Você descobriu na{' '}
              <span className="font-bold">
                {attemptsUsed + 1}ª tentativa
              </span>{' '}
              e ganhou{' '}
              <span className="font-mono-tabular font-bold">
                +{lastPointsEarned} pontos
              </span>
              .
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-900">
              <span className="inline-flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-500" />
                Sequência atual:{' '}
                <span className="font-mono-tabular">{currentStreak}</span>
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onNextRound}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1E40AF] cursor-pointer"
        >
          <span>
            {isLastRound ? 'Ver Resultado da Partida' : 'Próximo Pokémon'}
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  if (outcome === 'lost' && roundData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border-2 border-[#E3350D]/35 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E3350D] text-white">
            <XCircle className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-xl font-extrabold text-slate-900">
              O Pokémon era {roundData.roster.displayName}!
            </h3>
            <p className="mt-1 text-sm text-slate-700">
              Todas as {maxAttempts} chances foram usadas nesta rodada (
              <span className="font-mono-tabular font-bold">0 pontos</span>).
              Sequência zerada.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNextRound}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E3350D] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#C82D09] cursor-pointer"
        >
          <span>
            {isLastRound ? 'Ver Resultado da Partida' : 'Próximo Pokémon'}
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <div
      key={shakeTrigger}
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-xs ${
        shakeTrigger > 0 ? 'animate-shake' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-base font-bold text-slate-900">
          Seu Palpite
        </h3>
        <span className="text-xs font-medium text-slate-500">
          {difficulty === 'easy'
            ? 'Fácil · Escolha ou digite'
            : difficulty === 'normal'
            ? 'Normal · Com sugestões'
            : 'Difícil · Texto livre'}
        </span>
      </div>

      {feedbackMessage && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Easy Mode: 4 Multiple-Choice Candidate Buttons */}
      {difficulty === 'easy' && roundData && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {roundData.choices.map((choice, idx) => {
            const alreadyTried = wrongGuesses.some(
              (g) => normalizeGuess(g) === normalizeGuess(choice.displayName)
            );
            const isSelected =
              normalizeGuess(inputValue) === normalizeGuess(choice.displayName);

            return (
              <button
                key={choice.id}
                type="button"
                disabled={alreadyTried || loading}
                onClick={() => setInputValue(choice.displayName)}
                className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm font-semibold transition-all cursor-pointer ${
                  alreadyTried
                    ? 'border-slate-200 bg-slate-100 text-slate-400 line-through cursor-not-allowed'
                    : isSelected
                    ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#1E3A8A] ring-2 ring-[#1D4ED8]/20'
                    : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-[#1D4ED8]/50 hover:bg-white'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono-tabular text-xs font-bold ${
                    isSelected
                      ? 'bg-[#1D4ED8] text-white'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {OPTION_LETTERS[idx]}
                </span>
                <span className="truncate">{choice.displayName}</span>
              </button>
            );
          })}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="mt-3 space-y-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            disabled={loading}
            onChange={(e) => {
              setInputValue(e.target.value);
              setHighlightIndex(0);
              if (difficulty === 'normal') {
                setDropdownOpen(e.target.value.trim().length > 0);
              }
            }}
            onFocus={() => {
              if (difficulty === 'normal' && inputValue.trim().length > 0) {
                setDropdownOpen(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setDropdownOpen(false), 150);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Digite o nome do Pokémon (ex: Pikachu, Vulpix de Alola)..."
            autoComplete="off"
            aria-label="Nome do Pokémon"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#1D4ED8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
          />

          {difficulty === 'normal' && dropdownOpen && suggestions.length > 0 && (
            <ul
              role="listbox"
              className="absolute z-30 mt-1.5 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            >
              {suggestions.map((item, idx) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setInputValue(item.displayName);
                      setDropdownOpen(false);
                      onSubmitGuess(item.displayName);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                      idx === highlightIndex
                        ? 'bg-[#EFF6FF] font-semibold text-[#1E3A8A]'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.displayName}</span>
                    {item.englishName !== item.displayName && (
                      <span className="text-xs text-slate-400">{item.englishName}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E3350D] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#C82D09] disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer"
        >
          <Send className="h-4 w-4" />
          <span>Confirmar Resposta</span>
        </button>
      </form>

      {wrongGuesses.length > 0 && (
        <p className="mt-3 text-xs text-slate-500">
          Tentativas anteriores:{' '}
          <span className="font-medium text-slate-700">
            {wrongGuesses.join(' · ')}
          </span>
        </p>
      )}
    </div>
  );
}
