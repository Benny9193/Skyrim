#!/usr/bin/env node

/**
 * Export characters database to Markdown format
 * Usage: node scripts/export-markdown.js > CREATURES.md
 */

const fs = require('fs');
const path = require('path');

const CHARACTERS_PATH = path.join(__dirname, '../characters.json');

function exportToMarkdown() {
  let characters;
  try {
    const data = fs.readFileSync(CHARACTERS_PATH, 'utf8');
    characters = JSON.parse(data);
  } catch (error) {
    console.error('❌ Failed to read characters.json:', error.message);
    process.exit(1);
  }

  console.log('# Skyrim Bestiary - Creature Database');
  console.log('');
  console.log(`Total creatures: **${characters.length}**`);
  console.log('');
  console.log('---');
  console.log('');

  // Sort by difficulty then level
  const difficultyOrder = { 'Deadly': 0, 'Hard': 1, 'Normal': 2, 'Easy': 3 };
  characters.sort((a, b) => {
    const diffCompare = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    if (diffCompare !== 0) return diffCompare;
    return b.level - a.level;
  });

  let currentDifficulty = null;

  characters.forEach((character, index) => {
    // Add difficulty header
    if (character.difficulty !== currentDifficulty) {
      currentDifficulty = character.difficulty;
      console.log('');
      console.log(`## ${getDifficultyEmoji(currentDifficulty)} ${currentDifficulty} Tier`);
      console.log('');
    }

    // Character header
    console.log(`### ${index + 1}. ${character.name}`);
    console.log('');

    // Basic info table
    console.log('| Attribute | Value |');
    console.log('|-----------|-------|');
    console.log(`| **Race** | ${character.race} |`);
    console.log(`| **Level** | ${character.level} |`);
    console.log(`| **Location** | ${character.location} |`);
    console.log(`| **Faction** | ${character.faction} |`);
    console.log('');

    // Description
    console.log('**Description:**');
    console.log(character.description);
    console.log('');

    // Stats
    console.log('**Stats:**');
    console.log('| Health | Magicka | Stamina |');
    console.log('|--------|---------|---------|');
    console.log(`| ${character.stats.health} | ${character.stats.magicka} | ${character.stats.stamina} |`);
    console.log('');

    // Skills
    if (character.skills && character.skills.length > 0) {
      console.log('**Skills:**');
      character.skills.forEach(skill => {
        console.log(`- **${skill.name}** - ${skill.level}`);
      });
      console.log('');
    }

    // Combat
    if (character.combat && character.combat.length > 0) {
      console.log('**Combat Abilities:**');
      console.log('| Ability | Damage/Effect | Type |');
      console.log('|---------|---------------|------|');
      character.combat.forEach(ability => {
        console.log(`| ${ability.name} | ${ability.value} | ${ability.type} |`);
      });
      console.log('');
    }

    console.log('---');
    console.log('');
  });

  // Summary statistics
  console.log('## Summary Statistics');
  console.log('');

  const byDifficulty = {};
  characters.forEach(c => {
    byDifficulty[c.difficulty] = (byDifficulty[c.difficulty] || 0) + 1;
  });

  console.log('### By Difficulty');
  console.log('');
  console.log('| Difficulty | Count |');
  console.log('|------------|-------|');
  Object.entries(byDifficulty)
    .sort((a, b) => difficultyOrder[a[0]] - difficultyOrder[b[0]])
    .forEach(([difficulty, count]) => {
      console.log(`| ${getDifficultyEmoji(difficulty)} ${difficulty} | ${count} |`);
    });
  console.log('');

  console.log('### Level Distribution');
  console.log('');
  const levels = characters.map(c => c.level);
  const min = Math.min(...levels);
  const max = Math.max(...levels);
  const avg = (levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(1);

  console.log(`- **Minimum Level:** ${min}`);
  console.log(`- **Maximum Level:** ${max}`);
  console.log(`- **Average Level:** ${avg}`);
  console.log('');

  console.log('---');
  console.log('');
  console.log('*Generated automatically from characters.json*');
}

function getDifficultyEmoji(difficulty) {
  const emojiMap = {
    'Easy': '🟢',
    'Normal': '🔵',
    'Hard': '🟠',
    'Deadly': '🔴'
  };
  return emojiMap[difficulty] || '⚪';
}

exportToMarkdown();
