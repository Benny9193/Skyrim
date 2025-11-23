// Magic & Shouts JavaScript

let spells = [];
let shouts = [];
let filteredSpells = [];
let filteredShouts = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    setupEventListeners();
    renderAll();
});

// Load JSON data
async function loadAllData() {
    try {
        const [spellsRes, shoutsRes] = await Promise.all([
            fetch('spells.json'),
            fetch('shouts.json')
        ]);

        spells = await spellsRes.json();
        shouts = await shoutsRes.json();

        filteredSpells = [...spells];
        filteredShouts = [...shouts];
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });

    // Spell filters
    document.getElementById('spellSearch').addEventListener('input', filterSpells);
    document.getElementById('spellSchoolFilter').addEventListener('change', filterSpells);
    document.getElementById('spellLevelFilter').addEventListener('change', filterSpells);

    // Shout search
    document.getElementById('shoutSearch').addEventListener('input', filterShouts);
}

// Tab switching
function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

// Render all
function renderAll() {
    renderSpells();
    renderShouts();
}

// SPELLS
function filterSpells() {
    const search = document.getElementById('spellSearch').value.toLowerCase();
    const schoolFilter = document.getElementById('spellSchoolFilter').value;
    const levelFilter = document.getElementById('spellLevelFilter').value;

    filteredSpells = spells.filter(spell => {
        const matchesSearch = spell.name.toLowerCase().includes(search) ||
                            spell.description.toLowerCase().includes(search);
        const matchesSchool = !schoolFilter || spell.school === schoolFilter;
        const matchesLevel = !levelFilter || spell.level === levelFilter;

        return matchesSearch && matchesSchool && matchesLevel;
    });

    renderSpells();
}

function renderSpells() {
    const grid = document.getElementById('spellsGrid');

    if (filteredSpells.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-secondary);">No spells found</p>';
        return;
    }

    grid.innerHTML = filteredSpells.map(spell => `
        <div class="spell-card">
            <div class="spell-header">
                <h3 class="spell-name">${spell.name}</h3>
                <span class="spell-level ${spell.level.toLowerCase()}">${spell.level}</span>
            </div>
            <div class="spell-info">
                <p class="spell-school">${spell.school}${spell.type ? ` • ${spell.type}` : ''}</p>
                <p class="spell-description">${spell.description}</p>
            </div>
            <div class="spell-stats">
                <div class="stat-item">
                    <span class="stat-label">Magicka Cost</span>
                    <span class="stat-value">${spell.magicka}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Range</span>
                    <span class="stat-value">${spell.range}</span>
                </div>
                ${spell.damage ? `
                    <div class="stat-item">
                        <span class="stat-label">Damage</span>
                        <span class="stat-value">${spell.damage}</span>
                    </div>
                ` : ''}
                ${spell.aoe ? `
                    <div class="stat-item">
                        <span class="stat-label">Area</span>
                        <span class="stat-value">${spell.aoe}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// SHOUTS
function filterShouts() {
    const search = document.getElementById('shoutSearch').value.toLowerCase();

    filteredShouts = shouts.filter(shout => {
        const matchesSearch = shout.name.toLowerCase().includes(search) ||
                            shout.description.toLowerCase().includes(search) ||
                            shout.words.some(word => word.toLowerCase().includes(search));

        return matchesSearch;
    });

    renderShouts();
}

function renderShouts() {
    const container = document.getElementById('shoutsContainer');

    if (filteredShouts.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--color-text-secondary);">No shouts found</p>';
        return;
    }

    container.innerHTML = filteredShouts.map(shout => `
        <div class="shout-card">
            <h3 class="shout-title">${shout.name}</h3>
            <div class="shout-words">
                ${shout.words.map(word => `<span class="word-badge">${word}</span>`).join('')}
            </div>
            <p class="shout-description">${shout.description}</p>
            <div class="shout-effects">
                <h4>Effects</h4>
                ${shout.effects.map(effect => `
                    <div class="effect-item">${effect}</div>
                `).join('')}
            </div>
            <div class="shout-locations">
                <h4>Word Locations</h4>
                <ul class="location-list">
                    ${shout.locations.map(location => `
                        <li>${location}</li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `).join('');
}
