// Skyrim Codex JavaScript

let quests = [];
let skills = [];
let items = [];
let factions = [];

let filteredQuests = [];
let filteredItems = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    setupEventListeners();
    renderAll();
});

// Load all JSON data
async function loadAllData() {
    try {
        const [questsRes, skillsRes, itemsRes, factionsRes] = await Promise.all([
            fetch('quests.json'),
            fetch('skills.json'),
            fetch('items.json'),
            fetch('factions.json')
        ]);

        quests = await questsRes.json();
        skills = await skillsRes.json();
        items = await itemsRes.json();
        factions = await factionsRes.json();

        filteredQuests = [...quests];
        filteredItems = [...items];
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

    // Quest filters
    document.getElementById('questSearch').addEventListener('input', filterQuests);
    document.getElementById('questTypeFilter').addEventListener('change', filterQuests);

    // Item filters
    document.getElementById('itemSearch').addEventListener('input', filterItems);
    document.getElementById('itemTypeFilter').addEventListener('change', filterItems);
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

// Render all tabs
function renderAll() {
    renderQuests();
    renderSkills();
    renderItems();
    renderFactions();
}

// QUESTS
function filterQuests() {
    const search = document.getElementById('questSearch').value.toLowerCase();
    const typeFilter = document.getElementById('questTypeFilter').value;

    filteredQuests = quests.filter(quest => {
        const matchesSearch = quest.name.toLowerCase().includes(search) ||
                            quest.description.toLowerCase().includes(search);
        const matchesType = !typeFilter || quest.type === typeFilter;

        return matchesSearch && matchesType;
    });

    renderQuests();
}

function renderQuests() {
    const grid = document.getElementById('questsGrid');

    if (filteredQuests.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-secondary);">No quests found</p>';
        return;
    }

    grid.innerHTML = filteredQuests.map(quest => `
        <div class="card-item">
            <img src="${quest.imagePath}" alt="${quest.name}" class="card-image">
            <div class="card-body">
                <h3 class="card-title">${quest.name}</h3>
                <p class="card-type">${quest.type}</p>
                <p class="card-description">${quest.description}</p>
                <div class="card-meta">
                    <span class="card-badge badge-${getBadgeClass(quest.type)}">${quest.type}</span>
                    <span class="card-badge badge-${quest.difficulty.toLowerCase()}">${quest.difficulty}</span>
                    <span>Level ${quest.level}+</span>
                </div>
            </div>
        </div>
    `).join('');
}

// SKILLS
function renderSkills() {
    const container = document.getElementById('skillsContainer');

    container.innerHTML = skills.map(skill => `
        <div class="skill-card">
            <div class="skill-header">
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-info">
                    <h3>${skill.name}</h3>
                    <p class="skill-type">${skill.type} • ${skill.governing}</p>
                </div>
            </div>
            <p class="skill-description">${skill.description}</p>
            <div class="perks-list">
                ${skill.perks.slice(0, 5).map(perk => `
                    <div class="perk-item">
                        <span class="perk-name">${perk.name}</span>
                        ${perk.ranks > 1 ? `<span class="perk-ranks">${perk.ranks} ranks</span>` : ''}
                        <span class="perk-desc">${perk.description}</span>
                    </div>
                `).join('')}
                ${skill.perks.length > 5 ? `<div class="perk-item" style="text-align: center; font-style: italic; color: var(--color-text-secondary);">+${skill.perks.length - 5} more perks...</div>` : ''}
            </div>
        </div>
    `).join('');
}

// ITEMS
function filterItems() {
    const search = document.getElementById('itemSearch').value.toLowerCase();
    const typeFilter = document.getElementById('itemTypeFilter').value;

    filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search) ||
                            item.description.toLowerCase().includes(search);
        const matchesType = !typeFilter || item.type === typeFilter;

        return matchesSearch && matchesType;
    });

    renderItems();
}

function renderItems() {
    const grid = document.getElementById('itemsGrid');

    if (filteredItems.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-secondary);">No items found</p>';
        return;
    }

    grid.innerHTML = filteredItems.map(item => `
        <div class="card-item">
            <img src="${item.imagePath}" alt="${item.name}" class="card-image">
            <div class="card-body">
                <h3 class="card-title">${item.name}</h3>
                <p class="card-type">${item.type} • ${item.category}</p>
                <p class="card-description">${item.description}</p>
                <div class="item-stats">
                    <div class="stat-item">
                        <span class="stat-label">Value</span>
                        <span class="stat-value">${item.value} gold</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Weight</span>
                        <span class="stat-value">${item.weight}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Damage/Armor</span>
                        <span class="stat-value">${item.damage || item.armor || 'N/A'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Rarity</span>
                        <span class="stat-value">${item.rarity}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// FACTIONS
function renderFactions() {
    const grid = document.getElementById('factionsGrid');

    grid.innerHTML = factions.map(faction => `
        <div class="card-item">
            <img src="${faction.imagePath}" alt="${faction.name}" class="card-image">
            <div class="card-body">
                <h3 class="card-title">${faction.name}</h3>
                <p class="card-type">${faction.type} • ${faction.alignment}</p>
                <p class="card-description">${faction.description}</p>
                <div class="card-meta">
                    <span>${faction.joinable ? '✓ Joinable' : '✗ Not Joinable'}</span>
                    <span>📍 ${faction.location}</span>
                </div>
                <div class="faction-members">
                    <p class="faction-members-title">Key Members:</p>
                    <div class="members-list">
                        ${faction.members.slice(0, 4).map(member =>
                            `<span class="member-badge">${member}</span>`
                        ).join('')}
                        ${faction.members.length > 4 ? `<span class="member-badge">+${faction.members.length - 4} more</span>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Helper function
function getBadgeClass(type) {
    if (type.includes('Main')) return 'main';
    if (type.includes('Guild') || type.includes('Companions') || type.includes('College')) return 'guild';
    return 'side';
}
