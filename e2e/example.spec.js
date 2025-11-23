import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/landing.html');
    await expect(page).toHaveTitle(/3D Maker|Skyrim|Bestiary/i);
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/landing.html');

    // Check for main navigation elements
    const links = await page.locator('a[href*="index.html"], a[href*="bestiary.html"]').count();
    expect(links).toBeGreaterThan(0);
  });
});

test.describe('3D Reconstruction Studio', () => {
  test('should load 3D canvas', async ({ page }) => {
    await page.goto('/index.html');

    // Wait for Three.js canvas to load
    const canvas = await page.locator('#threeCanvas');
    await expect(canvas).toBeVisible();
  });

  test('should have upload section', async ({ page }) => {
    await page.goto('/index.html');

    // Check for file upload elements
    const uploadSection = await page.locator('[class*="upload"], [id*="upload"]').first();
    await expect(uploadSection).toBeVisible();
  });
});

test.describe('Character Bestiary', () => {
  test('should load character grid', async ({ page }) => {
    await page.goto('/bestiary.html');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check that page has loaded
    await expect(page).toHaveTitle(/Bestiary/i);
  });

  test('should have filter controls', async ({ page }) => {
    await page.goto('/bestiary.html');

    // Look for filter elements
    const filters = await page.locator('[class*="filter"], [id*="filter"]').count();
    expect(filters).toBeGreaterThan(0);
  });
});

test.describe('Character Detail View', () => {
  test('should load 3D character viewer', async ({ page }) => {
    await page.goto('/character.html');

    // Wait for Three.js canvas
    const canvas = await page.locator('#modelCanvas');
    await expect(canvas).toBeVisible();
  });

  test('should have character info sections', async ({ page }) => {
    await page.goto('/character.html');
    await page.waitForLoadState('networkidle');

    // Check for character information display
    const characterInfo = await page.locator('[class*="character"], [id*="character"]').count();
    expect(characterInfo).toBeGreaterThan(0);
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/landing.html');

    await expect(page).toHaveTitle(/3D Maker|Skyrim|Bestiary/i);
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/index.html');

    const canvas = await page.locator('#threeCanvas');
    await expect(canvas).toBeVisible();
  });
});
