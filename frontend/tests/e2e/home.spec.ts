import { test, expect } from '@playwright/test';

test('home page loads and shows title', async ({ page }) => {
  await page.goto('/');
  // Check for the main app title in the header
  await expect(page.locator('header h1')).toHaveText('Clario');
  // Check for the dashboard title
  await expect(page.locator('main h1')).toHaveText('项目仪表盘');
});
