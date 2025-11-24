// Oblivion NPCs Table JavaScript

// Global state
let npcsData = [];
let filteredData = [];
const currentSort = { column: 'id', direction: 'asc' };

// DOM elements
const tableBody = document.getElementById('npcsTableBody');
const searchInput = document.getElementById('searchInput');
const raceFilter = document.getElementById('raceFilter');
const factionFilter = document.getElementById('factionFilter');
const genderFilter = document.getElementById('genderFilter');
const essentialFilter = document.getElementById('essentialFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const emptyState = document.getElementById('emptyState');
const totalNPCsEl = document.getElementById('totalNPCs');
const filteredNPCsEl = document.getElementById('filteredNPCs');
const essentialCountEl = document.getElementById('essentialCount');

// Initialize the application
async function init() {
    try {
        await loadNPCsData();
        populateFilters();
        setupEventListeners();
        applyFiltersAndSort();
        hideLoading();
    } catch (error) {
        console.error('Error initializing application:', error);
        showError();
    }
}

// Load NPCs data from JSON
async function loadNPCsData() {
    try {
        const response = await fetch('oblivion-npcs.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        npcsData = await response.json();
        filteredData = [...npcsData];
        updateStats();
    } catch (error) {
        console.error('Error loading NPCs data:', error);
        throw error;
    }
}

// Populate filter dropdowns
function populateFilters() {
    // Get unique races
    const races = [...new Set(npcsData.map(npc => npc.race))].sort();
    races.forEach(race => {
        const option = document.createElement('option');
        option.value = race;
        option.textContent = race;
        raceFilter.appendChild(option);
    });

    // Get unique factions
    const factions = [...new Set(npcsData.map(npc => npc.faction))].sort();
    factions.forEach(faction => {
        const option = document.createElement('option');
        option.value = faction;
        option.textContent = faction;
        factionFilter.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    searchInput.addEventListener('input', debounce(applyFiltersAndSort, 300));

    // Filter dropdowns
    raceFilter.addEventListener('change', applyFiltersAndSort);
    factionFilter.addEventListener('change', applyFiltersAndSort);
    genderFilter.addEventListener('change', applyFiltersAndSort);
    essentialFilter.addEventListener('change', applyFiltersAndSort);

    // Clear filters button
    clearFiltersBtn.addEventListener('click', clearFilters);

    // Table sorting
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => handleSort(header.dataset.sort));
    });
}

// Apply filters and sorting
function applyFiltersAndSort() {
    // Start with all data
    filteredData = [...npcsData];

    // Apply search filter
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filteredData = filteredData.filter(npc => 
            npc.name.toLowerCase().includes(searchTerm) ||
            npc.race.toLowerCase().includes(searchTerm) ||
            npc.faction.toLowerCase().includes(searchTerm) ||
            npc.location.toLowerCase().includes(searchTerm) ||
            npc.role.toLowerCase().includes(searchTerm) ||
            npc.description.toLowerCase().includes(searchTerm)
        );
    }

    // Apply race filter
    const selectedRace = raceFilter.value;
    if (selectedRace) {
        filteredData = filteredData.filter(npc => npc.race === selectedRace);
    }

    // Apply faction filter
    const selectedFaction = factionFilter.value;
    if (selectedFaction) {
        filteredData = filteredData.filter(npc => npc.faction === selectedFaction);
    }

    // Apply gender filter
    const selectedGender = genderFilter.value;
    if (selectedGender) {
        filteredData = filteredData.filter(npc => npc.gender === selectedGender);
    }

    // Apply essential filter
    const selectedEssential = essentialFilter.value;
    if (selectedEssential !== '') {
        const isEssential = selectedEssential === 'true';
        filteredData = filteredData.filter(npc => npc.essential === isEssential);
    }

    // Apply sorting
    sortData();

    // Update display
    renderTable();
    updateStats();
    updateEmptyState();
}

// Handle sorting
function handleSort(column) {
    if (currentSort.column === column) {
        // Toggle direction
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        // New column, default to ascending
        currentSort.column = column;
        currentSort.direction = 'asc';
    }

    // Update UI
    updateSortUI();

    // Re-sort and render
    sortData();
    renderTable();
}

// Sort the filtered data
function sortData() {
    filteredData.sort((a, b) => {
        let aVal = a[currentSort.column];
        let bVal = b[currentSort.column];

        // Handle different data types
        if (typeof aVal === 'boolean') {
            aVal = aVal ? 1 : 0;
            bVal = bVal ? 1 : 0;
        } else if (typeof aVal === 'number') {
            // Numbers compare directly
        } else {
            // Convert to lowercase for string comparison
            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();
        }

        let comparison = 0;
        if (aVal > bVal) {
            comparison = 1;
        } else if (aVal < bVal) {
            comparison = -1;
        }

        return currentSort.direction === 'asc' ? comparison : -comparison;
    });
}

// Update sort UI indicators
function updateSortUI() {
    document.querySelectorAll('.sortable').forEach(header => {
        header.classList.remove('sorted-asc', 'sorted-desc');
        if (header.dataset.sort === currentSort.column) {
            header.classList.add(`sorted-${currentSort.direction}`);
        }
    });
}

// Render table with filtered and sorted data
function renderTable() {
    tableBody.innerHTML = '';

    filteredData.forEach(npc => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${npc.id}</td>
            <td><strong>${npc.name}</strong></td>
            <td>${npc.race}</td>
            <td>${npc.gender}</td>
            <td>${npc.class}</td>
            <td>${npc.faction}</td>
            <td>${npc.location}</td>
            <td>
                <span class="essential-badge ${npc.essential ? 'yes' : 'no'}">
                    ${npc.essential ? 'Yes' : 'No'}
                </span>
            </td>
            <td>${npc.role}</td>
            <td>${npc.description}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Update statistics
function updateStats() {
    totalNPCsEl.textContent = npcsData.length;
    filteredNPCsEl.textContent = filteredData.length;
    
    const essentialCount = npcsData.filter(npc => npc.essential).length;
    essentialCountEl.textContent = essentialCount;
}

// Update empty state visibility
function updateEmptyState() {
    if (filteredData.length === 0) {
        emptyState.style.display = 'block';
        document.querySelector('.table-container').style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        document.querySelector('.table-container').style.display = 'block';
    }
}

// Clear all filters
function clearFilters() {
    searchInput.value = '';
    raceFilter.value = '';
    factionFilter.value = '';
    genderFilter.value = '';
    essentialFilter.value = '';
    applyFiltersAndSort();
}

// Hide loading state
function hideLoading() {
    loadingState.style.display = 'none';
}

// Show error state
function showError() {
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
}

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
