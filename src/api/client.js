/**
 * API Client for Skyrim Bestiary Backend
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Character API
 */
export const characterAPI = {
  /**
   * Get all characters with optional filters
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/characters?${params}` : '/characters';
    return apiFetch(endpoint);
  },

  /**
   * Get single character by ID
   */
  async getById(id) {
    return apiFetch(`/characters/${id}`);
  },

  /**
   * Search characters
   */
  async search(query) {
    return apiFetch(`/characters?search=${encodeURIComponent(query)}`);
  },

  /**
   * Create new character
   */
  async create(characterData) {
    return apiFetch('/characters', {
      method: 'POST',
      body: JSON.stringify(characterData)
    });
  },

  /**
   * Update character
   */
  async update(id, characterData) {
    return apiFetch(`/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(characterData)
    });
  },

  /**
   * Delete character
   */
  async delete(id) {
    return apiFetch(`/characters/${id}`, {
      method: 'DELETE'
    });
  }
};

/**
 * Favorites API
 */
export const favoritesAPI = {
  /**
   * Get all favorites
   */
  async getAll() {
    return apiFetch('/favorites');
  },

  /**
   * Add to favorites
   */
  async add(characterId) {
    return apiFetch(`/favorites/${characterId}`, {
      method: 'POST'
    });
  },

  /**
   * Remove from favorites
   */
  async remove(characterId) {
    return apiFetch(`/favorites/${characterId}`, {
      method: 'DELETE'
    });
  }
};

/**
 * Stats API
 */
export const statsAPI = {
  /**
   * Get database statistics
   */
  async get() {
    return apiFetch('/stats');
  }
};

/**
 * Health check
 */
export async function healthCheck() {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Export everything
export default {
  characters: characterAPI,
  favorites: favoritesAPI,
  stats: statsAPI,
  healthCheck
};
