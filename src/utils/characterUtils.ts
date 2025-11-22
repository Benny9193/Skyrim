/**
 * Utility functions for character management (TypeScript example)
 * This demonstrates how to migrate from JavaScript to TypeScript
 */

import type {
  Character,
  FilterOptions,
  SortOptions,
  Difficulty
} from '../types/index.js';

/**
 * Filter characters based on criteria
 */
export function filterCharacters(
  characters: Character[],
  filters: FilterOptions
): Character[] {
  return characters.filter(character => {
    // Filter by race
    if (filters.race && character.race !== filters.race) {
      return false;
    }

    // Filter by difficulty
    if (filters.difficulty && character.difficulty !== filters.difficulty) {
      return false;
    }

    // Filter by location
    if (filters.location && !character.location.includes(filters.location)) {
      return false;
    }

    // Filter by faction
    if (filters.faction && character.faction !== filters.faction) {
      return false;
    }

    // Filter by level range
    if (filters.minLevel && character.level < filters.minLevel) {
      return false;
    }

    if (filters.maxLevel && character.level > filters.maxLevel) {
      return false;
    }

    return true;
  });
}

/**
 * Sort characters
 */
export function sortCharacters(
  characters: Character[],
  sort: SortOptions
): Character[] {
  const sorted = [...characters];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sort.by) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;

      case 'level':
        comparison = a.level - b.level;
        break;

      case 'difficulty':
        const difficultyOrder: Record<Difficulty, number> = {
          'Easy': 1,
          'Normal': 2,
          'Hard': 3,
          'Deadly': 4
        };
        comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        break;
    }

    return sort.order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Search characters by name or description
 */
export function searchCharacters(
  characters: Character[],
  query: string
): Character[] {
  const searchTerm = query.toLowerCase();

  return characters.filter(character => {
    return (
      character.name.toLowerCase().includes(searchTerm) ||
      character.description.toLowerCase().includes(searchTerm) ||
      character.race.toLowerCase().includes(searchTerm)
    );
  });
}

/**
 * Get unique values for filter options
 */
export function getUniqueRaces(characters: Character[]): string[] {
  return [...new Set(characters.map(c => c.race))].sort();
}

export function getUniqueFactions(characters: Character[]): string[] {
  return [...new Set(characters.map(c => c.faction))].sort();
}

export function getUniqueLocations(characters: Character[]): string[] {
  const locations = new Set<string>();
  characters.forEach(c => {
    c.location.split(',').forEach(loc => locations.add(loc.trim()));
  });
  return [...locations].sort();
}

/**
 * Get level range
 */
export function getLevelRange(characters: Character[]): { min: number; max: number } {
  const levels = characters.map(c => c.level);
  return {
    min: Math.min(...levels),
    max: Math.max(...levels)
  };
}

/**
 * Calculate average stats
 */
export function calculateAverageStats(characters: Character[]) {
  const total = characters.reduce(
    (acc, c) => ({
      health: acc.health + c.stats.health,
      magicka: acc.magicka + c.stats.magicka,
      stamina: acc.stamina + c.stats.stamina
    }),
    { health: 0, magicka: 0, stamina: 0 }
  );

  const count = characters.length;

  return {
    health: Math.round(total.health / count),
    magicka: Math.round(total.magicka / count),
    stamina: Math.round(total.stamina / count)
  };
}

/**
 * Get characters by difficulty tier
 */
export function getCharactersByDifficulty(
  characters: Character[],
  difficulty: Difficulty
): Character[] {
  return characters.filter(c => c.difficulty === difficulty);
}

/**
 * Find character by ID
 */
export function findCharacterById(
  characters: Character[],
  id: number
): Character | undefined {
  return characters.find(c => c.id === id);
}

/**
 * Get random character
 */
export function getRandomCharacter(characters: Character[]): Character {
  const randomIndex = Math.floor(Math.random() * characters.length);
  return characters[randomIndex];
}

/**
 * Get related characters (same race or faction)
 */
export function getRelatedCharacters(
  characters: Character[],
  character: Character,
  limit: number = 5
): Character[] {
  return characters
    .filter(c => c.id !== character.id)
    .filter(c => c.race === character.race || c.faction === character.faction)
    .slice(0, limit);
}

/**
 * Format character level display
 */
export function formatLevel(level: number): string {
  return `Level ${level}`;
}

/**
 * Get difficulty color
 */
export function getDifficultyColor(difficulty: Difficulty): string {
  const colors: Record<Difficulty, string> = {
    'Easy': '#44aa44',
    'Normal': '#4488ff',
    'Hard': '#ff8844',
    'Deadly': '#ff0000'
  };
  return colors[difficulty];
}

/**
 * Get difficulty emoji
 */
export function getDifficultyEmoji(difficulty: Difficulty): string {
  const emojis: Record<Difficulty, string> = {
    'Easy': '🟢',
    'Normal': '🔵',
    'Hard': '🟠',
    'Deadly': '🔴'
  };
  return emojis[difficulty];
}
