// Dragons JavaScript

let dragons = [];
let filteredDragons = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupEventListeners();
    renderDragons();
});

// Load dragons data
async function loadData() {
    try {
        const response = await fetch('dragons.json');
        dragons = await response.json();
        filteredDragons = [...dragons];
    } catch (error) {
        console.error('Error loading dragons:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Filters
    document.getElementById('dragonSearch').addEventListener('input', filterDragons);
    document.getElementById('typeFilter').addEventListener('change', filterDragons);
    document.getElementById('breathFilter').addEventListener('change', filterDragons);
    document.getElementById('questFilter').addEventListener('change', filterDragons);

    // Modal close
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('modalBackdrop').addEventListener('click', closeModal);
}

// Filter dragons
function filterDragons() {
    const search = document.getElementById('dragonSearch').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    const breathFilter = document.getElementById('breathFilter').value;
    const questFilter = document.getElementById('questFilter').value;

    filteredDragons = dragons.filter(dragon => {
        const matchesSearch = dragon.name.toLowerCase().includes(search) ||
                            dragon.title.toLowerCase().includes(search) ||
                            dragon.lore.toLowerCase().includes(search);
        const matchesType = !typeFilter || dragon.type === typeFilter;
        const matchesBreath = !breathFilter || dragon.breath === breathFilter;

        let matchesQuest = true;
        if (questFilter === 'quest') {
            matchesQuest = dragon.questRelated;
        } else if (questFilter === 'friendly') {
            matchesQuest = dragon.canBeFriend;
        }

        return matchesSearch && matchesType && matchesBreath && matchesQuest;
    });

    renderDragons();
}

// Render dragons grid
function renderDragons() {
    const grid = document.getElementById('dragonsGrid');

    if (filteredDragons.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-secondary);">No dragons found</p>';
        return;
    }

    grid.innerHTML = filteredDragons.map(dragon => `
        <div class="dragon-card" onclick="openDragonModal(${dragon.id})">
            <div class="dragon-card-header">
                <div class="dragon-card-icon">🐉</div>
                <div class="dragon-card-title">
                    <h3>${dragon.name}</h3>
                    <p class="dragon-card-subtitle">${dragon.title}</p>
                </div>
            </div>
            <div class="dragon-card-body">
                <span class="dragon-type-badge">${dragon.type}</span>
                <p class="dragon-breath"><strong>Breath:</strong> ${dragon.breath}</p>
            </div>
            <div class="dragon-card-footer">
                <span>Level ${typeof dragon.level === 'string' ? dragon.level : dragon.level}</span>
                ${dragon.questRelated ? '<span class="quest-badge">Quest</span>' : ''}
                ${dragon.canBeFriend ? '<span class="friend-badge">Ally</span>' : ''}
            </div>
        </div>
    `).join('');
}

// Open dragon modal
function openDragonModal(id) {
    const dragon = dragons.find(d => d.id === id);
    if (!dragon) return;

    // Update modal content
    document.getElementById('modalIcon').textContent = '🐉';
    document.getElementById('modalDragonName').textContent = dragon.name;
    document.getElementById('modalTitle').textContent = dragon.title;
    document.getElementById('modalType').textContent = dragon.type;
    document.getElementById('modalLevel').textContent = typeof dragon.level === 'string' ? dragon.level : `Level ${dragon.level}`;
    document.getElementById('modalHealth').textContent = dragon.health;
    document.getElementById('modalBreath').textContent = dragon.breath;
    document.getElementById('modalLore').textContent = dragon.lore;
    document.getElementById('modalLocation').textContent = dragon.location;

    // Shouts
    const shoutsContainer = document.getElementById('modalShouts');
    if (dragon.shouts && dragon.shouts.length > 0) {
        shoutsContainer.innerHTML = dragon.shouts.map(shout => `
            <div class="shout-item">${shout}</div>
        `).join('');
    } else {
        shoutsContainer.innerHTML = '';
    }

    // Abilities
    const abilitiesContainer = document.getElementById('modalAbilities');
    if (dragon.abilities && dragon.abilities.length > 0) {
        abilitiesContainer.innerHTML = dragon.abilities.map(ability => `
            <div class="ability-item">${ability}</div>
        `).join('');
    } else {
        abilitiesContainer.innerHTML = '';
    }

    // Quest section
    const questSection = document.getElementById('modalQuestSection');
    if (dragon.questRelated) {
        questSection.style.display = 'block';
        document.getElementById('modalQuest').textContent = dragon.quest || 'Related to main questline';

        const friendBadge = document.getElementById('modalFriendBadge');
        if (dragon.canBeFriend) {
            friendBadge.style.display = 'block';
        } else {
            friendBadge.style.display = 'none';
        }
    } else {
        questSection.style.display = 'none';
    }

    // Weakness section
    const weaknessSection = document.getElementById('modalWeaknessSection');
    if (dragon.weakness) {
        weaknessSection.style.display = 'block';
        document.getElementById('modalWeakness').textContent = dragon.weakness;
    } else {
        weaknessSection.style.display = 'none';
    }

    // Show modal
    document.getElementById('dragonModal').classList.remove('hidden');
}

// Close modal
function closeModal() {
    document.getElementById('dragonModal').classList.add('hidden');
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});
