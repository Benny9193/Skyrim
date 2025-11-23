#!/usr/bin/env node

/**
 * Validate characters.json for data integrity
 * Usage: node scripts/validate-characters.js
 */

const fs = require('fs');
const path = require('path');

const CHARACTERS_PATH = path.join(__dirname, '../characters.json');

// Required fields for each character
const REQUIRED_FIELDS = [
  'id',
  'name',
  'race',
  'level',
  'location',
  'faction',
  'difficulty',
  'description',
  'imagePath',
  'modelPath',
  'stats',
  'skills',
  'combat'
];

// Valid difficulty levels
const VALID_DIFFICULTIES = ['Easy', 'Normal', 'Hard', 'Deadly'];

// Valid stat names
const VALID_STATS = ['health', 'magicka', 'stamina'];

function validateCharacters() {
  console.log('🔍 Validating characters.json...\n');

  let characters;
  try {
    const data = fs.readFileSync(CHARACTERS_PATH, 'utf8');
    characters = JSON.parse(data);
  } catch (error) {
    console.error('❌ Failed to read or parse characters.json:', error.message);
    process.exit(1);
  }

  if (!Array.isArray(characters)) {
    console.error('❌ characters.json must contain an array');
    process.exit(1);
  }

  let errors = 0;
  let warnings = 0;
  const ids = new Set();
  const names = new Set();

  characters.forEach((character, index) => {
    const characterNum = index + 1;
    console.log(`Checking character ${characterNum}/${characters.length}: ${character.name || 'UNNAMED'}`);

    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      if (!(field in character)) {
        console.error(`  ❌ Missing required field: ${field}`);
        errors++;
      }
    });

    // Check ID uniqueness
    if (character.id) {
      if (ids.has(character.id)) {
        console.error(`  ❌ Duplicate ID: ${character.id}`);
        errors++;
      }
      ids.add(character.id);
    }

    // Check name uniqueness
    if (character.name) {
      if (names.has(character.name)) {
        console.warn(`  ⚠️  Duplicate name: ${character.name}`);
        warnings++;
      }
      names.add(character.name);
    }

    // Validate difficulty
    if (character.difficulty && !VALID_DIFFICULTIES.includes(character.difficulty)) {
      console.error(`  ❌ Invalid difficulty: ${character.difficulty}`);
      console.error(`     Valid options: ${VALID_DIFFICULTIES.join(', ')}`);
      errors++;
    }

    // Validate level
    if (character.level) {
      if (typeof character.level !== 'number' || character.level < 1 || character.level > 100) {
        console.error(`  ❌ Invalid level: ${character.level} (must be 1-100)`);
        errors++;
      }
    }

    // Validate stats
    if (character.stats) {
      VALID_STATS.forEach(stat => {
        if (!(stat in character.stats)) {
          console.error(`  ❌ Missing stat: ${stat}`);
          errors++;
        } else {
          const value = character.stats[stat];
          if (typeof value !== 'number' || value < 0 || value > 100) {
            console.error(`  ❌ Invalid ${stat} value: ${value} (must be 0-100)`);
            errors++;
          }
        }
      });
    }

    // Validate skills array
    if (character.skills) {
      if (!Array.isArray(character.skills)) {
        console.error(`  ❌ skills must be an array`);
        errors++;
      } else if (character.skills.length === 0) {
        console.warn(`  ⚠️  No skills defined`);
        warnings++;
      } else {
        character.skills.forEach((skill, i) => {
          if (!skill.name || !skill.level) {
            console.error(`  ❌ Skill ${i + 1} missing name or level`);
            errors++;
          }
        });
      }
    }

    // Validate combat array
    if (character.combat) {
      if (!Array.isArray(character.combat)) {
        console.error(`  ❌ combat must be an array`);
        errors++;
      } else if (character.combat.length === 0) {
        console.warn(`  ⚠️  No combat abilities defined`);
        warnings++;
      } else {
        character.combat.forEach((ability, i) => {
          if (!ability.name || !ability.value || !ability.type) {
            console.error(`  ❌ Combat ability ${i + 1} missing name, value, or type`);
            errors++;
          }
        });
      }
    }

    // Check description length
    if (character.description && character.description.length < 50) {
      console.warn(`  ⚠️  Short description (${character.description.length} chars, recommend 50+)`);
      warnings++;
    }

    // Check for placeholder paths
    if (character.imagePath && character.imagePath.includes('placeholder')) {
      console.warn(`  ⚠️  Using placeholder image`);
      warnings++;
    }

    console.log('');
  });

  // Summary
  console.log('═'.repeat(60));
  console.log(`📊 Validation Summary`);
  console.log('═'.repeat(60));
  console.log(`Total characters: ${characters.length}`);
  console.log(`Errors: ${errors}`);
  console.log(`Warnings: ${warnings}`);

  if (errors === 0 && warnings === 0) {
    console.log('\n✅ All characters valid! No issues found.');
    return 0;
  } else if (errors === 0) {
    console.log(`\n⚠️  Validation passed with ${warnings} warning(s).`);
    return 0;
  } else {
    console.log(`\n❌ Validation failed with ${errors} error(s) and ${warnings} warning(s).`);
    return 1;
  }
}

// Run validation
const exitCode = validateCharacters();
process.exit(exitCode);
