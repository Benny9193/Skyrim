# 3D Maker - Skyrim Bestiary Setup Guide

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- **three** (v0.160.0) - Modern Three.js for 3D rendering
- **vite** - Fast development server and build tool
- **typescript** - For type safety (future migration)
- **jest** & **playwright** - Testing frameworks
- **eslint** & **prettier** - Code quality tools

### 2. Development Server

Start the development server with hot reload:

```bash
npm run dev
```

This will start Vite dev server at `http://localhost:3000` and automatically open the landing page.

### 3. Build for Production

Create optimized production build:

```bash
npm run build
```

Output will be in the `dist/` directory.

### 4. Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
Skyrim/
├── src/                      # Modern ES6 modules
│   ├── app.module.js        # 3D Studio with Three.js imports
│   ├── character.module.js  # Character viewer with Three.js imports
│   ├── bestiary.module.js   # Gallery module (TBD)
│   └── landing.module.js    # Landing page module (TBD)
├── index.html               # 3D Reconstruction Studio
├── character.html           # Character Detail Viewer
├── bestiary.html            # Character Gallery
├── landing.html             # Landing Page
├── characters.json          # Character database
├── reconstruction_data.json # Sample 3D data
├── *.obj, *.ply            # 3D model files
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── .eslintrc.json          # ESLint rules

```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm test` | Run Jest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint code with ESLint |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Check TypeScript types |

## Three.js Upgrade (v0.128 → v0.160)

### Key Changes

**Old (CDN-based):**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
```

**New (npm-based modules):**
```javascript
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
```

### Benefits

1. **Tree-shaking** - Only bundle what you use
2. **Type safety** - TypeScript definitions included
3. **Better caching** - npm packages cached locally
4. **Modern features** - Access to latest Three.js features
5. **Development speed** - Vite's instant HMR

### Migration Status

- ✅ Package.json created
- ✅ Vite configured
- ✅ Modern module versions created (`src/*.module.js`)
- ⏳ HTML files need updating to use modules
- ⏳ Legacy files (app.js, character.js) can be removed after testing

## Configuration Files

### vite.config.js

Configures:
- Multi-page application (4 HTML entry points)
- Path aliases (`@js`, `@css`, `@models`, `@data`)
- Static file copying (JSON, OBJ, PLY files)
- Dev server on port 3000

### tsconfig.json

Prepared for TypeScript migration with:
- Modern ES2020 target
- Bundler module resolution
- Strict type checking
- Path aliases matching Vite config

### .eslintrc.json

Linting rules for:
- ES2021+ JavaScript
- TypeScript files (when migrated)
- Browser and Node environments

## Development Workflow

### Making Changes

1. Edit files in `src/` or root HTML files
2. Changes auto-reload in browser (HMR)
3. Check console for errors
4. Lint before committing: `npm run lint`

### Adding New Features

1. Create new module in `src/`
2. Import Three.js components as needed
3. Add tests in `__tests__/` directory
4. Update this README

### Debugging

- **Browser DevTools** - Check console for errors
- **Vite Inspector** - Shows module graph at `http://localhost:3000/__inspect/`
- **Source Maps** - Enabled in build for debugging

## Next Steps

1. **Run `npm install`** to set up dependencies
2. **Run `npm run dev`** to start development
3. **Update HTML files** to use module scripts
4. **Test all features** to ensure compatibility
5. **Run `npm run build`** to verify production build works

## Troubleshooting

### Port Already in Use

Change port in `vite.config.js`:
```javascript
server: {
  port: 3001  // Use different port
}
```

### Module Not Found

Ensure path aliases are correct in both:
- `vite.config.js` (resolve.alias)
- `tsconfig.json` (compilerOptions.paths)

### Three.js Import Errors

Make sure imports use `.js` extension:
```javascript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
//                                                                    ^^^
```

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)

## Support

For issues or questions, please open an issue on GitHub.
