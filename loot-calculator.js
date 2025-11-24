// Loot Calculator JavaScript

// Global state
let allCharacters = [];
let selectedCreature = null;
let compareCreature = null;
let luckModifier = 0;
let simulationHistory = [];
let currentResults = null;
let comparisonMode = false;

// Loot table system - maps creature types to loot tables
const LOOT_TABLES = {
  Dragon: {
    items: [
      { name: 'Dragon Bones', icon: '🦴', probability: 100, value: 250, rarity: 'common', category: 'Materials' },
      { name: 'Dragon Scales', icon: '⚗️', probability: 100, value: 150, rarity: 'common', category: 'Materials' },
      { name: 'Dragon Soul', icon: '✨', probability: 100, value: 1000, rarity: 'legendary', category: 'Soul Gems' },
      { name: 'Dragon Heartscales', icon: '💎', probability: 15, value: 500, rarity: 'rare', category: 'Materials' },
      { name: 'Enchanted Weapon', icon: '⚔️', probability: 25, value: 800, rarity: 'epic', category: 'Weapons' },
      { name: 'Gold Coins', icon: '💰', probability: 100, value: 500, rarity: 'common', category: 'Currency' },
    ],
  },
  Undead: {
    items: [
      { name: 'Ancient Nord Sword', icon: '⚔️', probability: 60, value: 200, rarity: 'uncommon', category: 'Weapons' },
      { name: 'Ancient Nord Helmet', icon: '🛡️', probability: 40, value: 180, rarity: 'uncommon', category: 'Armor' },
      { name: 'Dragon Priest Mask', icon: '👺', probability: 5, value: 5000, rarity: 'legendary', category: 'Armor' },
      { name: 'Soul Gem (Greater)', icon: '💎', probability: 30, value: 300, rarity: 'rare', category: 'Soul Gems' },
      { name: 'Ancient Runes', icon: '📜', probability: 45, value: 100, rarity: 'uncommon', category: 'Scrolls' },
      { name: 'Gold Coins', icon: '💰', probability: 100, value: 150, rarity: 'common', category: 'Currency' },
    ],
  },
  Vampire: {
    items: [
      { name: 'Vampire Dust', icon: '🧪', probability: 90, value: 200, rarity: 'common', category: 'Alchemy' },
      { name: 'Blood Potion', icon: '🩸', probability: 70, value: 120, rarity: 'uncommon', category: 'Potions' },
      { name: 'Vampire Armor', icon: '🦇', probability: 25, value: 600, rarity: 'rare', category: 'Armor' },
      { name: 'Ring of Erudite', icon: '💍', probability: 8, value: 2500, rarity: 'epic', category: 'Jewelry' },
      { name: 'Vampiric Drain Spell Tome', icon: '📖', probability: 15, value: 400, rarity: 'rare', category: 'Spells' },
      { name: 'Gold Coins', icon: '💰', probability: 100, value: 200, rarity: 'common', category: 'Currency' },
    ],
  },
  Lycanthrope: {
    items: [
      { name: 'Wolf Pelt', icon: '🐺', probability: 95, value: 50, rarity: 'common', category: 'Materials' },
      { name: 'Beast Blood', icon: '🩸', probability: 80, value: 180, rarity: 'uncommon', category: 'Alchemy' },
      { name: 'Werewolf Claw', icon: '🦴', probability: 40, value: 300, rarity: 'rare', category: 'Materials' },
      { name: 'Ring of Hircine', icon: '💍', probability: 3, value: 3000, rarity: 'legendary', category: 'Jewelry' },
      { name: 'Savage Strike Tome', icon: '📖', probability: 20, value: 350, rarity: 'rare', category: 'Spells' },
      { name: 'Gold Coins', icon: '💰', probability: 100, value: 100, rarity: 'common', category: 'Currency' },
    ],
  },
  Draugr: {
    items: [
      { name: 'Ancient Nord Weapon', icon: '⚔️', probability: 65, value: 150, rarity: 'uncommon', category: 'Weapons' },
      { name: 'Draugr Armor Piece', icon: '🛡️', probability: 50, value: 120, rarity: 'uncommon', category: 'Armor' },
      { name: 'Soul Gem (Petty)', icon: '💎', probability: 35, value: 50, rarity: 'common', category: 'Soul Gems' },
      { name: 'Enchanted Draugr Bow', icon: '🏹', probability: 12, value: 700, rarity: 'rare', category: 'Weapons' },
      { name: 'Rusted Coins', icon: '💰', probability: 100, value: 75, rarity: 'common', category: 'Currency' },
    ],
  },
  Dremora: {
    items: [
      { name: 'Daedric Sword', icon: '⚔️', probability: 20, value: 1500, rarity: 'epic', category: 'Weapons' },
      { name: 'Daedra Heart', icon: '❤️', probability: 60, value: 500, rarity: 'rare', category: 'Alchemy' },
      { name: 'Daedric Armor Piece', icon: '🛡️', probability: 15, value: 1200, rarity: 'epic', category: 'Armor' },
      { name: 'Black Soul Gem', icon: '💎', probability: 40, value: 800, rarity: 'rare', category: 'Soul Gems' },
      { name: 'Conjuration Spell Tome', icon: '📖', probability: 25, value: 450, rarity: 'rare', category: 'Spells' },
      { name: 'Gold Coins', icon: '💰', probability: 100, value: 300, rarity: 'common', category: 'Currency' },
    ],
  },
  Giant: {
    items: [
      { name: 'Giant Toe', icon: '🦶', probability: 95, value: 200, rarity: 'common', category: 'Alchemy' },
      { name: 'Giant Club', icon: '🏏', probability: 40, value: 400, rarity: 'uncommon', category: 'Weapons' },
      { name: 'Mammoth Tusk', icon: '🦷', probability: 30, value: 150, rarity: 'uncommon', category: 'Materials' },
      { name: 'Giant Enchanted Club', icon: '⚡', probability: 5, value: 2000, rarity: 'legendary', category: 'Weapons' },
      { name: 'Gold Coins', icon: '💰', probability: 100, value: 250, rarity: 'common', category: 'Currency' },
    ],
  },
  Hagraven: {
    items: [
      { name: 'Hagraven Feathers', icon: '🪶', probability: 90, value: 120, rarity: 'common', category: 'Alchemy' },
      { name: 'Hagraven Claw', icon: '🦅', probability: 70, value: 180, rarity: 'uncommon', category: 'Alchemy' },
      { name: 'Spell Tome (Random)', icon: '📖', probability: 45, value: 300, rarity: 'rare', category: 'Spells' },
      { name: 'Enchanted Ring', icon: '💍', probability: 20, value: 600, rarity: 'epic', category: 'Jewelry' },
      { name: 'Soul Gem (Grand)', icon: '💎', probability: 25, value: 500, rarity: 'rare', category: 'Soul Gems' },
      { name: 'Gold Coins', icon: '💰', probability: 100, value: 180, rarity: 'common', category: 'Currency' },
    ],
  },
  Troll: {
    items: [
      { name: 'Troll Fat', icon: '🧪', probability: 95, value: 90, rarity: 'common', category: 'Alchemy' },
      { name: 'Troll Skull', icon: '💀', probability: 60, value: 150, rarity: 'uncommon', category: 'Materials' },
      { name: 'Regeneration Potion', icon: '🧪', probability: 30, value: 200, rarity: 'rare', category: 'Potions' },
      { name: 'Enchanted Troll Heart', icon: '❤️', probability: 8, value: 800, rarity: 'epic', category: 'Alchemy' },
      { name: 'Gold Coins', icon: '💰', probability: 100, value: 120, rarity: 'common', category: 'Currency' },
    ],
  },
  Default: {
    items: [
      { name: 'Hide', icon: '🦴', probability: 80, value: 30, rarity: 'common', category: 'Materials' },
      { name: 'Bone', icon: '🦴', probability: 70, value: 25, rarity: 'common', category: 'Materials' },
      { name: 'Minor Healing Potion', icon: '🧪', probability: 40, value: 50, rarity: 'uncommon', category: 'Potions' },
      { name: 'Iron Weapon', icon: '⚔️', probability: 35, value: 100, rarity: 'uncommon', category: 'Weapons' },
      { name: 'Soul Gem (Petty)', icon: '💎', probability: 15, value: 50, rarity: 'rare', category: 'Soul Gems' },
      { name: 'Gold Coins', icon: '💰', probability: 100, value: 80, rarity: 'common', category: 'Currency' },
    ],
  },
};

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
    showError('Failed to load creature data. Please refresh the page.');
  }
}

// Populate creature select dropdowns
function populateCreatureSelects() {
  const creatureSelect = document.getElementById('creatureSelect');
  const compareCreatureSelect = document.getElementById('compareCreatureSelect');

  if (!creatureSelect) return;

  // Sort creatures by name
  const sortedCreatures = [...allCharacters].sort((a, b) => a.name.localeCompare(b.name));

  // Populate both selects
  sortedCreatures.forEach((creature) => {
    const option1 = document.createElement('option');
    option1.value = creature.id;
    option1.textContent = `${creature.name} (${creature.race} - Lvl ${creature.level})`;
    creatureSelect.appendChild(option1);

    if (compareCreatureSelect) {
      const option2 = document.createElement('option');
      option2.value = creature.id;
      option2.textContent = `${creature.name} (${creature.race} - Lvl ${creature.level})`;
      compareCreatureSelect.appendChild(option2);
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Creature selection
  const creatureSelect = document.getElementById('creatureSelect');
  if (creatureSelect) {
    creatureSelect.addEventListener('change', (e) => {
      selectCreature(e.target.value);
    });
  }

  // Luck slider
  const luckSlider = document.getElementById('luckSlider');
  if (luckSlider) {
    luckSlider.addEventListener('input', (e) => {
      luckModifier = parseInt(e.target.value);
      document.getElementById('luckValue').textContent = luckModifier;
    });
  }

  // Simulation buttons
  document.getElementById('simulate1Btn')?.addEventListener('click', () => runSimulation(1));
  document.getElementById('simulate10Btn')?.addEventListener('click', () => runSimulation(10));
  document.getElementById('simulate100Btn')?.addEventListener('click', () => runSimulation(100));
  document.getElementById('simulate1000Btn')?.addEventListener('click', () => runSimulation(1000));

  // Export button
  document.getElementById('exportBtn')?.addEventListener('click', exportResults);

  // Comparison mode
  document.getElementById('toggleComparisonBtn')?.addEventListener('click', toggleComparisonMode);
  document
    .getElementById('compareCreatureSelect')
    ?.addEventListener('change', handleCompareCreatureChange);
  document.getElementById('runComparisonBtn')?.addEventListener('click', runComparison);

  // History
  document.getElementById('clearHistoryBtn')?.addEventListener('click', clearHistory);
}

// Select creature
function selectCreature(creatureId) {
  if (!creatureId) {
    selectedCreature = null;
    displayEmptyCreatureInfo();
    return;
  }

  selectedCreature = allCharacters.find((c) => c.id === parseInt(creatureId));
  if (selectedCreature) {
    displayCreatureInfo(selectedCreature);
  }
}

// Display creature info
function displayCreatureInfo(creature) {
  const creatureInfo = document.getElementById('creatureInfo');
  if (!creatureInfo) return;

  const lootTable = getLootTable(creature.race);

  const html = `
    <div class="creature-info fade-in">
      <div class="creature-header">
        <img src="${creature.imagePath || ''}" alt="${creature.name}" class="creature-avatar" />
        <div class="creature-details">
          <h3>${creature.name}</h3>
          <div class="creature-meta">
            ${creature.race} • Level ${creature.level} • ${creature.difficulty}
          </div>
        </div>
      </div>
      <div class="loot-table">
        <h4 style="font-size: 14px; font-weight: 600; margin: 0 0 12px; color: var(--color-text);">
          Loot Table
        </h4>
        ${lootTable.items
          .map(
            (item) => `
          <div class="loot-item">
            <div class="loot-item-info">
              <div class="loot-item-icon">${item.icon}</div>
              <div class="loot-item-details">
                <h4>${item.name}</h4>
                <div class="loot-item-type">${item.category} • ${item.value}g</div>
              </div>
            </div>
            <div class="loot-item-probability">
              <div class="probability-value">${item.probability}%</div>
              <div class="rarity-badge rarity-${item.rarity}">${item.rarity}</div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;

  creatureInfo.innerHTML = html;
}

// Display empty creature info
function displayEmptyCreatureInfo() {
  const creatureInfo = document.getElementById('creatureInfo');
  if (!creatureInfo) return;

  creatureInfo.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🐉</div>
      <p>Select a creature to view its loot table</p>
    </div>
  `;
}

// Get loot table for a race
function getLootTable(race) {
  // Check for exact match
  if (LOOT_TABLES[race]) {
    return LOOT_TABLES[race];
  }

  // Check for partial matches
  const raceKeys = Object.keys(LOOT_TABLES);
  for (const key of raceKeys) {
    if (race.includes(key) || key.includes(race)) {
      return LOOT_TABLES[key];
    }
  }

  return LOOT_TABLES.Default;
}

// Run simulation
function runSimulation(killCount) {
  if (!selectedCreature) {
    showError('Please select a creature first');
    return;
  }

  const customKillCount = document.getElementById('killCountInput')?.value;
  if (customKillCount && killCount === 1) {
    killCount = parseInt(customKillCount) || 1;
  }

  const lootTable = getLootTable(selectedCreature.race);
  const results = simulateLoot(lootTable, killCount, luckModifier);

  currentResults = {
    creature: selectedCreature,
    killCount,
    luckModifier,
    results,
    timestamp: new Date(),
  };

  displayResults(currentResults);
  updateChart(results);
  displayStatistics(currentResults);
  addToHistory(currentResults);

  // Enable export button
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) exportBtn.disabled = false;
}

// Simulate loot drops
function simulateLoot(lootTable, killCount, luck) {
  const lootResults = {};
  const categoryTotals = {};
  let totalValue = 0;
  let totalDrops = 0;

  for (let i = 0; i < killCount; i++) {
    lootTable.items.forEach((item) => {
      // Apply luck modifier to probability
      const adjustedProbability = Math.min(100, Math.max(0, item.probability + luck));
      const roll = Math.random() * 100;

      if (roll <= adjustedProbability) {
        // Item dropped
        if (!lootResults[item.name]) {
          lootResults[item.name] = {
            ...item,
            count: 0,
          };
        }
        lootResults[item.name].count++;

        // Track category totals
        if (!categoryTotals[item.category]) {
          categoryTotals[item.category] = 0;
        }
        categoryTotals[item.category]++;

        totalValue += item.value;
        totalDrops++;
      }
    });
  }

  return {
    lootResults,
    categoryTotals,
    totalValue,
    totalDrops,
  };
}

// Display results
function displayResults(data) {
  const resultsContent = document.getElementById('resultsContent');
  if (!resultsContent) return;

  const { creature, killCount, results } = data;
  const { lootResults, categoryTotals, totalValue, totalDrops } = results;

  const sortedLoot = Object.values(lootResults).sort((a, b) => b.count - a.count);
  const rarestItems = sortedLoot.filter((item) => item.rarity === 'legendary' || item.rarity === 'epic');

  let html = `
    <div class="results-summary fade-in">
      <div class="result-stat">
        <span class="result-label">Total Kills</span>
        <span class="result-value">${killCount.toLocaleString()}</span>
      </div>
      <div class="result-stat">
        <span class="result-label">Total Items Dropped</span>
        <span class="result-value result-highlight">${totalDrops.toLocaleString()}</span>
      </div>
      <div class="result-stat">
        <span class="result-label">Total Loot Value</span>
        <span class="result-value">${totalValue.toLocaleString()}g</span>
      </div>
      <div class="result-stat">
        <span class="result-label">Avg. Drops per Kill</span>
        <span class="result-value">${(totalDrops / killCount).toFixed(2)}</span>
      </div>
  `;

  if (rarestItems.length > 0) {
    html += `
      <div class="result-stat">
        <span class="result-label">Rare Items Obtained</span>
        <span class="result-value result-highlight">${rarestItems.reduce((sum, item) => sum + item.count, 0)}</span>
      </div>
    `;
  }

  html += `
      <div class="loot-breakdown">
        <h4>Loot by Category</h4>
  `;

  for (const [category, count] of Object.entries(categoryTotals)) {
    const itemsInCategory = sortedLoot.filter((item) => item.category === category);
    html += `
      <div class="loot-category">
        <div class="category-header">
          <span class="category-name">${category}</span>
          <span class="category-count">${count} items</span>
        </div>
        <div class="category-items">
          ${itemsInCategory
            .map(
              (item) =>
                `<div class="item-badge">${item.icon} ${item.name} ×${item.count}</div>`
            )
            .join('')}
        </div>
      </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  resultsContent.innerHTML = html;
}

// Update chart
function updateChart(results) {
  const canvas = document.getElementById('lootChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const { categoryTotals } = results;

  // Set canvas size
  canvas.width = canvas.offsetWidth;
  canvas.height = 300;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // If no data, show message
  if (Object.keys(categoryTotals).length === 0) {
    ctx.fillStyle = '#888';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No loot data to display', canvas.width / 2, canvas.height / 2);
    return;
  }

  // Draw pie chart
  const colors = [
    '#3b82f6',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
  ];

  const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
  const categories = Object.entries(categoryTotals);

  let currentAngle = -Math.PI / 2;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 20;

  // Draw pie slices
  categories.forEach(([category, count], index) => {
    const sliceAngle = (count / total) * 2 * Math.PI;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();

    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    currentAngle += sliceAngle;
  });

  // Update legend
  updateChartLegend(categories, colors);
}

// Update chart legend
function updateChartLegend(categories, colors) {
  const legend = document.getElementById('chartLegend');
  if (!legend) return;

  const html = categories
    .map(
      ([category, count], index) => `
    <div class="legend-item">
      <div class="legend-color" style="background: ${colors[index % colors.length]}"></div>
      <span>${category} (${count})</span>
    </div>
  `
    )
    .join('');

  legend.innerHTML = html;
}

// Display statistics
function displayStatistics(data) {
  const statsContent = document.getElementById('statsContent');
  if (!statsContent) return;

  const { killCount, results } = data;
  const { lootResults, totalValue, totalDrops } = results;

  const sortedLoot = Object.values(lootResults).sort((a, b) => b.count - a.count);
  const rarestItem = sortedLoot.find((item) => item.rarity === 'legendary') || sortedLoot[0];
  const mostCommonItem = sortedLoot[sortedLoot.length - 1] || sortedLoot[0];

  const html = `
    <div class="stats-grid fade-in">
      <div class="stat-card">
        <div class="stat-value">${(totalDrops / killCount).toFixed(2)}</div>
        <div class="stat-label">Avg Items/Kill</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${(totalValue / killCount).toFixed(0)}g</div>
        <div class="stat-label">Avg Value/Kill</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${rarestItem?.icon || '❓'} ${rarestItem?.count || 0}</div>
        <div class="stat-label">Rarest Drop</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${mostCommonItem?.icon || '❓'} ${mostCommonItem?.count || 0}</div>
        <div class="stat-label">Most Common</div>
      </div>
    </div>
  `;

  statsContent.innerHTML = html;
}

// Export results
function exportResults() {
  if (!currentResults) return;

  const { creature, killCount, luckModifier, results, timestamp } = currentResults;
  const { lootResults, categoryTotals, totalValue, totalDrops } = results;

  let report = `SKYRIM LOOT CALCULATOR - SIMULATION REPORT\n`;
  report += `${'='.repeat(50)}\n\n`;
  report += `Creature: ${creature.name} (${creature.race})\n`;
  report += `Level: ${creature.level} | Difficulty: ${creature.difficulty}\n`;
  report += `Simulation Date: ${timestamp.toLocaleString()}\n`;
  report += `Kill Count: ${killCount.toLocaleString()}\n`;
  report += `Luck Modifier: ${luckModifier > 0 ? '+' : ''}${luckModifier}%\n\n`;

  report += `SUMMARY\n`;
  report += `${'-'.repeat(50)}\n`;
  report += `Total Items Dropped: ${totalDrops.toLocaleString()}\n`;
  report += `Total Loot Value: ${totalValue.toLocaleString()} gold\n`;
  report += `Average Drops per Kill: ${(totalDrops / killCount).toFixed(2)}\n`;
  report += `Average Value per Kill: ${(totalValue / killCount).toFixed(2)} gold\n\n`;

  report += `LOOT BY CATEGORY\n`;
  report += `${'-'.repeat(50)}\n`;
  for (const [category, count] of Object.entries(categoryTotals)) {
    report += `${category}: ${count} items\n`;
  }
  report += `\n`;

  report += `DETAILED LOOT BREAKDOWN\n`;
  report += `${'-'.repeat(50)}\n`;
  const sortedLoot = Object.values(lootResults).sort((a, b) => b.count - a.count);
  sortedLoot.forEach((item) => {
    report += `${item.icon} ${item.name}\n`;
    report += `  Quantity: ${item.count}\n`;
    report += `  Rarity: ${item.rarity}\n`;
    report += `  Category: ${item.category}\n`;
    report += `  Unit Value: ${item.value}g\n`;
    report += `  Total Value: ${(item.count * item.value).toLocaleString()}g\n\n`;
  });

  // Download as text file
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `loot-report-${creature.name.replace(/\s+/g, '-')}-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Toggle comparison mode
function toggleComparisonMode() {
  comparisonMode = !comparisonMode;
  const comparisonContent = document.getElementById('comparisonContent');
  const toggleBtn = document.getElementById('toggleComparisonBtn');

  if (comparisonContent && toggleBtn) {
    if (comparisonMode) {
      comparisonContent.style.display = 'block';
      toggleBtn.textContent = 'Disable Comparison';
    } else {
      comparisonContent.style.display = 'none';
      toggleBtn.textContent = 'Enable Comparison';
    }
  }
}

// Handle compare creature change
function handleCompareCreatureChange(e) {
  const creatureId = e.target.value;
  const runBtn = document.getElementById('runComparisonBtn');

  if (creatureId && selectedCreature) {
    compareCreature = allCharacters.find((c) => c.id === parseInt(creatureId));
    if (runBtn) runBtn.disabled = false;
  } else {
    compareCreature = null;
    if (runBtn) runBtn.disabled = true;
  }
}

// Run comparison
function runComparison() {
  if (!selectedCreature || !compareCreature) return;

  const killCount = 100; // Fixed for comparison
  const lootTable1 = getLootTable(selectedCreature.race);
  const lootTable2 = getLootTable(compareCreature.race);

  const results1 = simulateLoot(lootTable1, killCount, luckModifier);
  const results2 = simulateLoot(lootTable2, killCount, luckModifier);

  displayComparison(selectedCreature, compareCreature, results1, results2, killCount);
}

// Display comparison
function displayComparison(creature1, creature2, results1, results2, killCount) {
  const comparisonResults = document.getElementById('comparisonResults');
  if (!comparisonResults) return;

  const html = `
    <div class="comparison-creature fade-in">
      <h4>${creature1.name}</h4>
      <div class="comparison-stats">
        <div class="comparison-stat">
          <span>Total Items:</span>
          <span>${results1.totalDrops}</span>
        </div>
        <div class="comparison-stat">
          <span>Total Value:</span>
          <span>${results1.totalValue.toLocaleString()}g</span>
        </div>
        <div class="comparison-stat">
          <span>Avg/Kill:</span>
          <span>${(results1.totalDrops / killCount).toFixed(2)}</span>
        </div>
        <div class="comparison-stat">
          <span>Gold/Kill:</span>
          <span>${(results1.totalValue / killCount).toFixed(0)}g</span>
        </div>
      </div>
    </div>
    <div class="comparison-divider">⚔️</div>
    <div class="comparison-creature fade-in">
      <h4>${creature2.name}</h4>
      <div class="comparison-stats">
        <div class="comparison-stat">
          <span>Total Items:</span>
          <span>${results2.totalDrops}</span>
        </div>
        <div class="comparison-stat">
          <span>Total Value:</span>
          <span>${results2.totalValue.toLocaleString()}g</span>
        </div>
        <div class="comparison-stat">
          <span>Avg/Kill:</span>
          <span>${(results2.totalDrops / killCount).toFixed(2)}</span>
        </div>
        <div class="comparison-stat">
          <span>Gold/Kill:</span>
          <span>${(results2.totalValue / killCount).toFixed(0)}g</span>
        </div>
      </div>
    </div>
  `;

  comparisonResults.innerHTML = html;
}

// Add to history
function addToHistory(data) {
  simulationHistory.unshift(data);

  // Keep only last 10 simulations
  if (simulationHistory.length > 10) {
    simulationHistory = simulationHistory.slice(0, 10);
  }

  displayHistory();
}

// Display history
function displayHistory() {
  const historyContent = document.getElementById('historyContent');
  if (!historyContent) return;

  if (simulationHistory.length === 0) {
    historyContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📜</div>
        <p>No simulation history yet</p>
      </div>
    `;
    return;
  }

  const html = `
    <div class="history-list">
      ${simulationHistory
        .map(
          (item) => `
        <div class="history-item slide-in">
          <div class="history-header">
            <span class="history-creature">${item.creature.name}</span>
            <span class="history-time">${new Date(item.timestamp).toLocaleTimeString()}</span>
          </div>
          <div class="history-details">
            ${item.killCount.toLocaleString()} kills • ${item.results.totalDrops} items • ${item.results.totalValue.toLocaleString()}g
            ${item.luckModifier !== 0 ? `• Luck: ${item.luckModifier > 0 ? '+' : ''}${item.luckModifier}%` : ''}
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `;

  historyContent.innerHTML = html;
}

// Clear history
function clearHistory() {
  if (simulationHistory.length === 0) return;

  if (confirm('Are you sure you want to clear simulation history?')) {
    simulationHistory = [];
    displayHistory();
  }
}

// Show error message
function showError(message) {
  // Create a toast notification
  const toast = document.createElement('div');
  toast.className = 'error-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--color-error);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
