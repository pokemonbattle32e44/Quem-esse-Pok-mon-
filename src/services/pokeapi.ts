import type {
  PokemonMoveHint,
  PokemonRosterItem,
  PokemonRoundData,
} from '../types/pokemon';
import { buildRosterItem, formatMoveName } from '../utils/pokemonNames';
import { generateSilhouetteDataUrl } from '../utils/silhouette';

const ROSTER_CACHE_KEY = 'wtp_pokemon_roster_v2';
const ROSTER_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

let memoryRosterCache: PokemonRosterItem[] | null = null;

interface PokeApiListResponse {
  results: Array<{ name: string; url: string }>;
}

interface PokeApiPokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  cries?: {
    latest?: string | null;
    legacy?: string | null;
  };
  types: Array<{
    slot: number;
    type: { name: string; url: string };
  }>;
  moves: Array<{
    move: { name: string; url: string };
    version_group_details: Array<{
      level_learned_at: number;
      move_learn_method: { name: string };
    }>;
  }>;
  sprites: {
    front_default: string | null;
    other?: {
      home?: { front_default: string | null };
      'official-artwork'?: { front_default: string | null };
    };
  };
}

interface PokeApiMoveDetail {
  name: string;
  power: number | null;
  pp: number | null;
  damage_class?: { name: 'physical' | 'special' | 'status' };
  names?: Array<{ name: string; language: { name: string } }>;
}

const GENERIC_MOVES = new Set([
  'protect',
  'substitute',
  'rest',
  'sleep-talk',
  'facade',
  'tera-blast',
  'endure',
  'snore',
  'confide',
  'swagger',
  'attract',
  'round',
  'hidden-power',
  'return',
  'frustration',
  'toxic',
  'double-team',
  'helping-hand',
  'frustration',
  'secret-power',
  'natural-gift',
  'captivate',
]);

const REGIONAL_SUFFIX_REGEX = /-(alola|galar|hisui|paldea)$/;
const SPECIAL_REGIONAL_SLUGS = new Set([
  'darmanitan-galar-standard',
  'tauros-paldea-combat-breed',
  'tauros-paldea-blaze-breed',
  'tauros-paldea-aqua-breed',
]);

function extractIdFromUrl(url: string): number {
  const parts = url.split('/').filter(Boolean);
  return Number(parts[parts.length - 1]);
}

function extractSpeciesSlugFromRegional(pokemonSlug: string): string {
  if (pokemonSlug === 'darmanitan-galar-standard') return 'darmanitan';
  if (pokemonSlug.startsWith('tauros-paldea-')) return 'tauros';
  return pokemonSlug.replace(REGIONAL_SUFFIX_REGEX, '');
}

export async function fetchPokemonRoster(): Promise<PokemonRosterItem[]> {
  if (memoryRosterCache && memoryRosterCache.length > 0) {
    return memoryRosterCache;
  }

  try {
    const cachedRaw = localStorage.getItem(ROSTER_CACHE_KEY);
    if (cachedRaw) {
      const parsed = JSON.parse(cachedRaw) as {
        savedAt: number;
        items: PokemonRosterItem[];
      };
      if (
        parsed?.items?.length > 1000 &&
        Date.now() - parsed.savedAt < ROSTER_TTL_MS
      ) {
        memoryRosterCache = parsed.items;
        return parsed.items;
      }
    }
  } catch {
    // Ignore storage read error
  }

  const [speciesRes, pokemonRes] = await Promise.all([
    fetch('https://pokeapi.co/api/v2/pokemon-species?limit=1025'),
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1500'),
  ]);

  if (!speciesRes.ok || !pokemonRes.ok) {
    throw new Error('Não foi possível carregar a lista de Pokémon da PokéAPI.');
  }

  const speciesData = (await speciesRes.json()) as PokeApiListResponse;
  const pokemonData = (await pokemonRes.json()) as PokeApiListResponse;

  const speciesByDex = new Map<number, string>();
  const dexBySpeciesSlug = new Map<string, number>();

  for (const entry of speciesData.results) {
    const dex = extractIdFromUrl(entry.url);
    speciesByDex.set(dex, entry.name);
    dexBySpeciesSlug.set(entry.name, dex);
  }

  const roster: PokemonRosterItem[] = [];

  for (const entry of pokemonData.results) {
    const id = extractIdFromUrl(entry.url);

    if (id >= 1 && id <= 1025) {
      const speciesSlug = speciesByDex.get(id) ?? entry.name;
      roster.push(buildRosterItem(id, id, entry.name, speciesSlug));
      continue;
    }

    if (
      id > 10000 &&
      !entry.name.includes('totem') &&
      (REGIONAL_SUFFIX_REGEX.test(entry.name) ||
        SPECIAL_REGIONAL_SLUGS.has(entry.name))
    ) {
      const speciesSlug = extractSpeciesSlugFromRegional(entry.name);
      const dex = dexBySpeciesSlug.get(speciesSlug);
      if (dex) {
        roster.push(buildRosterItem(id, dex, entry.name, speciesSlug));
      }
    }
  }

  const speciesWithRegionalForm = new Set(
    roster.filter((item) => item.isRegional).map((item) => item.speciesSlug)
  );
  for (const item of roster) {
    if (speciesWithRegionalForm.has(item.speciesSlug)) {
      item.hasRegionalVariant = true;
    }
  }

  memoryRosterCache = roster;
  try {
    localStorage.setItem(
      ROSTER_CACHE_KEY,
      JSON.stringify({ savedAt: Date.now(), items: roster })
    );
  } catch {
    // Ignore storage quota error
  }

  return roster;
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function selectTwoOfficialMoves(
  rawMoves: PokeApiPokemonDetail['moves']
): string[] {
  const levelUpMoves = rawMoves.filter((m) =>
    m.version_group_details.some(
      (d) => d.move_learn_method.name === 'level-up'
    )
  );

  const nonGenericLevelUp = levelUpMoves.filter(
    (m) => !GENERIC_MOVES.has(m.move.name)
  );
  const nonGenericAll = rawMoves.filter((m) => !GENERIC_MOVES.has(m.move.name));

  let pool = nonGenericLevelUp;
  if (pool.length < 2) {
    pool = nonGenericAll;
  }
  if (pool.length < 2) {
    pool = levelUpMoves;
  }
  if (pool.length < 2) {
    pool = rawMoves;
  }

  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, 2).map((m) => m.move.name);
}

async function fetchMoveHint(slug: string): Promise<PokemonMoveHint> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/move/${slug}`);
    if (!res.ok) throw new Error('Move fetch failed');
    const data = (await res.json()) as PokeApiMoveDetail;
    const enName =
      data.names?.find((n) => n.language.name === 'en')?.name ??
      formatMoveName(slug);
    return {
      slug,
      name: enName,
      damageClass: data.damage_class?.name ?? 'status',
      power: data.power,
      pp: data.pp,
    };
  } catch {
    return {
      slug,
      name: formatMoveName(slug),
      damageClass: 'status',
      power: null,
      pp: null,
    };
  }
}

function buildFourChoices(
  target: PokemonRosterItem,
  roster: PokemonRosterItem[]
): PokemonRosterItem[] {
  const sameGen = roster.filter(
    (r) => r.id !== target.id && r.generation === target.generation
  );
  const pool = sameGen.length >= 12 ? sameGen : roster.filter((r) => r.id !== target.id);
  const distractors = shuffleArray(pool).slice(0, 3);
  return shuffleArray([target, ...distractors]);
}

export async function fetchPokemonRoundData(
  target: PokemonRosterItem,
  roster: PokemonRosterItem[]
): Promise<PokemonRoundData> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${target.id}`);
  if (!res.ok) {
    throw new Error(`Falha ao carregar dados de ${target.displayName}.`);
  }
  const data = (await res.json()) as PokeApiPokemonDetail;

  const types = [...data.types]
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name);

  const selectedMoveSlugs = selectTwoOfficialMoves(data.moves);
  const moveHints = await Promise.all(selectedMoveSlugs.map(fetchMoveHint));

  // If a Pokémon (e.g. Ditto or Unown) genuinely learns only 1 official move
  const firstMove: PokemonMoveHint = moveHints[0] ?? {
    slug: 'struggle',
    name: 'Struggle',
    damageClass: 'physical',
    power: 50,
    pp: 1,
  };
  const secondMove: PokemonMoveHint = moveHints[1] ?? {
    slug: 'unique-move',
    name: `${firstMove.name} (único ataque oficial)`,
    damageClass: firstMove.damageClass,
    power: firstMove.power,
    pp: firstMove.pp,
  };

  const artworkUrl =
    data.sprites?.other?.['official-artwork']?.front_default ||
    data.sprites?.other?.home?.front_default ||
    data.sprites?.front_default ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${target.id}.png`;

  const fallbackSpriteUrl =
    data.sprites?.front_default ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${target.id}.png`;

  const cryUrl =
    data.cries?.latest ||
    data.cries?.legacy ||
    `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${target.id}.ogg`;

  const silhouetteDataUrl = await generateSilhouetteDataUrl(artworkUrl);

  return {
    roster: target,
    heightMeters: Number((data.height / 10).toFixed(1)),
    weightKg: Number((data.weight / 10).toFixed(1)),
    types,
    moves: [firstMove, secondMove],
    cryUrl,
    artworkUrl,
    fallbackSpriteUrl,
    silhouetteDataUrl,
    choices: buildFourChoices(target, roster),
  };
}

export function pickRandomPokemon(
  roster: PokemonRosterItem[],
  usedIds: Set<number>
): PokemonRosterItem {
  const available = roster.filter((p) => !usedIds.has(p.id));
  const pool = available.length > 0 ? available : roster;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}
