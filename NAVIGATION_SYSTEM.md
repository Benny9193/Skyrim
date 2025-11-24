# Skyrim Interactive Navigation System

## Overview
A comprehensive, unified navigation system for the Skyrim Interactive website with dark mode, favorites management, site-wide search, and loading states.

## Features Implemented

### ✅ Priority 1: Master Navigation System
- **Unified Navigation Component** (`src/components/nav-bar.html`)
  - Logo/home link
  - Dropdown menus for all categories:
    - Creatures (Bestiary, Character Viewer, Dragons, Followers, NPCs)
    - Combat (Combat Simulator, Size Comparison, Loot Calculator)
    - World (Locations, Location Viewer, Map, Standing Stones)
    - Knowledge (Codex, Library, Achievements, Daedric Artifacts)
    - Tools (Character Builder, Skill Tree, Crafting, Alchemy, Enchantments, Magic)
    - Games (Mini-Games)
    - 3D Studio
  - Search button with keyboard shortcut (Ctrl/Cmd+K)
  - Favorites counter
  - Dark mode toggle

- **Navigation JavaScript** (`nav.js`)
  - Automatic loading of navigation HTML
  - Mobile menu with hamburger toggle
  - Dropdown menu management
  - Active page highlighting
  - Search modal with live results
  - Keyboard navigation support
  - Theme persistence

- **Navigation CSS** (`nav.css`)
  - Responsive design (mobile hamburger menu)
  - Smooth animations and transitions
  - Dark and light mode styles
  - Dropdown animations
  - Search modal styling

### ✅ Priority 2: Dark Mode Theme System
- **Theme CSS** (`theme.css`)
  - Comprehensive CSS variables for both themes
  - Light theme (clean and bright)
  - Dark theme (default, easy on eyes)
  - Smooth transitions between themes
  - Color schemes for:
    - Backgrounds (primary, secondary, tertiary)
    - Text (primary, secondary, muted)
    - Borders and shadows
    - Interactive states
    - Status colors (success, warning, error, info)
    - Difficulty colors
    - Stat colors (health, magicka, stamina)

- **Theme Toggle**
  - LocalStorage persistence
  - Smooth transition animations
  - Sun/moon icon that changes
  - System preference detection (optional)

### ✅ Priority 3: User Favorites System
- **Favorites Management** (`favorites.js`)
  - LocalStorage-based persistence
  - Add/remove favorites from any page
  - Favorites counter in navigation
  - Support for multiple item types (creatures, locations, achievements, etc.)
  - Export/import functionality
  - Toast notifications for actions

- **Favorites Page** (`favorites.html`)
  - View all saved items
  - Filter by type (All, Creatures, Locations, Achievements, Other)
  - Statistics cards
  - Export/import JSON
  - Clear all functionality
  - Remove individual items

- **Favorites CSS** (`favorites.css`)
  - Card-based layout
  - Stats dashboard
  - Filter chips
  - Empty state
  - Toast notifications
  - Dark mode support

### ✅ Priority 4: Site-Wide Search
- **Search Modal** (integrated in `nav.js`)
  - Live search as you type
  - Search across:
    - Creatures/characters
    - Locations
    - Achievements
    - Dragons
    - Static pages
  - Keyboard navigation (↑↓ to navigate, Enter to select, Esc to close)
  - Grouped results by type
  - Keyboard shortcut: Ctrl+K or Cmd+K

- **Search Results Page** (`search.html`)
  - Dedicated search page
  - URL parameter support (?q=query)
  - Category-organized results
  - Result count statistics
  - Deep linking support

### ✅ Priority 5: Loading States & Performance
- **Loading CSS** (`loading.css`)
  - Page loader with animation
  - Inline spinners (small, medium, large)
  - Loading overlay for async operations
  - Skeleton loaders:
    - Card skeletons
    - Grid skeletons
    - List skeletons
    - Table skeletons
  - Progress bars (determinate and indeterminate)
  - Circular progress indicators
  - Loading button states
  - 3D model loading states
  - Image loading with shimmer effect
  - Dots loading indicator
  - Lazy load fade-in animations

## File Structure

```
/
├── src/
│   └── components/
│       └── nav-bar.html          # Navigation HTML template
├── nav.js                         # Navigation controller
├── nav.css                        # Navigation styles
├── theme.css                      # Theme system and CSS variables
├── favorites.js                   # Favorites management
├── favorites.html                 # Favorites page
├── favorites.css                  # Favorites page styles
├── loading.css                    # Loading states and skeletons
├── inject-nav.js                  # Auto-injection script
├── search.html                    # Search results page
└── NAVIGATION_SYSTEM.md           # This file
```

## Integration Guide

### Method 1: Automatic Injection (Recommended)
Add to the end of your HTML `<body>` tag:

```html
<script src="inject-nav.js"></script>
```

This automatically:
- Loads all required CSS files
- Loads navigation and favorites JavaScript
- Injects navigation into the page
- Initializes all systems

### Method 2: Manual Integration
For more control, add these to your HTML:

```html
<head>
    <!-- Existing styles -->
    <link rel="stylesheet" href="style.css">
    
    <!-- New navigation system styles -->
    <link rel="stylesheet" href="theme.css">
    <link rel="stylesheet" href="nav.css">
    <link rel="stylesheet" href="loading.css">
</head>
<body>
    <!-- Navigation will be injected here automatically -->
    
    <!-- Your content -->
    <div class="app-container">
        <main>
            <!-- Page content -->
        </main>
    </div>
    
    <!-- Load navigation system -->
    <script src="favorites.js"></script>
    <script src="nav.js"></script>
</body>
```

## Usage Examples

### Adding a Favorite Button to a Page

```javascript
// Add favorite button to a container
addFavoriteButton('buttonContainer', {
    id: 'alduin',
    type: 'creature',
    name: 'Alduin',
    icon: '🐉',
    url: 'character.html?id=alduin'
});
```

### Checking if Item is Favorited

```javascript
const isFavorited = favoritesManager.isFavorited('alduin', 'creature');
console.log(isFavorited); // true or false
```

### Adding Favorites Programmatically

```javascript
favoritesManager.add({
    id: 'whiterun',
    type: 'location',
    name: 'Whiterun',
    icon: '🏰',
    url: 'location.html?id=whiterun'
});
```

### Getting All Favorites

```javascript
const allFavorites = favoritesManager.getAll();
const creatures = favoritesManager.getByType('creature');
const count = favoritesManager.getCount();
```

### Using Loading States

```html
<!-- Page loader -->
<div class="page-loader" id="pageLoader">
    <div class="loader-content">
        <div class="loader-icon">🐉</div>
        <div class="loader-spinner"></div>
        <div class="loader-text">Loading...</div>
    </div>
</div>

<script>
    // Hide loader when page is ready
    window.addEventListener('load', () => {
        document.getElementById('pageLoader').classList.add('loaded');
    });
</script>
```

```html
<!-- Skeleton cards while loading -->
<div class="skeleton-grid">
    <div class="skeleton-card">
        <div class="skeleton skeleton-avatar"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
    </div>
    <!-- Repeat for more cards -->
</div>
```

```html
<!-- Progress bar -->
<div class="progress-bar">
    <div class="progress-bar-fill" style="width: 60%;"></div>
</div>
```

### Theme Switching

The theme automatically saves to localStorage. Users can toggle between light and dark modes using the theme button in the navigation.

To manually set a theme:
```javascript
document.documentElement.setAttribute('data-theme', 'light'); // or 'dark'
```

## Keyboard Shortcuts

- **Ctrl+K** or **Cmd+K**: Open search modal
- **Esc**: Close search modal
- **↑/↓**: Navigate search results
- **Enter**: Select highlighted search result

## CSS Variables

All colors and styles can be customized via CSS variables. See `theme.css` for the complete list.

Example customization:
```css
:root {
    --primary-color: #your-color;
    --nav-bg: #your-background;
}
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Features

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus visible indicators
- Screen reader friendly
- High contrast mode support
- Reduced motion support for animations

## Performance

- Lazy loading of search data
- Debounced search input (300ms)
- LocalStorage for favorites (no server calls)
- CSS animations use GPU acceleration
- Minimal JavaScript bundle size

## Future Enhancements

Potential additions (not yet implemented):
- Voice search
- Search history
- Popular searches
- Search suggestions/autocomplete
- Favorites syncing across devices
- Collections/folders for favorites
- Favorite tags and notes
- Advanced search filters
- Search within specific categories
- Recently viewed items

## Testing

Test pages:
- `landing.html` - Homepage with navigation
- `bestiary.html` - Gallery view with filters
- `favorites.html` - Favorites management
- `search.html` - Search results page
- `character.html` - Detail view example

## Troubleshooting

### Navigation not appearing
- Check browser console for errors
- Verify `inject-nav.js` is loaded
- Ensure `src/components/nav-bar.html` exists
- Check network tab for failed requests

### Favorites not persisting
- Check if localStorage is enabled
- Look for localStorage quota errors
- Verify `favoritesManager` is initialized

### Search not working
- Ensure JSON data files exist (characters.json, locations.json, etc.)
- Check network tab for 404 errors
- Verify data format matches expected structure

### Theme not saving
- Check localStorage permissions
- Verify theme toggle button exists
- Check console for JavaScript errors

## Credits

Built for Skyrim Interactive website as a comprehensive navigation and user experience enhancement.

## License

MIT License - Free to use and modify
