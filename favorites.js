/**
 * Skyrim Favorites System
 * Manages user favorites with localStorage persistence
 */

class SkyrimFavorites {
    constructor() {
        this.storageKey = 'skyrim-favorites';
        this.favorites = this.load();
    }

    /**
     * Load favorites from localStorage
     */
    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    /**
     * Save favorites to localStorage
     */
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
            
            // Dispatch custom event for other components to listen
            window.dispatchEvent(new CustomEvent('favorites-updated', {
                detail: { favorites: this.favorites }
            }));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }

    /**
     * Add item to favorites
     */
    add(item) {
        // Check if already favorited
        const exists = this.favorites.some(fav => 
            fav.id === item.id && fav.type === item.type
        );
        
        if (!exists) {
            this.favorites.push({
                id: item.id,
                type: item.type, // 'creature', 'location', 'achievement', etc.
                name: item.name,
                icon: item.icon || '⭐',
                url: item.url,
                timestamp: Date.now()
            });
            this.save();
            return true;
        }
        return false;
    }

    /**
     * Remove item from favorites
     */
    remove(id, type) {
        const initialLength = this.favorites.length;
        this.favorites = this.favorites.filter(fav => 
            !(fav.id === id && fav.type === type)
        );
        
        if (this.favorites.length < initialLength) {
            this.save();
            return true;
        }
        return false;
    }

    /**
     * Toggle favorite status
     */
    toggle(item) {
        const isFavorited = this.isFavorited(item.id, item.type);
        
        if (isFavorited) {
            this.remove(item.id, item.type);
            return false;
        } else {
            this.add(item);
            return true;
        }
    }

    /**
     * Check if item is favorited
     */
    isFavorited(id, type) {
        return this.favorites.some(fav => 
            fav.id === id && fav.type === type
        );
    }

    /**
     * Get all favorites
     */
    getAll() {
        return [...this.favorites];
    }

    /**
     * Get favorites by type
     */
    getByType(type) {
        return this.favorites.filter(fav => fav.type === type);
    }

    /**
     * Get favorites count
     */
    getCount() {
        return this.favorites.length;
    }

    /**
     * Clear all favorites
     */
    clear() {
        this.favorites = [];
        this.save();
    }

    /**
     * Export favorites as JSON
     */
    export() {
        return JSON.stringify(this.favorites, null, 2);
    }

    /**
     * Import favorites from JSON
     */
    import(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (Array.isArray(imported)) {
                this.favorites = imported;
                this.save();
                return true;
            }
        } catch (error) {
            console.error('Error importing favorites:', error);
        }
        return false;
    }
}

// Create global instance
const favoritesManager = new SkyrimFavorites();

/**
 * Add favorite button to any element
 * @param {string} containerId - ID of container to add button to
 * @param {object} item - Item to favorite {id, type, name, icon, url}
 */
function addFavoriteButton(containerId, item) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const isFavorited = favoritesManager.isFavorited(item.id, item.type);
    
    const button = document.createElement('button');
    button.className = 'favorite-btn' + (isFavorited ? ' favorited' : '');
    button.innerHTML = `
        <span class="favorite-icon">${isFavorited ? '❤️' : '🤍'}</span>
        <span class="favorite-text">${isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}</span>
    `;
    button.setAttribute('aria-label', isFavorited ? 'Remove from favorites' : 'Add to favorites');
    button.setAttribute('data-id', item.id);
    button.setAttribute('data-type', item.type);
    
    button.addEventListener('click', () => {
        const newState = favoritesManager.toggle(item);
        button.classList.toggle('favorited', newState);
        button.querySelector('.favorite-icon').textContent = newState ? '❤️' : '🤍';
        button.querySelector('.favorite-text').textContent = newState ? 'Remove from Favorites' : 'Add to Favorites';
        button.setAttribute('aria-label', newState ? 'Remove from favorites' : 'Add to favorites');
        
        // Show toast notification
        showFavoriteToast(newState, item.name);
    });
    
    container.appendChild(button);
    return button;
}

/**
 * Show toast notification for favorite actions
 */
function showFavoriteToast(added, itemName) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.favorite-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'favorite-toast';
    toast.innerHTML = `
        <span class="toast-icon">${added ? '❤️' : '💔'}</span>
        <span class="toast-text">
            ${added ? 'Added' : 'Removed'} 
            <strong>${itemName}</strong> 
            ${added ? 'to' : 'from'} favorites
        </span>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SkyrimFavorites, favoritesManager, addFavoriteButton, showFavoriteToast };
}
