export const DAMAGE_POPUP_PEAK_SCALE = 1.05;

export interface DamagePopupMotion {
  readonly riseProgress: number;
  readonly opacity: number;
  readonly scale: number;
}

const easeOutCubic = (value: number): number => 1 - (1 - value) ** 3;

export const resolveDamagePopupMotion = (progressInput: number): DamagePopupMotion => {
  const progress = Math.min(Math.max(progressInput, 0), 1);
  const fadeStart = 0.62;
  const fadeProgress = Math.max(0, (progress - fadeStart) / (1 - fadeStart));
  const introDuration = 0.16;
  const introProgress = Math.min(progress / introDuration, 1);
  const settleProgress = Math.max(0, (progress - introDuration) / (1 - introDuration));
  const scale =
    introProgress < 1
      ? 0.9 + introProgress * (DAMAGE_POPUP_PEAK_SCALE - 0.9)
      : DAMAGE_POPUP_PEAK_SCALE - settleProgress * (DAMAGE_POPUP_PEAK_SCALE - 1);

  return {
    riseProgress: easeOutCubic(progress),
    opacity: 1 - Math.min(fadeProgress, 1),
    scale,
  };
};
