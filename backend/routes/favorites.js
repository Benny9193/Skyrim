/**
 * Favorites API routes
 */

import express from 'express';
import db from '../db/database.js';

const router = express.Router();

/**
 * GET /api/favorites
 * Get all favorites
 */
router.get('/', (req, res) => {
  try {
    const favorites = db
      .prepare(`
        SELECT c.* FROM characters c
        INNER JOIN favorites f ON c.id = f.character_id
        ORDER BY f.created_at DESC
      `)
      .all();

    res.json({
      success: true,
      count: favorites.length,
      data: favorites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/favorites/:characterId
 * Add character to favorites
 */
router.post('/:characterId', (req, res) => {
  try {
    const { characterId } = req.params;

    // Check if character exists
    const character = db
      .prepare('SELECT id FROM characters WHERE id = ?')
      .get(characterId);

    if (!character) {
      return res.status(404).json({
        success: false,
        error: 'Character not found'
      });
    }

    // Check if already favorited
    const existing = db
      .prepare('SELECT id FROM favorites WHERE character_id = ?')
      .get(characterId);

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Character already in favorites'
      });
    }

    // Add to favorites
    db.prepare('INSERT INTO favorites (character_id) VALUES (?)').run(characterId);

    res.status(201).json({
      success: true,
      message: 'Added to favorites'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/favorites/:characterId
 * Remove character from favorites
 */
router.delete('/:characterId', (req, res) => {
  try {
    const { characterId } = req.params;

    const result = db
      .prepare('DELETE FROM favorites WHERE character_id = ?')
      .run(characterId);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Favorite not found'
      });
    }

    res.json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
