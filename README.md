# 3D Maker - Skyrim Bestiary

A web-based 3D reconstruction and visualization application with an interactive Skyrim Bestiary character viewer.

## Project Structure

```
3dmaker/
├── public/                          # Web application entry points
│   ├── index.html                   # 3D Reconstruction Studio main page
│   └── character.html               # Skyrim Bestiary character viewer
│
├── src/                             # Source code
│   ├── js/                          # JavaScript files
│   │   ├── app.js                   # 3D Studio application logic
│   │   └── character.js             # Character viewer logic
│   │
│   └── css/                         # Stylesheets
│       ├── style.css                # Main application styles
│       └── character.css            # Character viewer styles
│
├── data/                            # Data files
│   ├── characters.json              # Skyrim Bestiary character database
│   └── reconstruction_data.json     # Sample 3D reconstruction data
│
├── models/                          # 3D model files
│   ├── enhanced_mesh.obj            # Enhanced 3D mesh model
│   ├── enhanced_point_cloud.ply     # Enhanced point cloud data
│   ├── mesh.obj                     # Sample mesh file
│   └── point_cloud.ply              # Sample point cloud file
│
├── config/                          # Configuration files
│   ├── hypercorn.toml              # ASGI server configuration
│   ├── logs/                       # Log files
│   │   └── codex.log
│   └── secret_key                  # Server secret key
│
└── README.md                        # This file
```

## Features

### 3D Reconstruction Studio (`/public/index.html`)
- **Upload Media**: Drag-and-drop image and video upload
- **Processing Pipeline**: 4-step 3D reconstruction workflow
- **3D Viewer**: Interactive Three.js viewer with:
  - Point cloud visualization
  - Mesh view
  - Wireframe mode
  - Fullscreen toggle
- **3D Mapping**: Geographic mapping capabilities
- **Settings**: Adjustable reconstruction quality and parameters
- **Export**: Multiple format support (PLY, OBJ, STL, GeoTIFF, KML)

### Skyrim Bestiary Character Viewer (`/public/character.html`)
- **Interactive 3D Models**: View and rotate character/creature models
- **Character Stats**: Health, Magicka, Stamina with visual bars
- **Skills & Abilities**: Detailed skill listings
- **Combat Information**: Weapon damage, abilities, resistances
- **Lore & Location**: Detailed character information and descriptions
- **Navigation**: Browse through 10+ creatures
- **Model Export**: Download 3D models as OBJ files
- **Responsive Design**: Works on desktop, tablet, and mobile

### Interactive Skill Tree Visualizer (`skill-tree.html`)
- **Canvas-Based Visualization**: High-performance radial skill tree diagrams
- **Interactive Nodes**: Hover for details, click to select/expand
- **Skill Categorization**: Combat, Magic, Passive, and Special skills with color coding
- **Mastery Levels**: Visual indicators for Novice, Adept, Expert, and Legendary skills
- **Advanced Filtering**: Filter by skill type and mastery level
- **Search Functionality**: Find skills across all creatures
- **Comparison Mode**: Side-by-side skill tree comparison between creatures
- **Zoom & Pan Controls**: Mouse/touch gestures and keyboard shortcuts
- **Export Feature**: Save skill tree visualizations as PNG images
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: ARIA labels, keyboard navigation, and focus management

## Technologies Used

- **Three.js** (v0.128) - 3D graphics and WebGL rendering
- **HTML5/CSS3** - Semantic markup and modern styling
- **Vanilla JavaScript** - No framework dependencies
- **Three.js Loaders**:
  - OrbitControls - Interactive 3D navigation
  - OBJLoader - 3D mesh loading
  - PLYLoader - Point cloud loading

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- HTTP server (for local development)

### Running Locally

1. **Using Python:**
   ```bash
   python -m http.server 8000
   ```

2. **Using Node.js (http-server):**
   ```bash
   npx http-server
   ```

3. **Open in browser:**
   - 3D Studio: `http://localhost:8000/public/index.html`
   - Bestiary: `http://localhost:8000/public/character.html`

## File Descriptions

### HTML Files
- **index.html**: Main 3D reconstruction application interface
- **character.html**: Character/creature viewer with stats and information
- **skill-tree.html**: Interactive skill tree visualization for creature abilities

### JavaScript
- **app.js**: Core 3D reconstruction application logic
  - File upload handling
  - Processing pipeline management
  - 3D viewer initialization and controls
  - Model export functionality

- **character.js**: Character viewer logic
  - Character data loading from JSON
  - 3D model loading and rendering
  - Interactive controls (rotation, lighting, wireframe)
  - Navigation between characters
  - Model export and sharing

- **skill-tree.js**: Skill tree visualization logic
  - Canvas-based rendering engine
  - Radial skill tree layout algorithm
  - Interactive node system with hover/click detection
  - Zoom and pan controls with gesture support
  - Skill type categorization and filtering
  - Comparison mode for side-by-side analysis
  - Real-time search across all creatures
  - PNG export functionality

### CSS
- **style.css**: Main application stylesheet
  - Design tokens and color variables
  - Layout grid system
  - Component styling
  - Responsive breakpoints

- **character.css**: Character viewer specific styles
  - Character information panels
  - Stats display styling
  - Viewer controls
  - Modal dialogs
  - Mobile responsive design

- **skill-tree.css**: Skill tree visualizer styles
  - Control panel and sidebar layout
  - Canvas container styling
  - Tooltip and overlay components
  - Legend and filter UI
  - Responsive grid for mobile
  - Accessibility enhancements

### Data Files
- **characters.json**: Skyrim Bestiary database with 10 creatures
  - Character stats and attributes
  - Skills and combat information
  - Lore and location data
  - Model paths and imagery

- **reconstruction_data.json**: Sample data for 3D reconstruction

### Models
- **enhanced_mesh.obj**: High-quality 3D mesh model
- **enhanced_point_cloud.ply**: Point cloud representation
- **mesh.obj**: Simple mesh file
- **point_cloud.ply**: Simple point cloud file

## Development

### Adding New Characters

1. Edit `/data/characters.json`
2. Add a new character object with required fields:
   ```json
   {
     "id": 11,
     "name": "Character Name",
     "race": "Species",
     "level": 25,
     "location": "Location",
     "faction": "Faction",
     "difficulty": "Normal",
     "description": "Character description",
     "imagePath": "path/to/image",
     "modelPath": "../../models/model.obj",
     "stats": {
       "health": 50,
       "magicka": 40,
       "stamina": 60
     },
     "skills": [],
     "combat": []
   }
   ```

### Customizing Styles

All colors and typography are defined as CSS custom properties in `style.css`:
- Modify `--color-*` variables for theme changes
- Adjust `--font-size-*` for typography
- Update spacing with `--spacing-*` variables

## Support

For issues or questions, please refer to the project documentation or repository.