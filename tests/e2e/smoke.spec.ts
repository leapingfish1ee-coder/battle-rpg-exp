import { expect, test } from '@playwright/test';

test('boots the PixiJS canvas', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#app canvas')).toBeVisible();
});
