/**
 * Skyrim Navigation System
 * Handles navigation state, search, favorites, dark mode, and mobile menu
 */

class SkyrimNavigation {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.searchData = null;
        this.searchIndex = -1;
        this.init();
    }

    /**
     * Initialize navigation system
     */
    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Setup all navigation components
     */
    async setup() {
        // Load navigation HTML
        await this.loadNavigation();
        
        // Initialize components
        this.initMobileMenu();
        this.initDropdowns();
        this.initSearch();
        this.initTheme();
        this.initFavorites();
        this.setActivePage();
        
        // Global keyboard shortcuts
        this.initKeyboardShortcuts();
    }

    /**
     * Load navigation HTML into the page
     */
    async loadNavigation() {
        try {
            const response = await fetch('/src/components/nav-bar.html');
            if (!response.ok) throw new Error('Failed to load navigation');
            
            const navHTML = await response.text();
            
            // Insert at the beginning of body
            document.body.insertAdjacentHTML('afterbegin', navHTML);
        } catch (error) {
            console.error('Error loading navigation:', error);
            // Fallback: create a basic nav if loading fails
            this.createFallbackNav();
        }
    }

    /**
     * Create fallback navigation if HTML file can't be loaded
     */
    createFallbackNav() {
        const nav = document.createElement('nav');
        nav.className = 'skyrim-nav';
        nav.innerHTML = `
            <div class="nav-container">
                <a href="landing.html" class="nav-brand">
                    <span class="nav-logo">🐉</span>
                    <span class="nav-brand-text">Skyrim Interactive</span>
                </a>
                <div class="nav-actions">
                    <button class="nav-action-btn" id="themeToggle" aria-label="Toggle dark mode">
                        <span class="action-icon theme-icon-light">☀️</span>
                        <span class="action-icon theme-icon-dark">🌙</span>
                    </button>
                </div>
            </div>
        `;
        document.body.insertBefore(nav, document.body.firstChild);
    }

    /**
     * Get current page filename
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'landing.html';
        return page;
    }

    /**
     * Set active page in navigation
     */
    setActivePage() {
        const currentPage = this.currentPage;
        const navLinks = document.querySelectorAll('.nav-link, .dropdown-item');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes(currentPage)) {
                link.classList.add('active');
                
                // Also highlight parent dropdown if this is a dropdown item
                if (link.classList.contains('dropdown-item')) {
                    const dropdown = link.closest('.has-dropdown');
                    if (dropdown) {
                        const parentLink = dropdown.querySelector('.nav-link');
                        if (parentLink) {
                            parentLink.classList.add('active');
                        }
                    }
                }
            }
        });
    }

    /**
     * Initialize mobile menu toggle
     */
    initMobileMenu() {
        const toggle = document.getElementById('navToggle');
        const menu = document.getElementById('navMenu');
        
        if (!toggle || !menu) return;
        
        toggle.addEventListener('click', () => {
            const isActive = menu.classList.toggle('active');
            toggle.classList.toggle('active');
            toggle.setAttribute('aria-expanded', isActive);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isActive ? 'hidden' : '';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!toggle.contains(e.target) && !menu.contains(e.target) && menu.classList.contains('active')) {
                menu.classList.remove('active');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    /**
     * Initialize dropdown menus
     */
    initDropdowns() {
        const dropdownToggles = document.querySelectorAll('.has-dropdown > .nav-link');
        
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                
                // Close all other dropdowns
                dropdownToggles.forEach(other => {
                    if (other !== toggle) {
                        other.setAttribute('aria-expanded', 'false');
                    }
                });
                
                // Toggle current dropdown
                toggle.setAttribute('aria-expanded', !isExpanded);
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.has-dropdown')) {
                dropdownToggles.forEach(toggle => {
                    toggle.setAttribute('aria-expanded', 'false');
                });
            }
        });
    }

    /**
     * Initialize search functionality
     */
    initSearch() {
        const searchBtn = document.getElementById('searchBtn');
        const searchModal = document.getElementById('searchModal');
        const searchInput = document.getElementById('searchModalInput');
        const searchOverlay = document.getElementById('searchModalOverlay');
        const searchCloseBtn = document.getElementById('searchCloseBtn');
        
        if (!searchBtn || !searchModal || !searchInput) return;
        
        // Open search modal
        const openSearch = () => {
            searchModal.classList.add('active');
            searchInput.focus();
            document.body.style.overflow = 'hidden';
        };
        
        // Close search modal
        const closeSearch = () => {
            searchModal.classList.remove('active');
            searchInput.value = '';
            this.searchIndex = -1;
            document.body.style.overflow = '';
            this.clearSearchResults();
        };
        
        searchBtn.addEventListener('click', openSearch);
        searchOverlay?.addEventListener('click', closeSearch);
        searchCloseBtn?.addEventListener('click', closeSearch);
        
        // Search input
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300);
        });
        
        // Keyboard navigation in search
        searchInput.addEventListener('keydown', (e) => {
            this.handleSearchKeyboard(e);
        });
    }

    /**
     * Perform search across all content
     */
    async performSearch(query) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;
        
        if (!query.trim()) {
            this.clearSearchResults();
            return;
        }
        
        // Load search data if not already loaded
        if (!this.searchData) {
            await this.loadSearchData();
        }
        
        const results = this.searchInData(query);
        this.displaySearchResults(results);
    }

    /**
     * Load all searchable data
     */
    async loadSearchData() {
        try {
            const [characters, locations, achievements, dragons] = await Promise.all([
                fetch('/characters.json').then(r => r.ok ? r.json() : []).catch(() => []),
                fetch('/locations.json').then(r => r.ok ? r.json() : []).catch(() => []),
                fetch('/achievements.json').then(r => r.ok ? r.json() : []).catch(() => []),
                fetch('/dragons.json').then(r => r.ok ? r.json() : []).catch(() => [])
            ]);
            
            this.searchData = {
                creatures: characters || [],
                locations: locations || [],
                achievements: achievements || [],
                dragons: dragons || []
            };
        } catch (error) {
            console.error('Error loading search data:', error);
            this.searchData = { creatures: [], locations: [], achievements: [], dragons: [] };
        }
    }

    /**
     * Search in loaded data
     */
    searchInData(query) {
        const lowerQuery = query.toLowerCase();
        const results = {
            creatures: [],
            locations: [],
            achievements: [],
            pages: []
        };
        
        if (!this.searchData) return results;
        
        // Search creatures
        if (this.searchData.creatures) {
            results.creatures = this.searchData.creatures
                .filter(c => 
                    c.name?.toLowerCase().includes(lowerQuery) ||
                    c.race?.toLowerCase().includes(lowerQuery) ||
                    c.description?.toLowerCase().includes(lowerQuery)
                )
                .slice(0, 5);
        }
        
        // Search locations
        if (this.searchData.locations) {
            results.locations = this.searchData.locations
                .filter(l => 
                    l.name?.toLowerCase().includes(lowerQuery) ||
                    l.type?.toLowerCase().includes(lowerQuery) ||
                    l.description?.toLowerCase().includes(lowerQuery)
                )
                .slice(0, 5);
        }
        
        // Search achievements
        if (this.searchData.achievements) {
            results.achievements = this.searchData.achievements
                .filter(a => 
                    a.name?.toLowerCase().includes(lowerQuery) ||
                    a.description?.toLowerCase().includes(lowerQuery)
                )
                .slice(0, 5);
        }
        
        // Search pages (static page list)
        const pages = [
            { name: 'Bestiary', url: 'bestiary.html', icon: '🗂️', desc: 'Browse all creatures' },
            { name: 'Combat Simulator', url: 'combat-simulator.html', icon: '⚔️', desc: 'Simulate battles' },
            { name: 'Character Builder', url: 'character-builder.html', icon: '👤', desc: 'Build your character' },
            { name: '3D Studio', url: 'index.html', icon: '🎬', desc: 'Create 3D models' },
            { name: 'Map', url: 'map.html', icon: '🗺️', desc: 'Explore Skyrim map' },
            { name: 'Skill Tree', url: 'skill-tree.html', icon: '🌳', desc: 'View skill trees' },
            { name: 'Alchemy', url: 'alchemy.html', icon: '⚗️', desc: 'Potion crafting' },
            { name: 'Enchantments', url: 'enchantments.html', icon: '✨', desc: 'Enchanting guide' }
        ];
        
        results.pages = pages.filter(p => 
            p.name.toLowerCase().includes(lowerQuery) ||
            p.desc.toLowerCase().includes(lowerQuery)
        ).slice(0, 3);
        
        return results;
    }

    /**
     * Display search results
     */
    displaySearchResults(results) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;
        
        let html = '';
        
        // Pages
        if (results.pages && results.pages.length > 0) {
            html += this.createSearchGroup('Pages', results.pages.map(p => ({
                icon: p.icon,
                name: p.name,
                desc: p.desc,
                url: p.url
            })));
        }
        
        // Creatures
        if (results.creatures && results.creatures.length > 0) {
            html += this.createSearchGroup('Creatures', results.creatures.map(c => ({
                icon: '🐉',
                name: c.name,
                desc: c.race || c.description,
                url: `character.html?id=${c.id}`
            })));
        }
        
        // Locations
        if (results.locations && results.locations.length > 0) {
            html += this.createSearchGroup('Locations', results.locations.map(l => ({
                icon: '📍',
                name: l.name,
                desc: l.type || l.description,
                url: `location.html?id=${l.id}`
            })));
        }
        
        // Achievements
        if (results.achievements && results.achievements.length > 0) {
            html += this.createSearchGroup('Achievements', results.achievements.map(a => ({
                icon: '🏆',
                name: a.name,
                desc: a.description,
                url: `achievements.html#${a.id}`
            })));
        }
        
        if (!html) {
            html = `
                <div class="search-empty">
                    <span class="search-empty-icon">🔍</span>
                    <p>No results found</p>
                </div>
            `;
        }
        
        resultsContainer.innerHTML = html;
        this.searchIndex = -1;
    }

    /**
     * Create search results group HTML
     */
    createSearchGroup(title, items) {
        if (!items || items.length === 0) return '';
        
        const itemsHTML = items.map((item, index) => `
            <a href="${item.url}" class="search-result-item" data-index="${index}">
                <span class="search-result-icon">${item.icon}</span>
                <div class="search-result-info">
                    <div class="search-result-name">${item.name}</div>
                    ${item.desc ? `<div class="search-result-desc">${item.desc}</div>` : ''}
                </div>
            </a>
        `).join('');
        
        return `
            <div class="search-results-group">
                <div class="search-results-title">${title}</div>
                ${itemsHTML}
            </div>
        `;
    }

    /**
     * Clear search results
     */
    clearSearchResults() {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = `
            <div class="search-empty">
                <span class="search-empty-icon">🔍</span>
                <p>Type to search across creatures, locations, items, and more...</p>
            </div>
        `;
    }

    /**
     * Handle keyboard navigation in search
     */
    handleSearchKeyboard(e) {
        const items = Array.from(document.querySelectorAll('.search-result-item'));
        
        if (e.key === 'Escape') {
            e.preventDefault();
            document.getElementById('searchCloseBtn')?.click();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.searchIndex = Math.min(this.searchIndex + 1, items.length - 1);
            this.updateSearchSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.searchIndex = Math.max(this.searchIndex - 1, 0);
            this.updateSearchSelection(items);
        } else if (e.key === 'Enter' && this.searchIndex >= 0) {
            e.preventDefault();
            items[this.searchIndex]?.click();
        }
    }

    /**
     * Update selected search result
     */
    updateSearchSelection(items) {
        items.forEach((item, index) => {
            item.classList.toggle('active', index === this.searchIndex);
            if (index === this.searchIndex) {
                item.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    /**
     * Initialize theme toggle
     */
    initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        // Load saved theme
        const savedTheme = localStorage.getItem('skyrim-theme') || 'dark';
        this.setTheme(savedTheme);
        
        // Toggle theme
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        });
    }

    /**
     * Set theme
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('skyrim-theme', theme);
    }

    /**
     * Initialize favorites counter
     */
    initFavorites() {
        this.updateFavoritesCounter();
        
        // Listen for favorites changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'skyrim-favorites') {
                this.updateFavoritesCounter();
            }
        });
        
        // Listen for custom favorites events
        window.addEventListener('favorites-updated', () => {
            this.updateFavoritesCounter();
        });
    }

    /**
     * Update favorites counter
     */
    updateFavoritesCounter() {
        const counter = document.getElementById('favoritesCounter');
        if (!counter) return;
        
        const favorites = this.getFavorites();
        const count = favorites.length;
        
        counter.textContent = count;
        counter.style.display = count > 0 ? 'flex' : 'none';
    }

    /**
     * Get favorites from localStorage
     */
    getFavorites() {
        try {
            const favoritesStr = localStorage.getItem('skyrim-favorites');
            return favoritesStr ? JSON.parse(favoritesStr) : [];
        } catch (error) {
            console.error('Error reading favorites:', error);
            return [];
        }
    }

    /**
     * Initialize global keyboard shortcuts
     */
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('searchBtn')?.click();
            }
        });
    }
}

// Initialize navigation when script loads
window.skyrimNav = new SkyrimNavigation();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkyrimNavigation;
}
