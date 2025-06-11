import { test, expect } from '@playwright/test';

test.describe('Visual Browser Tests', () => {
  test('should take screenshot of login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot
    await page.screenshot({ 
      path: 'test-results/login-page-screenshot.png',
      fullPage: true 
    });
    
    console.log('✓ Screenshot taken of login page');
  });

  test('should test form interactions', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Look for form elements
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    if (await emailInput.count() > 0) {
      await emailInput.fill('test@example.com');
      console.log('✓ Filled email input');
    }
    
    if (await passwordInput.count() > 0) {
      await passwordInput.fill('testpassword');
      console.log('✓ Filled password input');
    }
    
    // Take screenshot of filled form
    await page.screenshot({ 
      path: 'test-results/filled-form-screenshot.png',
      fullPage: true 
    });
  });

  test('should test responsive design', async ({ page }) => {
    await page.goto('/');
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `test-results/responsive-${viewport.name}-screenshot.png`,
        fullPage: true 
      });
      
      console.log(`✓ Screenshot taken for ${viewport.name} viewport`);
    }
  });

  test('should test dark mode toggle if available', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for theme toggle button
    const themeToggle = page.locator('button[aria-label*="Toggle theme"]').first();
    
    if (await themeToggle.count() > 0) {
      // Take screenshot in light mode
      await page.screenshot({ 
        path: 'test-results/light-mode-screenshot.png',
        fullPage: true 
      });
      
      // Click theme toggle
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Look for dark option and click it
      const darkOption = page.locator('text=Dark').first();
      if (await darkOption.count() > 0) {
        await darkOption.click();
        await page.waitForTimeout(1000);
        
        // Take screenshot in dark mode
        await page.screenshot({ 
          path: 'test-results/dark-mode-screenshot.png',
          fullPage: true 
        });
        
        console.log('✓ Tested theme toggle functionality');
      }
    } else {
      console.log('ℹ Theme toggle not found, skipping dark mode test');
    }
  });
});
