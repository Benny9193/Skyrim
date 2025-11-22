/**
 * Favorites Service (TypeScript example)
 * Manages user favorites with localStorage persistence
 */

export class FavoritesService {
  private favorites: Set<number>;
  private readonly storageKey = 'characterFavorites';

  constructor() {
    this.favorites = new Set();
    this.load();
  }

  /**
   * Add character to favorites
   */
  add(characterId: number): void {
    this.favorites.add(characterId);
    this.save();
    this.dispatchEvent('favoriteAdded', characterId);
  }

  /**
   * Remove character from favorites
   */
  remove(characterId: number): void {
    this.favorites.delete(characterId);
    this.save();
    this.dispatchEvent('favoriteRemoved', characterId);
  }

  /**
   * Check if character is favorite
   */
  has(characterId: number): boolean {
    return this.favorites.has(characterId);
  }

  /**
   * Toggle favorite status
   */
  toggle(characterId: number): boolean {
    if (this.has(characterId)) {
      this.remove(characterId);
      return false;
    } else {
      this.add(characterId);
      return true;
    }
  }

  /**
   * Get all favorites
   */
  getAll(): number[] {
    return Array.from(this.favorites);
  }

  /**
   * Get favorites count
   */
  count(): number {
    return this.favorites.size;
  }

  /**
   * Clear all favorites
   */
  clear(): void {
    this.favorites.clear();
    this.save();
    this.dispatchEvent('favoritesCleared', null);
  }

  /**
   * Load favorites from localStorage
   */
  private load(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed: number[] = JSON.parse(stored);
        this.favorites = new Set(parsed);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      this.favorites = new Set();
    }
  }

  /**
   * Save favorites to localStorage
   */
  private save(): void {
    try {
      const array = Array.from(this.favorites);
      localStorage.setItem(this.storageKey, JSON.stringify(array));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }

  /**
   * Dispatch custom event
   */
  private dispatchEvent(type: string, detail: any): void {
    const event = new CustomEvent(type, { detail });
    window.dispatchEvent(event);
  }

  /**
   * Export favorites as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }

  /**
   * Import favorites from JSON
   */
  importFromJSON(json: string): void {
    try {
      const parsed: number[] = JSON.parse(json);
      if (Array.isArray(parsed)) {
        this.favorites = new Set(parsed);
        this.save();
        this.dispatchEvent('favoritesImported', parsed.length);
      }
    } catch (error) {
      console.error('Failed to import favorites:', error);
      throw new Error('Invalid JSON format');
    }
  }
}

// Create singleton instance
export const favoritesService = new FavoritesService();

// Export types
export type FavoriteEventType = 'favoriteAdded' | 'favoriteRemoved' | 'favoritesCleared' | 'favoritesImported';
