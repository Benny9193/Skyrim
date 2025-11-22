// Bestiary Gallery JavaScript - API Integrated
import api, { characterAPI, favoritesAPI, statsAPI, healthCheck } from '../api/client.js';
import { debounce } from '../utils/performance.js';

// State management
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

// Collections (still localStorage for now)
let collections = [];
let currentCreatureForCollection = null;

// Favorites (from backend)
let favorites = [];
let favoriteIds = [];

// Loading state
let isLoading = false;
let loadError = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    showLoadingState();
    await initializeApp();
});

// Initialize the application
async function initializeApp() {
    try {
        // Check backend health
        const isBackendHealthy = await healthCheck();

        if (!isBackendHealthy) {
            console.warn('Backend is not available, using fallback data');
            showError('Backend API is offline. Using sample data.');
            await loadFallbackData();
        } else {
            // Load data from backend
            await Promise.all([
                loadCharacterData(),
                loadFavorites()
            ]);
        }

        // Load collections from localStorage
        loadCollections();

        // Initialize UI
        initializeFilters();
        renderCollectionsList();
        setupEventListeners();
        setupGalleryEventDelegation(); // Setup event delegation once
        renderGallery();
        hideLoadingState();

    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to load application. Please refresh the page.');
        await loadFallbackData();
        hideLoadingState();
    }
}

// Show loading state
function showLoadingState() {
    isLoading = true;
    const grid = document.getElementById('creaturesGrid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                <h3 style="color: var(--color-text-secondary); margin: 0;">Loading creatures...</h3>
                <p style="color: var(--color-text-tertiary); margin-top: 8px; font-size: 14px;">Fetching data from backend API</p>
            </div>
        `;
    }
}

// Hide loading state
function hideLoadingState() {
    isLoading = false;
}

// Show error message
function showError(message) {
    const grid = document.getElementById('creaturesGrid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <h3 style="color: var(--color-danger, #dc3545); margin: 0;">Error</h3>
                <p style="color: var(--color-text-secondary); margin-top: 12px;">${message}</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: var(--color-primary); color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Reload Page
                </button>
            </div>
        `;
    }
}

// Load character data from backend API
async function loadCharacterData() {
    try {
        const response = await characterAPI.getAll();

        if (response.success && Array.isArray(response.data)) {
            allCharacters = response.data;
            filteredCharacters = [...allCharacters];
            console.log(`✓ Loaded ${allCharacters.length} characters from API`);
        } else {
            throw new Error('Invalid response format from API');
        }
    } catch (error) {
        console.error('Failed to load characters from API:', error);
        throw error;
    }
}

// Load favorites from backend API
async function loadFavorites() {
    try {
        const response = await favoritesAPI.getAll();

        if (response.success && Array.isArray(response.data)) {
            favorites = response.data;
            favoriteIds = favorites.map(fav => fav.character_id);
            updateFavoritesCount();
            console.log(`✓ Loaded ${favoriteIds.length} favorites from API`);
        } else {
            console.warn('Invalid favorites response, using empty array');
            favorites = [];
            favoriteIds = [];
        }
    } catch (error) {
        console.warn('Failed to load favorites:', error);
        // Fallback to localStorage
        loadFavoritesFromLocalStorage();
    }
}

// Fallback: Load favorites from localStorage
function loadFavoritesFromLocalStorage() {
    const saved = localStorage.getItem('bestiary_favorites');
    if (saved) {
        try {
            favoriteIds = JSON.parse(saved);
            updateFavoritesCount();
            console.log('✓ Loaded favorites from localStorage (fallback)');
        } catch (e) {
            console.error('Failed to parse localStorage favorites:', e);
            favoriteIds = [];
        }
    }
}

// Load fallback data when backend is unavailable
async function loadFallbackData() {
    try {
        const response = await fetch('../../data/characters.json');
        if (!response.ok) throw new Error('Failed to load characters.json');
        allCharacters = await response.json();

        if (!Array.isArray(allCharacters)) {
            allCharacters = getSampleCharacterData();
        }

        filteredCharacters = [...allCharacters];
        console.log('✓ Loaded fallback data from characters.json');
    } catch (error) {
        console.warn('Could not load characters.json, using sample data:', error);
        allCharacters = getSampleCharacterData();
        filteredCharacters = [...allCharacters];
    }

    // Load favorites from localStorage
    loadFavoritesFromLocalStorage();
}

// Toggle favorite for a creature
async function toggleFavorite(creatureId) {
    const wasFavorited = isFavorited(creatureId);

    try {
        if (wasFavorited) {
            // Remove from favorites
            const response = await favoritesAPI.remove(creatureId);
            if (response.success) {
                favoriteIds = favoriteIds.filter(id => id !== creatureId);
                console.log(`✓ Removed from favorites: ${creatureId}`);
            }
        } else {
            // Add to favorites
            const response = await favoritesAPI.add(creatureId);
            if (response.success) {
                favoriteIds.push(creatureId);
                console.log(`✓ Added to favorites: ${creatureId}`);
            }
        }

        // Update UI
        updateFavoritesCount();
        renderGallery();

    } catch (error) {
        console.error('Failed to toggle favorite:', error);

        // Fallback to localStorage
        const index = favoriteIds.indexOf(creatureId);
        if (index > -1) {
            favoriteIds.splice(index, 1);
        } else {
            favoriteIds.push(creatureId);
        }
        localStorage.setItem('bestiary_favorites', JSON.stringify(favoriteIds));
        updateFavoritesCount();
        renderGallery();
    }
}

// Check if a creature is favorited
function isFavorited(creatureId) {
    return favoriteIds.includes(creatureId);
}

// Update favorites count display
function updateFavoritesCount() {
    const countEl = document.getElementById('favoritesCount');
    if (countEl) {
        countEl.textContent = `(${favoriteIds.length})`;
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
    if (!filterEl) return;

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
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        // Debounce search to improve performance with large datasets
        const debouncedSearch = debounce((value) => {
            activeFilters.search = value.toLowerCase();
            applyFilters();
        }, 300);
        
        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    }

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

    // Favorites checkbox
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
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }

    // Reset search button
    const resetSearchBtn = document.getElementById('resetSearchBtn');
    if (resetSearchBtn) {
        resetSearchBtn.addEventListener('click', clearAllFilters);
    }

    // Comparison mode
    const compareToggleBtn = document.getElementById('compareToggleBtn');
    if (compareToggleBtn) {
        compareToggleBtn.addEventListener('click', toggleComparisonMode);
    }

    const viewComparisonBtn = document.getElementById('viewComparisonBtn');
    if (viewComparisonBtn) {
        viewComparisonBtn.addEventListener('click', viewComparison);
    }

    const clearComparisonBtn = document.getElementById('clearComparisonBtn');
    if (clearComparisonBtn) {
        clearComparisonBtn.addEventListener('click', clearComparison);
    }

    const closeComparisonBtn = document.getElementById('closeComparisonBtn');
    if (closeComparisonBtn) {
        closeComparisonBtn.addEventListener('click', () => {
            document.getElementById('comparisonModal').classList.add('hidden');
        });
    }

    // Modal overlay click to close
    const comparisonModal = document.getElementById('comparisonModal');
    if (comparisonModal) {
        const overlay = comparisonModal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                comparisonModal.classList.add('hidden');
            });
        }
    }

    // Collection events
    setupCollectionEventListeners();

    // Keyboard navigation
    setupKeyboardNavigation();
}

// Setup collection event listeners
function setupCollectionEventListeners() {
    const newCollectionBtn = document.getElementById('newCollectionBtn');
    if (newCollectionBtn) {
        newCollectionBtn.addEventListener('click', showNewCollectionModal);
    }

    const createCollectionBtn = document.getElementById('createCollectionBtn');
    if (createCollectionBtn) {
        createCollectionBtn.addEventListener('click', createCollection);
    }

    const cancelCollectionBtn = document.getElementById('cancelCollectionBtn');
    if (cancelCollectionBtn) {
        cancelCollectionBtn.addEventListener('click', () => {
            document.getElementById('newCollectionModal').classList.add('hidden');
        });
    }

    const closeNewCollectionBtn = document.getElementById('closeNewCollectionBtn');
    if (closeNewCollectionBtn) {
        closeNewCollectionBtn.addEventListener('click', () => {
            document.getElementById('newCollectionModal').classList.add('hidden');
        });
    }

    const newCollectionModal = document.getElementById('newCollectionModal');
    if (newCollectionModal) {
        const overlay = newCollectionModal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                newCollectionModal.classList.add('hidden');
            });
        }
    }

    // Add to collection modal
    const confirmAddToCollectionBtn = document.getElementById('confirmAddToCollectionBtn');
    if (confirmAddToCollectionBtn) {
        confirmAddToCollectionBtn.addEventListener('click', addCreatureToCollections);
    }

    const cancelAddToCollectionBtn = document.getElementById('cancelAddToCollectionBtn');
    if (cancelAddToCollectionBtn) {
        cancelAddToCollectionBtn.addEventListener('click', () => {
            document.getElementById('addToCollectionModal').classList.add('hidden');
        });
    }

    const closeAddToCollectionBtn = document.getElementById('closeAddToCollectionBtn');
    if (closeAddToCollectionBtn) {
        closeAddToCollectionBtn.addEventListener('click', () => {
            document.getElementById('addToCollectionModal').classList.add('hidden');
        });
    }

    const addToCollectionModal = document.getElementById('addToCollectionModal');
    if (addToCollectionModal) {
        const overlay = addToCollectionModal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                addToCollectionModal.classList.add('hidden');
            });
        }
    }
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

// Show keyboard shortcuts help
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

// Show modal helper
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

function renderCollectionsList() {
    const list = document.getElementById('collectionsList');
    if (!list) return;

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
    const modal = document.getElementById('newCollectionModal');
    if (!modal) return;

    modal.classList.remove('hidden');
    document.getElementById('collectionNameInput').value = '';
    document.getElementById('collectionDescInput').value = '';
    const defaultColor = document.getElementById('color2');
    if (defaultColor) defaultColor.checked = true;
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
    if (!checklist) return;

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
            const difficultyOrder = { 'Easy': 0, 'Normal': 1, 'Hard': 2, 'Deadly': 3 };
            filteredCharacters.sort((a, b) => {
                const orderA = difficultyOrder[a.difficulty] || 0;
                const orderB = difficultyOrder[b.difficulty] || 0;
                return orderB - orderA;
            });
            break;
    }
}

// Render gallery
// Render gallery with event delegation to prevent memory leaks
function renderGallery() {
    const grid = document.getElementById('creaturesGrid');
    const noResults = document.getElementById('noResults');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsCount = document.getElementById('resultsCount');

    if (!grid) return;

    // Update title and count
    if (activeFilters.search || activeFilters.race.length || activeFilters.difficulty.length ||
        activeFilters.location.length || activeFilters.faction.length) {
        if (resultsTitle) resultsTitle.textContent = 'Search Results';
    } else {
        if (resultsTitle) resultsTitle.textContent = 'All Creatures';
    }

    if (resultsCount) {
        resultsCount.textContent = `${filteredCharacters.length} of ${allCharacters.length} creatures`;
    }

    if (filteredCharacters.length === 0) {
        grid.innerHTML = '';
        if (noResults) noResults.classList.remove('hidden');
        return;
    }

    if (noResults) noResults.classList.add('hidden');
    grid.innerHTML = filteredCharacters.map((character, index) => 
        createCreatureCard(character, index)
    ).join('');
}

// Setup event delegation for gallery (call once on initialization)
function setupGalleryEventDelegation() {
    const grid = document.getElementById('creaturesGrid');
    if (!grid) return;
    
    // Use event delegation instead of adding listeners to each card
    grid.addEventListener('click', async (e) => {
        const card = e.target.closest('.creature-card');
        if (!card) return;
        
        const index = parseInt(card.dataset.index);
        const character = filteredCharacters[index];
        if (!character) return;
        
        // Handle add to collection button
        if (e.target.closest('.creature-card-add-btn')) {
            e.stopPropagation();
            showAddToCollectionModal(character);
            return;
        }
        
        // Handle favorite button
        if (e.target.closest('.creature-card-favorite-btn')) {
            e.stopPropagation();
            await toggleFavorite(character.id);
            // Update just this button instead of re-rendering
            const btn = e.target.closest('.creature-card-favorite-btn');
            const favorited = isFavorited(character.id);
            btn.textContent = favorited ? '❤️' : '🤍';
            return;
        }
        
        // Handle comparison checkbox
        if (comparisonMode) {
            const checkbox = e.target.closest('.creature-card-checkbox');
            if (checkbox) {
                e.stopPropagation();
                toggleComparisonSelection(character, card);
                return;
            }
            // Click anywhere on card in comparison mode toggles checkbox
            const cardCheckbox = card.querySelector('.creature-card-checkbox');
            if (cardCheckbox) {
                cardCheckbox.checked = !cardCheckbox.checked;
                toggleComparisonSelection(character, card);
            }
        } else {
            // Navigate to character detail page
            window.location.href = `character.html?character=${character.id - 1}`;
        }
    });
}

// Create creature card HTML with data-index for event delegation
function createCreatureCard(character, index) {
    const difficultyClass = character.difficulty.toLowerCase();
    const imagePath = character.imagePath || character.image_path || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E';
    const isSelected = selectedForComparison.some(c => c.id === character.id);
    const comparisonClass = comparisonMode ? 'comparison-mode' : '';
    const selectedClass = isSelected ? 'selected' : '';
    const checkbox = comparisonMode ? `<input type="checkbox" class="creature-card-checkbox" ${isSelected ? 'checked' : ''}>` : '';
    const addBtn = !comparisonMode ? `<button class="creature-card-add-btn" title="Add to collection" style="position: absolute; top: 8px; left: 8px; background: var(--color-primary); color: white; border: none; border-radius: 4px; width: 28px; height: 28px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; z-index: 10;">+</button>` : '';
    const favorited = isFavorited(character.id);
    const heartIcon = favorited ? '❤️' : '🤍';
    const favoriteBtn = !comparisonMode ? `<button class="creature-card-favorite-btn" title="Add to favorites" style="position: absolute; top: 8px; right: 8px; background: transparent; color: white; border: none; border-radius: 4px; width: 28px; height: 28px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; z-index: 10; text-shadow: 0 0 3px rgba(0,0,0,0.5);" data-creature-id="${character.id}">${heartIcon}</button>` : '';

    // Get stats (handle both nested object and flat structure)
    const health = character.stats?.health || character.health || 0;
    const level = character.level || 0;

    return `
        <div class="creature-card ${comparisonClass} ${selectedClass}" data-index="${index}">
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
                        <span class="detail-value">${level}</span>
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
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

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

    if (btn) {
        if (comparisonMode) {
            btn.classList.add('active');
            document.body.style.paddingBottom = '100px';
        } else {
            btn.classList.remove('active');
            document.body.style.paddingBottom = '0';
            clearComparison();
        }
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

    if (!banner || !count || !viewBtn) return;

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
    const banner = document.getElementById('comparisonBanner');
    if (banner) banner.classList.add('hidden');
    renderGallery();
}

function viewComparison() {
    if (selectedForComparison.length < 2) {
        alert('Select at least 2 creatures to compare');
        return;
    }

    const modal = document.getElementById('comparisonModal');
    const view = document.getElementById('comparisonView');

    if (modal && view) {
        view.innerHTML = generateComparisonView();
        modal.classList.remove('hidden');
    }
}

function generateComparisonView() {
    // Create creature header
    let html = '<div class="comparison-header">';
    selectedForComparison.forEach(creature => {
        const imagePath = creature.imagePath || creature.image_path || 'placeholder';
        html += `
            <div class="comparison-creature">
                <img src="${imagePath}" alt="${creature.name}" class="comparison-creature-image">
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
        const values = selectedForComparison.map(c => c.stats?.[stat.key] || c[stat.key] || 0);
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
            stats: { health: 100, magicka: 75, stamina: 85 }
        }
    ];
}
