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

test('repeated pointer selection is visually idempotent', async ({ page }) => {
  await page.goto('/');

  const canvas = page.locator('#app canvas');
  await expect(canvas).toHaveAttribute('data-selected-facility', 'guild');

  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Missing Pixi canvas bounds.');

  const compact = bounds.width < 900 || bounds.height < 620;
  const pad = compact ? 18 : 28;
  const menuWidth = compact ? Math.min(300, bounds.width * 0.38) : Math.min(356, bounds.width * 0.3);
  const menuX = bounds.width - menuWidth - pad;
  const menuY = compact ? 92 : 108;
  const rowHeight = compact ? 46 : 52;
  const rowWidth = menuWidth - 20;
  const rowX = menuX + 10;
  const rowY = menuY + 52;
  const guildCenter = {
    x: rowX + rowWidth / 2,
    y: rowY + rowHeight / 2,
  };
  const guildClip = {
    x: bounds.x + rowX,
    y: bounds.y + rowY,
    width: rowWidth,
    height: rowHeight,
  };

  const before = await page.screenshot({ clip: guildClip });

  for (let click = 0; click < 8; click += 1) {
    await canvas.click({ position: guildCenter });
    await expect(canvas).toHaveAttribute('data-selected-facility', 'guild');
  }

  const after = await page.screenshot({ clip: guildClip });
  expect(after).toEqual(before);
});
