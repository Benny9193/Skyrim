# Interactive Skill Tree Visualizer - User Guide

## Overview

The Interactive Skill Tree Visualizer is a powerful Canvas-based tool that displays creature skills and abilities in an intuitive radial diagram format. It allows you to explore, compare, and analyze the skill sets of all creatures in the Skyrim Bestiary.

## Accessing the Visualizer

Open `skill-tree.html` in your web browser. The visualizer will automatically load all creature data from `characters.json`.

## Key Features

### 1. Skill Tree Display

- **Radial Layout**: Skills are arranged in a circular pattern around the creature's name
- **Color Coding**: Each skill type has its own color:
  - 🔴 **Red**: Combat skills (Melee Combat, Weapon attacks, etc.)
  - 🔵 **Blue**: Magic skills (Destruction, Alteration, Conjuration, etc.)
  - 🟢 **Green**: Passive skills (Resistance, Regeneration, Armor, etc.)
  - 🟣 **Purple**: Special skills (Dragon Breath, Alchemy, Summoning, etc.)

- **Mastery Levels**: Node size indicates skill mastery:
  - Small: Novice
  - Medium: Adept
  - Large: Expert
  - Extra Large: Legendary

### 2. Navigation Controls

#### Mouse Controls
- **Click & Drag**: Pan the view
- **Mouse Wheel**: Zoom in/out
- **Hover**: View skill details in tooltip
- **Click Node**: Select/highlight a skill

#### Touch Controls (Mobile)
- **Single Finger Drag**: Pan the view
- **Pinch**: Zoom in/out (if supported)
- **Tap**: View tooltip or select node

#### Keyboard Shortcuts
- **Space**: Reset view to default
- **+** / **-**: Zoom in/out
- **Arrow Keys**: Pan the view
- **C**: Toggle comparison mode
- **E**: Export current view as PNG

### 3. Filtering System

#### Skill Type Filters
Check/uncheck boxes to show or hide specific skill types:
- Combat
- Magic
- Passive
- Special

#### Mastery Level Filters
Filter skills by their mastery level:
- Novice
- Adept
- Expert
- Legendary

### 4. Search Functionality

Use the search bar to find specific skills across all creatures:
1. Type at least 2 characters
2. Results show all matching skills
3. Each result lists creatures that have the skill
4. Click a result to jump to that creature and highlight the skill

### 5. Comparison Mode

Compare skill trees between two creatures:
1. Toggle "Comparison Mode" switch
2. Select first creature from main dropdown
3. Select second creature from "Compare With" dropdown
4. View split-screen comparison with stats cards

### 6. Export Feature

Save the current skill tree visualization:
1. Click "Export PNG" button (or press **E**)
2. Image downloads with white background
3. Filename includes creature name and timestamp

### 7. View Controls

**Canvas Overlay Buttons** (bottom right):
- **+**: Zoom in
- **-**: Zoom out
- **⛶**: Fit entire tree to view

**Control Panel Buttons**:
- **Reset View**: Return to default zoom and position
- **Export PNG**: Download current visualization

## Understanding the Visualization

### Node Elements

Each skill node consists of:
- **Outer Ring**: Skill type color
- **Inner Circle**: Mastery level color with gradient
- **Icon**: Emoji representing skill category
- **Label**: Skill name (visible on hover or when zoomed in)

### Connection Lines

Curved lines connect related skills:
- Same-type skills are connected
- Magic school skills are linked
- Helps identify skill relationships

### Tooltip Information

Hover over any node to see:
- **Skill Name**: Full skill name
- **Type**: Skill category
- **Mastery Level**: Proficiency level
- **Found In**: List of creatures with this skill

## Tips & Best Practices

### Exploration
1. Start with "Reset View" to see the full tree
2. Use "Fit to View" to auto-frame all visible nodes
3. Zoom in to read skill labels clearly
4. Use search to find rare or specific skills

### Comparison
1. Compare creatures of similar types to find unique skills
2. Use filters to focus on specific skill categories
3. Stats cards show skill distribution by type

### Analysis
1. Filter by Legendary mastery to find most powerful skills
2. Search for specific skills to see which creatures possess them
3. Use the legend to understand color meanings quickly

### Performance
1. Filtering reduces rendered nodes for better performance
2. Canvas-based rendering ensures smooth interaction
3. Works well on mobile devices with touch gestures

## Troubleshooting

**Skill tree not loading:**
- Ensure `characters.json` is in the same directory
- Check browser console for errors
- Verify file permissions

**Performance issues:**
- Close other browser tabs
- Reduce zoom level
- Use filters to show fewer nodes

**Export not working:**
- Allow downloads in browser settings
- Check available disk space
- Ensure pop-ups are not blocked

**Touch controls not responsive:**
- Ensure device supports touch events
- Try reloading the page
- Check for browser compatibility

## Technical Details

### Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with Canvas support

### Data Format
Skills are extracted from `characters.json`:
```json
{
  "skills": [
    { "name": "Melee Combat", "level": "Legendary" },
    { "name": "Dragon Breath", "level": "Legendary" }
  ]
}
```

### Skill Categorization
The system automatically categorizes skills based on keywords:
- Combat: melee, weapon, claw, attack, etc.
- Magic: destruction, alteration, conjuration, etc.
- Passive: resistance, regeneration, armor, etc.
- Special: dragon breath, alchemy, summoning, etc.

### Performance Optimization
- Canvas API for hardware-accelerated rendering
- Efficient redraw only when needed
- Culling of off-screen or filtered nodes
- Optimized hit detection for interactions

## Accessibility Features

- **ARIA Labels**: All interactive elements properly labeled
- **Keyboard Navigation**: Full keyboard control support
- **Focus Management**: Clear focus indicators
- **Reduced Motion**: Respects user's motion preferences
- **High Contrast**: Enhanced borders in high contrast mode
- **Screen Reader**: Tooltip content available to screen readers

## Future Enhancements

Potential features for future versions:
- Skill progression paths
- Skill unlock requirements
- Animated skill activation
- 3D skill sphere visualization
- Custom color schemes
- Skill tree templates
- Advanced analytics dashboard

## Credits

Part of the Skyrim 3D Bestiary project. Built with:
- HTML5 Canvas API
- Vanilla JavaScript
- Modern CSS3
- Elder Scrolls V: Skyrim creature data

---

For more information, see the main [README.md](README.md) file.
