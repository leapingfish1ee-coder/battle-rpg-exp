import { expect, test } from '@playwright/test';

test('renders the project title through the PixiJS canvas', async ({ page }) => {
  await page.goto('/');

  const canvas = page.locator('#app canvas[aria-label="战斗 RPG 实验"]');

  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('role', 'img');
  await expect(page.locator('#app h1')).toHaveCount(0);
  await expect(page.locator('#app button')).toHaveCount(0);
  await expect(page.locator('#app').locator(':scope > *')).toHaveCount(1);
});
