import { expect, test } from '@playwright/test';

test('opens directly in the JRPG town menu through one Pixi canvas', async ({ page }) => {
  await page.goto('/');

  const canvas = page.locator('#app canvas');

  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toHaveAttribute('role', 'img');
  await expect(canvas).toHaveAttribute('data-renderer', 'pixi');
  await expect(canvas).toHaveAttribute('data-page', 'town');
  await expect(canvas).toHaveAttribute('data-game-mode', 'jrpg-adventure');
  await expect(canvas).toHaveAttribute('data-menu', 'town');
  await expect(canvas).toHaveAttribute('data-location', 'lumina');
  await expect(canvas).toHaveAttribute('data-selected-facility', 'guild');
  await expect(canvas).toHaveAttribute('data-party-size', '1');
  await expect(canvas).toHaveAttribute('data-render-state', 'ready');
  await expect(page.locator('#app').locator(':scope > *')).toHaveCount(1);
  await expect(page.locator('#app').locator(':scope > :not(canvas)')).toHaveCount(0);

  await expect(canvas).not.toHaveAttribute('data-ballistics-model', /.+/);
  await expect(canvas).not.toHaveAttribute('data-enemy-count', /.+/);
  await expect(canvas).not.toHaveAttribute('data-projectile-count', /.+/);

  await page.keyboard.press('ArrowDown');
  await expect(canvas).toHaveAttribute('data-selected-facility', 'inn');

  await page.keyboard.press('KeyS');
  await expect(canvas).toHaveAttribute('data-selected-facility', 'shop');

  await page.keyboard.press('ArrowUp');
  await expect(canvas).toHaveAttribute('data-selected-facility', 'inn');

  await page.keyboard.press('Enter');
  await expect(canvas).toHaveAttribute('data-page', 'town');
  await expect(canvas).toHaveAttribute('data-menu', 'town');
});
