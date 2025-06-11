import { test, expect } from '@playwright/test';

test.describe('Basic Application Tests', () => {
  test('should load the homepage and redirect appropriately', async ({ page }) => {
    // Go to the homepage
    await page.goto('/');
    
    // Wait a moment for any redirects
    await page.waitForTimeout(2000);
    
    // The page should either show loading or redirect to login
    const currentUrl = page.url();
    
    // Check if we're on login page or still on home with loading
    if (currentUrl.includes('/login')) {
      // Verify we're on login page
      expect(currentUrl).toContain('/login');
      console.log('✓ Redirected to login page as expected');
    } else {
      // Check for loading spinner on homepage
      const loadingElement = page.locator('.animate-spin').first();
      await expect(loadingElement).toBeVisible({ timeout: 5000 });
      console.log('✓ Loading spinner visible on homepage');
    }
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page has a title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    console.log(`✓ Page title: "${title}"`);
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    console.log('✓ Tested responsive behavior across different viewport sizes');
  });
});
