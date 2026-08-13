export const PAGE_TYPOGRAPHY = {
  timerLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  floatingFeedback: {
    fontSize: 24,
    fontWeight: '900',
  },
} as const;

export const PAGE_EFFECT_STYLE = {
  floatingFeedback: {
    strokeWidth: 2,
    shadowDistance: 2,
    shadowBlur: 1,
    shadowAlpha: 0.35,
    motionBlurSamples: [
      { distance: 4, alpha: 0.18 },
      { distance: 8, alpha: 0.1 },
      { distance: 12, alpha: 0.04 },
    ],
  },
} as const;
