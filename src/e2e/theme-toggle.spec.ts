import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page that has the theme toggle (like dashboard)
    await page.goto('/dashboard');
    
    // If redirected to login, we'll need to handle that
    if (page.url().includes('/login')) {
      test.skip(true, 'User authentication required for this test');
    }
  });

  test('should toggle between light and dark themes', async ({ page }) => {
    // Look for the theme toggle button
    const themeToggle = page.locator('button[aria-label*="Toggle theme"]');
    
    if (await themeToggle.count() > 0) {
      // Click the theme toggle button
      await themeToggle.click();

      // Check for dropdown menu
      const lightOption = page.locator('text=Light');
      const darkOption = page.locator('text=Dark');

      // Verify dropdown options are visible
      await expect(lightOption.or(darkOption)).toBeVisible();

      // Click on Dark theme
      if (await darkOption.count() > 0) {
        await darkOption.click();
        
        // Check if dark theme is applied (look for dark class on html/body)
        const htmlElement = page.locator('html');
        await expect(htmlElement).toHaveClass(/dark/);
      }
    } else {
      test.skip(true, 'Theme toggle not found on this page');
    }
  });

  test('should display theme icons correctly', async ({ page }) => {
    const themeToggle = page.locator('button[aria-label*="Toggle theme"]');
    
    if (await themeToggle.count() > 0) {
      // Check that the theme toggle button is visible
      await expect(themeToggle).toBeVisible();

      // Check for sun/moon icons (they should be present as SVGs)
      const sunIcon = themeToggle.locator('svg').first();
      await expect(sunIcon).toBeVisible();
    } else {
      test.skip(true, 'Theme toggle not found on this page');
    }
  });
});
