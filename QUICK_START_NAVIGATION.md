# Quick Start: Skyrim Navigation System

## 🚀 Get Started in 60 Seconds

### For New Pages
Add one line before `</body>`:

```html
<script src="inject-nav.js"></script>
```

That's it! You now have:
- ✅ Navigation bar with all site links
- ✅ Dark mode toggle
- ✅ Search functionality (Ctrl+K)
- ✅ Favorites system
- ✅ Mobile responsive menu

### For Existing Pages
Already added to:
- `landing.html` ✅
- `bestiary.html` ✅  
- `character.html` ✅

Add to remaining pages:
- [ ] `index.html`
- [ ] `locations.html`
- [ ] `combat-simulator.html`
- [ ] `size-comparison.html`
- [ ] `loot-calculator.html`
- [ ] `mini-games.html`
- [ ] `achievements.html`
- [ ] `codex.html`
- [ ] `library.html`
- [ ] `skill-tree.html`
- [ ] `character-builder.html`
- [ ] `crafting.html`
- [ ] `alchemy.html`
- [ ] `enchantments.html`
- [ ] `magic.html`
- [ ] `dragons.html`
- [ ] `followers.html`
- [ ] `oblivion-npcs.html`
- [ ] `standing-stones.html`
- [ ] `daedric-artifacts.html`
- [ ] `location.html`
- [ ] `map.html`

## 💡 Adding Favorite Buttons

```html
<div id="favoriteContainer"></div>

<script>
    addFavoriteButton('favoriteContainer', {
        id: 'alduin',
        type: 'creature',
        name: 'Alduin',
        icon: '🐉',
        url: 'character.html?id=alduin'
    });
</script>
```

## 🎨 Using Theme Colors

```css
.my-component {
    background: var(--card-bg);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-md);
}

.my-button:hover {
    background: var(--hover-overlay);
}
```

## ⏳ Adding Loading States

```html
<!-- Loading spinner -->
<div class="spinner"></div>

<!-- Skeleton card -->
<div class="skeleton-card">
    <div class="skeleton skeleton-avatar"></div>
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-text"></div>
</div>

<!-- Progress bar -->
<div class="progress-bar">
    <div class="progress-bar-fill" style="width: 60%;"></div>
</div>
```

## 📱 Test It

1. Start dev server: `npm run dev`
2. Open http://localhost:3000/landing.html
3. Try:
   - Click navigation links
   - Press Ctrl+K to search
   - Toggle dark mode
   - Open on mobile (mobile menu)

## 📚 Full Documentation

See `NAVIGATION_SYSTEM.md` for complete details.

## 🐛 Issues?

1. Navigation not showing? Check browser console
2. Styles broken? Verify CSS files loaded
3. Search not working? Check JSON files exist
4. Favorites not saving? Check localStorage enabled

## 🎯 Next Steps

1. Add `inject-nav.js` to all remaining pages
2. Add favorite buttons to detail pages
3. Customize theme colors if needed
4. Test on mobile devices
5. Add loading states to async operations

## 🌟 Features

- **Dark Mode**: Auto-saves preference
- **Search**: Ctrl+K or Cmd+K
- **Favorites**: Persistent across sessions
- **Mobile**: Responsive hamburger menu
- **Accessible**: ARIA labels, keyboard nav
- **Fast**: No framework bloat

Enjoy! 🎮
