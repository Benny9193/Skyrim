/**
 * Skyrim Bestiary Backend API
 * Simple Express.js REST API with SQLite database
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import charactersRouter from './routes/characters.js';
import favoritesRouter from './routes/favorites.js';
import statsRouter from './routes/stats.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(morgan('combined')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/characters', charactersRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/stats', statsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Skyrim Bestiary API',
    version: '1.0.0',
    endpoints: {
      characters: '/api/characters',
      favorites: '/api/favorites',
      stats: '/api/stats',
      health: '/health'
    },
    documentation: '/api/docs'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Documentation
app.get('/api/docs', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'Skyrim Bestiary API',
      version: '1.0.0',
      description: 'REST API for Skyrim creature database'
    },
    paths: {
      '/api/characters': {
        get: {
          summary: 'Get all characters',
          parameters: [
            { name: 'difficulty', in: 'query', schema: { type: 'string' } },
            { name: 'race', in: 'query', schema: { type: 'string' } },
            { name: 'minLevel', in: 'query', schema: { type: 'integer' } },
            { name: 'maxLevel', in: 'query', schema: { type: 'integer' } }
          ]
        },
        post: {
          summary: 'Create new character',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Character' }
              }
            }
          }
        }
      },
      '/api/characters/{id}': {
        get: { summary: 'Get character by ID' },
        put: { summary: 'Update character' },
        delete: { summary: 'Delete character' }
      },
      '/api/stats': {
        get: { summary: 'Get database statistics' }
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: [
      '/api/characters',
      '/api/favorites',
      '/api/stats',
      '/health'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║        🐉 Skyrim Bestiary API Server                     ║
╚═══════════════════════════════════════════════════════════╝

Server running on: http://localhost:${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
Database: SQLite (data/skyrim.db)

Available endpoints:
  → http://localhost:${PORT}/
  → http://localhost:${PORT}/api/characters
  → http://localhost:${PORT}/api/stats
  → http://localhost:${PORT}/health
  → http://localhost:${PORT}/api/docs

Press Ctrl+C to stop
  `);
});

export default app;
