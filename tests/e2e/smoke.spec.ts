import { expect, test } from '@playwright/test';

test('renders the countdown and emits one timeout popup event', async ({ page }) => {
  await page.goto('/');

  const canvas = page.locator('#app canvas[aria-label="倒计时与伤害跳字演示"]');

  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('role', 'img');
  await expect(canvas).toHaveAttribute('data-render-state', 'ready');
  await expect(canvas).toHaveAttribute('data-countdown-state', 'running');
  await expect(canvas).toHaveAttribute('data-damage-popup-sequence', '0');
  await expect(page.locator('#app h1')).toHaveCount(0);
  await expect(page.locator('#app button')).toHaveCount(0);
  await expect(page.locator('#app').locator(':scope > *')).toHaveCount(1);

  await expect(canvas).toHaveAttribute('data-countdown-state', 'timed-out', { timeout: 7_000 });
  await expect(canvas).toHaveAttribute('data-damage-popup-sequence', '1');
});
