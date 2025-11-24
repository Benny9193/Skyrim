// Enchantments JavaScript

let enchantments = [];
let filteredEnchantments = [];

// DOM Elements
const enchantmentsGrid = document.getElementById('enchantmentsGrid');
const searchInput = document.getElementById('enchantmentSearch');
const typeFilter = document.getElementById('typeFilter');
const schoolFilter = document.getElementById('schoolFilter');
const enchantmentModal = document.getElementById('enchantmentModal');
const modalBackdrop = document.querySelector('.modal-backdrop');
const closeBtn = document.querySelector('.close-btn');

// Load enchantments data
async function loadData() {
    try {
        const response = await fetch('enchantments.json');
        enchantments = await response.json();
        filteredEnchantments = [...enchantments];
        renderEnchantments();
    } catch (error) {
        console.error('Error loading enchantments:', error);
        enchantmentsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary);">Failed to load enchantments data.</p>';
    }
}

// Filter enchantments
function filterEnchantments() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;
    const selectedSchool = schoolFilter.value;

    filteredEnchantments = enchantments.filter(enchantment => {
        const matchesSearch = enchantment.name.toLowerCase().includes(searchTerm) ||
                            enchantment.description.toLowerCase().includes(searchTerm) ||
                            enchantment.effect.toLowerCase().includes(searchTerm);
        const matchesType = !selectedType || enchantment.type === selectedType;
        const matchesSchool = !selectedSchool || enchantment.school === selectedSchool;

        return matchesSearch && matchesType && matchesSchool;
    });

    renderEnchantments();
}

// Render enchantments grid
function renderEnchantments() {
    if (filteredEnchantments.length === 0) {
        enchantmentsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary);">No enchantments found matching your criteria.</p>';
        return;
    }

    enchantmentsGrid.innerHTML = filteredEnchantments.map(enchantment => `
        <div class="enchantment-card" onclick="openEnchantmentModal(${enchantment.id})">
            <div class="enchantment-card-icon">${enchantment.icon}</div>
            <h3 class="enchantment-card-title">${enchantment.name}</h3>
            <div class="enchantment-card-type">
                <span class="type-badge">${enchantment.type}</span>
                <span class="school-badge">${enchantment.school}</span>
            </div>
            <div class="enchantment-card-effect">${enchantment.effect}</div>
            <div class="enchantment-card-items">
                ${enchantment.compatibleItems.slice(0, 3).map(item => `<span class="item-tag">${item}</span>`).join('')}
                ${enchantment.compatibleItems.length > 3 ? `<span class="item-tag">+${enchantment.compatibleItems.length - 3} more</span>` : ''}
            </div>
        </div>
    `).join('');
}

// Open enchantment modal
function openEnchantmentModal(enchantmentId) {
    const enchantment = enchantments.find(e => e.id === enchantmentId);
    if (!enchantment) return;

    document.getElementById('enchantmentIcon').textContent = enchantment.icon;
    document.getElementById('enchantmentName').textContent = enchantment.name;
    document.getElementById('enchantmentSchool').textContent = enchantment.school;
    document.getElementById('enchantmentType').textContent = enchantment.type;
    document.getElementById('schoolBadge').textContent = enchantment.school;
    document.getElementById('enchantmentDescription').textContent = enchantment.description;
    document.getElementById('enchantmentEffect').textContent = enchantment.effect;
    document.getElementById('enchantmentMagnitude').textContent = enchantment.magnitude;
    document.getElementById('enchantmentSoulGem').textContent = enchantment.soulGem;
    document.getElementById('enchantmentValue').textContent = enchantment.baseValue + ' gold';

    // Populate compatible items
    const itemsList = document.getElementById('compatibleItems');
    itemsList.innerHTML = enchantment.compatibleItems.map(item =>
        `<span class="item-badge">${item}</span>`
    ).join('');

    // Populate locations
    const locationsList = document.getElementById('enchantmentLocations');
    locationsList.innerHTML = enchantment.locations.map(location =>
        `<div class="location-item">${location}</div>`
    ).join('');

    enchantmentModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    enchantmentModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Event listeners
searchInput.addEventListener('input', filterEnchantments);
typeFilter.addEventListener('change', filterEnchantments);
schoolFilter.addEventListener('change', filterEnchantments);
closeBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !enchantmentModal.classList.contains('hidden')) {
        closeModal();
    }
});

// Initialize
loadData();
