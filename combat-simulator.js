// Combat Simulator JavaScript

// Global state
let allCharacters = [];
let fighter1 = null;
let fighter2 = null;
let battleInProgress = false;
let turnCount = 0;

// Combat state
let fighter1CurrentHealth = 0;
let fighter2CurrentHealth = 0;
let fighter1MaxHealth = 0;
let fighter2MaxHealth = 0;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadCharacterData();
  populateCreatureSelects();
  setupEventListeners();
  hideLoader();
});

// Hide page loader
function hideLoader() {
  const loader = document.querySelector('.page-loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 500);
  }
}

// Load character data from JSON
async function loadCharacterData() {
  try {
    const response = await fetch('characters.json');
    if (!response.ok) throw new Error('Failed to load characters.json');
    allCharacters = await response.json();

    if (!Array.isArray(allCharacters)) {
      allCharacters = [];
    }
  } catch (error) {
    console.error('Could not load characters.json:', error);
    addLogEntry('error', '⚠️', 'Failed to load creature data. Please refresh the page.');
  }
}

// Populate creature select dropdowns
function populateCreatureSelects() {
  const creature1Select = document.getElementById('creature1Select');
  const creature2Select = document.getElementById('creature2Select');

  if (!creature1Select || !creature2Select) return;

  // Sort creatures by name
  const sortedCreatures = [...allCharacters].sort((a, b) => a.name.localeCompare(b.name));

  // Populate both selects
  sortedCreatures.forEach(creature => {
    const option1 = document.createElement('option');
    option1.value = creature.id;
    option1.textContent = `${creature.name} (${creature.race} - Lvl ${creature.level})`;
    creature1Select.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = creature.id;
    option2.textContent = `${creature.name} (${creature.race} - Lvl ${creature.level})`;
    creature2Select.appendChild(option2);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Creature selection
  document.getElementById('creature1Select')?.addEventListener('change', e => {
    selectCreature(1, e.target.value);
  });

  document.getElementById('creature2Select')?.addEventListener('change', e => {
    selectCreature(2, e.target.value);
  });

  // Control buttons
  document.getElementById('randomEncounterBtn')?.addEventListener('click', selectRandomCreatures);
  document.getElementById('startBattleBtn')?.addEventListener('click', startBattle);
  document.getElementById('resetBtn')?.addEventListener('click', resetBattle);
  document.getElementById('clearLogBtn')?.addEventListener('click', clearBattleLog);

  // Modal buttons
  document.getElementById('closeModalBtn')?.addEventListener('click', closeVictoryModal);
  document.getElementById('rematchBtn')?.addEventListener('click', () => {
    closeVictoryModal();
    resetBattle();
  });

  // Close modal on overlay click
  document.querySelector('.modal-overlay')?.addEventListener('click', closeVictoryModal);
}

// Select a creature for a fighter
function selectCreature(fighterNumber, creatureId) {
  if (battleInProgress) {
    addLogEntry('info', 'ℹ️', 'Cannot change creatures during battle.');
    return;
  }

  const creature = allCharacters.find(c => c.id === parseInt(creatureId));
  if (!creature) return;

  if (fighterNumber === 1) {
    fighter1 = creature;
    displayCreature(1, creature);
  } else {
    fighter2 = creature;
    displayCreature(2, creature);
  }

  updateStartButtonState();
}

// Display creature information
function displayCreature(fighterNumber, creature) {
  const prefix = `creature${fighterNumber}`;

  // Show creature display
  const display = document.getElementById(`${prefix}Display`);
  if (display) display.style.display = 'block';

  // Update image
  const image = document.getElementById(`${prefix}Image`);
  if (image && creature.imagePath) {
    image.innerHTML = `<img src="${creature.imagePath}" alt="${creature.name}">`;
  }

  // Update basic info
  document.getElementById(`${prefix}Name`).textContent = creature.name;
  document.getElementById(`${prefix}Race`).textContent = creature.race;
  document.getElementById(`${prefix}Level`).textContent = `Level ${creature.level}`;
  document.getElementById(`${prefix}Difficulty`).textContent = creature.difficulty;

  // Update stats
  const stats = creature.stats || { health: 100, magicka: 50, stamina: 50 };
  const healthValue = Math.round((stats.health / 100) * 500); // Scale to combat-appropriate values

  document.getElementById(`${prefix}HealthValue`).textContent = `${healthValue}/${healthValue}`;
  document.getElementById(`${prefix}MagickaValue`).textContent = stats.magicka;
  document.getElementById(`${prefix}StaminaValue`).textContent = stats.stamina;

  // Reset stat bars to 100%
  document.getElementById(`${prefix}HealthBar`).style.width = '100%';
  document.getElementById(`${prefix}MagickaBar`).style.width = '100%';
  document.getElementById(`${prefix}StaminaBar`).style.width = '100%';

  // Display combat abilities
  displayAbilities(fighterNumber, creature);

  // Update fighter status
  updateFighterStatus(fighterNumber, 'ready');
}

// Display creature abilities
function displayAbilities(fighterNumber, creature) {
  const abilitiesList = document.getElementById(`creature${fighterNumber}Abilities`);
  if (!abilitiesList) return;

  abilitiesList.innerHTML = '';

  if (creature.combat && Array.isArray(creature.combat)) {
    creature.combat.forEach(ability => {
      const abilityDiv = document.createElement('div');
      abilityDiv.className = 'ability-item';
      abilityDiv.innerHTML = `
                <span class="ability-name">${ability.name}</span>
                <span class="ability-value">${ability.value}</span>
                <span class="ability-type">${ability.type}</span>
            `;
      abilitiesList.appendChild(abilityDiv);
    });
  }
}

// Update fighter status badge
function updateFighterStatus(fighterNumber, status) {
  const statusEl = document.getElementById(`fighter${fighterNumber}Status`);
  const panel = document.getElementById(`fighter${fighterNumber}Panel`);

  if (!statusEl || !panel) return;

  // Remove all status classes
  statusEl.className = 'fighter-status';
  panel.className = 'fighter-panel';

  // Add new status
  const statusText = {
    ready: 'Ready',
    fighting: 'Fighting',
    defeated: 'Defeated',
    victorious: 'Victorious',
  };

  statusEl.textContent = statusText[status] || '';
  statusEl.classList.add(status);

  if (status === 'fighting') {
    panel.classList.add('active');
  } else if (status === 'defeated') {
    panel.classList.add('defeated');
  }
}

// Update start button state
function updateStartButtonState() {
  const startBtn = document.getElementById('startBattleBtn');
  if (!startBtn) return;

  if (fighter1 && fighter2 && !battleInProgress) {
    startBtn.disabled = false;
  } else {
    startBtn.disabled = true;
  }
}

// Select random creatures
function selectRandomCreatures() {
  if (battleInProgress) {
    addLogEntry('info', 'ℹ️', 'Cannot change creatures during battle.');
    return;
  }

  if (allCharacters.length < 2) {
    addLogEntry('error', '⚠️', 'Not enough creatures available.');
    return;
  }

  // Select two different random creatures
  const randomIndex1 = Math.floor(Math.random() * allCharacters.length);
  let randomIndex2;
  do {
    randomIndex2 = Math.floor(Math.random() * allCharacters.length);
  } while (randomIndex2 === randomIndex1);

  const creature1 = allCharacters[randomIndex1];
  const creature2 = allCharacters[randomIndex2];

  // Update selects
  document.getElementById('creature1Select').value = creature1.id;
  document.getElementById('creature2Select').value = creature2.id;

  // Display creatures
  selectCreature(1, creature1.id);
  selectCreature(2, creature2.id);

  addLogEntry('info', '🎲', `Random encounter: ${creature1.name} vs ${creature2.name}!`);
}

// Start battle
function startBattle() {
  if (!fighter1 || !fighter2) return;
  if (battleInProgress) return;

  battleInProgress = true;
  turnCount = 0;

  // Hide start button, show reset button
  document.getElementById('startBattleBtn').style.display = 'none';
  document.getElementById('resetBtn').style.display = 'inline-block';

  // Initialize health
  fighter1MaxHealth = Math.round((fighter1.stats.health / 100) * 500);
  fighter2MaxHealth = Math.round((fighter2.stats.health / 100) * 500);
  fighter1CurrentHealth = fighter1MaxHealth;
  fighter2CurrentHealth = fighter2MaxHealth;

  // Update status
  updateFighterStatus(1, 'fighting');
  updateFighterStatus(2, 'fighting');

  // Add battle start log
  addLogEntry('info', '⚔️', `Battle begins! ${fighter1.name} vs ${fighter2.name}!`);
  addLogEntry('info', 'ℹ️', `${fighter1.name} has ${fighter1CurrentHealth} HP`);
  addLogEntry('info', 'ℹ️', `${fighter2.name} has ${fighter2CurrentHealth} HP`);

  // Start combat loop
  setTimeout(() => executeTurn(), 1500);
}

// Execute a combat turn
function executeTurn() {
  if (!battleInProgress) return;

  turnCount++;
  addLogEntry('info', '🔄', `--- Turn ${turnCount} ---`);

  // Fighter 1 attacks Fighter 2
  const damage1 = calculateDamage(fighter1, fighter2);
  fighter2CurrentHealth = Math.max(0, fighter2CurrentHealth - damage1);

  addLogEntry('attack', '⚔️', `${fighter1.name} attacks ${fighter2.name} for ${damage1} damage!`);
  updateHealthBar(2, fighter2CurrentHealth, fighter2MaxHealth);

  // Check if fighter 2 is defeated
  if (fighter2CurrentHealth <= 0) {
    endBattle(1);
    return;
  }

  // Fighter 2 attacks Fighter 1
  setTimeout(() => {
    const damage2 = calculateDamage(fighter2, fighter1);
    fighter1CurrentHealth = Math.max(0, fighter1CurrentHealth - damage2);

    addLogEntry('attack', '⚔️', `${fighter2.name} attacks ${fighter1.name} for ${damage2} damage!`);
    updateHealthBar(1, fighter1CurrentHealth, fighter1MaxHealth);

    // Check if fighter 1 is defeated
    if (fighter1CurrentHealth <= 0) {
      endBattle(2);
      return;
    }

    // Continue to next turn
    setTimeout(() => executeTurn(), 1500);
  }, 1000);
}

// Calculate damage from attacker to defender
function calculateDamage(attacker, defender) {
  // Get attacker's combat abilities
  const combatAbilities = attacker.combat || [];

  // Find a random attack ability
  const attackAbilities = combatAbilities.filter(
    ability =>
      !ability.type.toLowerCase().includes('resistance') &&
      !ability.type.toLowerCase().includes('armor')
  );

  if (attackAbilities.length === 0) {
    // Default damage if no abilities
    return Math.floor(Math.random() * 20) + 10;
  }

  // Select random attack
  const attack = attackAbilities[Math.floor(Math.random() * attackAbilities.length)];

  // Parse damage value
  let baseDamage = 0;
  const damageStr = attack.value.toString();

  if (damageStr.includes('-')) {
    // Range damage (e.g., "30-45")
    const [min, max] = damageStr.split('-').map(n => parseInt(n));
    baseDamage = Math.floor(Math.random() * (max - min + 1)) + min;
  } else if (damageStr.includes('/')) {
    // Damage per second (e.g., "5/sec") - use as base
    baseDamage = parseInt(damageStr) * 5;
  } else {
    // Fixed damage
    baseDamage = parseInt(damageStr) || 20;
  }

  // Apply level modifier
  const levelModifier = 1 + attacker.level / 100;
  baseDamage = Math.floor(baseDamage * levelModifier);

  // Check for critical hit (10% chance, 1.5x damage)
  const isCritical = Math.random() < 0.1;
  if (isCritical) {
    baseDamage = Math.floor(baseDamage * 1.5);
    setTimeout(() => {
      addLogEntry('damage', '💥', `Critical hit!`);
    }, 300);
  }

  // Apply defender's armor/resistance (reduce damage by 10-30%)
  const defenderArmor = defender.combat?.find(
    c => c.type.toLowerCase().includes('armor') || c.name.toLowerCase().includes('armor')
  );

  if (defenderArmor) {
    const armorValue = parseInt(defenderArmor.value) || 0;
    const damageReduction = Math.min(0.3, armorValue / 500); // Max 30% reduction
    baseDamage = Math.floor(baseDamage * (1 - damageReduction));
  }

  // Ensure minimum damage of 1
  return Math.max(1, baseDamage);
}

// Update health bar
function updateHealthBar(fighterNumber, currentHealth, maxHealth) {
  const healthBar = document.getElementById(`creature${fighterNumber}HealthBar`);
  const healthValue = document.getElementById(`creature${fighterNumber}HealthValue`);

  if (!healthBar || !healthValue) return;

  const percentage = Math.max(0, (currentHealth / maxHealth) * 100);
  healthBar.style.width = `${percentage}%`;
  healthValue.textContent = `${Math.max(0, Math.round(currentHealth))}/${maxHealth}`;
}

// End battle
function endBattle(winnerNumber) {
  battleInProgress = false;

  const winner = winnerNumber === 1 ? fighter1 : fighter2;
  const loser = winnerNumber === 1 ? fighter2 : fighter1;

  // Update statuses
  updateFighterStatus(winnerNumber, 'victorious');
  updateFighterStatus(winnerNumber === 1 ? 2 : 1, 'defeated');

  // Add victory log
  addLogEntry('victory', '🏆', `${winner.name} is victorious! ${loser.name} has been defeated.`);
  addLogEntry('info', 'ℹ️', `Battle ended after ${turnCount} turns.`);

  // Show victory modal
  setTimeout(() => {
    showVictoryModal(winner, loser, turnCount);
  }, 1500);
}

// Show victory modal
function showVictoryModal(winner, loser, turns) {
  const modal = document.getElementById('victoryModal');
  const title = document.getElementById('victoryTitle');
  const icon = document.getElementById('victoryIcon');
  const message = document.getElementById('victoryMessage');
  const stats = document.getElementById('battleStats');

  if (!modal) return;

  title.textContent = `${winner.name} Wins!`;
  icon.textContent = '🏆';
  message.textContent = `${winner.name} has defeated ${loser.name} in epic combat!`;

  const remainingHealth = winner === fighter1 ? fighter1CurrentHealth : fighter2CurrentHealth;
  const maxHealth = winner === fighter1 ? fighter1MaxHealth : fighter2MaxHealth;
  const healthPercentage = Math.round((remainingHealth / maxHealth) * 100);

  stats.innerHTML = `
        <div class="battle-stat-row">
            <span class="battle-stat-label">Winner:</span>
            <span class="battle-stat-value">${winner.name}</span>
        </div>
        <div class="battle-stat-row">
            <span class="battle-stat-label">Defeated:</span>
            <span class="battle-stat-value">${loser.name}</span>
        </div>
        <div class="battle-stat-row">
            <span class="battle-stat-label">Turns:</span>
            <span class="battle-stat-value">${turns}</span>
        </div>
        <div class="battle-stat-row">
            <span class="battle-stat-label">Remaining Health:</span>
            <span class="battle-stat-value">${Math.round(remainingHealth)} (${healthPercentage}%)</span>
        </div>
        <div class="battle-stat-row">
            <span class="battle-stat-label">Difficulty:</span>
            <span class="battle-stat-value">${winner.difficulty}</span>
        </div>
    `;

  modal.style.display = 'flex';
}

// Close victory modal
function closeVictoryModal() {
  const modal = document.getElementById('victoryModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Reset battle
function resetBattle() {
  battleInProgress = false;
  turnCount = 0;

  // Reset buttons
  document.getElementById('startBattleBtn').style.display = 'inline-block';
  document.getElementById('resetBtn').style.display = 'none';

  // Reset fighter statuses
  if (fighter1) {
    updateFighterStatus(1, 'ready');
    displayCreature(1, fighter1);
  }
  if (fighter2) {
    updateFighterStatus(2, 'ready');
    displayCreature(2, fighter2);
  }

  updateStartButtonState();
  addLogEntry('info', '🔄', 'Battle reset. Ready for a new encounter!');
}

// Clear battle log
function clearBattleLog() {
  const battleLog = document.getElementById('battleLog');
  if (!battleLog) return;

  battleLog.innerHTML = `
        <div class="log-entry log-entry--info">
            <span class="log-icon">ℹ️</span>
            <span class="log-text">Battle log cleared.</span>
        </div>
    `;
}

// Add entry to battle log
function addLogEntry(type, icon, text) {
  const battleLog = document.getElementById('battleLog');
  if (!battleLog) return;

  const entry = document.createElement('div');
  entry.className = `log-entry log-entry--${type}`;
  entry.innerHTML = `
        <span class="log-icon">${icon}</span>
        <span class="log-text">${text}</span>
    `;

  battleLog.appendChild(entry);

  // Auto-scroll to bottom
  battleLog.scrollTop = battleLog.scrollHeight;
}

// Sample character data (fallback)
function getSampleCharacterData() {
  return [
    {
      id: 1,
      name: 'Alduin',
      race: 'Dragon',
      level: 50,
      difficulty: 'Deadly',
      imagePath:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23660000' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='80' text-anchor='middle' dominant-baseline='middle'%3E🐉%3C/text%3E%3C/svg%3E",
      stats: { health: 100, magicka: 75, stamina: 85 },
      combat: [
        { name: 'Claw Damage', value: '45-65', type: 'Physical' },
        { name: 'Fire Breath', value: '80', type: 'Fire' },
      ],
    },
  ];
}
