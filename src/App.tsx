import {
  Flame,
  Infinity as InfinityIcon,
  Layers,
  Play,
  RefreshCw,
  SlidersHorizontal,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CustomModePanel } from './components/CustomModePanel';
import { GuessControls } from './components/GuessControls';
import { HintCards } from './components/HintCards';
import { HintTracker } from './components/HintTracker';
import { MatchSummary } from './components/MatchSummary';
import { PokeballLogo } from './components/PokeballLogo';
import { PokedexView } from './components/PokedexView';
import { PokemonStage } from './components/PokemonStage';
import { RulesView } from './components/RulesView';
import { StatsView } from './components/StatsView';
import {
  fetchPokemonRoster,
  fetchPokemonRoundData,
  pickRandomPokemon,
} from './services/pokeapi';
import type {
  CustomGameConfig,
  Difficulty,
  DiscoveredPokemonEntry,
  GameMode,
  GameScreen,
  HintKey,
  HintStage,
  MatchRoundRecord,
  NavTab,
  PlayerStats,
  PokemonRosterItem,
  PokemonRoundData,
  RoundOutcome,
  StepUnlockOption,
} from './types/pokemon';
import { evaluateGuess, normalizeGuess } from './utils/pokemonNames';
import { soundFx } from './utils/soundFx';

const STATS_STORAGE_KEY = 'wtp_stats_v1';
const POKEDEX_STORAGE_KEY = 'wtp_pokedex_v1';

const HINT_PRIORITY_ORDER: HintKey[] = [
  'cry',
  'info',
  'moves',
  'types',
  'silhouette',
];

const HINT_LABELS: Record<HintKey, string> = {
  cry: 'Som Característico (Cry)',
  info: 'Região, Forma e Medidas',
  moves: '2 Ataques Compatíveis',
  types: 'Tipagens Oficiais',
  silhouette: 'Silhueta',
};

const DEFAULT_CUSTOM_CONFIG: CustomGameConfig = {
  totalRounds: 10,
  maxAttempts: 4,
  initialHints: ['cry', 'info'],
  stepUnlocks: ['moves', 'types', 'silhouette'],
  allowHintChoice: true,
  generations: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  includeRegional: true,
};

const DEFAULT_STATS: PlayerStats = {
  totalMatches: 0,
  totalRounds: 0,
  totalWins: 0,
  totalLosses: 0,
  totalPoints: 0,
  bestClassicScore: 0,
  bestStreak: 0,
  currentStreak: 0,
  stageWins: { 1: 0, 2: 0, 3: 0, 4: 0 },
};

function loadSavedStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

function loadSavedPokedex(): Record<number, DiscoveredPokemonEntry> {
  try {
    const raw = localStorage.getItem(POKEDEX_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<number, DiscoveredPokemonEntry>;
  } catch {
    return {};
  }
}

function computePointsForAttempt(attemptsUsed: number, maxAttempts: number): number {
  const remaining = Math.max(1, maxAttempts - attemptsUsed);
  return Math.max(10, Math.round((100 * remaining) / maxAttempts));
}

function getActiveRules(
  mode: GameMode,
  custom: CustomGameConfig
): {
  totalRounds: number | null;
  maxAttempts: number;
  initialHints: HintKey[];
  stepUnlocks: StepUnlockOption[];
  allowHintChoice: boolean;
} {
  if (mode === 'custom') {
    return {
      totalRounds: custom.totalRounds,
      maxAttempts: custom.maxAttempts,
      initialHints: custom.initialHints,
      stepUnlocks: custom.stepUnlocks,
      allowHintChoice: custom.allowHintChoice,
    };
  }
  return {
    totalRounds: mode === 'classic' ? 10 : null,
    maxAttempts: 4,
    initialHints: ['cry', 'info'],
    stepUnlocks: ['moves', 'types', 'silhouette'],
    allowHintChoice: true,
  };
}

function filterRosterForMode(
  roster: PokemonRosterItem[],
  mode: GameMode,
  custom: CustomGameConfig
): PokemonRosterItem[] {
  if (mode !== 'custom') return roster;
  const filtered = roster.filter(
    (item) =>
      custom.generations.includes(item.generation) &&
      (custom.includeRegional || !item.isRegional)
  );
  return filtered.length > 0 ? filtered : roster;
}

export default function App() {
  // Navigation & Setup
  const [activeTab, setActiveTab] = useState<NavTab>('play');
  const [screen, setScreen] = useState<GameScreen>('TITLE_MENU');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [customConfig, setCustomConfig] =
    useState<CustomGameConfig>(DEFAULT_CUSTOM_CONFIG);
  const [fxEnabled, setFxEnabled] = useState(true);

  // Active match rules snapshot (frozen when match starts)
  const [matchRules, setMatchRules] = useState(() =>
    getActiveRules('classic', DEFAULT_CUSTOM_CONFIG)
  );

  // Roster state
  const [roster, setRoster] = useState<PokemonRosterItem[]>([]);
  const [rosterLoading, setRosterLoading] = useState(true);
  const [rosterError, setRosterError] = useState<string | null>(null);

  // Persistent Stats & Pokédex
  const [stats, setStats] = useState<PlayerStats>(loadSavedStats);
  const [discovered, setDiscovered] =
    useState<Record<number, DiscoveredPokemonEntry>>(loadSavedPokedex);

  // Active Match & Round state
  const [roundNumber, setRoundNumber] = useState(1);
  const [matchScore, setMatchScore] = useState(0);
  const [matchStreak, setMatchStreak] = useState(0);
  const [bestMatchStreak, setBestMatchStreak] = useState(0);
  const [matchRecords, setMatchRecords] = useState<MatchRoundRecord[]>([]);

  const [roundData, setRoundData] = useState<PokemonRoundData | null>(null);
  const [roundLoading, setRoundLoading] = useState(false);
  const [roundError, setRoundError] = useState<string | null>(null);

  const [unlockedHints, setUnlockedHints] = useState<HintKey[]>(['cry', 'info']);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [outcome, setOutcome] = useState<RoundOutcome>('active');
  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [isCryPlaying, setIsCryPlaying] = useState(false);

  const usedIdsRef = useRef<Set<number>>(new Set());
  const preloadedNextRef = useRef<Promise<PokemonRoundData> | null>(null);
  const activePoolRef = useRef<PokemonRosterItem[]>([]);

  const previewPool = useMemo(
    () => filterRosterForMode(roster, gameMode, customConfig),
    [roster, gameMode, customConfig]
  );

  // Persist stats & pokedex
  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Ignore quota errors
    }
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem(POKEDEX_STORAGE_KEY, JSON.stringify(discovered));
    } catch {
      // Ignore quota errors
    }
  }, [discovered]);

  const loadRoster = useCallback(async () => {
    setRosterLoading(true);
    setRosterError(null);
    try {
      const list = await fetchPokemonRoster();
      setRoster(list);
    } catch (err) {
      setRosterError(
        err instanceof Error
          ? err.message
          : 'Erro ao conectar à PokéAPI. Tente novamente.'
      );
    } finally {
      setRosterLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  const playCrySafe = useCallback((cryUrl: string | null) => {
    soundFx.playCry(cryUrl, setIsCryPlaying);
  }, []);

  const preloadNextRound = useCallback((pool: PokemonRosterItem[]) => {
    if (pool.length === 0) return;
    const nextTarget = pickRandomPokemon(pool, usedIdsRef.current);
    usedIdsRef.current.add(nextTarget.id);
    preloadedNextRef.current = fetchPokemonRoundData(nextTarget, pool);
  }, []);

  const loadRound = useCallback(
    async (
      pool: PokemonRosterItem[],
      initialHints: HintKey[],
      isLastRound: boolean
    ) => {
      soundFx.stopCry();
      setIsCryPlaying(false);
      setRoundLoading(true);
      setRoundError(null);
      setUnlockedHints(initialHints);
      setAttemptsUsed(0);
      setOutcome('active');
      setLastPointsEarned(0);
      setWrongGuesses([]);
      setFeedbackMessage(null);
      setShakeTrigger(0);

      try {
        let data: PokemonRoundData;
        if (preloadedNextRef.current) {
          const pending = preloadedNextRef.current;
          preloadedNextRef.current = null;
          data = await pending;
        } else {
          const target = pickRandomPokemon(pool, usedIdsRef.current);
          usedIdsRef.current.add(target.id);
          data = await fetchPokemonRoundData(target, pool);
        }

        setRoundData(data);
        setRoundLoading(false);

        if (initialHints.includes('cry')) {
          playCrySafe(data.cryUrl);
        }

        if (!isLastRound) {
          preloadNextRound(pool);
        }
      } catch (err) {
        setRoundError(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar este Pokémon.'
        );
        setRoundLoading(false);
      }
    },
    [playCrySafe, preloadNextRound]
  );

  const startNewMatch = useCallback(
    (
      selectedMode: GameMode = gameMode,
      selectedDifficulty: Difficulty = difficulty
    ) => {
      if (roster.length === 0) return;
      const rules = getActiveRules(selectedMode, customConfig);
      const pool = filterRosterForMode(roster, selectedMode, customConfig);
      activePoolRef.current = pool;

      setGameMode(selectedMode);
      setDifficulty(selectedDifficulty);
      setMatchRules(rules);
      setActiveTab('play');
      setScreen('PLAYING');
      setRoundNumber(1);
      setMatchScore(0);
      setMatchStreak(0);
      setBestMatchStreak(0);
      setMatchRecords([]);
      usedIdsRef.current = new Set();
      preloadedNextRef.current = null;

      loadRound(pool, rules.initialHints, rules.totalRounds === 1);
    },
    [customConfig, difficulty, gameMode, loadRound, roster]
  );

  const recordOutcome = useCallback(
    (
      data: PokemonRoundData,
      roundResult: 'won' | 'lost',
      usedAttempts: number,
      maxAttempts: number,
      points: number,
      guessesMade: string[]
    ) => {
      const solvedAtStage = (
        roundResult === 'lost' ? 5 : Math.min(4, usedAttempts + 1)
      ) as HintStage;

      setMatchRecords((prev) => [
        ...prev,
        {
          roster: data.roster,
          artworkUrl: data.artworkUrl,
          types: data.types,
          outcome: roundResult,
          solvedAtStage,
          attemptsUsed: usedAttempts,
          maxAttempts,
          pointsEarned: points,
          wrongGuesses: guessesMade,
        },
      ]);

      setDiscovered((prev) => {
        const existing = prev[data.roster.id];
        return {
          ...prev,
          [data.roster.id]: {
            id: data.roster.id,
            dexNumber: data.roster.dexNumber,
            displayName: data.roster.displayName,
            englishName: data.roster.englishName,
            generation: data.roster.generation,
            types: data.types,
            artworkUrl: data.artworkUrl,
            cryUrl: data.cryUrl,
            heightMeters: data.heightMeters,
            weightKg: data.weightKg,
            wins: (existing?.wins ?? 0) + (roundResult === 'won' ? 1 : 0),
            losses: (existing?.losses ?? 0) + (roundResult === 'lost' ? 1 : 0),
            lastSeenAt: Date.now(),
          },
        };
      });

      setStats((prev) => {
        const nextStreak = roundResult === 'won' ? prev.currentStreak + 1 : 0;
        const nextBestStreak = Math.max(prev.bestStreak, nextStreak);
        const nextStageWins = { ...prev.stageWins };
        if (roundResult === 'won' && solvedAtStage <= 4) {
          const s = solvedAtStage as 1 | 2 | 3 | 4;
          nextStageWins[s] = nextStageWins[s] + 1;
        }
        return {
          ...prev,
          totalRounds: prev.totalRounds + 1,
          totalWins: prev.totalWins + (roundResult === 'won' ? 1 : 0),
          totalLosses: prev.totalLosses + (roundResult === 'lost' ? 1 : 0),
          totalPoints: prev.totalPoints + points,
          bestStreak: nextBestStreak,
          currentStreak: nextStreak,
          stageWins: nextStageWins,
        };
      });
    },
    []
  );

  const handleChooseHint = useCallback(
    (hintKey: HintKey) => {
      if (!roundData || outcome !== 'active' || roundLoading) return;
      if (!matchRules.allowHintChoice) return;
      if (attemptsUsed >= matchRules.maxAttempts - 1) return;
      if (unlockedHints.includes(hintKey)) return;

      const nextUnlocked = [...unlockedHints, hintKey];
      setUnlockedHints(nextUnlocked);
      setAttemptsUsed((prev) => prev + 1);
      soundFx.playHintUnlock();

      if (hintKey === 'cry') {
        playCrySafe(roundData.cryUrl);
      }

      setFeedbackMessage(
        `Dica revelada por escolha: ${HINT_LABELS[hintKey]} (-1 tentativa).`
      );
    },
    [
      attemptsUsed,
      matchRules.allowHintChoice,
      matchRules.maxAttempts,
      outcome,
      playCrySafe,
      roundData,
      roundLoading,
      unlockedHints,
    ]
  );

  const handleSubmitGuess = useCallback(
    (rawGuess: string) => {
      if (!roundData || outcome !== 'active' || roundLoading) return;

      const trimmed = rawGuess.trim();
      if (!trimmed) return;

      const check = evaluateGuess(trimmed, roundData.roster);

      if (check.status === 'needs-region') {
        setFeedbackMessage(check.regionHint);
        setShakeTrigger((n) => n + 1);
        soundFx.playWrongGuess();
        return;
      }

      if (check.status === 'correct') {
        const points = computePointsForAttempt(
          attemptsUsed,
          matchRules.maxAttempts
        );
        setOutcome('won');
        setLastPointsEarned(points);
        setFeedbackMessage(null);
        setMatchScore((s) => s + points);
        setMatchStreak((prev) => {
          const updated = prev + 1;
          setBestMatchStreak((b) => Math.max(b, updated));
          return updated;
        });

        soundFx.playCorrectFanfare();
        recordOutcome(
          roundData,
          'won',
          attemptsUsed,
          matchRules.maxAttempts,
          points,
          wrongGuesses
        );
        return;
      }

      // Wrong guess
      const nextWrongGuesses = wrongGuesses.some(
        (g) => normalizeGuess(g) === normalizeGuess(trimmed)
      )
        ? wrongGuesses
        : [...wrongGuesses, trimmed];
      setWrongGuesses(nextWrongGuesses);
      setShakeTrigger((n) => n + 1);

      const nextAttemptsUsed = attemptsUsed + 1;

      if (nextAttemptsUsed >= matchRules.maxAttempts) {
        // All attempts exhausted -> Reveal Pokémon
        setAttemptsUsed(nextAttemptsUsed);
        setUnlockedHints([...HINT_PRIORITY_ORDER]);
        setOutcome('lost');
        setLastPointsEarned(0);
        setMatchStreak(0);
        setFeedbackMessage(null);

        soundFx.playRevealLoss();
        setTimeout(() => playCrySafe(roundData.cryUrl), 320);
        recordOutcome(
          roundData,
          'lost',
          nextAttemptsUsed,
          matchRules.maxAttempts,
          0,
          nextWrongGuesses
        );
        return;
      }

      // Unlock next hint according to stepUnlocks[attemptsUsed]
      const configuredStep = matchRules.stepUnlocks[attemptsUsed] ?? 'auto';
      let newlyUnlocked: HintKey | null = null;

      if (configuredStep !== 'none') {
        if (
          configuredStep !== 'auto' &&
          !unlockedHints.includes(configuredStep)
        ) {
          newlyUnlocked = configuredStep;
        } else {
          newlyUnlocked =
            HINT_PRIORITY_ORDER.find((h) => !unlockedHints.includes(h)) ?? null;
        }
      }

      if (newlyUnlocked) {
        setUnlockedHints((prev) => [...prev, newlyUnlocked!]);
        if (newlyUnlocked === 'cry') {
          setTimeout(() => playCrySafe(roundData.cryUrl), 220);
        }
      }

      setAttemptsUsed(nextAttemptsUsed);
      soundFx.playWrongGuess();
      if (newlyUnlocked) {
        setTimeout(() => soundFx.playHintUnlock(), 180);
      }

      const remaining = matchRules.maxAttempts - nextAttemptsUsed;
      const suffix =
        remaining === 1 ? ' Última tentativa!' : ` (${remaining} chances restantes)`;

      setFeedbackMessage(
        newlyUnlocked
          ? `Resposta incorreta. Dica desbloqueada: ${HINT_LABELS[newlyUnlocked]}.${suffix}`
          : `Resposta incorreta.${suffix}`
      );
    },
    [
      attemptsUsed,
      matchRules.maxAttempts,
      matchRules.stepUnlocks,
      outcome,
      playCrySafe,
      recordOutcome,
      roundData,
      roundLoading,
      unlockedHints,
      wrongGuesses,
    ]
  );

  const finishMatch = useCallback(
    (finalScore: number) => {
      soundFx.stopCry();
      setIsCryPlaying(false);
      setStats((prev) => ({
        ...prev,
        totalMatches: prev.totalMatches + 1,
        bestClassicScore:
          gameMode === 'classic'
            ? Math.max(prev.bestClassicScore, finalScore)
            : prev.bestClassicScore,
      }));
      setScreen('MATCH_SUMMARY');
    },
    [gameMode]
  );

  const handleNextRound = useCallback(() => {
    if (
      matchRules.totalRounds !== null &&
      roundNumber >= matchRules.totalRounds
    ) {
      finishMatch(matchScore);
      return;
    }
    const nextRound = roundNumber + 1;
    setRoundNumber(nextRound);
    const isUpcomingLast =
      matchRules.totalRounds !== null && nextRound >= matchRules.totalRounds;
    loadRound(
      activePoolRef.current.length > 0 ? activePoolRef.current : roster,
      matchRules.initialHints,
      isUpcomingLast
    );
  }, [finishMatch, loadRound, matchRules, matchScore, roundNumber, roster]);

  const toggleSoundFx = () => {
    const next = !fxEnabled;
    setFxEnabled(next);
    soundFx.setFxEnabled(next);
  };

  const handleResetStats = () => {
    setStats(DEFAULT_STATS);
    setDiscovered({});
    localStorage.removeItem(STATS_STORAGE_KEY);
    localStorage.removeItem(POKEDEX_STORAGE_KEY);
  };

  const currentPotentialPoints =
    outcome === 'active'
      ? computePointsForAttempt(attemptsUsed, matchRules.maxAttempts)
      : 0;

  const canChooseHintNow =
    outcome === 'active' &&
    matchRules.allowHintChoice &&
    attemptsUsed < matchRules.maxAttempts - 1;

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB] text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 py-3">
          {/* Zone 1: Brand wordmark */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('play');
              if (screen === 'MATCH_SUMMARY') setScreen('TITLE_MENU');
            }}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PokeballLogo className="h-7 w-7 shrink-0" />
            <span className="font-display text-lg font-extrabold tracking-tight text-[#0F294A]">
              Quem é esse Pokémon?
            </span>
          </button>

          {/* Zone 2: 4 single-line nav links */}
          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-6 text-sm font-semibold"
          >
            {(
              [
                { id: 'play', label: 'Jogar' },
                { id: 'pokedex', label: 'Pokédex' },
                { id: 'stats', label: 'Estatísticas' },
                { id: 'rules', label: 'Regras' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap shrink-0 border-b-2 py-1 transition-colors cursor-pointer ${
                  activeTab === item.id
                    ? 'border-[#E3350D] text-[#0F294A]'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              disabled={rosterLoading || roster.length === 0}
              onClick={() => {
                setActiveTab('play');
                if (screen === 'PLAYING') {
                  setScreen('TITLE_MENU');
                  soundFx.stopCry();
                } else {
                  startNewMatch();
                }
              }}
              className="rounded-xl bg-[#E3350D] px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#C82D09] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {screen === 'PLAYING' && activeTab === 'play'
                ? 'Configurar'
                : 'Nova Partida'}
            </button>
          </div>
        </div>

        {/* Compact mobile nav row */}
        <nav
          aria-label="Navegação móvel"
          className="flex md:hidden items-center justify-around border-t border-slate-100 px-2 py-1.5 text-xs font-semibold"
        >
          {(
            [
              { id: 'play', label: 'Jogar' },
              { id: 'pokedex', label: 'Pokédex' },
              { id: 'stats', label: 'Estatísticas' },
              { id: 'rules', label: 'Regras' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`rounded-lg px-3 py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                activeTab === item.id
                  ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                  : 'text-slate-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        {activeTab === 'pokedex' && (
          <PokedexView
            discovered={discovered}
            onPlayCry={(url) => playCrySafe(url)}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            stats={stats}
            discoveredCount={Object.keys(discovered).length}
            onResetStats={handleResetStats}
          />
        )}

        {activeTab === 'rules' && <RulesView />}

        {activeTab === 'play' && (
          <>
            {screen === 'TITLE_MENU' && (
              <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                    {/* Hero Brand Left Panel */}
                    <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-[#0F294A] via-[#173B7A] to-[#1D4ED8] p-7 sm:p-9 text-white">
                      <div>
                        <div className="flex items-center gap-3">
                          <PokeballLogo className="h-11 w-11" />
                          <span className="font-mono-tabular text-xs font-bold text-[#FFCB05]">
                            Gerações 1 a 9 · Formas Regionais
                          </span>
                        </div>
                        <h1 className="mt-5 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-balance">
                          Quem é esse Pokémon?
                        </h1>
                        <p className="mt-3 text-sm sm:text-base leading-relaxed text-blue-100">
                          Ouça o cry original, analise a região, ataques compatíveis, tipagens e silhueta — ou monte sua própria partida personalizada.
                        </p>
                      </div>

                      <div className="mt-8 grid grid-cols-4 gap-2 border-t border-white/15 pt-5 text-center">
                        <div>
                          <p className="text-xs text-blue-200">1ª Tent.</p>
                          <p className="font-mono-tabular text-base font-extrabold text-[#FFCB05]">
                            100
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-200">2ª Tent.</p>
                          <p className="font-mono-tabular text-base font-extrabold text-white">
                            75
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-200">3ª Tent.</p>
                          <p className="font-mono-tabular text-base font-extrabold text-white">
                            50
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-200">4ª Tent.</p>
                          <p className="font-mono-tabular text-base font-extrabold text-white">
                            25
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Setup Panel Right */}
                    <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-between space-y-5">
                      <div className="space-y-5">
                        {/* Mode Selection */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500">
                            Modo de Jogo
                          </label>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <button
                              type="button"
                              onClick={() => setGameMode('classic')}
                              className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                                gameMode === 'classic'
                                  ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#1E3A8A] ring-2 ring-[#1D4ED8]/15'
                                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                              }`}
                            >
                              <Layers className="h-5 w-5 shrink-0 text-[#1D4ED8]" />
                              <div>
                                <p className="text-sm font-bold">Clássico</p>
                                <p className="text-xs text-slate-500">10 rodadas</p>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setGameMode('infinite')}
                              className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                                gameMode === 'infinite'
                                  ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#1E3A8A] ring-2 ring-[#1D4ED8]/15'
                                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                              }`}
                            >
                              <InfinityIcon className="h-5 w-5 shrink-0 text-[#E3350D]" />
                              <div>
                                <p className="text-sm font-bold">Infinito</p>
                                <p className="text-xs text-slate-500">Sem limite</p>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setGameMode('custom')}
                              className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                                gameMode === 'custom'
                                  ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#1E3A8A] ring-2 ring-[#1D4ED8]/15'
                                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                              }`}
                            >
                              <SlidersHorizontal className="h-5 w-5 shrink-0 text-[#1D4ED8]" />
                              <div>
                                <p className="text-sm font-bold">Personalizado</p>
                                <p className="text-xs text-slate-500">Suas regras</p>
                              </div>
                            </button>
                          </div>

                          {gameMode === 'custom' && (
                            <CustomModePanel
                              config={customConfig}
                              onChange={setCustomConfig}
                            />
                          )}
                        </div>

                        {/* Difficulty Selection */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500">
                            Dificuldade
                          </label>
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            {(
                              [
                                { id: 'easy', label: 'Fácil', hint: '4 opções' },
                                { id: 'normal', label: 'Normal', hint: 'Sugestões' },
                                { id: 'hard', label: 'Difícil', hint: 'Texto livre' },
                              ] as const
                            ).map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setDifficulty(opt.id)}
                                className={`rounded-xl border px-3 py-2.5 text-center transition-all cursor-pointer ${
                                  difficulty === opt.id
                                    ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#1E3A8A] ring-2 ring-[#1D4ED8]/15'
                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                                }`}
                              >
                                <p className="text-sm font-bold">{opt.label}</p>
                                <p className="text-xs text-slate-500">{opt.hint}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {rosterError ? (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                          <p className="font-semibold">{rosterError}</p>
                          <button
                            type="button"
                            onClick={loadRoster}
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#E3350D] hover:underline cursor-pointer"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Tentar Novamente
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <button
                            type="button"
                            disabled={rosterLoading}
                            onClick={() => startNewMatch(gameMode, difficulty)}
                            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#E3350D] px-6 py-4 text-base font-extrabold text-white shadow-sm transition-colors hover:bg-[#C82D09] disabled:opacity-60 cursor-pointer"
                          >
                            <Play className="h-5 w-5 fill-current" />
                            <span>
                              {rosterLoading
                                ? 'Carregando Pokédex...'
                                : 'Iniciar Desafio'}
                            </span>
                          </button>
                          <p className="text-center text-xs text-slate-500 font-mono-tabular">
                            {roster.length > 0
                              ? `${previewPool.length} Pokémon selecionados · PT-BR e EN`
                              : 'Conectando à PokéAPI...'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {screen === 'PLAYING' && (
              <section className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-5">
                {/* Match HUD Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 sm:px-5 py-3 shadow-xs">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                    <div>
                      <span className="text-xs text-slate-500">Rodada</span>
                      <p className="font-mono-tabular font-extrabold text-slate-900">
                        {matchRules.totalRounds !== null
                          ? `${roundNumber} / ${matchRules.totalRounds}`
                          : `${roundNumber} · Infinito`}
                      </p>
                    </div>

                    <div className="h-7 w-px bg-slate-200" aria-hidden="true" />

                    <div>
                      <span className="text-xs text-slate-500">Pontuação</span>
                      <p className="font-mono-tabular flex items-center gap-1 font-extrabold text-[#1D4ED8]">
                        <Trophy className="h-4 w-4 text-[#FFCB05]" />
                        {matchScore}
                      </p>
                    </div>

                    <div className="h-7 w-px bg-slate-200" aria-hidden="true" />

                    <div>
                      <span className="text-xs text-slate-500">Sequência</span>
                      <p className="font-mono-tabular flex items-center gap-1 font-extrabold text-slate-900">
                        <Flame className="h-4 w-4 text-[#E3350D]" />
                        {matchStreak}
                      </p>
                    </div>

                    {outcome === 'active' && (
                      <>
                        <div
                          className="hidden sm:block h-7 w-px bg-slate-200"
                          aria-hidden="true"
                        />
                        <div className="hidden sm:block">
                          <span className="text-xs text-slate-500">Valendo</span>
                          <p className="font-mono-tabular font-extrabold text-[#E3350D]">
                            {currentPotentialPoints} pts
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleSoundFx}
                      aria-label={
                        fxEnabled
                          ? 'Desativar efeitos sonoros'
                          : 'Ativar efeitos sonoros'
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {fxEnabled ? (
                        <Volume2 className="h-4 w-4 text-[#1D4ED8]" />
                      ) : (
                        <VolumeX className="h-4 w-4 text-slate-400" />
                      )}
                      <span className="hidden sm:inline">
                        {fxEnabled ? 'Efeitos Ativos' : 'Mudo'}
                      </span>
                    </button>

                    {matchRules.totalRounds === null && matchRecords.length > 0 && (
                      <button
                        type="button"
                        onClick={() => finishMatch(matchScore)}
                        className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Encerrar Sessão
                      </button>
                    )}
                  </div>
                </div>

                {/* Hint & Attempts Tracker */}
                <HintTracker
                  unlockedHints={unlockedHints}
                  attemptsUsed={attemptsUsed}
                  maxAttempts={matchRules.maxAttempts}
                  potentialPoints={currentPotentialPoints}
                  outcome={outcome}
                />

                {roundError ? (
                  <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center">
                    <p className="font-display text-lg font-bold text-rose-900">
                      {roundError}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        loadRound(
                          activePoolRef.current.length > 0
                            ? activePoolRef.current
                            : roster,
                          matchRules.initialHints,
                          matchRules.totalRounds !== null &&
                            roundNumber >= matchRules.totalRounds
                        )
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1E40AF] cursor-pointer"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Carregar Novo Pokémon
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Visual Stage */}
                    <div className="lg:col-span-6">
                      <PokemonStage
                        roundData={roundData}
                        loading={roundLoading}
                        unlockedHints={unlockedHints}
                        outcome={outcome}
                        isCryPlaying={isCryPlaying}
                        onPlayCry={() => playCrySafe(roundData?.cryUrl ?? null)}
                      />
                    </div>

                    {/* Right Hints + Guess Controls */}
                    <div className="lg:col-span-6 space-y-4">
                      <HintCards
                        roundData={roundData}
                        unlockedHints={unlockedHints}
                        outcome={outcome}
                        isCryPlaying={isCryPlaying}
                        canChooseHint={canChooseHintNow}
                        onPlayCry={() => playCrySafe(roundData?.cryUrl ?? null)}
                        onChooseHint={handleChooseHint}
                      />

                      <GuessControls
                        roster={roster}
                        roundData={roundData}
                        loading={roundLoading}
                        difficulty={difficulty}
                        gameMode={gameMode}
                        roundNumber={roundNumber}
                        totalRounds={matchRules.totalRounds}
                        attemptsUsed={attemptsUsed}
                        maxAttempts={matchRules.maxAttempts}
                        outcome={outcome}
                        lastPointsEarned={lastPointsEarned}
                        currentStreak={matchStreak}
                        wrongGuesses={wrongGuesses}
                        feedbackMessage={feedbackMessage}
                        shakeTrigger={shakeTrigger}
                        onSubmitGuess={handleSubmitGuess}
                        onNextRound={handleNextRound}
                      />
                    </div>
                  </div>
                )}
              </section>
            )}

            {screen === 'MATCH_SUMMARY' && (
              <MatchSummary
                gameMode={gameMode}
                records={matchRecords}
                totalScore={matchScore}
                bestStreakInMatch={bestMatchStreak}
                onPlayAgain={() => startNewMatch(gameMode, difficulty)}
                onBackToMenu={() => setScreen('TITLE_MENU')}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
