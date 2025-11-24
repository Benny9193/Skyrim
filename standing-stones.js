// Standing Stones JavaScript

let stones = [];
let filteredStones = [];

// DOM Elements
const stonesGrid = document.getElementById('stonesGrid');
const searchInput = document.getElementById('stoneSearch');
const typeFilter = document.getElementById('typeFilter');
const categoryFilter = document.getElementById('categoryFilter');
const stoneModal = document.getElementById('stoneModal');
const modalBackdrop = document.querySelector('.modal-backdrop');
const closeBtn = document.querySelector('.close-btn');

// Load stones data
async function loadData() {
    try {
        const response = await fetch('standing-stones.json');
        stones = await response.json();
        filteredStones = [...stones];
        renderStones();
    } catch (error) {
        console.error('Error loading standing stones:', error);
        stonesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary);">Failed to load standing stones data.</p>';
    }
}

// Filter stones
function filterStones() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;
    const selectedCategory = categoryFilter.value;

    filteredStones = stones.filter(stone => {
        const matchesSearch = stone.name.toLowerCase().includes(searchTerm) ||
                            stone.description.toLowerCase().includes(searchTerm) ||
                            stone.effect.toLowerCase().includes(searchTerm);
        const matchesType = !selectedType || stone.type === selectedType;
        const matchesCategory = !selectedCategory || stone.category === selectedCategory;

        return matchesSearch && matchesType && matchesCategory;
    });

    renderStones();
}

// Render stones grid
function renderStones() {
    if (filteredStones.length === 0) {
        stonesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary);">No standing stones found matching your criteria.</p>';
        return;
    }

    stonesGrid.innerHTML = filteredStones.map(stone => `
        <div class="stone-card" onclick="openStoneModal(${stone.id})">
            <div class="stone-card-icon">${stone.icon}</div>
            <h3 class="stone-card-title">${stone.name}</h3>
            <div class="stone-card-type">
                <span class="type-badge">${stone.type}</span>
                ${stone.category ? `<span class="category-badge">${stone.category}</span>` : ''}
            </div>
            <div class="stone-card-effect">${stone.effect}</div>
            ${stone.skills && stone.skills.length > 0 ? `
                <div class="stone-card-skills">
                    ${stone.skills.slice(0, 3).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    ${stone.skills.length > 3 ? `<span class="skill-tag">+${stone.skills.length - 3} more</span>` : ''}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Open stone modal
function openStoneModal(stoneId) {
    const stone = stones.find(s => s.id === stoneId);
    if (!stone) return;

    document.getElementById('stoneIcon').textContent = stone.icon;
    document.getElementById('stoneName').textContent = stone.name;
    document.getElementById('stoneType').textContent = stone.type;

    const categoryBadge = document.getElementById('stoneCategory');
    if (stone.category) {
        categoryBadge.textContent = stone.category;
        categoryBadge.style.display = 'inline-block';
    } else {
        categoryBadge.style.display = 'none';
    }

    document.getElementById('stoneEffect').textContent = stone.effect;
    document.getElementById('stoneDescription').textContent = stone.description;
    document.getElementById('stoneLocation').textContent = stone.location;

    const skillsList = document.getElementById('stoneSkills');
    const skillsSection = document.querySelector('.stone-skills-section');

    if (stone.skills && stone.skills.length > 0) {
        skillsList.innerHTML = stone.skills.map(skill =>
            `<span class="skill-badge">${skill}</span>`
        ).join('');
        skillsSection.style.display = 'block';
    } else {
        skillsSection.style.display = 'none';
    }

    stoneModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    stoneModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Event listeners
searchInput.addEventListener('input', filterStones);
typeFilter.addEventListener('change', filterStones);
categoryFilter.addEventListener('change', filterStones);
closeBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !stoneModal.classList.contains('hidden')) {
        closeModal();
    }
});

// Initialize
loadData();
