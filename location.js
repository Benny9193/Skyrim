// Skyrim Locations - Interactive Location Guide

// State Management
let locations = [];
let filteredLocations = [];
let activeFilters = {
    region: [],
    type: [],
    difficulty: [],
    search: ''
};
let currentSort = 'name';
let currentView = 'grid';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const locationGrid = document.getElementById('locationGrid');
const noResults = document.getElementById('noResults');
const resultCount = document.getElementById('resultCount');
const resetFiltersBtn = document.getElementById('resetFilters');
const locationModal = document.getElementById('locationModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadLocations();
    initializeFilters();
    initializeEventListeners();
    displayLocations();
});

// Load location data
async function loadLocations() {
    try {
        const response = await fetch('locations.json');
        locations = await response.json();
        filteredLocations = [...locations];
    } catch (error) {
        console.error('Error loading locations:', error);
        locations = [];
        filteredLocations = [];
    }
}

// Initialize filter options
function initializeFilters() {
    // Extract unique values for each filter
    const regions = [...new Set(locations.map(loc => loc.region))].sort();
    const types = [...new Set(locations.map(loc => loc.type))].sort();
    const difficulties = [...new Set(locations.map(loc => loc.difficulty))].sort();

    // Populate filter sections
    populateFilterSection('regionFilter', regions, 'region');
    populateFilterSection('typeFilter', types, 'type');
    populateFilterSection('difficultyFilter', difficulties, 'difficulty');
}

// Populate a filter section with checkboxes
function populateFilterSection(elementId, options, filterType) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';

    options.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'filter-option';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${filterType}-${option}`;
        checkbox.value = option;
        checkbox.addEventListener('change', (e) => handleFilterChange(filterType, option, e.target.checked));

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = option;

        optionDiv.appendChild(checkbox);
        optionDiv.appendChild(label);
        container.appendChild(optionDiv);
    });
}

// Event Listeners
function initializeEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
        activeFilters.search = e.target.value.toLowerCase();
        applyFilters();
    });

    // Sort buttons
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentSort = e.target.dataset.sort;
            applyFilters();
        });
    });

    // View buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentView = e.target.dataset.view;
            updateView();
        });
    });

    // Filter toggles
    document.querySelectorAll('.filter-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filterType = e.target.dataset.filter;
            const filterOptions = document.getElementById(`${filterType}Filter`);
            const isCollapsed = filterOptions.classList.toggle('collapsed');
            e.target.textContent = isCollapsed ? '+' : '−';
        });
    });

    // Reset filters
    resetFiltersBtn.addEventListener('click', resetFilters);

    // Modal
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
}

// Handle filter changes
function handleFilterChange(filterType, value, checked) {
    if (checked) {
        if (!activeFilters[filterType].includes(value)) {
            activeFilters[filterType].push(value);
        }
    } else {
        activeFilters[filterType] = activeFilters[filterType].filter(v => v !== value);
    }
    applyFilters();
}

// Apply all filters
function applyFilters() {
    filteredLocations = locations.filter(location => {
        // Search filter
        if (activeFilters.search) {
            const searchTerm = activeFilters.search;
            const matchesSearch = 
                location.name.toLowerCase().includes(searchTerm) ||
                location.description.toLowerCase().includes(searchTerm) ||
                location.region.toLowerCase().includes(searchTerm) ||
                location.type.toLowerCase().includes(searchTerm);
            if (!matchesSearch) return false;
        }

        // Region filter
        if (activeFilters.region.length > 0 && !activeFilters.region.includes(location.region)) {
            return false;
        }

        // Type filter
        if (activeFilters.type.length > 0 && !activeFilters.type.includes(location.type)) {
            return false;
        }

        // Difficulty filter
        if (activeFilters.difficulty.length > 0 && !activeFilters.difficulty.includes(location.difficulty)) {
            return false;
        }

        return true;
    });

    sortLocations();
    displayLocations();
}

// Sort locations
function sortLocations() {
    filteredLocations.sort((a, b) => {
        switch (currentSort) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'difficulty':
                const difficultyOrder = ['Safe', 'Medium', 'Hard', 'Very Hard', 'Deadly'];
                return difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty);
            case 'region':
                return a.region.localeCompare(b.region);
            default:
                return 0;
        }
    });
}

// Display locations
function displayLocations() {
    resultCount.textContent = filteredLocations.length;

    if (filteredLocations.length === 0) {
        locationGrid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    locationGrid.style.display = 'grid';
    noResults.style.display = 'none';

    locationGrid.innerHTML = filteredLocations.map(location => createLocationCard(location)).join('');

    // Add click listeners to cards
    document.querySelectorAll('.location-card').forEach(card => {
        card.addEventListener('click', () => {
            const locationId = parseInt(card.dataset.id);
            showLocationDetail(locationId);
        });
    });
}

// Create location card HTML
function createLocationCard(location) {
    const creatureCount = location.creatures.length;
    const poiCount = location.pointsOfInterest.length;

    return `
        <div class="location-card" data-id="${location.id}">
            <img src="${location.imagePath}" alt="${location.name}" class="location-card-image">
            <div class="location-card-content">
                <div class="location-card-header">
                    <h3 class="location-card-name">${location.name}</h3>
                    <div class="location-card-meta">
                        <span class="location-badge">${location.region}</span>
                        <span class="location-badge">${location.type}</span>
                        <span class="location-badge difficulty ${location.difficulty.replace(' ', '.')}">${location.difficulty}</span>
                    </div>
                </div>
                <p class="location-card-description">${location.description}</p>
                <div class="location-card-footer">
                    <div class="location-card-info">
                        ${creatureCount > 0 ? `🐲 ${creatureCount} creatures` : ''}
                        ${creatureCount > 0 && poiCount > 0 ? ' • ' : ''}
                        ${poiCount > 0 ? `📍 ${poiCount} POIs` : ''}
                    </div>
                    <span class="location-card-link">View Details →</span>
                </div>
            </div>
        </div>
    `;
}

// Update view (grid/list)
function updateView() {
    if (currentView === 'list') {
        locationGrid.classList.add('list-view');
    } else {
        locationGrid.classList.remove('list-view');
    }
}

// Show location detail modal
function showLocationDetail(locationId) {
    const location = locations.find(loc => loc.id === locationId);
    if (!location) return;

    // Populate modal
    document.getElementById('modalImage').src = location.imagePath;
    document.getElementById('modalImage').alt = location.name;
    document.getElementById('modalName').textContent = location.name;
    document.getElementById('modalRegion').textContent = location.region;
    document.getElementById('modalType').textContent = location.type;
    
    const difficultyBadge = document.getElementById('modalDifficulty');
    difficultyBadge.textContent = location.difficulty;
    difficultyBadge.className = `location-badge difficulty ${location.difficulty.replace(' ', '.')}`;
    
    document.getElementById('modalDescription').textContent = location.description;
    document.getElementById('modalLore').textContent = location.lore;

    // Creatures
    const creaturesSection = document.getElementById('creaturesSection');
    const modalCreatures = document.getElementById('modalCreatures');
    if (location.creatures.length > 0) {
        creaturesSection.style.display = 'block';
        modalCreatures.innerHTML = location.creatures
            .map(creature => `<span class="creature-tag">${creature}</span>`)
            .join('');
    } else {
        creaturesSection.style.display = 'none';
    }

    // Points of Interest
    document.getElementById('modalPOI').innerHTML = location.pointsOfInterest
        .map(poi => `<li>${poi}</li>`)
        .join('');

    // Quests
    const questsSection = document.getElementById('questsSection');
    const modalQuests = document.getElementById('modalQuests');
    if (location.questsAvailable.length > 0) {
        questsSection.style.display = 'block';
        modalQuests.innerHTML = location.questsAvailable
            .map(quest => `<li>${quest}</li>`)
            .join('');
    } else {
        questsSection.style.display = 'none';
    }

    // Services
    const servicesSection = document.getElementById('servicesSection');
    const modalServices = document.getElementById('modalServices');
    if (location.services.length > 0) {
        servicesSection.style.display = 'block';
        modalServices.innerHTML = location.services
            .map(service => `<span class="service-tag">${service}</span>`)
            .join('');
    } else {
        servicesSection.style.display = 'none';
    }

    // Button actions
    document.getElementById('viewOnMapBtn').onclick = () => {
        alert(`Map view coming soon!\nCoordinates: X:${location.coordinates.x}, Y:${location.coordinates.y}`);
    };

    document.getElementById('viewCreaturesBtn').onclick = () => {
        if (location.creatures.length > 0) {
            window.location.href = `bestiary.html`;
        } else {
            alert('No creatures found at this location.');
        }
    };

    // Show modal
    locationModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    locationModal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Reset all filters
function resetFilters() {
    // Clear search
    searchInput.value = '';
    activeFilters.search = '';

    // Clear all checkboxes
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Reset filter arrays
    activeFilters.region = [];
    activeFilters.type = [];
    activeFilters.difficulty = [];

    // Reset sort
    currentSort = 'name';
    document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-sort="name"]').classList.add('active');

    // Reapply filters
    applyFilters();
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !locationModal.classList.contains('hidden')) {
        closeModal();
    }
});
