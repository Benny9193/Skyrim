// Character Builder JavaScript

let currentBuild = {
    name: '',
    race: '',
    level: 50,
    buildType: '',
    skills: [],
    standingStone: ''
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadSavedBuild();
});

// Setup event listeners
function setupEventListeners() {
    // Character info
    document.getElementById('characterName').addEventListener('input', updateBuild);
    document.getElementById('characterRace').addEventListener('change', updateBuild);
    document.getElementById('characterLevel').addEventListener('input', updateBuild);

    // Build type buttons
    document.querySelectorAll('.build-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectBuildType(btn.dataset.build);
        });
    });

    // Skill checkboxes
    document.querySelectorAll('input[name="skill"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateSkills);
    });

    // Standing stone
    document.getElementById('standingStone').addEventListener('change', updateBuild);

    // Action buttons
    document.getElementById('saveBuildBtn').addEventListener('click', saveBuild);
    document.getElementById('exportBuildBtn').addEventListener('click', exportBuild);
    document.getElementById('resetBuildBtn').addEventListener('click', resetBuild);
}

// Select build type
function selectBuildType(buildType) {
    // Update UI
    document.querySelectorAll('.build-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.build === buildType);
    });

    currentBuild.buildType = buildType;

    // Auto-select skills based on build type
    if (buildType !== 'custom') {
        preselectSkills(buildType);
    }

    // Show equipment recommendations
    showEquipmentRecommendations(buildType);

    updateSummary();
}

// Preselect skills based on build type
function preselectSkills(buildType) {
    // Clear all checkboxes first
    document.querySelectorAll('input[name="skill"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    const presets = {
        warrior: ['One-Handed', 'Heavy Armor', 'Block', 'Smithing', 'Archery'],
        mage: ['Destruction', 'Restoration', 'Conjuration', 'Enchanting', 'Alteration'],
        thief: ['Sneak', 'Archery', 'Light Armor', 'Lockpicking', 'Speech', 'Alchemy'],
        hybrid: ['One-Handed', 'Destruction', 'Sneak', 'Enchanting', 'Alchemy']
    };

    const skills = presets[buildType] || [];
    skills.forEach(skill => {
        const checkbox = document.querySelector(`input[name="skill"][value="${skill}"]`);
        if (checkbox) checkbox.checked = true;
    });

    updateSkills();
}

// Show equipment recommendations
function showEquipmentRecommendations(buildType) {
    const container = document.getElementById('equipmentRecommendations');

    const recommendations = {
        warrior: [
            { name: 'Daedric Sword', desc: 'High-damage one-handed weapon' },
            { name: 'Dragonplate Armor', desc: 'Best heavy armor in the game' },
            { name: 'Daedric Shield', desc: 'Maximum block rating' },
            { name: 'Ring of Strength', desc: 'Fortify One-Handed enchantment' }
        ],
        mage: [
            { name: 'Archmage\'s Robes', desc: 'Reduces spell cost, increases magicka regen' },
            { name: 'Morokei', desc: 'Dragon Priest mask, +100% magicka regen' },
            { name: 'Staff of Magnus', desc: 'Powerful destruction staff' },
            { name: 'Ring of Eminent Destruction', desc: 'Fortify Destruction spells' }
        ],
        thief: [
            { name: 'Nightingale Armor', desc: 'Excellent stealth armor set' },
            { name: 'Blade of Woe', desc: 'Powerful dagger for sneak attacks' },
            { name: 'Nightingale Bow', desc: 'Enchanted bow with damage bonuses' },
            { name: 'Ring of Major Sneaking', desc: 'Fortify Sneak enchantment' }
        ],
        hybrid: [
            { name: 'Dragonscale Armor', desc: 'Light armor with good protection' },
            { name: 'Dawnbreaker', desc: 'One-handed sword with fire damage' },
            { name: 'Savos Aren\'s Amulet', desc: 'Reduces spell costs' },
            { name: 'Various Enchanted Rings', desc: 'Mix fortify effects' }
        ],
        custom: []
    };

    const items = recommendations[buildType] || [];

    if (items.length === 0) {
        container.innerHTML = '<p class="no-recommendations">Configure your build to see equipment recommendations</p>';
        return;
    }

    container.innerHTML = `
        <div class="equipment-grid">
            ${items.map(item => `
                <div class="equipment-item">
                    <h4>${item.name}</h4>
                    <p>${item.desc}</p>
                </div>
            `).join('')}
        </div>
    `;
}

// Update skills array
function updateSkills() {
    currentBuild.skills = Array.from(document.querySelectorAll('input[name="skill"]:checked'))
        .map(checkbox => checkbox.value);

    updateSummary();
}

// Update build from form
function updateBuild() {
    currentBuild.name = document.getElementById('characterName').value;
    currentBuild.race = document.getElementById('characterRace').value;
    currentBuild.level = parseInt(document.getElementById('characterLevel').value);
    currentBuild.standingStone = document.getElementById('standingStone').value;

    updateSummary();
}

// Update build summary
function updateSummary() {
    const summary = document.getElementById('buildSummary');

    if (!currentBuild.name || !currentBuild.race || currentBuild.skills.length === 0) {
        summary.innerHTML = '<p class="no-summary">Configure your character to see a build summary</p>';
        return;
    }

    summary.innerHTML = `
        <div class="summary-item">
            <div class="summary-label">Character Name</div>
            <div class="summary-value">${currentBuild.name || 'Not set'}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Race</div>
            <div class="summary-value">${currentBuild.race || 'Not selected'}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Target Level</div>
            <div class="summary-value">${currentBuild.level}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Build Type</div>
            <div class="summary-value">${currentBuild.buildType ? currentBuild.buildType.charAt(0).toUpperCase() + currentBuild.buildType.slice(1) : 'Not selected'}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Primary Skills (${currentBuild.skills.length})</div>
            <div class="summary-value">${currentBuild.skills.join(', ') || 'None selected'}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Standing Stone</div>
            <div class="summary-value">${currentBuild.standingStone || 'Not selected'}</div>
        </div>
    `;
}

// Save build to localStorage
function saveBuild() {
    if (!currentBuild.name) {
        alert('Please enter a character name before saving.');
        return;
    }

    localStorage.setItem('skyrimCharacterBuild', JSON.stringify(currentBuild));
    alert(`Build "${currentBuild.name}" saved successfully!`);
}

// Load saved build
function loadSavedBuild() {
    const saved = localStorage.getItem('skyrimCharacterBuild');
    if (!saved) return;

    try {
        currentBuild = JSON.parse(saved);

        // Restore form values
        document.getElementById('characterName').value = currentBuild.name || '';
        document.getElementById('characterRace').value = currentBuild.race || '';
        document.getElementById('characterLevel').value = currentBuild.level || 50;
        document.getElementById('standingStone').value = currentBuild.standingStone || '';

        // Restore build type
        if (currentBuild.buildType) {
            document.querySelectorAll('.build-type-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.build === currentBuild.buildType);
            });
            showEquipmentRecommendations(currentBuild.buildType);
        }

        // Restore skills
        document.querySelectorAll('input[name="skill"]').forEach(checkbox => {
            checkbox.checked = currentBuild.skills.includes(checkbox.value);
        });

        updateSummary();
    } catch (error) {
        console.error('Error loading saved build:', error);
    }
}

// Export build as text
function exportBuild() {
    if (!currentBuild.name) {
        alert('Please configure your build before exporting.');
        return;
    }

    const text = `
SKYRIM CHARACTER BUILD
=====================

Character: ${currentBuild.name}
Race: ${currentBuild.race}
Level: ${currentBuild.level}
Build Type: ${currentBuild.buildType}

PRIMARY SKILLS:
${currentBuild.skills.map(skill => `- ${skill}`).join('\n')}

STANDING STONE:
${currentBuild.standingStone || 'Not selected'}

=====================
Generated by Skyrim Character Builder
    `.trim();

    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
        alert('Build exported to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard. Please try again.');
    });
}

// Reset build
function resetBuild() {
    if (!confirm('Are you sure you want to reset your build?')) return;

    currentBuild = {
        name: '',
        race: '',
        level: 50,
        buildType: '',
        skills: [],
        standingStone: ''
    };

    // Clear form
    document.getElementById('characterName').value = '';
    document.getElementById('characterRace').value = '';
    document.getElementById('characterLevel').value = 50;
    document.getElementById('standingStone').value = '';

    // Clear build type
    document.querySelectorAll('.build-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Clear skills
    document.querySelectorAll('input[name="skill"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Clear equipment recommendations
    document.getElementById('equipmentRecommendations').innerHTML = '<p class="no-recommendations">Select a build type to see equipment recommendations</p>';

    updateSummary();
}
