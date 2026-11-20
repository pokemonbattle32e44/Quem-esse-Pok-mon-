import type { PokemonRosterItem } from '../types/pokemon';

export function normalizeGuess(input: string): string {
  return input
    .replace(/♀/g, ' f ')
    .replace(/♂/g, ' m ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function compactNormalized(input: string): string {
  return normalizeGuess(input).replace(/\s+/g, '');
}

const SPECIAL_DISPLAY_NAMES: Record<string, string> = {
  'nidoran-f': 'Nidoran♀',
  'nidoran-m': 'Nidoran♂',
  'farfetchd': "Farfetch'd",
  'sirfetchd': "Sirfetch'd",
  'mr-mime': 'Mr. Mime',
  'mr-rime': 'Mr. Rime',
  'mime-jr': 'Mime Jr.',
  'ho-oh': 'Ho-Oh',
  'porygon-z': 'Porygon-Z',
  'porygon2': 'Porygon2',
  'flabebe': 'Flabébé',
  'type-null': 'Type: Null',
  'jangmo-o': 'Jangmo-o',
  'hakamo-o': 'Hakamo-o',
  'kommo-o': 'Kommo-o',
  'tapu-koko': 'Tapu Koko',
  'tapu-lele': 'Tapu Lele',
  'tapu-bulu': 'Tapu Bulu',
  'tapu-fini': 'Tapu Fini',
  'wo-chien': 'Wo-Chien',
  'chien-pao': 'Chien-Pao',
  'ting-lu': 'Ting-Lu',
  'chi-yu': 'Chi-Yu',
};

const PT_EN_ALIASES: Record<string, string[]> = {
  'nidoran-f': ['nidoran f', 'nidoran femea', 'nidoran female', 'nidoran'],
  'nidoran-m': ['nidoran m', 'nidoran macho', 'nidoran male', 'nidoran'],
  'type-null': ['type null', 'codigo nulo', 'codigo: nulo'],
  'great-tusk': ['presa grande', 'grande presa'],
  'scream-tail': ['cauda brilhante', 'cauda estridente'],
  'brute-bonnet': ['capuz bruto', 'cogumelo bruto'],
  'flutter-mane': ['juba tremulante', 'crina flutuante'],
  'slither-wing': ['asa rastejante'],
  'sandy-shocks': ['choque arenoso', 'choques arenosos'],
  'roaring-moon': ['lua estrondosa', 'lua rugidora'],
  'walking-wake': ['onda andante', 'despertar andante'],
  'gouging-fire': ['fogo voraz', 'chama perfurante'],
  'raging-bolt': ['raio furia', 'relampago furioso'],
  'iron-treads': ['trilho ferreo', 'esteira ferrea'],
  'iron-bundle': ['pacote ferreo', 'embrulho ferreo'],
  'iron-hands': ['maos ferreas'],
  'iron-jugulis': ['jugulis ferreo', 'pescoco ferreo'],
  'iron-moth': ['mariposa ferrea'],
  'iron-thorns': ['espinhos ferreos'],
  'iron-valiant': ['valentia ferrea', 'valente ferreo'],
  'iron-leaves': ['folhas ferreas'],
  'iron-boulder': ['rocha ferrea', 'pedregulho ferreo'],
  'iron-crown': ['coroa ferrea'],
};

const SPECIES_CAPITALIZATION_EXCEPTIONS = new Set([
  'ho-oh',
  'porygon-z',
  'jangmo-o',
  'hakamo-o',
  'kommo-o',
  'wo-chien',
  'chien-pao',
  'ting-lu',
  'chi-yu',
]);

function titleCaseWords(slug: string): string {
  return slug
    .split('-')
    .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ');
}

export function formatSpeciesDisplayName(speciesSlug: string): string {
  if (SPECIAL_DISPLAY_NAMES[speciesSlug]) {
    return SPECIAL_DISPLAY_NAMES[speciesSlug];
  }
  if (SPECIES_CAPITALIZATION_EXCEPTIONS.has(speciesSlug)) {
    return speciesSlug
      .split('-')
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join('-');
  }
  return titleCaseWords(speciesSlug);
}

export function getGenerationByDex(dexNumber: number, regionLabel?: string): number {
  if (regionLabel === 'Alola') return 7;
  if (regionLabel === 'Galar') return 8;
  if (regionLabel === 'Hisui') return 8;
  if (regionLabel === 'Paldea') return 9;

  if (dexNumber <= 151) return 1;
  if (dexNumber <= 251) return 2;
  if (dexNumber <= 386) return 3;
  if (dexNumber <= 493) return 4;
  if (dexNumber <= 649) return 5;
  if (dexNumber <= 721) return 6;
  if (dexNumber <= 809) return 7;
  if (dexNumber <= 905) return 8;
  return 9;
}

export function getRegionByDex(dexNumber: number, regionLabel?: string): string {
  if (regionLabel) return regionLabel;

  if (dexNumber <= 151) return 'Kanto';
  if (dexNumber <= 251) return 'Johto';
  if (dexNumber <= 386) return 'Hoenn';
  if (dexNumber <= 493) return 'Sinnoh';
  if (dexNumber <= 649) return 'Unova';
  if (dexNumber <= 721) return 'Kalos';
  if (dexNumber <= 809) return 'Alola';
  if (dexNumber <= 898) return 'Galar';
  if (dexNumber <= 905) return 'Hisui';
  return 'Paldea';
}

export function buildRosterItem(
  id: number,
  dexNumber: number,
  pokemonSlug: string,
  speciesSlug: string
): PokemonRosterItem {
  const baseDisplay = formatSpeciesDisplayName(speciesSlug);
  const baseNormalized = normalizeGuess(baseDisplay);
  const baseAliases = [
    baseNormalized,
    normalizeGuess(speciesSlug),
    ...(PT_EN_ALIASES[speciesSlug] ?? []).map(normalizeGuess),
  ];
  const uniqueBaseAliases = Array.from(new Set(baseAliases.filter(Boolean)));

  let isRegional = false;
  let regionLabel: PokemonRosterItem['regionLabel'];
  let displayName = baseDisplay;
  let englishName = baseDisplay;
  const accepted = new Set<string>();

  if (pokemonSlug.endsWith('-alola')) {
    isRegional = true;
    regionLabel = 'Alola';
    displayName = `${baseDisplay} de Alola`;
    englishName = `Alolan ${baseDisplay}`;
    for (const b of uniqueBaseAliases) {
      accepted.add(`${b} de alola`);
      accepted.add(`${b} alola`);
      accepted.add(`alolan ${b}`);
      accepted.add(`alola ${b}`);
    }
  } else if (pokemonSlug.endsWith('-galar') || pokemonSlug === 'darmanitan-galar-standard') {
    isRegional = true;
    regionLabel = 'Galar';
    displayName = `${baseDisplay} de Galar`;
    englishName = `Galarian ${baseDisplay}`;
    for (const b of uniqueBaseAliases) {
      accepted.add(`${b} de galar`);
      accepted.add(`${b} galar`);
      accepted.add(`galarian ${b}`);
      accepted.add(`galar ${b}`);
    }
  } else if (pokemonSlug.endsWith('-hisui')) {
    isRegional = true;
    regionLabel = 'Hisui';
    displayName = `${baseDisplay} de Hisui`;
    englishName = `Hisuian ${baseDisplay}`;
    for (const b of uniqueBaseAliases) {
      accepted.add(`${b} de hisui`);
      accepted.add(`${b} hisui`);
      accepted.add(`hisuian ${b}`);
      accepted.add(`hisui ${b}`);
    }
  } else if (pokemonSlug.endsWith('-paldea')) {
    isRegional = true;
    regionLabel = 'Paldea';
    displayName = `${baseDisplay} de Paldea`;
    englishName = `Paldean ${baseDisplay}`;
    for (const b of uniqueBaseAliases) {
      accepted.add(`${b} de paldea`);
      accepted.add(`${b} paldea`);
      accepted.add(`paldean ${b}`);
      accepted.add(`paldea ${b}`);
    }
  } else if (pokemonSlug.startsWith('tauros-paldea-')) {
    isRegional = true;
    regionLabel = 'Paldea';
    const breed = pokemonSlug.replace('tauros-paldea-', '').replace('-breed', '');
    const breedPt =
      breed === 'combat' ? 'Combate' : breed === 'blaze' ? 'Chama' : 'Água';
    const breedEn =
      breed === 'combat' ? 'Combat' : breed === 'blaze' ? 'Blaze' : 'Aqua';
    displayName = `Tauros de Paldea (${breedPt})`;
    englishName = `Paldean Tauros (${breedEn})`;
    accepted.add(`tauros de paldea ${normalizeGuess(breedPt)}`);
    accepted.add(`tauros de paldea ${breed}`);
    accepted.add(`paldean tauros ${breed}`);
    accepted.add(`tauros paldea ${breed}`);
    accepted.add(`tauros paldea ${normalizeGuess(breedPt)}`);
  } else {
    for (const b of uniqueBaseAliases) {
      accepted.add(b);
    }
  }

  return {
    id,
    dexNumber,
    slug: pokemonSlug,
    speciesSlug,
    displayName,
    englishName,
    acceptedNames: Array.from(accepted),
    baseSpeciesNames: uniqueBaseAliases,
    isRegional,
    regionLabel,
    regionName: getRegionByDex(dexNumber, regionLabel),
    hasRegionalVariant: isRegional,
    generation: getGenerationByDex(dexNumber, regionLabel),
  };
}

export type GuessCheckResult =
  | { status: 'correct' }
  | { status: 'needs-region'; regionHint: string }
  | { status: 'wrong' };

export function evaluateGuess(rawGuess: string, target: PokemonRosterItem): GuessCheckResult {
  const norm = normalizeGuess(rawGuess);
  const compact = compactNormalized(rawGuess);
  if (!norm) return { status: 'wrong' };

  for (const candidate of target.acceptedNames) {
    if (norm === candidate || compact === candidate.replace(/\s+/g, '')) {
      return { status: 'correct' };
    }
  }

  if (target.isRegional) {
    for (const base of target.baseSpeciesNames) {
      if (norm === base || compact === base.replace(/\s+/g, '')) {
        return {
          status: 'needs-region',
          regionHint: `Quase lá! Esse Pokémon é uma forma regional — especifique a região (de Alola, de Galar, de Hisui ou de Paldea).`,
        };
      }
    }
  }

  return { status: 'wrong' };
}

export const TYPE_PT_MAP: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  normal: { label: 'Normal', bg: '#9099A1', text: '#FFFFFF', border: '#6E7780' },
  fire: { label: 'Fogo', bg: '#E3350D', text: '#FFFFFF', border: '#B92808' },
  water: { label: 'Água', bg: '#2563EB', text: '#FFFFFF', border: '#1D4ED8' },
  grass: { label: 'Planta', bg: '#16A34A', text: '#FFFFFF', border: '#15803D' },
  electric: { label: 'Elétrico', bg: '#EAB308', text: '#0F172A', border: '#CA8A04' },
  ice: { label: 'Gelo', bg: '#0EA5E9', text: '#FFFFFF', border: '#0284C7' },
  fighting: { label: 'Lutador', bg: '#C2410C', text: '#FFFFFF', border: '#9A3412' },
  poison: { label: 'Venenoso', bg: '#9333EA', text: '#FFFFFF', border: '#7E22CE' },
  ground: { label: 'Terrestre', bg: '#B45309', text: '#FFFFFF', border: '#92400E' },
  flying: { label: 'Voador', bg: '#6366F1', text: '#FFFFFF', border: '#4F46E5' },
  psychic: { label: 'Psíquico', bg: '#EC4899', text: '#FFFFFF', border: '#DB2777' },
  bug: { label: 'Inseto', bg: '#65A30D', text: '#FFFFFF', border: '#4D7C0F' },
  rock: { label: 'Pedra', bg: '#A16207', text: '#FFFFFF', border: '#854D0E' },
  ghost: { label: 'Fantasma', bg: '#5B21B6', text: '#FFFFFF', border: '#4C1D95' },
  dragon: { label: 'Dragão', bg: '#1E40AF', text: '#FFFFFF', border: '#1E3A8A' },
  dark: { label: 'Sombrio', bg: '#334155', text: '#FFFFFF', border: '#1E293B' },
  steel: { label: 'Aço', bg: '#475569', text: '#FFFFFF', border: '#334155' },
  fairy: { label: 'Fada', bg: '#DB2777', text: '#FFFFFF', border: '#BE185D' },
};

export function formatMoveName(moveSlug: string): string {
  return moveSlug
    .split('-')
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

export function formatDexNumber(dexNumber: number): string {
  return `#${String(dexNumber).padStart(4, '0')}`;
}
