/**
 * Database connection and utilities
 * Using better-sqlite3 for synchronous SQLite operations
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '..', 'data', 'skyrim.db');

// Ensure data directory exists
const dataDir = join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

console.log(`✓ Database connected: ${DB_PATH}`);

/**
 * Initialize database schema
 */
export function initializeDatabase() {
  console.log('Initializing database schema...');

  // Characters table
  db.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      race TEXT NOT NULL,
      level INTEGER NOT NULL,
      location TEXT NOT NULL,
      faction TEXT NOT NULL,
      difficulty TEXT NOT NULL CHECK(difficulty IN ('Easy', 'Normal', 'Hard', 'Deadly')),
      description TEXT NOT NULL,
      image_path TEXT,
      model_path TEXT,
      stats_health INTEGER NOT NULL,
      stats_magicka INTEGER NOT NULL,
      stats_stamina INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Skills table (one-to-many)
  db.exec(`
    CREATE TABLE IF NOT EXISTS character_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      level TEXT NOT NULL CHECK(level IN ('Novice', 'Adept', 'Expert', 'Legendary')),
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
    );
  `);

  // Combat abilities table (one-to-many)
  db.exec(`
    CREATE TABLE IF NOT EXISTS character_combat (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      value TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('Physical', 'Fire', 'Frost', 'Shock', 'Poison', 'Magic', 'Heal')),
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
    );
  `);

  // Favorites table
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER NOT NULL,
      user_id INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
    );
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_characters_difficulty ON characters(difficulty);
    CREATE INDEX IF NOT EXISTS idx_characters_race ON characters(race);
    CREATE INDEX IF NOT EXISTS idx_characters_level ON characters(level);
    CREATE INDEX IF NOT EXISTS idx_favorites_character_id ON favorites(character_id);
  `);

  console.log('✓ Database schema initialized');
}

/**
 * Get all characters with their skills and combat abilities
 */
export function getAllCharacters(filters = {}) {
  let query = 'SELECT * FROM characters WHERE 1=1';
  const params = [];

  if (filters.difficulty) {
    query += ' AND difficulty = ?';
    params.push(filters.difficulty);
  }

  if (filters.race) {
    query += ' AND race = ?';
    params.push(filters.race);
  }

  if (filters.minLevel) {
    query += ' AND level >= ?';
    params.push(filters.minLevel);
  }

  if (filters.maxLevel) {
    query += ' AND level <= ?';
    params.push(filters.maxLevel);
  }

  query += ' ORDER BY level DESC, name ASC';

  const characters = db.prepare(query).all(...params);

  // Attach skills and combat for each character
  return characters.map(char => ({
    ...char,
    stats: {
      health: char.stats_health,
      magicka: char.stats_magicka,
      stamina: char.stats_stamina
    },
    skills: getCharacterSkills(char.id),
    combat: getCharacterCombat(char.id)
  }));
}

/**
 * Get character by ID
 */
export function getCharacterById(id) {
  const char = db.prepare('SELECT * FROM characters WHERE id = ?').get(id);

  if (!char) return null;

  return {
    ...char,
    stats: {
      health: char.stats_health,
      magicka: char.stats_magicka,
      stamina: char.stats_stamina
    },
    skills: getCharacterSkills(char.id),
    combat: getCharacterCombat(char.id)
  };
}

/**
 * Get character skills
 */
function getCharacterSkills(characterId) {
  return db
    .prepare('SELECT name, level FROM character_skills WHERE character_id = ?')
    .all(characterId);
}

/**
 * Get character combat abilities
 */
function getCharacterCombat(characterId) {
  return db
    .prepare('SELECT name, value, type FROM character_combat WHERE character_id = ?')
    .all(characterId);
}

/**
 * Create new character
 */
export function createCharacter(data) {
  const insert = db.prepare(`
    INSERT INTO characters (
      name, race, level, location, faction, difficulty, description,
      image_path, model_path, stats_health, stats_magicka, stats_stamina
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    data.name,
    data.race,
    data.level,
    data.location,
    data.faction,
    data.difficulty,
    data.description,
    data.imagePath || null,
    data.modelPath || null,
    data.stats.health,
    data.stats.magicka,
    data.stats.stamina
  );

  const characterId = result.lastInsertRowid;

  // Insert skills
  if (data.skills && data.skills.length > 0) {
    const insertSkill = db.prepare(
      'INSERT INTO character_skills (character_id, name, level) VALUES (?, ?, ?)'
    );

    for (const skill of data.skills) {
      insertSkill.run(characterId, skill.name, skill.level);
    }
  }

  // Insert combat abilities
  if (data.combat && data.combat.length > 0) {
    const insertCombat = db.prepare(
      'INSERT INTO character_combat (character_id, name, value, type) VALUES (?, ?, ?, ?)'
    );

    for (const ability of data.combat) {
      insertCombat.run(characterId, ability.name, ability.value, ability.type);
    }
  }

  return getCharacterById(characterId);
}

/**
 * Update character
 */
export function updateCharacter(id, data) {
  const update = db.prepare(`
    UPDATE characters SET
      name = ?, race = ?, level = ?, location = ?, faction = ?,
      difficulty = ?, description = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  update.run(
    data.name,
    data.race,
    data.level,
    data.location,
    data.faction,
    data.difficulty,
    data.description,
    id
  );

  return getCharacterById(id);
}

/**
 * Delete character
 */
export function deleteCharacter(id) {
  const result = db.prepare('DELETE FROM characters WHERE id = ?').run(id);
  return result.changes > 0;
}

/**
 * Get database statistics
 */
export function getStats() {
  const totalCharacters = db
    .prepare('SELECT COUNT(*) as count FROM characters')
    .get().count;

  const byDifficulty = db
    .prepare('SELECT difficulty, COUNT(*) as count FROM characters GROUP BY difficulty')
    .all();

  const byRace = db
    .prepare('SELECT race, COUNT(*) as count FROM characters GROUP BY race ORDER BY count DESC')
    .all();

  const levelStats = db
    .prepare('SELECT MIN(level) as min, MAX(level) as max, AVG(level) as avg FROM characters')
    .get();

  return {
    total: totalCharacters,
    byDifficulty,
    byRace,
    levelStats: {
      min: levelStats.min,
      max: levelStats.max,
      average: Math.round(levelStats.avg * 10) / 10
    }
  };
}

/**
 * Search characters
 */
export function searchCharacters(query) {
  const sql = `
    SELECT * FROM characters
    WHERE name LIKE ? OR description LIKE ? OR race LIKE ?
    ORDER BY name ASC
  `;

  const searchTerm = `%${query}%`;
  const characters = db.prepare(sql).all(searchTerm, searchTerm, searchTerm);

  return characters.map(char => ({
    ...char,
    stats: {
      health: char.stats_health,
      magicka: char.stats_magicka,
      stamina: char.stats_stamina
    },
    skills: getCharacterSkills(char.id),
    combat: getCharacterCombat(char.id)
  }));
}

export default db;
