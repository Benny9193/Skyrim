#!/usr/bin/env node

/**
 * Generate statistics about the character database
 * Usage: node scripts/stats.js
 */

const fs = require('fs');
const path = require('path');

const CHARACTERS_PATH = path.join(__dirname, '../characters.json');

function generateStats() {
  console.log('═'.repeat(60));
  console.log('📊 Skyrim Bestiary Statistics');
  console.log('═'.repeat(60));
  console.log('');

  let characters;
  try {
    const data = fs.readFileSync(CHARACTERS_PATH, 'utf8');
    characters = JSON.parse(data);
  } catch (error) {
    console.error('❌ Failed to read characters.json:', error.message);
    process.exit(1);
  }

  // Basic stats
  console.log('📈 Overview');
  console.log('─'.repeat(60));
  console.log(`Total Characters: ${characters.length}`);
  console.log('');

  // By difficulty
  console.log('⚔️  By Difficulty');
  console.log('─'.repeat(60));
  const byDifficulty = {};
  characters.forEach(c => {
    byDifficulty[c.difficulty] = (byDifficulty[c.difficulty] || 0) + 1;
  });
  Object.entries(byDifficulty)
    .sort((a, b) => {
      const order = { 'Easy': 1, 'Normal': 2, 'Hard': 3, 'Deadly': 4 };
      return order[a[0]] - order[b[0]];
    })
    .forEach(([difficulty, count]) => {
      const percentage = ((count / characters.length) * 100).toFixed(1);
      const bar = '█'.repeat(Math.round(count / 2));
      console.log(`${difficulty.padEnd(10)} ${count.toString().padStart(2)} (${percentage}%) ${bar}`);
    });
  console.log('');

  // By race
  console.log('🏃 By Race');
  console.log('─'.repeat(60));
  const byRace = {};
  characters.forEach(c => {
    byRace[c.race] = (byRace[c.race] || 0) + 1;
  });
  Object.entries(byRace)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([race, count]) => {
      console.log(`${race.padEnd(20)} ${count}`);
    });
  console.log('');

  // By faction
  console.log('🏰 By Faction');
  console.log('─'.repeat(60));
  const byFaction = {};
  characters.forEach(c => {
    byFaction[c.faction] = (byFaction[c.faction] || 0) + 1;
  });
  Object.entries(byFaction)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([faction, count]) => {
      console.log(`${faction.padEnd(25)} ${count}`);
    });
  console.log('');

  // Level distribution
  console.log('📊 Level Distribution');
  console.log('─'.repeat(60));
  const levels = characters.map(c => c.level).sort((a, b) => a - b);
  const min = Math.min(...levels);
  const max = Math.max(...levels);
  const avg = (levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(1);
  const median = levels[Math.floor(levels.length / 2)];

  console.log(`Min Level:    ${min}`);
  console.log(`Max Level:    ${max}`);
  console.log(`Average:      ${avg}`);
  console.log(`Median:       ${median}`);
  console.log('');

  // Level ranges
  const ranges = {
    '1-10': 0,
    '11-20': 0,
    '21-30': 0,
    '31-40': 0,
    '41-50': 0
  };
  characters.forEach(c => {
    const level = c.level;
    if (level <= 10) ranges['1-10']++;
    else if (level <= 20) ranges['11-20']++;
    else if (level <= 30) ranges['21-30']++;
    else if (level <= 40) ranges['31-40']++;
    else ranges['41-50']++;
  });
  Object.entries(ranges).forEach(([range, count]) => {
    const bar = '▓'.repeat(Math.round(count / 2));
    console.log(`Level ${range.padEnd(8)} ${count.toString().padStart(2)} ${bar}`);
  });
  console.log('');

  // Average stats
  console.log('💪 Average Stats');
  console.log('─'.repeat(60));
  const avgHealth = (characters.reduce((sum, c) => sum + c.stats.health, 0) / characters.length).toFixed(1);
  const avgMagicka = (characters.reduce((sum, c) => sum + c.stats.magicka, 0) / characters.length).toFixed(1);
  const avgStamina = (characters.reduce((sum, c) => sum + c.stats.stamina, 0) / characters.length).toFixed(1);

  console.log(`Health:       ${avgHealth}`);
  console.log(`Magicka:      ${avgMagicka}`);
  console.log(`Stamina:      ${avgStamina}`);
  console.log('');

  // Top 5 most powerful
  console.log('👑 Top 5 Most Powerful (by level)');
  console.log('─'.repeat(60));
  characters
    .sort((a, b) => b.level - a.level)
    .slice(0, 5)
    .forEach((c, i) => {
      console.log(`${i + 1}. ${c.name.padEnd(25)} Lvl ${c.level} (${c.difficulty})`);
    });
  console.log('');

  // Skills analysis
  console.log('🎯 Most Common Skills');
  console.log('─'.repeat(60));
  const skillCounts = {};
  characters.forEach(c => {
    c.skills.forEach(skill => {
      skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
    });
  });
  Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([skill, count]) => {
      console.log(`${skill.padEnd(25)} ${count}`);
    });
  console.log('');

  // Content completeness
  console.log('✅ Content Completeness');
  console.log('─'.repeat(60));
  const withDescription = characters.filter(c => c.description && c.description.length > 50).length;
  const withSkills = characters.filter(c => c.skills && c.skills.length > 0).length;
  const withCombat = characters.filter(c => c.combat && c.combat.length > 0).length;

  console.log(`Descriptions (50+ chars): ${withDescription}/${characters.length} (${((withDescription / characters.length) * 100).toFixed(1)}%)`);
  console.log(`With Skills:              ${withSkills}/${characters.length} (${((withSkills / characters.length) * 100).toFixed(1)}%)`);
  console.log(`With Combat Abilities:    ${withCombat}/${characters.length} (${((withCombat / characters.length) * 100).toFixed(1)}%)`);
  console.log('');

  console.log('═'.repeat(60));
}

generateStats();
