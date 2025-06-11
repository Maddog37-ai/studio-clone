import { test, expect } from '@playwright/test';

test.describe('Homepage Navigation', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Wait for navigation to complete
    await page.waitForURL('/login', { timeout: 10000 });

    // Verify we're on the login page
    expect(page.url()).toContain('/login');
  });

  test('should display loading spinner initially', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Check for loading spinner (using data-testid or class)
    const loadingSpinner = page.locator('.animate-spin').first();
    await expect(loadingSpinner).toBeVisible();
  });
});

test.describe('Login Page', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for login form elements
    await expect(page.locator('form')).toBeVisible();
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/login');
    
    // Check the page title
    await expect(page).toHaveTitle(/login/i);
  });
});
