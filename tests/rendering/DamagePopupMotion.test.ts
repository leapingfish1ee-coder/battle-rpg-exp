import { describe, expect, it } from 'vitest';
import {
  DAMAGE_POPUP_PEAK_SCALE,
  resolveDamagePopupMotion,
} from '../../src/rendering/animation/DamagePopupMotion';

describe('DamagePopupMotion', () => {
  it('caps the popup scale at 1.05', () => {
    for (let index = 0; index <= 100; index += 1) {
      const motion = resolveDamagePopupMotion(index / 100);
      expect(motion.scale).toBeGreaterThanOrEqual(0.9);
      expect(motion.scale).toBeLessThanOrEqual(DAMAGE_POPUP_PEAK_SCALE);
    }

    expect(resolveDamagePopupMotion(0).scale).toBe(0.9);
    expect(resolveDamagePopupMotion(0.16).scale).toBeCloseTo(DAMAGE_POPUP_PEAK_SCALE);
    expect(resolveDamagePopupMotion(1).scale).toBeCloseTo(1);
  });

  it('rises and fades monotonically over the animation', () => {
    let previousRise = 0;
    let previousOpacity = 1;

    for (let index = 0; index <= 100; index += 1) {
      const motion = resolveDamagePopupMotion(index / 100);
      expect(motion.riseProgress).toBeGreaterThanOrEqual(previousRise);
      expect(motion.opacity).toBeLessThanOrEqual(previousOpacity);
      previousRise = motion.riseProgress;
      previousOpacity = motion.opacity;
    }

    expect(resolveDamagePopupMotion(0).opacity).toBe(1);
    expect(resolveDamagePopupMotion(1).opacity).toBe(0);
  });
});
