// Bestiary Gallery JavaScript

let allCharacters = [];
let filteredCharacters = [];
let activeFilters = {
    search: '',
    race: [],
    difficulty: [],
    location: [],
    faction: [],
    collection: null,
    favorites: false
};
let currentSort = 'name';

// Comparison mode
let comparisonMode = false;
let selectedForComparison = [];

// Collections
let collections = [];
let currentCreatureForCollection = null;

// Favorites
let favorites = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadCharacterData();
    loadCollections();
    loadFavorites();
    updateFavoritesCount();
    initializeFilters();
    renderCollectionsList();
    setupEventListeners();
    renderGallery();
});

// Load character data from JSON
async function loadCharacterData() {
    try {
        const response = await fetch('../../data/characters.json');
        if (!response.ok) throw new Error('Failed to load characters.json');
        allCharacters = await response.json();

        if (!Array.isArray(allCharacters)) {
            allCharacters = [];
        }

        filteredCharacters = [...allCharacters];
    } catch (error) {
        console.warn('Could not load characters.json:', error);
        allCharacters = getSampleCharacterData();
        filteredCharacters = [...allCharacters];
    }
}

// Initialize filter options
function initializeFilters() {
    const races = [...new Set(allCharacters.map(c => c.race))].sort();
    const difficulties = [...new Set(allCharacters.map(c => c.difficulty))];
    const locations = [...new Set(allCharacters.map(c => c.location))].sort();
    const factions = [...new Set(allCharacters.map(c => c.faction || 'None'))].sort();

    populateFilter('raceFilter', races, 'race');
    populateFilter('difficultyFilter', difficulties, 'difficulty');
    populateFilter('locationFilter', locations, 'location');
    populateFilter('factionFilter', factions, 'faction');
}

// Populate filter checkboxes
function populateFilter(filterId, options, filterType) {
    const filterEl = document.getElementById(filterId);
    filterEl.innerHTML = options.map(option => {
        const count = allCharacters.filter(c => {
            if (filterType === 'faction') return (c.faction || 'None') === option;
            return c[filterType] === option;
        }).length;

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
    document.getElementById('searchInput').addEventListener('input', (e) => {
        activeFilters.search = e.target.value.toLowerCase();
        applyFilters();
    });

    // Filter checkboxes
    document.querySelectorAll('.filter-checkbox:not([data-filter="favorites"])').forEach(checkbox => {
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

    // Favorites checkbox (special handling - boolean, not array)
    const favoritesCheckbox = document.getElementById('favoritesCheckbox');
    if (favoritesCheckbox) {
        favoritesCheckbox.addEventListener('change', (e) => {
            activeFilters.favorites = e.target.checked;
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
    document.getElementById('clearFiltersBtn').addEventListener('click', clearAllFilters);

    // Reset search button
    document.getElementById('resetSearchBtn').addEventListener('click', clearAllFilters);

    // Comparison mode
    document.getElementById('compareToggleBtn').addEventListener('click', toggleComparisonMode);
    document.getElementById('viewComparisonBtn').addEventListener('click', viewComparison);
    document.getElementById('clearComparisonBtn').addEventListener('click', clearComparison);
    document.getElementById('closeComparisonBtn').addEventListener('click', () => {
        document.getElementById('comparisonModal').classList.add('hidden');
    });

    // Modal overlay click to close
    document.getElementById('comparisonModal').querySelector('.modal-overlay').addEventListener('click', () => {
        document.getElementById('comparisonModal').classList.add('hidden');
    });

    // Collection events
    document.getElementById('newCollectionBtn').addEventListener('click', showNewCollectionModal);
    document.getElementById('createCollectionBtn').addEventListener('click', createCollection);
    document.getElementById('cancelCollectionBtn').addEventListener('click', () => {
        document.getElementById('newCollectionModal').classList.add('hidden');
    });
    document.getElementById('closeNewCollectionBtn').addEventListener('click', () => {
        document.getElementById('newCollectionModal').classList.add('hidden');
    });
    document.getElementById('newCollectionModal').querySelector('.modal-overlay').addEventListener('click', () => {
        document.getElementById('newCollectionModal').classList.add('hidden');
    });

    // Add to collection modal
    document.getElementById('confirmAddToCollectionBtn').addEventListener('click', addCreatureToCollections);
    document.getElementById('cancelAddToCollectionBtn').addEventListener('click', () => {
        document.getElementById('addToCollectionModal').classList.add('hidden');
    });
    document.getElementById('closeAddToCollectionBtn').addEventListener('click', () => {
        document.getElementById('addToCollectionModal').classList.add('hidden');
    });
    document.getElementById('addToCollectionModal').querySelector('.modal-overlay').addEventListener('click', () => {
        document.getElementById('addToCollectionModal').classList.add('hidden');
    });

    // Keyboard navigation
    setupKeyboardNavigation();
}

// Keyboard navigation for gallery
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Ignore if typing in input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch(e.key) {
            case 'c':
            case 'C':
                e.preventDefault();
                toggleComparisonMode();
                break;
            case 'Escape':
                if (comparisonMode) {
                    toggleComparisonMode();
                }
                break;
            case 'h':
            case 'H':
            case '?':
                e.preventDefault();
                showKeyboardShortcuts();
                break;
        }
    });
}

// Show keyboard shortcuts help for gallery
function showKeyboardShortcuts() {
    const shortcuts = `
        <div style="padding: 20px; max-width: 500px;">
            <h3 style="margin-top: 0; color: var(--color-primary);">⌨️ Keyboard Shortcuts</h3>
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 12px 20px; margin-top: 20px;">
                <kbd style="padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-family: monospace;">C</kbd>
                <span>Toggle comparison mode</span>

                <kbd style="padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-family: monospace;">Esc</kbd>
                <span>Exit comparison mode</span>

                <kbd style="padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-family: monospace;">H or ?</kbd>
                <span>Show this help</span>
            </div>
            <button onclick="this.closest('.modal-overlay').parentElement.classList.add('hidden')"
                    style="margin-top: 20px; padding: 10px 20px; background: var(--color-primary); color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">
                Got it!
            </button>
        </div>
    `;
    showModal('Keyboard Shortcuts', shortcuts);
}

// Show modal helper for gallery
function showModal(title, content) {
    let modal = document.getElementById('helpModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'helpModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;"></div>
        `;
        document.body.appendChild(modal);

        const modalContent = document.createElement('div');
        modalContent.style.cssText = 'position: relative; background: white; border-radius: 8px; max-width: 600px; z-index: 10000;';
        modalContent.innerHTML = `
            <div style="padding: 20px; border-bottom: 1px solid #eee;">
                <h3 id="helpModalTitle" style="margin: 0;">${title}</h3>
            </div>
            <div id="helpModalBody" style="padding: 20px;"></div>
        `;
        modal.querySelector('.modal-overlay').appendChild(modalContent);

        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                modal.classList.add('hidden');
            }
        });
    }

    modal.querySelector('#helpModalTitle').textContent = title;
    modal.querySelector('#helpModalBody').innerHTML = content;
    modal.classList.remove('hidden');
}

// Collection management functions
function loadCollections() {
    const saved = localStorage.getItem('bestiary_collections');
    if (saved) {
        try {
            collections = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse collections:', e);
            collections = [];
        }
    }
}

function saveCollections() {
    localStorage.setItem('bestiary_collections', JSON.stringify(collections));
}

// Load favorites from localStorage
function loadFavorites() {
    const saved = localStorage.getItem('bestiary_favorites');
    if (saved) {
        try {
            favorites = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse favorites:', e);
            favorites = [];
        }
    }
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('bestiary_favorites', JSON.stringify(favorites));
}

// Toggle favorite for a creature
function toggleFavorite(creatureId) {
    const index = favorites.indexOf(creatureId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(creatureId);
    }
    saveFavorites();
    updateFavoritesCount();
    renderGallery();
}

// Check if a creature is favorited
function isFavorited(creatureId) {
    return favorites.includes(creatureId);
}

// Update favorites count display
function updateFavoritesCount() {
    const countEl = document.getElementById('favoritesCount');
    if (countEl) {
        countEl.textContent = `(${favorites.length})`;
    }
}

function renderCollectionsList() {
    const list = document.getElementById('collectionsList');
    if (collections.length === 0) {
        list.innerHTML = '<p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); text-align: center; padding: 12px;">No collections yet</p>';
        return;
    }

    list.innerHTML = collections.map((collection, idx) => `
        <div class="collection-item" data-collection-id="${collection.id}">
            <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                <span style="width: 12px; height: 12px; border-radius: 50%; background-color: ${collection.color};"></span>
                <span class="collection-item-name">${collection.name}</span>
            </div>
            <span class="collection-item-count">${collection.creatures.length}</span>
            <button class="collection-item-remove" data-collection-id="${collection.id}">×</button>
        </div>
    `).join('');

    // Add event listeners
    list.querySelectorAll('.collection-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('collection-item-remove')) {
                const collectionId = item.dataset.collectionId;
                activeFilters.collection = collectionId;
                applyFilters();
                document.querySelectorAll('.collection-item').forEach(i => i.style.opacity = '0.5');
                item.style.opacity = '1';
            }
        });
    });

    list.querySelectorAll('.collection-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const collectionId = btn.dataset.collectionId;
            deleteCollection(collectionId);
        });
    });
}

function showNewCollectionModal() {
    document.getElementById('newCollectionModal').classList.remove('hidden');
    document.getElementById('collectionNameInput').value = '';
    document.getElementById('collectionDescInput').value = '';
    document.getElementById('color2').checked = true;
}

function createCollection() {
    const name = document.getElementById('collectionNameInput').value.trim();
    if (!name) {
        alert('Please enter a collection name');
        return;
    }

    const newCollection = {
        id: Date.now().toString(),
        name: name,
        description: document.getElementById('collectionDescInput').value,
        color: document.querySelector('input[name="collectionColor"]:checked').value,
        creatures: [],
        createdAt: new Date().toISOString()
    };

    collections.push(newCollection);
    saveCollections();
    renderCollectionsList();
    document.getElementById('newCollectionModal').classList.add('hidden');
}

function deleteCollection(collectionId) {
    if (confirm('Delete this collection?')) {
        collections = collections.filter(c => c.id !== collectionId);
        if (activeFilters.collection === collectionId) {
            activeFilters.collection = null;
        }
        saveCollections();
        renderCollectionsList();
        applyFilters();
    }
}

function showAddToCollectionModal(creature) {
    currentCreatureForCollection = creature;
    const checklist = document.getElementById('collectionsChecklist');

    checklist.innerHTML = collections.map(collection => {
        const isInCollection = collection.creatures.some(c => c.id === creature.id);
        return `
            <label class="collection-checkbox-item">
                <input type="checkbox" class="collection-add-checkbox" data-collection-id="${collection.id}" ${isInCollection ? 'checked' : ''}>
                <span class="collection-checkbox-label">${collection.name}</span>
            </label>
        `;
    }).join('');

    if (collections.length === 0) {
        checklist.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); font-size: var(--font-size-sm);">No collections. Create one first!</p>';
    }

    document.getElementById('addToCollectionModal').classList.remove('hidden');
}

function addCreatureToCollections() {
    if (!currentCreatureForCollection) return;

    const checkboxes = document.querySelectorAll('.collection-add-checkbox');
    checkboxes.forEach(checkbox => {
        const collectionId = checkbox.dataset.collectionId;
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) return;

        const creatureExists = collection.creatures.some(c => c.id === currentCreatureForCollection.id);

        if (checkbox.checked && !creatureExists) {
            collection.creatures.push({
                id: currentCreatureForCollection.id,
                name: currentCreatureForCollection.name
            });
        } else if (!checkbox.checked && creatureExists) {
            collection.creatures = collection.creatures.filter(c => c.id !== currentCreatureForCollection.id);
        }
    });

    saveCollections();
    renderCollectionsList();
    document.getElementById('addToCollectionModal').classList.add('hidden');
}

// Apply filters and sorting
function applyFilters() {
    filteredCharacters = allCharacters.filter(character => {
        // Search filter
        if (activeFilters.search && !character.name.toLowerCase().includes(activeFilters.search)) {
            return false;
        }

        // Race filter
        if (activeFilters.race.length > 0 && !activeFilters.race.includes(character.race)) {
            return false;
        }

        // Difficulty filter
        if (activeFilters.difficulty.length > 0 && !activeFilters.difficulty.includes(character.difficulty)) {
            return false;
        }

        // Location filter
        if (activeFilters.location.length > 0 && !activeFilters.location.includes(character.location)) {
            return false;
        }

        // Faction filter
        if (activeFilters.faction.length > 0) {
            const charFaction = character.faction || 'None';
            if (!activeFilters.faction.includes(charFaction)) {
                return false;
            }
        }

        // Collection filter
        if (activeFilters.collection) {
            const collection = collections.find(c => c.id === activeFilters.collection);
            if (collection && !collection.creatures.some(c => c.id === character.id)) {
                return false;
            }
        }

        // Favorites filter
        if (activeFilters.favorites && !isFavorited(character.id)) {
            return false;
        }

        return true;
    });

    // Apply sorting
    sortCharacters();

    // Render gallery
    renderGallery();
}

// Sort characters
function sortCharacters() {
    switch (currentSort) {
        case 'name':
            filteredCharacters.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'level':
            filteredCharacters.sort((a, b) => b.level - a.level);
            break;
        case 'difficulty':
            const difficultyOrder = { 'Normal': 1, 'Hard': 2, 'Deadly': 3 };
            filteredCharacters.sort((a, b) => {
                const orderA = difficultyOrder[a.difficulty] || 0;
                const orderB = difficultyOrder[b.difficulty] || 0;
                return orderB - orderA;
            });
            break;
    }
}

// Render gallery
function renderGallery() {
    const grid = document.getElementById('creaturesGrid');
    const noResults = document.getElementById('noResults');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsCount = document.getElementById('resultsCount');

    // Update title and count
    if (activeFilters.search || activeFilters.race.length || activeFilters.difficulty.length ||
        activeFilters.location.length || activeFilters.faction.length) {
        resultsTitle.textContent = 'Search Results';
    } else {
        resultsTitle.textContent = 'All Creatures';
    }

    resultsCount.textContent = `${filteredCharacters.length} of ${allCharacters.length} creatures`;

    if (filteredCharacters.length === 0) {
        grid.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');
    grid.innerHTML = filteredCharacters.map(character => createCreatureCard(character)).join('');

    // Add click handlers to cards
    document.querySelectorAll('.creature-card').forEach((card, index) => {
        const addBtn = card.querySelector('.creature-card-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showAddToCollectionModal(filteredCharacters[index]);
            });
        }

        const favoriteBtn = card.querySelector('.creature-card-favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(filteredCharacters[index].id);
            });
        }

        if (comparisonMode) {
            const checkbox = card.querySelector('.creature-card-checkbox');
            if (checkbox) {
                checkbox.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleComparisonSelection(filteredCharacters[index], card);
                });
            }
            card.addEventListener('click', (e) => {
                const checkbox = card.querySelector('.creature-card-checkbox');
                checkbox.click();
            });
        } else {
            card.addEventListener('click', () => {
                const characterId = filteredCharacters[index].id;
                window.location.href = `character.html?character=${characterId - 1}`;
            });
        }
    });
}

// Create creature card HTML
function createCreatureCard(character) {
    const difficultyClass = character.difficulty.toLowerCase();
    const imagePath = character.imagePath || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E';
    const isSelected = selectedForComparison.some(c => c.id === character.id);
    const comparisonClass = comparisonMode ? 'comparison-mode' : '';
    const selectedClass = isSelected ? 'selected' : '';
    const checkbox = comparisonMode ? `<input type="checkbox" class="creature-card-checkbox" ${isSelected ? 'checked' : ''}>` : '';
    const addBtn = !comparisonMode ? `<button class="creature-card-add-btn" title="Add to collection" style="position: absolute; top: 8px; left: 8px; background: var(--color-primary); color: white; border: none; border-radius: 4px; width: 28px; height: 28px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; z-index: 10;">+</button>` : '';
    const favorited = isFavorited(character.id);
    const heartIcon = favorited ? '❤️' : '🤍';
    const favoriteBtn = !comparisonMode ? `<button class="creature-card-favorite-btn" title="Add to favorites" style="position: absolute; top: 8px; right: 8px; background: transparent; color: white; border: none; border-radius: 4px; width: 28px; height: 28px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; z-index: 10; text-shadow: 0 0 3px rgba(0,0,0,0.5);" data-creature-id="${character.id}">${heartIcon}</button>` : '';

    return `
        <div class="creature-card ${comparisonClass} ${selectedClass}">
            ${checkbox}
            ${addBtn}
            ${favoriteBtn}
            <img src="${imagePath}" alt="${character.name}" class="creature-image">
            <div class="creature-info">
                <h3 class="creature-name">${character.name}</h3>
                <p class="creature-race">${character.race}</p>
                <div class="creature-details">
                    <div class="detail-item">
                        <span class="detail-label">Level</span>
                        <span class="detail-value">${character.level}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Difficulty</span>
                        <span class="difficulty-badge ${difficultyClass}">${character.difficulty}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Clear all filters
function clearAllFilters() {
    // Reset active filters
    activeFilters = {
        search: '',
        race: [],
        difficulty: [],
        location: [],
        faction: [],
        collection: null,
        favorites: false
    };

    // Uncheck all checkboxes
    document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Clear search input
    document.getElementById('searchInput').value = '';

    // Reset sort
    currentSort = 'name';
    document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));

    // Reset collection highlighting
    document.querySelectorAll('.collection-item').forEach(item => item.style.opacity = '1');

    // Re-render
    applyFilters();
}

// Comparison functions
function toggleComparisonMode() {
    comparisonMode = !comparisonMode;
    const btn = document.getElementById('compareToggleBtn');

    if (comparisonMode) {
        btn.classList.add('active');
        document.body.style.paddingBottom = '100px'; // Add padding for banner
    } else {
        btn.classList.remove('active');
        document.body.style.paddingBottom = '0';
        clearComparison();
    }

    renderGallery();
}

function toggleComparisonSelection(character, cardEl) {
    const index = selectedForComparison.findIndex(c => c.id === character.id);

    if (index > -1) {
        selectedForComparison.splice(index, 1);
        cardEl.classList.remove('selected');
    } else {
        selectedForComparison.push(character);
        cardEl.classList.add('selected');
    }

    updateComparisonBanner();
}

function updateComparisonBanner() {
    const banner = document.getElementById('comparisonBanner');
    const count = document.getElementById('comparisonCount');
    const viewBtn = document.getElementById('viewComparisonBtn');

    if (selectedForComparison.length > 0) {
        banner.classList.remove('hidden');
        count.textContent = selectedForComparison.length;
        viewBtn.disabled = selectedForComparison.length < 2;
    } else {
        banner.classList.add('hidden');
        viewBtn.disabled = true;
    }
}

function clearComparison() {
    selectedForComparison = [];
    document.getElementById('comparisonBanner').classList.add('hidden');
    renderGallery();
}

function viewComparison() {
    if (selectedForComparison.length < 2) {
        alert('Select at least 2 creatures to compare');
        return;
    }

    const modal = document.getElementById('comparisonModal');
    const view = document.getElementById('comparisonView');

    view.innerHTML = generateComparisonView();
    modal.classList.remove('hidden');
}

function generateComparisonView() {
    // Create creature header
    let html = '<div class="comparison-header">';
    selectedForComparison.forEach(creature => {
        html += `
            <div class="comparison-creature">
                <img src="${creature.imagePath || 'placeholder'}" alt="${creature.name}" class="comparison-creature-image">
                <h4 class="comparison-creature-name">${creature.name}</h4>
                <p class="comparison-creature-race">${creature.race}</p>
            </div>
        `;
    });
    html += '</div>';

    // Create stats comparison
    html += '<div class="comparison-stat-group">';
    html += '<h4 class="comparison-stat-group-title">Base Stats</h4>';

    const statLabels = [
        { key: 'health', label: 'Health' },
        { key: 'magicka', label: 'Magicka' },
        { key: 'stamina', label: 'Stamina' }
    ];

    statLabels.forEach(stat => {
        const values = selectedForComparison.map(c => c.stats[stat.key] || 0);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);

        html += `<div class="comparison-stat-row">`;
        html += `<div class="comparison-stat-label">${stat.label}</div>`;
        values.forEach((value, idx) => {
            let valueClass = 'comparison-stat-value';
            if (value === maxValue && selectedForComparison.length > 1) valueClass += ' highest';
            else if (value === minValue && selectedForComparison.length > 1) valueClass += ' lowest';
            html += `<div class="${valueClass}">${value}</div>`;
        });
        html += `</div>`;
    });

    html += '</div>';

    // Create other attributes
    html += '<div class="comparison-stat-group">';
    html += '<h4 class="comparison-stat-group-title">Attributes</h4>';

    html += `<div class="comparison-stat-row">`;
    html += `<div class="comparison-stat-label">Level</div>`;
    selectedForComparison.forEach(creature => {
        html += `<div class="comparison-stat-value">${creature.level}</div>`;
    });
    html += `</div>`;

    html += `<div class="comparison-stat-row">`;
    html += `<div class="comparison-stat-label">Difficulty</div>`;
    selectedForComparison.forEach(creature => {
        html += `<div class="comparison-stat-value">${creature.difficulty}</div>`;
    });
    html += `</div>`;

    html += `<div class="comparison-stat-row">`;
    html += `<div class="comparison-stat-label">Race</div>`;
    selectedForComparison.forEach(creature => {
        html += `<div class="comparison-stat-value">${creature.race}</div>`;
    });
    html += `</div>`;

    html += '</div>';

    return html;
}

// Sample character data (fallback)
function getSampleCharacterData() {
    return [
        {
            id: 1,
            name: "Alduin",
            race: "Dragon",
            level: 50,
            location: "Skuldafn Temple",
            faction: "Dragons",
            difficulty: "Deadly",
            description: "The World-Eater",
            imagePath: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23660000%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E",
            modelPath: "../../models/enhanced_mesh.obj",
            stats: { health: 100, magicka: 75, stamina: 85 },
            skills: [],
            combat: []
        },
        {
            id: 2,
            name: "Daedric Dremora",
            race: "Dremora",
            level: 30,
            location: "Oblivion Gates",
            faction: "Daedric Forces",
            difficulty: "Hard",
            description: "A fearsome Dremora warrior",
            imagePath: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23662200%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E",
            modelPath: "../../models/enhanced_mesh.obj",
            stats: { health: 85, magicka: 90, stamina: 75 },
            skills: [],
            combat: []
        },
        {
            id: 3,
            name: "Frostbite Spider",
            race: "Arachnid",
            level: 12,
            location: "Blackreach, Dwemer Ruins",
            faction: "Wildlife",
            difficulty: "Normal",
            description: "A giant ice-infused spider",
            imagePath: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%2300ccff%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E",
            modelPath: "../../models/enhanced_mesh.obj",
            stats: { health: 45, magicka: 20, stamina: 60 },
            skills: [],
            combat: []
        },
        {
            id: 4,
            name: "Ancient Dragon",
            race: "Dragon",
            level: 45,
            location: "Various Dragon Lairs",
            faction: "Dragons",
            difficulty: "Deadly",
            description: "One of the oldest and most powerful dragons",
            imagePath: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23333333%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E",
            modelPath: "../../models/enhanced_mesh.obj",
            stats: { health: 95, magicka: 70, stamina: 80 },
            skills: [],
            combat: []
        },
        {
            id: 5,
            name: "Vampire Lord",
            race: "Vampire",
            level: 35,
            location: "Vampire Lairs",
            faction: "Vampires",
            difficulty: "Hard",
            description: "A powerful vampire in their lord form",
            imagePath: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23330000%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E",
            modelPath: "../../models/enhanced_mesh.obj",
            stats: { health: 80, magicka: 85, stamina: 70 },
            skills: [],
            combat: []
        },
        {
            id: 6,
            name: "Frost Atronach",
            race: "Atronach",
            level: 20,
            location: "Nordic Ruins, Frozen Peaks",
            faction: "Daedric Constructs",
            difficulty: "Normal",
            description: "An elemental construct of pure frost magic",
            imagePath: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%2300ffff%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E",
            modelPath: "../../models/enhanced_mesh.obj",
            stats: { health: 70, magicka: 65, stamina: 50 },
            skills: [],
            combat: []
        },
        {
            id: 7,
            name: "Sabre Cat",
            race: "Beast",
            level: 16,
            location: "Wilderness, Mountain Passes",
            faction: "Wildlife",
            difficulty: "Normal",
            description: "A large predatory feline with saber-like teeth",
            imagePath: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23cc8822%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E",
            modelPath: "../../models/enhanced_mesh.obj",
            stats: { health: 55, magicka: 10, stamina: 70 },
            skills: [],
            combat: []
        },
        {
            id: 8,
            name: "Deathlord",
            race: "Draugr",
            level: 28,
            location: "Nordic Tombs",
            faction: "Undead",
            difficulty: "Hard",
            description: "The most powerful form of draugr",
            imagePath: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23444444%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E",
            modelPath: "../../models/enhanced_mesh.obj",
            stats: { health: 75, magicka: 60, stamina: 75 },
            skills: [],
            combat: []
        },
        {
            id: 9,
            name: "Storm Atronach",
            race: "Atronach",
            level: 22,
            location: "Mountain Peaks, Storms",
            faction: "Daedric Constructs",
            difficulty: "Normal",
            description: "An elemental construct of storm and lightning",
            imagePath: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ffff00%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E",
            modelPath: "../../models/enhanced_mesh.obj",
            stats: { health: 72, magicka: 70, stamina: 48 },
            skills: [],
            combat: []
        },
        {
            id: 10,
            name: "Daedric Sphere",
            race: "Daedric Construct",
            level: 18,
            location: "Dwemer Ruins, Oblivion Gates",
            faction: "Daedric Forces",
            difficulty: "Normal",
            description: "A mechanical sphere of pure Daedric design",
            imagePath: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23554433%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E",
            modelPath: "../../models/enhanced_mesh.obj",
            stats: { health: 65, magicka: 40, stamina: 60 },
            skills: [],
            combat: []
        }
    ];
}
