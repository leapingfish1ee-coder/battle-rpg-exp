import { expect, test } from '@playwright/test';

test('renders the project title through the PixiJS canvas', async ({ page }) => {
  await page.goto('/');

  const canvas = page.locator('#app canvas[aria-label="战斗 RPG 实验"]');

  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('role', 'img');
  await expect(canvas).toHaveAttribute('data-render-state', 'ready');
  await expect(page.locator('#app h1')).toHaveCount(0);
  await expect(page.locator('#app button')).toHaveCount(0);
  await expect(page.locator('#app').locator(':scope > *')).toHaveCount(1);

  const nonBackgroundPixels = await canvas.evaluate((sourceCanvas) => {
    const source = sourceCanvas as HTMLCanvasElement;
    const probe = document.createElement('canvas');
    probe.width = source.width;
    probe.height = source.height;

    const context = probe.getContext('2d', { willReadFrequently: true });
    if (!context) {
      throw new Error('Unable to create 2D probe context.');
    }

    context.drawImage(source, 0, 0);
    const pixels = context.getImageData(0, 0, probe.width, probe.height).data;
    const background = [0x21, 0x17, 0x11] as const;
    let count = 0;

    for (let index = 0; index < pixels.length; index += 4) {
      const distance =
        Math.abs(pixels[index] - background[0]) +
        Math.abs(pixels[index + 1] - background[1]) +
        Math.abs(pixels[index + 2] - background[2]);

      if (distance > 24 && pixels[index + 3] > 0) {
        count += 1;
      }
    }

    return count;
  });

  expect(nonBackgroundPixels).toBeGreaterThan(100);
});
