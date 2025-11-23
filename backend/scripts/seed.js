/**
 * Seed database with characters from JSON file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, createCharacter } from '../db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to characters.json in parent directory
const CHARACTERS_JSON = path.join(__dirname, '../../characters.json');

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Initialize database schema
  initializeDatabase();

  // Read characters from JSON
  let characters;
  try {
    const data = fs.readFileSync(CHARACTERS_JSON, 'utf8');
    characters = JSON.parse(data);
    console.log(`✓ Loaded ${characters.length} characters from JSON\n`);
  } catch (error) {
    console.error('❌ Failed to read characters.json:', error.message);
    process.exit(1);
  }

  // Insert each character
  let successCount = 0;
  let errorCount = 0;

  for (const char of characters) {
    try {
      createCharacter(char);
      console.log(`✓ Added: ${char.name} (Level ${char.level}, ${char.difficulty})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to add ${char.name}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 Seed Summary');
  console.log('═'.repeat(60));
  console.log(`✓ Successfully added: ${successCount}`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount}`);
  }
  console.log('═'.repeat(60));
  console.log('\n✅ Database seeding complete!\n');
}

seed().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
