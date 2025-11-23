// Daedric Artifacts JavaScript

let artifacts = [];
let filteredArtifacts = [];

// DOM Elements
const artifactsGrid = document.getElementById('artifactsGrid');
const searchInput = document.getElementById('artifactSearch');
const princeFilter = document.getElementById('princeFilter');
const typeFilter = document.getElementById('typeFilter');
const categoryFilter = document.getElementById('categoryFilter');
const artifactModal = document.getElementById('artifactModal');
const modalBackdrop = document.querySelector('.modal-backdrop');
const closeBtn = document.querySelector('.close-btn');

// Load artifacts data
async function loadData() {
    try {
        const response = await fetch('daedric-artifacts.json');
        artifacts = await response.json();
        filteredArtifacts = [...artifacts];
        renderArtifacts();
    } catch (error) {
        console.error('Error loading daedric artifacts:', error);
        artifactsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary);">Failed to load daedric artifacts data.</p>';
    }
}

// Filter artifacts
function filterArtifacts() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedPrince = princeFilter.value;
    const selectedType = typeFilter.value;
    const selectedCategory = categoryFilter.value;

    filteredArtifacts = artifacts.filter(artifact => {
        const matchesSearch = artifact.name.toLowerCase().includes(searchTerm) ||
                            artifact.description.toLowerCase().includes(searchTerm) ||
                            artifact.enchantment.toLowerCase().includes(searchTerm);
        const matchesPrince = !selectedPrince || artifact.daedricPrince === selectedPrince;
        const matchesType = !selectedType || artifact.type === selectedType;
        const matchesCategory = !selectedCategory || artifact.category === selectedCategory;

        return matchesSearch && matchesPrince && matchesType && matchesCategory;
    });

    renderArtifacts();
}

// Render artifacts grid
function renderArtifacts() {
    if (filteredArtifacts.length === 0) {
        artifactsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary);">No daedric artifacts found matching your criteria.</p>';
        return;
    }

    artifactsGrid.innerHTML = filteredArtifacts.map(artifact => `
        <div class="artifact-card" onclick="openArtifactModal(${artifact.id})">
            <div class="artifact-card-icon">${artifact.icon}</div>
            <h3 class="artifact-card-title">${artifact.name}</h3>
            <p class="artifact-card-prince">${artifact.daedricPrince}</p>
            <div class="artifact-card-type">
                <span class="type-badge">${artifact.type}</span>
                <span class="category-badge">${artifact.category}</span>
                ${artifact.rarity ? `<span class="rarity-badge">${artifact.rarity}</span>` : ''}
            </div>
            <p class="artifact-card-description">${artifact.description.substring(0, 100)}${artifact.description.length > 100 ? '...' : ''}</p>
            <div class="artifact-card-quest">📜 ${artifact.quest}</div>
        </div>
    `).join('');
}

// Open artifact modal
function openArtifactModal(artifactId) {
    const artifact = artifacts.find(a => a.id === artifactId);
    if (!artifact) return;

    document.getElementById('artifactIcon').textContent = artifact.icon;
    document.getElementById('artifactName').textContent = artifact.name;
    document.getElementById('daedricPrince').textContent = artifact.daedricPrince;
    document.getElementById('artifactType').textContent = artifact.type;
    document.getElementById('artifactCategory').textContent = artifact.category;

    const rarityBadge = document.getElementById('artifactRarity');
    if (artifact.rarity) {
        rarityBadge.textContent = artifact.rarity;
        rarityBadge.style.display = 'inline-block';
    } else {
        rarityBadge.style.display = 'none';
    }

    document.getElementById('artifactDescription').textContent = artifact.description;
    document.getElementById('artifactWeight').textContent = artifact.weight;
    document.getElementById('artifactValue').textContent = artifact.value + ' gold';

    // Show damage or armor rating based on type
    const damageSection = document.getElementById('damageSection');
    const armorSection = document.getElementById('armorSection');

    if (artifact.damage !== undefined) {
        document.getElementById('artifactDamage').textContent = artifact.damage;
        damageSection.style.display = 'block';
        armorSection.style.display = 'none';
    } else if (artifact.armorRating !== undefined) {
        document.getElementById('artifactArmor').textContent = artifact.armorRating;
        armorSection.style.display = 'block';
        damageSection.style.display = 'none';
    } else {
        damageSection.style.display = 'none';
        armorSection.style.display = 'none';
    }

    document.getElementById('artifactEnchantment').textContent = artifact.enchantment;
    document.getElementById('artifactQuest').textContent = artifact.quest;
    document.getElementById('questGiver').textContent = artifact.questGiver;
    document.getElementById('artifactLocation').textContent = artifact.location;

    artifactModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    artifactModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Event listeners
searchInput.addEventListener('input', filterArtifacts);
princeFilter.addEventListener('change', filterArtifacts);
typeFilter.addEventListener('change', filterArtifacts);
categoryFilter.addEventListener('change', filterArtifacts);
closeBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !artifactModal.classList.contains('hidden')) {
        closeModal();
    }
});

// Initialize
loadData();
