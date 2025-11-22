/**
 * Reset database (drop all tables and recreate)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../data/skyrim.db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function reset() {
  console.log('⚠️  WARNING: This will delete ALL data in the database!\n');

  const answer = await question('Are you sure you want to reset the database? (yes/no): ');

  if (answer.toLowerCase() !== 'yes') {
    console.log('\n❌ Reset cancelled\n');
    rl.close();
    return;
  }

  try {
    // Delete database file
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
      console.log('\n✓ Database deleted');
    }

    console.log('✓ Database reset complete');
    console.log('\nRun these commands to set up a fresh database:');
    console.log('  npm run db:migrate');
    console.log('  npm run db:seed\n');
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }

  rl.close();
}

reset();
