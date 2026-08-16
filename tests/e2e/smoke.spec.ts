import { expect, test } from '@playwright/test';

test('runs the cement world with automatic spawning, combat clocks, and camera movement', async ({
  page,
}) => {
  await page.goto('/');

  const canvas = page.locator('#app canvas');
  const numberAttribute = async (name: string): Promise<number> =>
    Number((await canvas.getAttribute(name)) ?? '0');

  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('role', 'img');
  await expect(canvas).toHaveAttribute('data-render-state', 'ready');
  await expect(canvas).toHaveAttribute('data-world-surface', 'cement');
  await expect(page.locator('#app').locator(':scope > *')).toHaveCount(1);

  await expect
    .poll(() => numberAttribute('data-solo-spawn-sequence'), { timeout: 4_000 })
    .toBeGreaterThanOrEqual(2);
  await expect
    .poll(() => numberAttribute('data-group-spawn-sequence'), { timeout: 4_000 })
    .toBeGreaterThanOrEqual(1);
  await expect.poll(() => numberAttribute('data-enemy-count')).toBeGreaterThan(0);
  await expect.poll(() => numberAttribute('data-stationary-count')).toBeGreaterThan(0);
  await expect
    .poll(() => numberAttribute('data-sidearm-cycle-sequence'))
    .toBeGreaterThanOrEqual(4);
  await expect
    .poll(() => numberAttribute('data-sidearm-attack-sequence'))
    .toBeGreaterThan(0);
  await expect
    .poll(() => numberAttribute('data-saber-cycle-sequence'))
    .toBeGreaterThanOrEqual(2);

  const initialPlayerX = await numberAttribute('data-player-x');
  const initialPlayerY = await numberAttribute('data-player-y');
  const initialCameraX = await numberAttribute('data-camera-x');

  await page.keyboard.down('d');
  await page.waitForTimeout(700);
  await page.keyboard.up('d');

  await expect.poll(() => numberAttribute('data-player-x')).toBeGreaterThan(initialPlayerX + 60);
  await expect.poll(() => numberAttribute('data-camera-x')).toBeGreaterThan(initialCameraX + 20);
  await expect
    .poll(async () => Math.abs((await numberAttribute('data-player-y')) - initialPlayerY))
    .toBeLessThan(2);
});
