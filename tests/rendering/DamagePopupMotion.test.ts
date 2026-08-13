import { describe, expect, it } from 'vitest';
import {
  DAMAGE_POPUP_PEAK_SCALE,
  resolveDamagePopupMotion,
} from '../../src/rendering/animation/DamagePopupMotion';

describe('DamagePopupMotion', () => {
  it('keeps the impact pulse compact', () => {
    for (let index = 0; index <= 100; index += 1) {
      const motion = resolveDamagePopupMotion(index / 100);
      expect(motion.scale).toBeGreaterThanOrEqual(0.82);
      expect(motion.scale).toBeLessThanOrEqual(DAMAGE_POPUP_PEAK_SCALE);
    }

    expect(resolveDamagePopupMotion(0).scale).toBe(0.82);
    expect(resolveDamagePopupMotion(0.08).scale).toBeCloseTo(DAMAGE_POPUP_PEAK_SCALE);
    expect(resolveDamagePopupMotion(0.18).scale).toBeCloseTo(0.98);
    expect(resolveDamagePopupMotion(0.34).scale).toBeCloseTo(1);
    expect(resolveDamagePopupMotion(1).scale).toBeCloseTo(1);
  });

  it('moves fast at the start and decelerates sharply', () => {
    const earlyDistance =
      resolveDamagePopupMotion(0.15).riseProgress - resolveDamagePopupMotion(0).riseProgress;
    const lateDistance =
      resolveDamagePopupMotion(0.8).riseProgress - resolveDamagePopupMotion(0.65).riseProgress;

    expect(resolveDamagePopupMotion(0.15).riseProgress).toBeGreaterThan(0.5);
    expect(earlyDistance).toBeGreaterThan(lateDistance * 10);
  });

  it('uses a single lateral burst instead of sustained sway', () => {
    expect(resolveDamagePopupMotion(0).lateralProgress).toBe(0);
    expect(resolveDamagePopupMotion(0.12).lateralProgress).toBeCloseTo(1);
    expect(resolveDamagePopupMotion(0.4).lateralProgress).toBeLessThan(0.15);
    expect(resolveDamagePopupMotion(1).lateralProgress).toBeLessThan(0.002);
  });

  it('fades motion blur with velocity while rise remains monotonic', () => {
    let previousRise = 0;
    let previousOpacity = 1;
    let previousBlur = 1;

    for (let index = 0; index <= 100; index += 1) {
      const motion = resolveDamagePopupMotion(index / 100);
      expect(motion.riseProgress).toBeGreaterThanOrEqual(previousRise);
      expect(motion.opacity).toBeLessThanOrEqual(previousOpacity);
      expect(motion.blurStrength).toBeLessThanOrEqual(previousBlur);
      previousRise = motion.riseProgress;
      previousOpacity = motion.opacity;
      previousBlur = motion.blurStrength;
    }

    expect(resolveDamagePopupMotion(0).blurStrength).toBe(1);
    expect(resolveDamagePopupMotion(0.5).blurStrength).toBeLessThan(0.15);
    expect(resolveDamagePopupMotion(1).blurStrength).toBe(0);
    expect(resolveDamagePopupMotion(1).opacity).toBe(0);
  });
});
