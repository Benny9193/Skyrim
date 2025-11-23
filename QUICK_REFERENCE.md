# ⚡ Quick Reference Card

## 🚀 Essential Commands

```bash
# Development
npm run dev              # Start dev server → http://localhost:3000
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                 # Run tests
npm run test:e2e         # E2E tests (need: npx playwright install)

# Quality
npm run lint             # Check code quality
npm run format           # Auto-format code

# Utilities
npm run validate         # Validate characters.json
npm run stats            # Show database stats
npm run add-character    # Add new creature
```

---

## 📊 Project Stats

- **Creatures:** 25 (Easy: 2, Normal: 9, Hard: 11, Deadly: 3)
- **Level Range:** 12-50 (Average: 28.8)
- **Three.js:** v0.160.1
- **Dependencies:** 500 packages
- **Test Files:** 3
- **Documentation:** 9 guides

---

## 📁 Key Files

```
characters.json          # Database (25 creatures)
package.json             # Dependencies + scripts
vite.config.js           # Build configuration
src/types/index.ts       # TypeScript definitions
scripts/*.js             # Utility scripts
```

---

## 🔧 Troubleshooting

**Port in use?**
```bash
# Edit vite.config.js → server.port: 3001
```

**Module errors?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Tests fail?**
```bash
npm test -- --clearCache
npm test
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| GETTING_STARTED.md | 30-second quick start |
| SETUP.md | Detailed installation |
| MIGRATION.md | What changed |
| COMPLETE_SUMMARY.md | Full overview |

---

## ✅ Checklist

### First Time Setup
- [ ] `npm install`
- [ ] `npm run dev`
- [ ] Open http://localhost:3000

### Before Committing
- [ ] `npm run format`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run validate`

### Deployment
- [ ] `npm run build`
- [ ] Test dist/ folder
- [ ] Deploy to Netlify/Vercel

---

## 💡 Pro Tips

1. **Use stats script** - `npm run stats` shows db overview
2. **Validate before commit** - Catches errors early
3. **Check documentation** - 9 guides available
4. **TypeScript examples** - See src/types/ for migration
5. **CI/CD ready** - Push to GitHub for auto-deploy

---

**Made with ❤️ using Claude Code**
