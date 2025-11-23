/**
 * Character API routes
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import {
  getAllCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  searchCharacters
} from '../db/database.js';

const router = express.Router();

/**
 * GET /api/characters
 * Get all characters with optional filters
 */
router.get(
  '/',
  [
    query('difficulty').optional().isIn(['Easy', 'Normal', 'Hard', 'Deadly']),
    query('race').optional().isString(),
    query('minLevel').optional().isInt({ min: 1, max: 100 }),
    query('maxLevel').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString()
  ],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { search, ...filters } = req.query;

      let characters;
      if (search) {
        characters = searchCharacters(search);
      } else {
        characters = getAllCharacters(filters);
      }

      res.json({
        success: true,
        count: characters.length,
        data: characters
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * GET /api/characters/:id
 * Get single character by ID
 */
router.get(
  '/:id',
  [param('id').isInt()],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const character = getCharacterById(req.params.id);

      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Character not found'
        });
      }

      res.json({
        success: true,
        data: character
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * POST /api/characters
 * Create new character
 */
router.post(
  '/',
  [
    body('name').isString().trim().isLength({ min: 2, max: 100 }),
    body('race').isString().trim().isLength({ min: 2, max: 50 }),
    body('level').isInt({ min: 1, max: 100 }),
    body('location').isString().trim().isLength({ min: 2, max: 200 }),
    body('faction').isString().trim().isLength({ min: 2, max: 100 }),
    body('difficulty').isIn(['Easy', 'Normal', 'Hard', 'Deadly']),
    body('description').isString().trim().isLength({ min: 50, max: 1000 }),
    body('stats.health').isInt({ min: 0, max: 100 }),
    body('stats.magicka').isInt({ min: 0, max: 100 }),
    body('stats.stamina').isInt({ min: 0, max: 100 }),
    body('skills').isArray({ min: 1 }),
    body('combat').isArray({ min: 1 })
  ],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const character = createCharacter(req.body);

      res.status(201).json({
        success: true,
        data: character
      });
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        res.status(409).json({
          success: false,
          error: 'Character with this name already exists'
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  }
);

/**
 * PUT /api/characters/:id
 * Update character
 */
router.put(
  '/:id',
  [
    param('id').isInt(),
    body('name').optional().isString().trim().isLength({ min: 2, max: 100 }),
    body('race').optional().isString().trim().isLength({ min: 2, max: 50 }),
    body('level').optional().isInt({ min: 1, max: 100 }),
    body('location').optional().isString().trim(),
    body('faction').optional().isString().trim(),
    body('difficulty').optional().isIn(['Easy', 'Normal', 'Hard', 'Deadly']),
    body('description').optional().isString().trim()
  ],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const character = updateCharacter(req.params.id, req.body);

      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Character not found'
        });
      }

      res.json({
        success: true,
        data: character
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * DELETE /api/characters/:id
 * Delete character
 */
router.delete(
  '/:id',
  [param('id').isInt()],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const deleted = deleteCharacter(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Character not found'
        });
      }

      res.json({
        success: true,
        message: 'Character deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

export default router;
