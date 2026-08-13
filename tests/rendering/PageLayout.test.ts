import { describe, expect, it } from 'vitest';
import {
  PAGE_LAYOUT_UNIT,
  PAGE_SPACING,
  resolvePageLayout,
} from '../../src/rendering/layout/PageLayout';

describe('PageLayout', () => {
  it('uses the 32 px timer as the page layout unit', () => {
    expect(PAGE_LAYOUT_UNIT).toBe(32);
    expect(PAGE_SPACING.quarter).toBe(8);
    expect(PAGE_SPACING.half).toBe(16);
    expect(PAGE_SPACING.one).toBe(32);
    expect(PAGE_SPACING.two).toBe(64);
    expect(PAGE_SPACING.four).toBe(128);
  });

  it('resolves geometry without carrying typography or effect styling', () => {
    const layout = resolvePageLayout(1280, 720);

    expect(layout.center).toEqual({ x: 640, y: 360 });
    expect(layout.pageInset).toBe(32);
    expect(layout.timer).toEqual({ x: 640, y: 360, diameter: 32, radius: 16 });
    expect(layout.feedback).toEqual({
      originX: 640,
      originY: 312,
      riseDistance: 64,
      swayDistance: 8,
    });
  });
});
