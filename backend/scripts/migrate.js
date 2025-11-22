/**
 * Run database migrations
 */

import { initializeDatabase } from '../db/database.js';

function migrate() {
  console.log('🔧 Running database migrations...\n');

  try {
    initializeDatabase();
    console.log('\n✅ Migrations complete!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
