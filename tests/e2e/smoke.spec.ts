import { expect, test } from '@playwright/test';

test('renders a cement world, moves the player, and follows with the camera', async ({ page }) => {
  await page.goto('/');

  const canvas = page.locator('#app canvas');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('role', 'img');
  await expect(canvas).toHaveAttribute('data-render-state', 'ready');
  await expect(canvas).toHaveAttribute('data-world-surface', 'cement');
  await expect(page.locator('#app').locator(':scope > *')).toHaveCount(1);

  const initialPlayerX = Number(await canvas.getAttribute('data-player-x'));
  const initialPlayerY = Number(await canvas.getAttribute('data-player-y'));
  const initialCameraX = Number(await canvas.getAttribute('data-camera-x'));

  await page.keyboard.down('d');
  await page.waitForTimeout(700);
  await page.keyboard.up('d');

  await expect
    .poll(async () => Number(await canvas.getAttribute('data-player-x')))
    .toBeGreaterThan(initialPlayerX + 60);
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-camera-x')))
    .toBeGreaterThan(initialCameraX + 20);
  await expect
    .poll(async () => Math.abs(Number(await canvas.getAttribute('data-player-y')) - initialPlayerY))
    .toBeLessThan(2);

  expect(await canvas.getAttribute('data-countdown-state')).toBeNull();
  expect(await canvas.getAttribute('data-damage-popup-sequence')).toBeNull();
});
