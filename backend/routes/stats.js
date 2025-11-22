/**
 * Statistics API routes
 */

import express from 'express';
import { getStats } from '../db/database.js';

const router = express.Router();

/**
 * GET /api/stats
 * Get database statistics
 */
router.get('/', (req, res) => {
  try {
    const stats = getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
