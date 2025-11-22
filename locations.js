// Locations Gallery JavaScript

let allLocations = [];
let filteredLocations = [];
let activeFilters = {
    search: '',
    type: [],
    difficulty: [],
    hold: [],
    region: [],
    fastTravel: false,
    discovered: false
};
let currentSort = 'name';
let viewMode = 'grid'; // 'grid' or 'list'

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadLocationData();
    initializeFilters();
    setupEventListeners();
    renderGallery();
});

// Load location data from JSON
async function loadLocationData() {
    try {
        const response = await fetch('locations.json');
        if (!response.ok) throw new Error('Failed to load locations.json');
        allLocations = await response.json();

        if (!Array.isArray(allLocations)) {
            allLocations = [];
        }

        filteredLocations = [...allLocations];
    } catch (error) {
        console.warn('Could not load locations.json:', error);
        allLocations = [];
        filteredLocations = [];
    }
}

// Initialize filter options
function initializeFilters() {
    const types = [...new Set(allLocations.map(l => l.type))].sort();
    const difficulties = [...new Set(allLocations.map(l => l.difficulty))].sort();
    const holds = [...new Set(allLocations.map(l => l.hold))].sort();
    const regions = [...new Set(allLocations.map(l => l.region))].sort();

    populateFilter('typeFilter', types, 'type');
    populateFilter('difficultyFilter', difficulties, 'difficulty');
    populateFilter('holdFilter', holds, 'hold');
    populateFilter('regionFilter', regions, 'region');
}

// Populate filter checkboxes
function populateFilter(filterId, options, filterType) {
    const filterEl = document.getElementById(filterId);
    if (!filterEl) return;

    filterEl.innerHTML = options.map(option => {
        const count = allLocations.filter(l => l[filterType] === option).length;

        return `
            <label class="filter-option">
                <input
                    type="checkbox"
                    class="filter-checkbox"
                    data-filter="${filterType}"
                    value="${option}"
                >
                <span class="filter-label">${option}</span>
                <span class="filter-count">(${count})</span>
            </label>
        `;
    }).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            activeFilters.search = e.target.value.toLowerCase();
            applyFilters();
        });
    }

    // Filter checkboxes
    document.querySelectorAll('.filter-checkbox:not([data-filter="fastTravel"]):not([data-filter="discovered"])').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const filterType = e.target.dataset.filter;
            const value = e.target.value;

            if (e.target.checked) {
                activeFilters[filterType].push(value);
            } else {
                activeFilters[filterType] = activeFilters[filterType].filter(v => v !== value);
            }

            applyFilters();
        });
    });

    // Fast Travel checkbox
    const fastTravelCheckbox = document.getElementById('fastTravelCheckbox');
    if (fastTravelCheckbox) {
        fastTravelCheckbox.addEventListener('change', (e) => {
            activeFilters.fastTravel = e.target.checked;
            applyFilters();
        });
    }

    // Discovered checkbox
    const discoveredCheckbox = document.getElementById('discoveredCheckbox');
    if (discoveredCheckbox) {
        discoveredCheckbox.addEventListener('change', (e) => {
            activeFilters.discovered = e.target.checked;
            applyFilters();
        });
    }

    // Sort buttons
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentSort = e.target.dataset.sort;
            applyFilters();
        });
    });

    // Clear filters button
    const clearBtn = document.getElementById('clearFiltersBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllFilters);
    }

    // Reset search button
    const resetBtn = document.getElementById('resetSearchBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', clearAllFilters);
    }

    // View toggle buttons
    const gridToggleBtn = document.getElementById('gridToggleBtn');
    if (gridToggleBtn) {
        gridToggleBtn.addEventListener('click', () => {
            viewMode = 'grid';
            renderGallery();
        });
    }

    const listToggleBtn = document.getElementById('listToggleBtn');
    if (listToggleBtn) {
        listToggleBtn.addEventListener('click', () => {
            viewMode = 'list';
            renderGallery();
        });
    }

    // Map view button
    const mapViewBtn = document.getElementById('mapViewBtn');
    if (mapViewBtn) {
        mapViewBtn.addEventListener('click', () => {
            document.getElementById('mapModal').classList.remove('hidden');
        });
    }

    // Map modal close
    const closeMapBtn = document.getElementById('closeMapBtn');
    if (closeMapBtn) {
        closeMapBtn.addEventListener('click', () => {
            document.getElementById('mapModal').classList.add('hidden');
        });
    }

    const mapModal = document.getElementById('mapModal');
    if (mapModal) {
        const overlay = mapModal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                mapModal.classList.add('hidden');
            });
        }
    }

    // Filter toggle buttons
    document.querySelectorAll('.filter-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filterType = e.target.dataset.filter;
            const filterOptions = e.target.closest('.filter-section').querySelector('.filter-options');

            if (filterOptions) {
                const isHidden = filterOptions.style.display === 'none';
                filterOptions.style.display = isHidden ? 'flex' : 'none';
                e.target.textContent = isHidden ? '−' : '+';
            }
        });
    });
}

// Apply filters and sorting
function applyFilters() {
    filteredLocations = allLocations.filter(location => {
        // Search filter
        if (activeFilters.search && !location.name.toLowerCase().includes(activeFilters.search)) {
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

        // Hold filter
        if (activeFilters.hold.length > 0 && !activeFilters.hold.includes(location.hold)) {
            return false;
        }

        // Region filter
        if (activeFilters.region.length > 0 && !activeFilters.region.includes(location.region)) {
            return false;
        }

        // Fast Travel filter
        if (activeFilters.fastTravel && !location.fastTravel) {
            return false;
        }

        // Discovered filter
        if (activeFilters.discovered && !location.discovered) {
            return false;
        }

        return true;
    });

    // Sort
    filteredLocations.sort((a, b) => {
        switch (currentSort) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'type':
                return a.type.localeCompare(b.type);
            case 'difficulty':
                const difficultyOrder = { 'Safe': 1, 'Normal': 2, 'Hard': 3, 'Deadly': 4 };
                return (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
            default:
                return 0;
        }
    });

    renderGallery();
}

// Clear all filters
function clearAllFilters() {
    activeFilters = {
        search: '',
        type: [],
        difficulty: [],
        hold: [],
        region: [],
        fastTravel: false,
        discovered: false
    };

    // Reset UI
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);

    applyFilters();
}

// Render locations gallery
function renderGallery() {
    const grid = document.getElementById('locationsGrid');
    const noResults = document.getElementById('noResults');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsCount = document.getElementById('resultsCount');

    // Update view mode class
    if (viewMode === 'list') {
        grid.classList.add('list-view');
    } else {
        grid.classList.remove('list-view');
    }

    // Update results count
    const filterCount = filteredLocations.length;
    const totalCount = allLocations.length;

    if (resultsCount) {
        resultsCount.textContent = `Showing ${filterCount} of ${totalCount} locations`;
    }

    if (resultsTitle) {
        const hasActiveFilters = activeFilters.search ||
            activeFilters.type.length > 0 ||
            activeFilters.difficulty.length > 0 ||
            activeFilters.hold.length > 0 ||
            activeFilters.region.length > 0 ||
            activeFilters.fastTravel ||
            activeFilters.discovered;

        resultsTitle.textContent = hasActiveFilters ? 'Filtered Locations' : 'All Locations';
    }

    // Show/hide no results
    if (filteredLocations.length === 0) {
        grid.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    } else {
        noResults.classList.add('hidden');
    }

    // Render location cards
    grid.innerHTML = filteredLocations.map(location => {
        const difficultyClass = location.difficulty.toLowerCase().replace(' ', '-');

        return `
            <div class="location-card" onclick="viewLocation(${location.id})">
                <img src="${location.imagePath}" alt="${location.name}" class="location-image">
                <div class="location-info">
                    <h3 class="location-name">${location.name}</h3>
                    <p class="location-type">${location.type}</p>
                    <div class="location-badges">
                        ${location.fastTravel ? '<span class="location-badge fast-travel">🗺️ Fast Travel</span>' : ''}
                        ${location.discovered ? '<span class="location-badge">✓ Discovered</span>' : ''}
                    </div>
                    <div class="location-details">
                        <div class="detail-item">
                            <span class="detail-label">Hold</span>
                            <span class="detail-value">${location.hold}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Danger</span>
                            <span class="detail-value">
                                <span class="difficulty-badge ${difficultyClass}">${location.difficulty}</span>
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Quests</span>
                            <span class="detail-value">${location.quests ? location.quests.length : 0}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Features</span>
                            <span class="detail-value">${location.features ? location.features.length : 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Navigate to location detail page
function viewLocation(locationId) {
    window.location.href = `location.html?id=${locationId}`;
}

// Toggle location as discovered
function toggleDiscovered(locationId) {
    const location = allLocations.find(l => l.id === locationId);
    if (location) {
        location.discovered = !location.discovered;

        // Save to localStorage
        const discovered = JSON.parse(localStorage.getItem('skyrim_discovered_locations') || '[]');
        if (location.discovered) {
            if (!discovered.includes(locationId)) {
                discovered.push(locationId);
            }
        } else {
            const index = discovered.indexOf(locationId);
            if (index > -1) {
                discovered.splice(index, 1);
            }
        }
        localStorage.setItem('skyrim_discovered_locations', JSON.stringify(discovered));

        renderGallery();
    }
}

// Load discovered locations from localStorage on init
function loadDiscoveredLocations() {
    const discovered = JSON.parse(localStorage.getItem('skyrim_discovered_locations') || '[]');
    allLocations.forEach(location => {
        location.discovered = discovered.includes(location.id);
    });
}
