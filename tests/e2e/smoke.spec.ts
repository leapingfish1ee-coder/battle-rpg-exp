import { expect, test } from '@playwright/test';

test('opens the main entry before booting the game', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('entry')).toBeVisible();
  await expect(page.getByRole('heading', { name: /enter the combat grid/i })).toBeVisible();
  await expect(page.locator('#app canvas')).toHaveCount(0);

  await page.getByTestId('start-game').click();
  await expect(page.getByTestId('game-shell')).toHaveClass(/is-active/);
  await expect(page.locator('#app canvas')).toBeVisible();

  await page.getByTestId('exit-game').click();
  await expect(page.getByTestId('game-shell')).not.toHaveClass(/is-active/);
  await expect(page.getByTestId('start-game')).toBeVisible();
});
