export const DAMAGE_POPUP_PEAK_SCALE = 1.05;

export interface DamagePopupMotion {
  readonly riseProgress: number;
  readonly lateralProgress: number;
  readonly opacity: number;
  readonly scale: number;
  readonly blurStrength: number;
}

const RISE_EXPONENT = 8;
const RISE_NORMALIZER = 1 - 2 ** -RISE_EXPONENT;
const LATERAL_PEAK_PROGRESS = 0.12;

const clamp01 = (value: number): number => Math.min(Math.max(value, 0), 1);
const easeOutCubic = (value: number): number => 1 - (1 - value) ** 3;

const easeOutExpo = (value: number): number =>
  (1 - 2 ** (-RISE_EXPONENT * value)) / RISE_NORMALIZER;

const resolveLateralProgress = (progress: number): number => {
  if (progress <= LATERAL_PEAK_PROGRESS) {
    return easeOutCubic(progress / LATERAL_PEAK_PROGRESS);
  }

  return Math.exp(-7.5 * (progress - LATERAL_PEAK_PROGRESS));
};

const resolveScale = (progress: number): number => {
  if (progress < 0.08) {
    return 0.82 + (progress / 0.08) * (DAMAGE_POPUP_PEAK_SCALE - 0.82);
  }

  if (progress < 0.18) {
    return DAMAGE_POPUP_PEAK_SCALE - ((progress - 0.08) / 0.1) * 0.07;
  }

  if (progress < 0.34) {
    return 0.98 + ((progress - 0.18) / 0.16) * 0.02;
  }

  return 1;
};

export const resolveDamagePopupMotion = (progressInput: number): DamagePopupMotion => {
  const progress = clamp01(progressInput);
  const fadeProgress = clamp01((progress - 0.58) / 0.42);

  return {
    riseProgress: easeOutExpo(progress),
    lateralProgress: resolveLateralProgress(progress),
    opacity: 1 - fadeProgress ** 2,
    scale: resolveScale(progress),
    blurStrength: clamp01(1.15 * (1 - progress) ** 3.2),
  };
};
