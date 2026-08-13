import { expect, test } from '@playwright/test';

test('shows only the centered project title', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: '战斗 RPG 实验' })).toBeVisible();
  await expect(page.locator('#app canvas')).toHaveCount(0);
  await expect(page.locator('#app button')).toHaveCount(0);
  await expect(page.locator('#app').locator(':scope > *')).toHaveCount(1);
});
