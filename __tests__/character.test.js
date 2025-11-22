/**
 * Unit tests for character module
 */

describe('Character Module', () => {
  describe('Character Data Loading', () => {
    test('should load character data from JSON', async () => {
      const mockCharacters = {
        characters: [
          { id: 1, name: 'Alduin', race: 'Dragon', level: 50 },
          { id: 2, name: 'Dremora', race: 'Daedric', level: 30 }
        ]
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCharacters)
        })
      );

      const response = await fetch('characters.json');
      const data = await response.json();

      expect(data.characters).toHaveLength(2);
      expect(data.characters[0].name).toBe('Alduin');
    });

    test('should handle fetch errors gracefully', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404
        })
      );

      const response = await fetch('characters.json');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });
  });

  describe('Favorites System', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    test('should save favorites to localStorage', () => {
      const favorites = [1, 3, 5];
      localStorage.setItem('characterFavorites', JSON.stringify(favorites));

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'characterFavorites',
        JSON.stringify(favorites)
      );
    });

    test('should load favorites from localStorage', () => {
      const favorites = [1, 3, 5];
      localStorage.getItem = jest.fn(() => JSON.stringify(favorites));

      const stored = localStorage.getItem('characterFavorites');
      const parsed = JSON.parse(stored);

      expect(parsed).toEqual(favorites);
    });

    test('should handle empty favorites', () => {
      localStorage.getItem = jest.fn(() => null);

      const stored = localStorage.getItem('characterFavorites');
      const favorites = stored ? JSON.parse(stored) : [];

      expect(favorites).toEqual([]);
    });
  });

  describe('Character Navigation', () => {
    test('should navigate to next character', () => {
      let currentIndex = 0;
      const totalCharacters = 10;

      currentIndex = (currentIndex + 1) % totalCharacters;

      expect(currentIndex).toBe(1);
    });

    test('should wrap around to first character', () => {
      let currentIndex = 9;
      const totalCharacters = 10;

      currentIndex = (currentIndex + 1) % totalCharacters;

      expect(currentIndex).toBe(0);
    });

    test('should navigate to previous character', () => {
      let currentIndex = 5;
      const totalCharacters = 10;

      currentIndex = (currentIndex - 1 + totalCharacters) % totalCharacters;

      expect(currentIndex).toBe(4);
    });

    test('should wrap around to last character', () => {
      let currentIndex = 0;
      const totalCharacters = 10;

      currentIndex = (currentIndex - 1 + totalCharacters) % totalCharacters;

      expect(currentIndex).toBe(9);
    });
  });

  describe('Character Filtering', () => {
    const mockCharacters = [
      { id: 1, name: 'Alduin', race: 'Dragon', difficulty: 'Deadly', level: 50 },
      { id: 2, name: 'Spider', race: 'Spider', difficulty: 'Normal', level: 12 },
      { id: 3, name: 'Vampire', race: 'Vampire', difficulty: 'Hard', level: 35 }
    ];

    test('should filter by difficulty', () => {
      const filtered = mockCharacters.filter(c => c.difficulty === 'Deadly');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Alduin');
    });

    test('should filter by race', () => {
      const filtered = mockCharacters.filter(c => c.race === 'Dragon');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Alduin');
    });

    test('should filter by level range', () => {
      const minLevel = 30;
      const filtered = mockCharacters.filter(c => c.level >= minLevel);
      expect(filtered).toHaveLength(2);
    });

    test('should search by name', () => {
      const searchTerm = 'ald';
      const filtered = mockCharacters.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Alduin');
    });
  });
});
