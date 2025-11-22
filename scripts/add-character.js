#!/usr/bin/env node

/**
 * Interactive script to add a new character to characters.json
 * Usage: node scripts/add-character.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CHARACTERS_PATH = path.join(__dirname, '../characters.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function generateSVGPlaceholder(name, color) {
  const emoji = getEmojiForRace(name);
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23${color}' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='30' text-anchor='middle' dominant-baseline='middle' fill='white'%3E${emoji}%3C/text%3E%3C/svg%3E`;
}

function getEmojiForRace(race) {
  const emojiMap = {
    'dragon': '🐉',
    'undead': '💀',
    'vampire': '🦇',
    'werewolf': '🐺',
    'giant': '🗿',
    'troll': '👹',
    'spider': '🕷️',
    'atronach': '⚡',
    'beast': '🐯',
    'dremora': '👿',
    'hagraven': '🦅',
    'falmer': '👽',
    'daedric': '⚙️'
  };

  const raceLower = race.toLowerCase();
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (raceLower.includes(key)) return emoji;
  }
  return '⭐';
}

function getColorForDifficulty(difficulty) {
  const colorMap = {
    'Easy': '44aa44',
    'Normal': '4488ff',
    'Hard': 'ff8844',
    'Deadly': 'ff0000'
  };
  return colorMap[difficulty] || '888888';
}

async function addCharacter() {
  console.log('═'.repeat(60));
  console.log('🐉 Add New Character to Skyrim Bestiary');
  console.log('═'.repeat(60));
  console.log('');

  // Load existing characters
  let characters;
  try {
    const data = fs.readFileSync(CHARACTERS_PATH, 'utf8');
    characters = JSON.parse(data);
  } catch (error) {
    console.error('❌ Failed to read characters.json:', error.message);
    process.exit(1);
  }

  const nextId = Math.max(...characters.map(c => c.id)) + 1;

  // Collect character information
  const name = await question('Character name: ');
  const race = await question('Race: ');
  const level = parseInt(await question('Level (1-100): '));
  const location = await question('Location: ');
  const faction = await question('Faction: ');

  console.log('\nDifficulty options: Easy, Normal, Hard, Deadly');
  const difficulty = await question('Difficulty: ');

  const description = await question('Description: ');

  console.log('\n--- Stats (0-100) ---');
  const health = parseInt(await question('Health: '));
  const magicka = parseInt(await question('Magicka: '));
  const stamina = parseInt(await question('Stamina: '));

  console.log('\n--- Skills ---');
  const skillCount = parseInt(await question('How many skills? '));
  const skills = [];
  for (let i = 0; i < skillCount; i++) {
    console.log(`\nSkill ${i + 1}:`);
    const skillName = await question('  Name: ');
    const skillLevel = await question('  Level (Novice/Adept/Expert/Legendary): ');
    skills.push({ name: skillName, level: skillLevel });
  }

  console.log('\n--- Combat Abilities ---');
  const combatCount = parseInt(await question('How many combat abilities? '));
  const combat = [];
  for (let i = 0; i < combatCount; i++) {
    console.log(`\nAbility ${i + 1}:`);
    const abilityName = await question('  Name: ');
    const abilityValue = await question('  Value (e.g., "30-40" or "50"): ');
    const abilityType = await question('  Type (Physical/Fire/Frost/Shock/Poison/Magic): ');
    combat.push({ name: abilityName, value: abilityValue, type: abilityType });
  }

  // Generate placeholder image
  const color = getColorForDifficulty(difficulty);
  const imagePath = generateSVGPlaceholder(race, color);

  // Create character object
  const newCharacter = {
    id: nextId,
    name,
    race,
    level,
    location,
    faction,
    difficulty,
    description,
    imagePath,
    modelPath: 'enhanced_mesh.obj',
    stats: { health, magicka, stamina },
    skills,
    combat
  };

  // Preview
  console.log('\n═'.repeat(60));
  console.log('Preview:');
  console.log('═'.repeat(60));
  console.log(JSON.stringify(newCharacter, null, 2));
  console.log('');

  const confirm = await question('Add this character? (y/n): ');

  if (confirm.toLowerCase() === 'y') {
    characters.push(newCharacter);

    // Sort by ID
    characters.sort((a, b) => a.id - b.id);

    // Write back to file
    fs.writeFileSync(CHARACTERS_PATH, JSON.stringify(characters, null, 2) + '\n');

    console.log(`\n✅ Added ${name} (ID: ${nextId})`);
    console.log(`📊 Total characters: ${characters.length}`);
  } else {
    console.log('\n❌ Cancelled');
  }

  rl.close();
}

addCharacter().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
