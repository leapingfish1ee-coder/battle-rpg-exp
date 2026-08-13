import { expect, test } from '@playwright/test';

test('renders a looping countdown and repeats the cycle event', async ({ page }) => {
  await page.goto('/');

  const canvas = page.locator('#app canvas');
  const sequence = async (): Promise<string | null> =>
    canvas.evaluate((element) =>
      Array.from(element.attributes).find(
        (attribute) => attribute.name.startsWith('data-') && attribute.name.endsWith('-sequence'),
      )?.value ?? null,
    );

  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('role', 'img');
  await expect(canvas).toHaveAttribute('data-render-state', 'ready');
  await expect(canvas).toHaveAttribute('data-countdown-state', 'running');
  await expect.poll(sequence).toBe('0');
  await expect(page.locator('#app').locator(':scope > *')).toHaveCount(1);

  await expect.poll(sequence, { timeout: 7_000 }).toBe('1');
  await expect(canvas).toHaveAttribute('data-countdown-state', 'running', { timeout: 1_000 });
  await expect.poll(sequence, { timeout: 7_000 }).toBe('2');
});
