# Migration Guide: Legacy to Modern Setup

## Overview

This guide helps you migrate from the legacy CDN-based setup to the modern npm-based development environment.

## What Changed?

### Before (Legacy)
```html
<!-- index.html -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script src="app.js"></script>
```

```javascript
// app.js
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(...);
```

### After (Modern)
```html
<!-- index.html -->
<script type="module" src="./src/app.module.js"></script>
```

```javascript
// src/app.module.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(...);
```

## Migration Steps

### 1. Install Dependencies (DONE ✓)

```bash
npm install
```

**Result:**
- Three.js v0.160.1 installed
- Vite v5.0.10 installed
- All development tools ready

### 2. File Structure Changes

**New files created:**
```
src/
├── app.module.js          # Modern version of app.js
├── character.module.js    # Modern version of character.js
├── bestiary.module.js     # (To be created)
└── landing.module.js      # (To be created)

Config files:
├── package.json           # Dependencies
├── vite.config.js         # Build configuration
├── tsconfig.json          # TypeScript config
├── jest.config.js         # Test configuration
├── playwright.config.js   # E2E test config
├── .eslintrc.json         # Linting rules
├── .prettierrc.json       # Code formatting
└── .gitignore            # Git ignore rules

Tests:
├── __tests__/
│   ├── character.test.js
│   └── utils.test.js
└── e2e/
    └── example.spec.js
```

### 3. Update HTML Files

You have **two options**:

#### Option A: Keep Existing HTML (Compatible Mode)
Your existing HTML files will continue to work with CDN scripts. Run:
```bash
# This opens the legacy version
start index.html
```

#### Option B: Use Modern Modules (Recommended)
Create new HTML files that use module scripts:

```html
<!DOCTYPE html>
<html>
<head>
    <title>3D Reconstruction Studio</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="app">
        <canvas id="threeCanvas"></canvas>
    </div>

    <!-- Modern module import -->
    <script type="module" src="./src/app.module.js"></script>
</body>
</html>
```

### 4. Development Workflow

#### Start Development Server
```bash
npm run dev
```

**What happens:**
- Vite starts at `http://localhost:3000`
- Landing page opens automatically
- Hot Module Replacement (HMR) enabled
- Changes auto-reload in browser

#### Build for Production
```bash
npm run build
```

**Output:**
- Optimized files in `dist/` directory
- Minified JavaScript bundles
- Compressed assets
- Source maps for debugging

#### Preview Production Build
```bash
npm run preview
```

Serves the `dist/` folder at `http://localhost:8080`

### 5. Running Tests

#### Unit Tests (Jest)
```bash
npm test              # Run once
npm run test:watch    # Watch mode
```

**Current tests:**
- Character data loading
- Favorites system
- Character navigation
- Filtering logic
- Utility functions

#### E2E Tests (Playwright)
```bash
npm run test:e2e
```

**Test coverage:**
- Landing page navigation
- 3D Studio canvas loading
- Character bestiary grid
- Character detail viewer
- Responsive design (mobile/tablet)

#### Install Playwright Browsers (First Time)
```bash
npx playwright install
```

### 6. Code Quality

#### Lint Code
```bash
npm run lint
```

Checks for:
- Syntax errors
- Code style issues
- Best practice violations

#### Format Code
```bash
npm run format
```

Automatically formats:
- JavaScript files
- HTML files
- CSS files
- JSON files

#### Type Check
```bash
npm run type-check
```

Validates TypeScript types (when files are migrated)

## Breaking Changes

### 1. Module Scope
Variables in module scripts are scoped, not global:

```javascript
// ❌ Won't work anymore
// window.scene = new THREE.Scene();

// ✓ Export if needed elsewhere
export const scene = new THREE.Scene();
```

### 2. Import Paths
Must use explicit extensions:

```javascript
// ❌ Old way
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// ✓ New way
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
```

### 3. Asset Paths
Vite may resolve paths differently:

```javascript
// ❌ Might not work
const texture = loader.load('textures/image.png');

// ✓ Use explicit paths or imports
const texture = loader.load('/textures/image.png');
// or
import textureUrl from './textures/image.png';
```

## Compatibility Matrix

| Feature | Legacy | Modern | Status |
|---------|--------|--------|--------|
| Three.js | v0.128 (CDN) | v0.160.1 (npm) | ✓ Upgraded |
| Module System | Global scripts | ES Modules | ✓ Ready |
| Dev Server | None | Vite HMR | ✓ Configured |
| Build Tool | None | Vite | ✓ Configured |
| Testing | None | Jest + Playwright | ✓ Configured |
| TypeScript | None | Ready to use | ⏳ Optional |
| Linting | None | ESLint | ✓ Configured |
| Formatting | None | Prettier | ✓ Configured |

## Rollback Plan

If you need to use the legacy version:

1. **Keep existing files:** `app.js`, `character.js`, original HTML files
2. **Use original HTML:** Open `index.html` directly in browser
3. **CDN scripts still work:** No changes needed to legacy code

The modern setup lives alongside legacy code, so nothing is broken.

## Next Steps

### Immediate (Completed ✓)
- [x] Install dependencies
- [x] Configure build tools
- [x] Set up testing framework
- [x] Create modern module versions
- [x] Add linting and formatting

### Short-term (Recommended)
- [ ] Update HTML files to use modules
- [ ] Test all features with Vite dev server
- [ ] Run test suite to verify functionality
- [ ] Remove legacy files once confident

### Medium-term (Optional)
- [ ] Migrate to TypeScript
- [ ] Add more unit tests
- [ ] Set up CI/CD with GitHub Actions
- [ ] Add PWA features

### Long-term (Future)
- [ ] Implement real backend
- [ ] Database integration
- [ ] Expand creature database
- [ ] Real model exports

## Troubleshooting

### "Cannot find module 'three'"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Port 3000 already in use"
```bash
# Kill the process or change port in vite.config.js
npx kill-port 3000
# or edit vite.config.js → server.port
```

### "WebGL context lost"
- Clear browser cache
- Update graphics drivers
- Try different browser

### Tests failing
```bash
# Update Jest config
npm test -- --clearCache
npm test
```

## Support

- **Documentation:** See `SETUP.md` for detailed setup
- **Issues:** Check GitHub issues or create new one
- **Questions:** Review Three.js docs at threejs.org

## Comparison: Development Experience

| Task | Legacy | Modern |
|------|--------|--------|
| Setup time | 0 min (CDN) | 2 min (npm install) |
| Change reload | Manual refresh | Auto (HMR) |
| Debugging | Browser only | Source maps + tools |
| Testing | Manual | Automated |
| Type safety | None | TypeScript ready |
| Code quality | Manual review | Automated linting |
| Build optimization | None | Automatic |

## Summary

**Phase 1 (Quick Wins) is COMPLETE! ✓**

You now have:
- ✅ Modern npm-based setup
- ✅ Three.js v0.160.1 (from v0.128)
- ✅ Vite development server
- ✅ Jest + Playwright testing
- ✅ ESLint + Prettier for code quality
- ✅ TypeScript configuration ready
- ✅ Sample tests written
- ✅ Module versions of main JS files

**Ready to use:**
```bash
npm run dev    # Start developing!
```

Your legacy files remain untouched and functional. The modern setup is ready whenever you want to switch over!
