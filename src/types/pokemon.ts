export type GameMode = 'classic' | 'infinite' | 'custom';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type GameScreen = 'TITLE_MENU' | 'PLAYING' | 'MATCH_SUMMARY';
export type NavTab = 'play' | 'pokedex' | 'stats' | 'rules';

export type HintKey = 'cry' | 'info' | 'moves' | 'types' | 'silhouette';
export type StepUnlockOption = HintKey | 'auto' | 'none';

export interface CustomGameConfig {
  totalRounds: number | null; // null = infinite
  maxAttempts: number; // 1 to 6
  initialHints: HintKey[];
  stepUnlocks: StepUnlockOption[]; // length >= maxAttempts - 1
  allowHintChoice: boolean;
  generations: number[]; // subset of [1..9]
  includeRegional: boolean;
}

/**
 * Hint stages kept for stats compatibility (1..4 = solved on attempt 1..4, 5 = lost)
 */
export type HintStage = 1 | 2 | 3 | 4 | 5;
export type RoundOutcome = 'active' | 'won' | 'lost';

export interface PokemonRosterItem {
  id: number;
  dexNumber: number;
  slug: string;
  speciesSlug: string;
  displayName: string;
  englishName: string;
  acceptedNames: string[];
  baseSpeciesNames: string[];
  isRegional: boolean;
  regionLabel?: 'Alola' | 'Galar' | 'Hisui' | 'Paldea';
  regionName: string;
  hasRegionalVariant: boolean;
  generation: number;
}

export interface PokemonMoveHint {
  slug: string;
  name: string;
  damageClass: 'physical' | 'special' | 'status';
  power: number | null;
  pp: number | null;
}

export interface PokemonRoundData {
  roster: PokemonRosterItem;
  heightMeters: number;
  weightKg: number;
  types: string[];
  moves: [PokemonMoveHint, PokemonMoveHint];
  cryUrl: string | null;
  artworkUrl: string;
  fallbackSpriteUrl: string;
  silhouetteDataUrl: string | null;
  choices: PokemonRosterItem[];
}

export interface MatchRoundRecord {
  roster: PokemonRosterItem;
  artworkUrl: string;
  types: string[];
  outcome: 'won' | 'lost';
  solvedAtStage: HintStage;
  attemptsUsed: number;
  maxAttempts: number;
  pointsEarned: number;
  wrongGuesses: string[];
}

export interface DiscoveredPokemonEntry {
  id: number;
  dexNumber: number;
  displayName: string;
  englishName: string;
  generation: number;
  types: string[];
  artworkUrl: string;
  cryUrl: string | null;
  heightMeters: number;
  weightKg: number;
  wins: number;
  losses: number;
  lastSeenAt: number;
}

export interface PlayerStats {
  totalMatches: number;
  totalRounds: number;
  totalWins: number;
  totalLosses: number;
  totalPoints: number;
  bestClassicScore: number;
  bestStreak: number;
  currentStreak: number;
  stageWins: {
    1: number;
    2: number;
    3: number;
    4: number;
  };
}
